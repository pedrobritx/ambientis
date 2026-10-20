import { z } from "zod";
import type { WorkspaceState } from "./workflow";
import { contactInputSchema } from "./registration";
export const invitationSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  email: z.email(),
  at: z.string(),
  companyId: z.string().optional(),
  contactId: z.string().optional(),
  code: z
    .string()
    .regex(/^[A-F0-9]{32}$/)
    .optional(),
  expiresAt: z.string().optional(),
  status: z
    .enum(["legacy", "pending", "accepted", "revoked"])
    .default("legacy"),
  acceptedAt: z.string().optional(),
  version: z.number().int().positive().default(1),
});
export type Invitation = z.infer<typeof invitationSchema>;
const token = () => crypto.randomUUID().replace(/-/g, "").toUpperCase();
const expiry = () =>
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
export function invitationCompany(state: WorkspaceState, invite: Invitation) {
  return (
    invite.companyId ??
    state.jobs.find((job) => job.id === invite.jobId)?.companyId
  );
}
export function issueInvitation(
  state: WorkspaceState,
  companyId: string,
  contactId: string,
  jobId?: string,
): Invitation {
  const company = state.companies.find((company) => company.id === companyId);
  const contact = company?.contacts.find((contact) => contact.id === contactId);
  if (!company || !contact)
    throw new Error(
      "Cadastre um contato válido para esta empresa antes de gerar o convite.",
    );
  for (const invite of state.invitations)
    if (invite.contactId === contactId && invite.status === "pending") {
      invite.status = "revoked";
      invite.code = undefined;
    }
  const result: Invitation = {
    id: crypto.randomUUID(),
    jobId: jobId ?? `company:${companyId}`,
    companyId,
    contactId,
    email: contact.email,
    at: new Date().toISOString(),
    code: token(),
    expiresAt: expiry(),
    status: "pending",
    version: 1,
  };
  state.invitations.push(result);
  return result;
}
export function renewInvitation(state: WorkspaceState, id: string): Invitation {
  const invite = state.invitations.find((entry) => entry.id === id);
  if (!invite || invite.status === "accepted")
    throw new Error(
      "Este convite não pode ser renovado; o perfil já foi criado ou o convite não existe.",
    );
  const companyId = invitationCompany(state, invite);
  const company = state.companies.find((entry) => entry.id === companyId);
  const contact = company?.contacts.find(
    (entry) => entry.id === invite.contactId || entry.email === invite.email,
  );
  if (!contact)
    throw new Error(
      "Cadastre o contato da empresa antes de gerar um novo código.",
    );
  for (const other of state.invitations)
    if (
      other.id !== invite.id &&
      other.contactId === contact.id &&
      other.status === "pending"
    ) {
      other.status = "revoked";
      other.code = undefined;
    }
  invite.companyId = companyId;
  invite.contactId = contact.id;
  invite.code = token();
  invite.expiresAt = expiry();
  invite.at = new Date().toISOString();
  invite.status = "pending";
  invite.version++;
  return invite;
}
export function resolveInvitation(state: WorkspaceState, value: string) {
  const code = value.trim().toUpperCase();
  const invite = state.invitations.find(
    (entry) => entry.code === code && entry.status === "pending",
  );
  if (
    !invite ||
    !invite.expiresAt ||
    !Number.isFinite(Date.parse(invite.expiresAt)) ||
    Date.parse(invite.expiresAt) <= Date.now()
  )
    throw new Error(
      "Convite inválido, expirado ou já utilizado. Peça à equipe técnica um novo código.",
    );
  const company = state.companies.find(
    (entry) => entry.id === invitationCompany(state, invite),
  );
  const contact = company?.contacts.find(
    (entry) => entry.id === invite.contactId && entry.email === invite.email,
  );
  if (!company || !contact)
    throw new Error(
      "O contato deste convite não está mais disponível. Peça um novo convite.",
    );
  return { invite, company, contact };
}
export function acceptInvitation(
  state: WorkspaceState,
  code: string,
  profile: { name: string; position: string; phone: string },
) {
  const { invite, company, contact } = resolveInvitation(state, code);
  const fields = contactInputSchema.parse({ ...profile, email: invite.email });
  Object.assign(contact, fields);
  invite.status = "accepted";
  invite.acceptedAt = new Date().toISOString();
  invite.code = undefined;
  return { actorId: `contact:${contact.id}`, jobId: `company:${company.id}` };
}
