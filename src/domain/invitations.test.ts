import { describe, expect, it, vi, afterEach } from "vitest";
import {
  applyCommand,
  seedState,
  visibleJobs,
  stateSchema,
  type Command,
  type WorkspaceState,
} from "./workflow";
import { resolveInvitation } from "./invitations";
import { registrationSchema } from "./registration";
const run = (state: WorkspaceState, actor: string, command: Command) =>
  applyCommand(state, actor, command, state.revision);
const prepare = () =>
  run(seedState(), "technical", {
    type: "invite-contact",
    companyId: "industry",
    contactId: "industry-contact",
  });
afterEach(() => vi.useRealTimers());
describe("local invitation lifecycle", () => {
  it("revokes the previous code on renewal and consumes the new code once without changing company or email", () => {
    let state = prepare();
    const first = state.invitations[0];
    const old = first.code!;
    state = run(state, "technical", {
      type: "renew-invitation",
      invitationId: first.id,
    });
    const fresh = state.invitations[0].code!;
    expect(fresh).not.toBe(old);
    expect(() => resolveInvitation(state, old)).toThrow();
    state = run(state, "guest", {
      type: "accept-invitation",
      code: fresh,
      profile: {
        name: "Contato convidado",
        position: "Operações",
        phone: "+55 00 00000-0000",
      },
    });
    expect(() => resolveInvitation(state, fresh)).toThrow();
    expect(state.invitations[0].status).toBe("accepted");
    expect(state.companies[0].contacts[0]).toMatchObject({
      name: "Contato convidado",
      email: "industria@example.test",
    });
    expect(
      visibleJobs(state, "contact:industry-contact").map((j) => j.companyId),
    ).toEqual(["industry"]);
    expect(state.events.at(-1)?.detail).not.toContain(fresh);
  });
  it("rejects expired, forged and client-managed invitations without mutating input", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-19T15:00:00Z"));
    const state = prepare();
    const code = state.invitations[0].code!;
    expect(() =>
      run(state, "client-hospital", {
        type: "renew-invitation",
        invitationId: state.invitations[0].id,
      }),
    ).toThrow();
    expect(() =>
      run(state, "client-industry", {
        type: "invite-contact",
        companyId: "hospital",
        contactId: "hospital-contact",
      }),
    ).toThrow();
    expect(() =>
      run(state, "guest", {
        type: "accept-invitation",
        code: "F".repeat(32),
        profile: { name: "Test", position: "", phone: "" },
      }),
    ).toThrow();
    vi.advanceTimersByTime(7 * 24 * 60 * 60 * 1000 + 1);
    expect(() => resolveInvitation(state, code)).toThrow(/expirado/);
    expect(state.invitations[0].status).toBe("pending");
  });
  it("loads earlier invitation records without inventing a valid access code", () => {
    const state = stateSchema.parse({
      ...seedState(),
      invitations: [
        {
          id: "legacy",
          jobId: "industry-job",
          email: "industria@example.test",
          at: "2026-10-19T15:00:00Z",
        },
      ],
    });
    expect(state.invitations[0].status).toBe("legacy");
    expect(state.invitations[0].code).toBeUndefined();
    const next = run(state, "technical", {
      type: "renew-invitation",
      invitationId: "legacy",
    });
    expect(resolveInvitation(next, next.invitations[0].code!).company.id).toBe(
      "industry",
    );
  });
});
describe("reviewable requirement catalogue", () => {
  it("adds several suggestions without duplicates and invalidates prior scope review", () => {
    let state = run(seedState(), "technical", {
      type: "validate-scope",
      jobId: "industry-job",
    });
    state = run(state, "technical", {
      type: "add-catalogue",
      jobId: "industry-job",
      catalogueIds: ["licence", "scope", "licence"],
    });
    expect(state.jobs[0].requirements).toHaveLength(5);
    expect(state.jobs[0].scopeReviewed).toBe(false);
    const next = run(state, "technical", {
      type: "add-catalogue",
      jobId: "industry-job",
      catalogueIds: ["licence"],
    });
    expect(next.jobs[0].requirements).toHaveLength(5);
    expect(() =>
      run(state, "client-industry", {
        type: "add-catalogue",
        jobId: "industry-job",
        catalogueIds: ["water"],
      }),
    ).toThrow();
    expect(() =>
      run(state, "technical", {
        type: "add-catalogue",
        jobId: "industry-job",
        catalogueIds: ["scope", "unknown"],
      }),
    ).toThrow();
    expect(state.jobs[0].requirements).toHaveLength(5);
  });
});

it("updates missing registration while preserving released versions and preventing duplicate legal entities", () => {
  let state = run(seedState(), "technical", {
    type: "release",
    jobId: "industry-job",
    kind: "intermediate",
    note: "Versão preservada",
  });
  const registration = registrationSchema.parse({
    cnpj: "12ABC34501DE35",
    sector: "gases",
  });
  state = run(state, "technical", {
    type: "company-update",
    companyId: "industry",
    name: "Nome conferido",
    registration,
  });
  expect(state.jobs[0].company).toBe("Nome conferido");
  expect(state.deliveries[0].company).toBe("Indústria exemplo");
  expect(state.jobs[0].scopeReviewed).toBe(false);
  expect(() =>
    run(state, "technical", {
      type: "company-update",
      companyId: "hospital",
      name: "Outro",
      registration,
    }),
  ).toThrow(/CNPJ/);
  expect(() =>
    run(state, "technical", {
      type: "company-update",
      companyId: "industry",
      name: "Outro",
      registration: registrationSchema.parse({ cnpj: "12345678000195" }),
    }),
  ).toThrow(/entidade jurídica/);
});

it("normalises an older in-memory company record before applying a command", () => {
  const state = seedState();
  delete (state.companies[0] as Partial<(typeof state.companies)[number]>)
    .registration;
  const result = run(state, "technical", {
    type: "invite-contact",
    companyId: "industry",
    contactId: "industry-contact",
  });
  expect(result.companies[0].registration.cnpj).toBe("");
  expect(result.jobs).toEqual(state.jobs);
  expect(result.invitations[0].code).toHaveLength(32);
});
