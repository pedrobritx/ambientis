import { z } from "zod";
import { m } from "../messages/pt-BR";
import {
  registrationSchema,
  contactInputSchema,
  type Registration,
  type ContactInput,
} from "./registration";
export { contactInputSchema } from "./registration";
export type { ContactInput } from "./registration";
import {
  invitationSchema,
  issueInvitation,
  renewInvitation,
  acceptInvitation,
} from "./invitations";
import { requirementCatalogue, catalogueSource } from "./catalogue";

export const MAX_FILE_BYTES = 1024 * 1024;
export const MAX_TOTAL_BYTES = 2 * MAX_FILE_BYTES;
export const requirementSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  help: z.string().max(1200),
  source: z.string(),
  catalogueId: z.string().optional(),
  conditional: z.boolean().default(false),
  status: z.enum([
    "needed",
    "requested",
    "review",
    "correction",
    "accepted",
    "excluded",
  ]),
  exclusionReason: z.string().optional(),
  request: z.string().optional(),
  deadline: z.string().optional(),
  reviewNote: z.string().optional(),
  reviews: z
    .array(
      z.object({
        at: z.string(),
        actorId: z.string(),
        decision: z.enum(["accepted", "correction"]),
        reason: z.string(),
        submissionId: z.string(),
      }),
    )
    .default([]),
  submissions: z.array(
    z.object({
      id: z.string(),
      at: z.string(),
      actorId: z.string(),
      text: z.string(),
      documentIds: z.array(z.string()),
      confirmed: z.boolean(),
    }),
  ),
});
export type Requirement = z.infer<typeof requirementSchema>;
const documentSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  name: z.string(),
  mime: z.enum([
    "application/pdf",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ]),
  size: z.number().int().min(1).max(MAX_FILE_BYTES),
  base64: z.string().max(1400000),
  sha256: z.string().length(64),
  at: z.string(),
  actorId: z.string(),
});
export type DocumentRecord = z.infer<typeof documentSchema>;
const concernSchema = z.object({
  id: z.string(),
  text: z.string(),
  resolved: z.boolean(),
  resolution: z.string().optional(),
});
const jobSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  company: z.string().min(1).max(160),
  facility: z.string().min(1).max(160),
  title: z.string().min(1).max(160),
  state: z.enum(["GO", "DF"]),
  city: z.string().max(120),
  industry: z.enum(["gases", "hospital", "other"]),
  services: z.array(z.string().max(120)).max(12).default([]),
  postcode: z.string().max(9).default(""),
  street: z.string().max(200).default(""),
  period: z.string().min(1).max(40),
  profileSupported: z.boolean(),
  scopeReviewed: z.boolean(),
  independentlyReviewed: z.boolean(),
  requirements: z.array(requirementSchema).max(100),
  concerns: z.array(concernSchema),
});
export type Job = z.infer<typeof jobSchema>;
export const deliverySchema = z.object({
  id: z.string(),
  jobId: z.string(),
  version: z.number().int().positive(),
  companyId: z.string(),
  company: z.string(),
  registration: registrationSchema.default(() => registrationSchema.parse({})),
  facility: z.string(),
  title: z.string(),
  period: z.string(),
  at: z.string(),
  kind: z.enum(["intermediate", "final"]),
  note: z.string(),
  requirements: z.array(requirementSchema),
  documents: z.array(documentSchema),
  acknowledgedAt: z.string().optional(),
});
export type Delivery = z.infer<typeof deliverySchema>;
const contactSchema = contactInputSchema.extend({ id: z.string() });
const companySchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(160),
  registration: registrationSchema.default(() => registrationSchema.parse({})),
  contacts: z.array(contactSchema).min(1).max(20),
});
export type Company = z.infer<typeof companySchema>;
function seedCompanies(): Company[] {
  return [
    {
      id: "industry",
      name: "Indústria exemplo",
      registration: registrationSchema.parse({ sector: "gases" }),
      contacts: [
        {
          id: "industry-contact",
          name: "Contato industrial fictício",
          position: "Meio ambiente",
          phone: "",
          email: "industria@example.test",
        },
      ],
    },
    {
      id: "hospital",
      name: "Hospital exemplo",
      registration: registrationSchema.parse({ sector: "hospital" }),
      contacts: [
        {
          id: "hospital-contact",
          name: "Contato hospitalar fictício",
          position: "Operações",
          phone: "",
          email: "hospital@example.test",
        },
      ],
    },
  ];
}
export const stateSchema = z.object({
  version: z.literal(1),
  revision: z.number().int().nonnegative(),
  companies: z.array(companySchema).max(50).default(seedCompanies),
  jobs: z.array(jobSchema).max(50),
  documents: z.array(documentSchema).max(100),
  deliveries: z.array(deliverySchema).max(50),
  events: z
    .array(
      z.object({
        id: z.string(),
        jobId: z.string(),
        actorId: z.string(),
        at: z.string(),
        type: z.string(),
        detail: z.string(),
      }),
    )
    .max(5000),
  invitations: z.array(invitationSchema).max(500),
});
export type WorkspaceState = z.infer<typeof stateSchema>;
export const actors = [
  {
    id: "technical",
    label: "Equipe técnica",
    role: "technical",
    companyId: null,
  },
  {
    id: "reviewer",
    label: "Revisor independente",
    role: "reviewer",
    companyId: null,
  },
  {
    id: "client-industry",
    label: "Cliente · Indústria exemplo",
    role: "client",
    companyId: "industry",
  },
  {
    id: "client-hospital",
    label: "Cliente · Hospital exemplo",
    role: "client",
    companyId: "hospital",
  },
] as const;
export type Actor = {
  id: string;
  label: string;
  role: "technical" | "reviewer" | "client";
  companyId: string | null;
};
export function actorsForState(state: WorkspaceState): Actor[] {
  return [
    ...actors,
    ...state.companies.flatMap((company) =>
      company.contacts.map((contact) => ({
        id: `contact:${contact.id}`,
        label: `${contact.name} · ${company.name}`,
        role: "client" as const,
        companyId: company.id,
      })),
    ),
  ];
}
export function actorById(id: string, state?: WorkspaceState): Actor {
  const actor = (state ? actorsForState(state) : actors).find(
    (a) => a.id === id,
  );
  if (!actor) throw new Error(m.accessDenied);
  return actor;
}
export function visibleJobs(state: WorkspaceState, actorId: string): Job[] {
  const actor = actorById(actorId, state);
  return state.jobs.filter(
    (j) => actor.role !== "client" || j.companyId === actor.companyId,
  );
}
function text(value: string, max = 1200) {
  const result = value.trim();
  if (!result || result.length > max) throw new Error(m.required);
  return result;
}
const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
function item(
  id: string,
  title: string,
  help: string,
  conditional = false,
): Requirement {
  return {
    id,
    title,
    help,
    source: m.profilePending,
    conditional,
    status: "needed",
    submissions: [],
    reviews: [],
  };
}
export function selectProfile(
  industry: Job["industry"],
  state: Job["state"],
  water: "yes" | "no" | "unknown",
) {
  const supported =
    (industry === "gases" && state === "GO") ||
    (industry === "hospital" && state === "DF");
  if (!supported) return { supported: false, items: [] as Requirement[] };
  const keys = [
    "identity",
    industry === "hospital" ? "health-waste" : "waste",
    "report",
    ...(water === "no" ? [] : ["water"]),
  ];
  const items = keys.map((key) => {
    const entry = requirementCatalogue.find((entry) => entry.id === key)!;
    return {
      ...item(uid(), entry.title, entry.help, key === "water"),
      catalogueId: key,
      source: catalogueSource,
    };
  });
  return { supported, items };
}
export function seedState(): WorkspaceState {
  return {
    version: 1,
    revision: 0,
    companies: seedCompanies(),
    documents: [],
    deliveries: [],
    events: [],
    invitations: [],
    jobs: [
      {
        id: "industry-job",
        companyId: "industry",
        company: "Indústria exemplo",
        facility: "Unidade Goiás",
        title: "Diagnóstico ambiental",
        period: "2026",
        state: "GO",
        city: "Aparecida de Goiânia",
        industry: "gases",
        services: [],
        postcode: "",
        street: "",
        profileSupported: true,
        scopeReviewed: false,
        independentlyReviewed: false,
        concerns: [],
        requirements: [
          item(
            "industry-license",
            "Identificação e documentos da unidade",
            "Confira a unidade, o período e o escopo dos documentos recebidos.",
          ),
          item(
            "industry-waste",
            "Registros e evidências de resíduos",
            "Solicite as fontes do período e confira a relação entre documentos.",
          ),
          item(
            "industry-report",
            "Relatório técnico revisado",
            "Inclua uma versão sintética do relatório para explorar a entrega.",
          ),
        ],
      },
      {
        id: "hospital-job",
        companyId: "hospital",
        company: "Hospital exemplo",
        facility: "Unidade Distrito Federal",
        title: "Revisão documental",
        period: "2026",
        state: "DF",
        city: "Brasília",
        industry: "hospital",
        services: [],
        postcode: "",
        street: "",
        profileSupported: true,
        scopeReviewed: false,
        independentlyReviewed: false,
        concerns: [],
        requirements: [
          item(
            "hospital-license",
            "Identificação e documentos da unidade",
            "Confira a unidade e as atividades efetivamente realizadas.",
          ),
          item(
            "hospital-waste",
            "Documentação de gestão de resíduos de saúde",
            "Confira o escopo dos serviços e os documentos ambientais; não use dados de pacientes neste ensaio.",
          ),
        ],
      },
    ],
  };
}
export type Command =
  | {
      type: "company-update";
      companyId: string;
      name: string;
      registration: Registration;
    }
  | {
      type: "company-create";
      name: string;
      contacts: ContactInput[];
      registration?: Registration;
    }
  | { type: "company-add-contact"; companyId: string; contact: ContactInput }
  | { type: "invite-contact"; companyId: string; contactId: string }
  | { type: "renew-invitation"; invitationId: string }
  | {
      type: "accept-invitation";
      code: string;
      profile: { name: string; position: string; phone: string };
    }
  | {
      type: "create";
      companyId: string;
      company: string;
      facility: string;
      title: string;
      period: string;
      industry: Job["industry"];
      state: Job["state"];
      city: string;
      water: "yes" | "no" | "unknown";
      services?: string[];
      catalogueIds?: string[];
      postcode?: string;
      street?: string;
    }
  | { type: "add"; jobId: string; title: string; help: string }
  | { type: "add-catalogue"; jobId: string; catalogueIds: string[] }
  | {
      type: "edit";
      jobId: string;
      requirementId: string;
      title: string;
      help: string;
    }
  | { type: "exclude"; jobId: string; requirementId: string; reason: string }
  | { type: "restore"; jobId: string; requirementId: string }
  | {
      type: "request";
      jobId: string;
      requirementId: string;
      message: string;
      deadline?: string;
    }
  | {
      type: "submit";
      jobId: string;
      requirementId: string;
      text: string;
      documentIds: string[];
      confirmed: boolean;
    }
  | {
      type: "review";
      jobId: string;
      requirementId: string;
      decision: "accepted" | "correction";
      reason: string;
    }
  | { type: "concern"; jobId: string; text: string }
  | {
      type: "resolve-concern";
      jobId: string;
      concernId: string;
      reason: string;
    }
  | { type: "upload"; jobId: string; document: DocumentRecord }
  | { type: "validate-scope" | "independent-review"; jobId: string }
  | { type: "release"; jobId: string; kind: Delivery["kind"]; note: string }
  | { type: "acknowledge"; jobId: string; deliveryId: string }
  | { type: "invitation"; jobId: string; email: string };

export function releaseSnapshot(
  state: WorkspaceState,
  actorId: string,
  jobId: string,
  kind: Delivery["kind"],
  note: string,
): Delivery {
  const actor = actorById(actorId, state);
  const job = visibleJobs(state, actorId).find((j) => j.id === jobId);
  if (!job || actor.role !== "technical") throw new Error(m.accessDenied);
  if (
    kind === "final" &&
    (!job.requirements.length ||
      !job.profileSupported ||
      !job.scopeReviewed ||
      !job.independentlyReviewed ||
      job.requirements.some(
        (r) => !["accepted", "excluded"].includes(r.status),
      ) ||
      job.concerns.some((c) => !c.resolved))
  )
    throw new Error(m.finalBlocked);
  if (kind === "intermediate" && !note.trim())
    throw new Error(m.intermediateReason);
  const ids = new Set(
    job.requirements
      .filter((r) => r.status === "accepted")
      .flatMap((r) => r.submissions.at(-1)?.documentIds ?? []),
  );
  return structuredClone({
    id: uid(),
    jobId,
    version: state.deliveries.filter((d) => d.jobId === jobId).length + 1,
    companyId: job.companyId,
    company: job.company,
    registration:
      state.companies.find((company) => company.id === job.companyId)
        ?.registration ?? registrationSchema.parse({}),
    facility: job.facility,
    title: job.title,
    period: job.period,
    at: now(),
    kind,
    note: note.trim(),
    requirements: job.requirements,
    documents: state.documents.filter(
      (d) => d.jobId === jobId && ids.has(d.id),
    ),
  });
}

// This policy is a rehearsal seam, not authentication. Every role shares a local browser store.
export function applyCommand(
  input: WorkspaceState,
  actorId: string,
  command: Command,
  expectedRevision: number,
): WorkspaceState {
  if (input.revision !== expectedRevision) throw new Error(m.stale);
  // Normalise older in-memory drafts too, including a preview already open during a schema update.
  const state = stateSchema.parse(input);
  if (command.type === "accept-invitation") {
    const accepted = acceptInvitation(state, command.code, command.profile);
    state.revision++;
    state.events.push({
      id: uid(),
      jobId: accepted.jobId,
      actorId: accepted.actorId,
      at: now(),
      type: command.type,
      detail: "Perfil de demonstração criado pelo contato convidado.",
    });
    return stateSchema.parse(state);
  }
  const actor = actorById(actorId, state);
  let detail = "";
  let jobId: string;
  if (
    command.type === "invite-contact" ||
    command.type === "renew-invitation"
  ) {
    if (actor.role !== "technical") throw new Error(m.accessDenied);
    const invite =
      command.type === "invite-contact"
        ? issueInvitation(state, command.companyId, command.contactId)
        : renewInvitation(state, command.invitationId);
    jobId = invite.jobId;
    detail = "Código local de demonstração gerado; nenhum e-mail enviado.";
  } else if (command.type === "company-update") {
    if (actor.role !== "technical") throw new Error(m.accessDenied);
    const company = state.companies.find(
      (entry) => entry.id === command.companyId,
    );
    if (!company) throw new Error(m.missing);
    const registration = registrationSchema.parse(command.registration);
    if (
      company.registration.cnpj &&
      company.registration.cnpj !== registration.cnpj
    )
      throw new Error(
        "Para outra entidade jurídica, cadastre uma nova empresa; o CNPJ existente é preservado.",
      );
    if (
      registration.cnpj &&
      state.companies.some(
        (entry) =>
          entry.id !== company.id &&
          entry.registration.cnpj === registration.cnpj,
      )
    )
      throw new Error(
        "Este CNPJ já tem cadastro. Use a empresa existente e crie outra unidade ou trabalho.",
      );
    company.name = text(command.name, 160);
    company.registration = registration;
    for (const job of state.jobs)
      if (job.companyId === company.id) {
        job.company = company.name;
        job.scopeReviewed = false;
        job.independentlyReviewed = false;
      }
    jobId = `company:${company.id}`;
    detail =
      "Cadastro atualizado; escopo dos trabalhos precisa de nova conferência. Versões entregues preservadas.";
  } else if (
    command.type === "company-create" ||
    command.type === "company-add-contact"
  ) {
    if (actor.role !== "technical") throw new Error(m.accessDenied);
    const values =
      command.type === "company-create" ? command.contacts : [command.contact];
    const contacts = values.map((value) => ({
      ...contactInputSchema.parse(value),
      id: uid(),
    }));
    const existing =
      command.type === "company-add-contact"
        ? state.companies.find((c) => c.id === command.companyId)
        : undefined;
    if (command.type === "company-add-contact" && !existing)
      throw new Error(m.missing);
    const all = [...(existing?.contacts ?? []), ...contacts];
    if (!all.length || new Set(all.map((c) => c.email)).size !== all.length)
      throw new Error(
        "Informe contatos com e-mails diferentes para esta empresa.",
      );
    const company = companySchema.parse({
      id: existing?.id ?? uid(),
      name:
        existing?.name ??
        (command.type === "company-create" ? command.name : ""),
      contacts: all,
      registration:
        existing?.registration ??
        (command.type === "company-create" ? command.registration : undefined),
    });
    if (
      !existing &&
      company.registration.cnpj &&
      state.companies.some(
        (entry) => entry.registration.cnpj === company.registration.cnpj,
      )
    )
      throw new Error(
        "Este CNPJ já tem cadastro. Use a empresa existente e crie outra unidade ou trabalho.",
      );
    if (existing) existing.contacts = all;
    else state.companies.push(company);
    jobId = `company:${company.id}`;
    detail = company.name;
  } else if (command.type === "create") {
    if (actor.role !== "technical") throw new Error(m.accessDenied);
    const company = state.companies.find((c) => c.id === command.companyId);
    if (!company) throw new Error(m.missing);
    const profile = selectProfile(
      command.industry,
      command.state,
      command.water,
    );
    if (
      command.catalogueIds?.some(
        (id) => !profile.items.some((item) => item.catalogueId === id),
      )
    )
      throw new Error(
        "A seleção inicial contém um requisito que não faz parte deste perfil.",
      );
    jobId = uid();
    state.jobs.push({
      id: jobId,
      companyId: text(command.companyId, 160),
      company: company.name,
      facility: text(command.facility, 160),
      title: text(command.title, 160),
      period: text(command.period, 40),
      city: text(command.city, 120),
      state: command.state,
      industry: command.industry,
      profileSupported: profile.supported,
      scopeReviewed: false,
      independentlyReviewed: false,
      services: command.services ?? [],
      postcode: command.postcode ?? "",
      street: command.street ?? "",
      requirements: command.catalogueIds
        ? profile.items.filter((r) =>
            command.catalogueIds!.includes(r.catalogueId!),
          )
        : profile.items,
      concerns: [],
    });
    detail = command.title;
  } else {
    jobId = command.jobId;
    const job = visibleJobs(state, actorId).find((j) => j.id === jobId);
    if (!job) throw new Error(m.accessDenied);
    const clientActions = ["submit", "upload", "acknowledge"];
    if (actor.role === "client" && !clientActions.includes(command.type))
      throw new Error(m.accessDenied);
    if (actor.role === "reviewer" && command.type !== "independent-review")
      throw new Error(m.accessDenied);
    const req =
      "requirementId" in command
        ? job.requirements.find((r) => r.id === command.requirementId)
        : undefined;
    if ("requirementId" in command && !req) throw new Error(m.missing);
    switch (command.type) {
      case "add-catalogue": {
        const keys = [...new Set(command.catalogueIds)];
        if (
          !keys.length ||
          keys.some(
            (key) => !requirementCatalogue.some((entry) => entry.id === key),
          )
        )
          throw new Error(m.required);
        for (const key of keys) {
          const entry = requirementCatalogue.find((entry) => entry.id === key)!;
          if (
            job.requirements.some(
              (r) => r.catalogueId === key || r.title === entry.title,
            )
          )
            continue;
          job.requirements.push({
            ...item(uid(), entry.title, entry.help, key === "water"),
            catalogueId: key,
            source: catalogueSource,
          });
        }
        detail = keys.join(", ");
        break;
      }
      case "add":
        job.requirements.push(
          item(uid(), text(command.title, 200), text(command.help)),
        );
        detail = command.title;
        break;
      case "edit":
        req!.title = text(command.title, 200);
        req!.help = text(command.help);
        if (req!.status === "accepted") req!.status = "needed";
        detail = req!.title;
        break;
      case "exclude":
        req!.exclusionReason = text(command.reason);
        req!.status = "excluded";
        detail = `${req!.title}: ${req!.exclusionReason}`;
        break;
      case "restore":
        req!.status = "needed";
        detail = req!.title;
        break;
      case "request":
        if (req!.status === "excluded") throw new Error(m.invalidTransition);
        req!.request = text(command.message);
        req!.deadline = command.deadline || undefined;
        req!.status = "requested";
        detail = `${req!.title}: ${req!.request}`;
        break;
      case "submit":
        if (
          actor.role !== "client" ||
          !["requested", "correction"].includes(req!.status)
        )
          throw new Error(m.invalidTransition);
        if (!command.confirmed) throw new Error(m.submissionRequired);
        if (
          command.documentIds.some(
            (id) =>
              !state.documents.some(
                (d) =>
                  d.id === id && d.jobId === jobId && d.actorId === actorId,
              ),
          )
        )
          throw new Error(m.accessDenied);
        req!.submissions.push({
          id: uid(),
          at: now(),
          actorId,
          text: text(command.text),
          documentIds: [...command.documentIds],
          confirmed: command.confirmed,
        });
        req!.status = "review";
        detail = req!.title;
        break;
      case "review":
        if (req!.status !== "review") throw new Error(m.invalidTransition);
        if (
          command.decision === "accepted" &&
          !req!.submissions.at(-1)?.documentIds.length
        )
          throw new Error(
            "Anexe pelo menos uma evidência sintética antes de conferir.",
          );
        req!.reviewNote = text(command.reason);
        req!.reviews.push({
          at: now(),
          actorId,
          decision: command.decision,
          reason: req!.reviewNote,
          submissionId: req!.submissions.at(-1)!.id,
        });
        req!.status =
          command.decision === "accepted" ? "accepted" : "correction";
        detail = `${req!.title}: ${req!.reviewNote}`;
        break;
      case "concern":
        job.concerns.push({
          id: uid(),
          text: text(command.text),
          resolved: false,
        });
        detail = command.text;
        break;
      case "resolve-concern": {
        const concern = job.concerns.find((c) => c.id === command.concernId);
        if (!concern) throw new Error(m.missing);
        concern.resolution = text(command.reason);
        concern.resolved = true;
        detail = concern.text;
        break;
      }
      case "upload":
        if (
          command.document.jobId !== jobId ||
          command.document.actorId !== actorId
        )
          throw new Error(m.accessDenied);
        if (
          state.documents.reduce((sum, d) => sum + d.size, 0) +
            command.document.size >
          MAX_TOTAL_BYTES
        )
          throw new Error(m.uploadLimit);
        state.documents.push(documentSchema.parse(command.document));
        detail = command.document.name;
        break;
      case "validate-scope":
        job.scopeReviewed = true;
        detail = m.profilePending;
        break;
      case "independent-review":
        if (
          actor.role !== "reviewer" ||
          job.requirements.some(
            (r) => !["accepted", "excluded"].includes(r.status),
          ) ||
          job.concerns.some((c) => !c.resolved)
        )
          throw new Error(m.finalBlocked);
        job.independentlyReviewed = true;
        detail =
          "Revisão por outro perfil simulado; não constitui revisão profissional.";
        break;
      case "release":
        state.deliveries.push(
          releaseSnapshot(state, actorId, jobId, command.kind, command.note),
        );
        detail = command.note;
        break;
      case "acknowledge": {
        if (actor.role !== "client") throw new Error(m.accessDenied);
        const delivery = state.deliveries.find(
          (d) => d.id === command.deliveryId && d.jobId === jobId,
        );
        if (!delivery) throw new Error(m.missing);
        delivery.acknowledgedAt = now();
        detail = String(delivery.version);
        break;
      }
      case "invitation": {
        const email = z.email().parse(command.email.trim().toLowerCase());
        const contact = state.companies
          .find((entry) => entry.id === job.companyId)
          ?.contacts.find((entry) => entry.email === email);
        if (!contact)
          throw new Error(
            "Adicione este e-mail aos contatos da empresa antes de preparar o convite.",
          );
        issueInvitation(state, job.companyId, contact.id, jobId);
        detail = "Convite simulado; nenhum e-mail enviado.";
        break;
      }
    }
    if (
      !["release", "acknowledge", "invitation", "independent-review"].includes(
        command.type,
      )
    )
      job.independentlyReviewed = false;
    if (
      ["add", "add-catalogue", "edit", "exclude", "restore"].includes(
        command.type,
      )
    )
      job.scopeReviewed = false;
  }
  state.revision += 1;
  state.events.push({
    id: uid(),
    jobId,
    actorId,
    at: now(),
    type: command.type,
    detail,
  });
  return stateSchema.parse(state);
}
