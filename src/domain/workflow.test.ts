import { describe, expect, it } from "vitest";
import {
  seedState,
  visibleJobs,
  applyCommand,
  releaseSnapshot,
  selectProfile,
  stateSchema,
  type WorkspaceState,
} from "./workflow";

function run(
  state: WorkspaceState,
  actor: string,
  command: Parameters<typeof applyCommand>[2],
) {
  return applyCommand(state, actor, command, state.revision);
}

describe("review workflow", () => {
  it("scopes client views to their company and denies direct cross-company changes", () => {
    const state = seedState();
    expect(
      visibleJobs(state, "client-industry").map((j) => j.companyId),
    ).toEqual(["industry"]);
    expect(() =>
      run(state, "client-industry", {
        type: "request",
        jobId: "hospital-job",
        requirementId: "hospital-license",
        message: "Solicitação",
      }),
    ).toThrow();
    expect(() =>
      run(state, "client-hospital", {
        type: "submit",
        jobId: "industry-job",
        requirementId: "industry-license",
        text: "Dados",
        documentIds: [],
        confirmed: true,
      }),
    ).toThrow();
  });
  it("does not give clients technical approval or role-management actions", () => {
    expect(() =>
      run(seedState(), "client-industry", {
        type: "review",
        jobId: "industry-job",
        requirementId: "industry-license",
        decision: "accepted",
        reason: "Ok",
      }),
    ).toThrow();
  });
  it("requires a reason to exclude an item and preserves it for restoration", () => {
    expect(() =>
      run(seedState(), "technical", {
        type: "exclude",
        jobId: "industry-job",
        requirementId: "industry-license",
        reason: "",
      }),
    ).toThrow();
    let state = run(seedState(), "technical", {
      type: "exclude",
      jobId: "industry-job",
      requirementId: "industry-license",
      reason: "Fora do escopo deste ensaio",
    });
    expect(state.jobs[0].requirements[0].exclusionReason).toBe(
      "Fora do escopo deste ensaio",
    );
    state = run(state, "technical", {
      type: "restore",
      jobId: "industry-job",
      requirementId: "industry-license",
    });
    expect(state.jobs[0].requirements[0].status).toBe("needed");
    expect(state.events).toHaveLength(2);
  });
  it("keeps an upload and an attested submission distinct from technical acceptance", () => {
    let state = run(seedState(), "technical", {
      type: "request",
      jobId: "industry-job",
      requirementId: "industry-license",
      message: "Envie a evidência do período.",
    });
    state = run(state, "client-industry", {
      type: "submit",
      jobId: "industry-job",
      requirementId: "industry-license",
      text: "Resposta sintética",
      documentIds: [],
      confirmed: true,
    });
    expect(state.jobs[0].requirements[0].status).toBe("review");
    state = run(state, "technical", {
      type: "review",
      jobId: "industry-job",
      requirementId: "industry-license",
      decision: "correction",
      reason: "O período não está identificado.",
    });
    expect(state.jobs[0].requirements[0].status).toBe("correction");
    expect(state.jobs[0].requirements[0].submissions).toHaveLength(1);
    expect(state.jobs[0].requirements[0].reviewNote).toContain("período");
  });
  it("rejects stale edits rather than silently overwriting newer work", () => {
    const state = seedState();
    expect(() =>
      applyCommand(
        state,
        "technical",
        { type: "add", jobId: "industry-job", title: "Item", help: "Ajuda" },
        state.revision - 1,
      ),
    ).toThrow(/atualiz/);
  });
  it("does not invent coverage for unsupported combinations or treat unknown water use as no", () => {
    expect(selectProfile("hospital", "GO", "unknown").supported).toBe(false);
    expect(
      selectProfile("gases", "GO", "unknown").items.some((i) => i.conditional),
    ).toBe(true);
    expect(
      selectProfile("gases", "GO", "no").items.some((i) => i.conditional),
    ).toBe(false);
  });
  it("preserves an existing delivery when source requirements change", () => {
    const state = seedState();
    const delivery = releaseSnapshot(
      state,
      "technical",
      "industry-job",
      "intermediate",
      "Ensaio com pendências explícitas",
    );
    expect(delivery.requirements.every((r) => r.title.length > 0)).toBe(true);
    const oldTitle = delivery.requirements[0].title;
    state.jobs[0].requirements[0].title = "Alterado depois da entrega";
    expect(delivery.requirements[0].title).toBe(oldTitle);
    expect(delivery.kind).toBe("intermediate");
  });
  it("blocks final delivery with pending evidence and self-assigned independent review", () => {
    expect(() =>
      releaseSnapshot(seedState(), "technical", "industry-job", "final", ""),
    ).toThrow();
    expect(() =>
      run(seedState(), "technical", {
        type: "independent-review",
        jobId: "industry-job",
      }),
    ).toThrow();
  });
  it("records manual concerns and requires an explanation to resolve them", () => {
    let state = run(seedState(), "technical", {
      type: "concern",
      jobId: "industry-job",
      text: "Verificar o período da evidência",
    });
    expect(state.jobs[0].concerns[0].resolved).toBe(false);
    expect(() =>
      run(state, "technical", {
        type: "resolve-concern",
        jobId: "industry-job",
        concernId: state.jobs[0].concerns[0].id,
        reason: "",
      }),
    ).toThrow();
    state = run(state, "technical", {
      type: "resolve-concern",
      jobId: "industry-job",
      concernId: state.jobs[0].concerns[0].id,
      reason: "Período confirmado por resposta vinculada",
    });
    expect(state.jobs[0].concerns[0].resolved).toBe(true);
  });
});

describe("delivery and review invariants", () => {
  it("invalidates previous approvals after a scope change while preserving its delivery", () => {
    let state = seedState();
    for (const requirement of state.jobs[0].requirements) {
      state = run(state, "technical", {
        type: "exclude",
        jobId: "industry-job",
        requirementId: requirement.id,
        reason: "Outside this synthetic exercise",
      });
    }
    state = run(state, "technical", {
      type: "validate-scope",
      jobId: "industry-job",
    });
    state = run(state, "reviewer", {
      type: "independent-review",
      jobId: "industry-job",
    });
    state = run(state, "technical", {
      type: "release",
      jobId: "industry-job",
      kind: "final",
      note: "Synthetic final version",
    });
    expect(state.deliveries[0].version).toBe(1);
    state = run(state, "technical", {
      type: "restore",
      jobId: "industry-job",
      requirementId: "industry-license",
    });
    expect(state.jobs[0].scopeReviewed).toBe(false);
    expect(state.jobs[0].independentlyReviewed).toBe(false);
    expect(state.deliveries[0].requirements[0].status).toBe("excluded");
    expect(() =>
      releaseSnapshot(
        state,
        "technical",
        "industry-job",
        "final",
        "Correction",
      ),
    ).toThrow();
  });
  it("rejects linking a file from another company or another uploader", () => {
    const state = run(seedState(), "technical", {
      type: "request",
      jobId: "industry-job",
      requirementId: "industry-license",
      message: "Evidence",
    });
    state.documents.push({
      id: "internal",
      jobId: "industry-job",
      name: "internal.txt",
      mime: "text/plain",
      size: 1,
      base64: "eA==",
      sha256: "a".repeat(64),
      at: new Date().toISOString(),
      actorId: "technical",
    });
    state.documents.push({
      ...state.documents[0],
      id: "other-company",
      jobId: "hospital-job",
      actorId: "client-hospital",
    });
    for (const id of ["internal", "other-company"]) {
      expect(() =>
        run(state, "client-industry", {
          type: "submit",
          jobId: "industry-job",
          requirementId: "industry-license",
          text: "Reply",
          documentIds: [id],
          confirmed: true,
        }),
      ).toThrow();
    }
  });
  it("keeps correction reasons tied to the submission that was reviewed", () => {
    let state = run(seedState(), "technical", {
      type: "request",
      jobId: "industry-job",
      requirementId: "industry-license",
      message: "Evidence",
    });
    state = run(state, "client-industry", {
      type: "submit",
      jobId: "industry-job",
      requirementId: "industry-license",
      text: "First reply",
      documentIds: [],
      confirmed: true,
    });
    const submissionId = state.jobs[0].requirements[0].submissions[0].id;
    state = run(state, "technical", {
      type: "review",
      jobId: "industry-job",
      requirementId: "industry-license",
      decision: "correction",
      reason: "Confirm the period",
    });
    state = run(state, "client-industry", {
      type: "submit",
      jobId: "industry-job",
      requirementId: "industry-license",
      text: "Second reply",
      documentIds: [],
      confirmed: true,
    });
    expect(state.jobs[0].requirements[0].reviews[0]).toMatchObject({
      submissionId,
      reason: "Confirm the period",
      decision: "correction",
    });
    expect(state.jobs[0].requirements[0].submissions).toHaveLength(2);
  });
});

describe("company contacts", () => {
  it("loads an earlier browser draft without losing its work or history", () => {
    const { companies, ...legacy } = run(seedState(), "technical", {
      type: "request",
      jobId: "industry-job",
      requirementId: "industry-license",
      message: "Preserve this earlier request",
    });
    const restored = stateSchema.parse(legacy);
    expect(restored.jobs).toEqual(legacy.jobs);
    expect(restored.events).toEqual(legacy.events);
    expect(restored.revision).toBe(legacy.revision);
    expect(restored.companies).toEqual(companies);
  });
  it("registers multiple scoped contacts and prevents a client from registering companies", () => {
    let state = run(seedState(), "technical", {
      type: "company-create",
      name: "Empresa de ensaio",
      contacts: [
        {
          name: "Contato A",
          position: "Ambiente",
          phone: "+55 00 00000-0000",
          email: "a@example.test",
        },
        {
          name: "Contato B",
          position: "Operações",
          phone: "",
          email: "b@example.test",
        },
      ],
    });
    const company = state.companies.at(-1)!;
    expect(company.contacts).toHaveLength(2);
    expect(() =>
      run(state, "client-industry", {
        type: "company-add-contact",
        companyId: company.id,
        contact: {
          name: "Intruso",
          position: "",
          phone: "",
          email: "c@example.test",
        },
      }),
    ).toThrow();
    state = run(state, "technical", {
      type: "create",
      companyId: company.id,
      company: "Forged name ignored",
      facility: "Unidade fictícia",
      title: "Ensaio",
      period: "2026",
      industry: "gases",
      state: "GO",
      city: "Local fictício",
      water: "no",
    });
    for (const contact of company.contacts) {
      const jobs = visibleJobs(state, `contact:${contact.id}`);
      expect(jobs).toHaveLength(1);
      expect(jobs[0].company).toBe(company.name);
      expect(() =>
        run(state, `contact:${contact.id}`, {
          type: "request",
          jobId: "industry-job",
          requirementId: "industry-license",
          message: "No",
        }),
      ).toThrow();
    }
  });
  it("requires unique valid contact emails within each company", () => {
    const contact = {
      name: "Contato",
      position: "",
      phone: "",
      email: "same@example.test",
    };
    expect(() =>
      run(seedState(), "technical", {
        type: "company-create",
        name: "Empresa",
        contacts: [contact, contact],
      }),
    ).toThrow();
    expect(() =>
      run(seedState(), "technical", {
        type: "company-create",
        name: "Empresa",
        contacts: [{ ...contact, email: "invalid" }],
      }),
    ).toThrow();
  });
});
