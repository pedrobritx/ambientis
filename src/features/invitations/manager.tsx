"use client";
import { useState } from "react";
import { Dialog, Empty } from "../../components/ui/dialog";
import { invitationCompany } from "../../domain/invitations";
import { actorById } from "../../domain/workflow";
import type { Controller } from "../workspace/controller";
export function InvitationManager({
  controller: c,
  companyId,
}: {
  controller: Controller;
  companyId?: string;
}) {
  const [message, setMessage] = useState("");
  if (actorById(c.actorId, c.state).role !== "technical")
    return <Empty title="Gerenciamento disponível à equipe técnica" />;
  const companies = c.state.companies.filter(
    (company) => !companyId || company.id === companyId,
  );
  return (
    <>
      <p className="notice">
        Convites locais para testar a criação de perfil neste mesmo navegador.
        Não são login, não verificam o e-mail e não funcionam em outro
        dispositivo. Nenhum e-mail é enviado.
      </p>
      <p className="source-note">
        O código vale por 7 dias e pode ser usado uma vez. Gerar um novo código
        invalida o anterior. Em operação real, a validação ficará no servidor
        autenticado.
      </p>
      {message && <p role="status">{message}</p>}
      {companies.map((company) => (
        <section className="invitation-company" key={company.id}>
          <h3>{company.name}</h3>
          {company.contacts.map((contact) => {
            const invite = c.state.invitations.findLast(
              (invite) =>
                invitationCompany(c.state, invite) === company.id &&
                (invite.contactId === contact.id ||
                  invite.email === contact.email),
            );
            const pending = invite?.status === "pending";
            const expired =
              pending &&
              (!invite.expiresAt || Date.parse(invite.expiresAt) <= Date.now());
            const link = invite?.code
              ? `${location.origin}/#convite/${invite.code}`
              : "";
            return (
              <article className="invitation-card" key={contact.id}>
                <strong>{contact.name}</strong>
                <p>{contact.email}</p>
                <p className="source-note">
                  {invite?.status === "accepted"
                    ? "Perfil criado nesta demonstração"
                    : expired
                      ? "Código expirado"
                      : pending
                        ? "Aguardando criação do perfil"
                        : invite
                          ? "Sem código ativo"
                          : "Convite ainda não preparado"}
                </p>
                {pending && !expired && link && (
                  <>
                    <label className="field">
                      <span>Link de convite para {contact.name}</span>
                      <input
                        readOnly
                        value={link}
                        onFocus={(e) => e.target.select()}
                      />
                    </label>
                    <label className="field">
                      <span>Código de convite para {contact.name}</span>
                      <input
                        readOnly
                        value={invite.code}
                        onFocus={(e) => e.target.select()}
                      />
                    </label>
                    <div className="inline-actions">
                      <button
                        className="secondary"
                        onClick={() => {
                          if (!navigator.clipboard) {
                            setMessage(
                              "Selecione e copie o link exibido acima.",
                            );
                            return;
                          }
                          void navigator.clipboard.writeText(link).then(
                            () =>
                              setMessage(
                                "Link local copiado. Use apenas neste navegador.",
                              ),
                            () =>
                              setMessage(
                                "Selecione e copie o link exibido acima.",
                              ),
                          );
                        }}
                      >
                        Copiar link local
                      </button>
                      <a
                        className="button secondary"
                        href={`#convite/${invite.code}`}
                      >
                        Testar entrada do convidado
                      </a>
                    </div>
                  </>
                )}
                <div className="inline-actions">
                  {invite && invite.status !== "accepted" ? (
                    <button
                      className="secondary"
                      onClick={() => {
                        if (
                          c.execute({
                            type: "renew-invitation",
                            invitationId: invite.id,
                          })
                        )
                          setMessage(
                            "Novo código gerado. O código anterior deixou de funcionar.",
                          );
                      }}
                    >
                      Gerar novo código para {contact.name}
                    </button>
                  ) : (
                    <button
                      className="secondary"
                      onClick={() => {
                        if (
                          c.execute({
                            type: "invite-contact",
                            companyId: company.id,
                            contactId: contact.id,
                          })
                        )
                          setMessage(
                            "Convite local preparado; nenhum e-mail enviado.",
                          );
                      }}
                    >
                      Gerar convite para {contact.name}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      ))}
    </>
  );
}
export function InvitationDialog({
  controller,
  companyId,
  close,
}: {
  controller: Controller;
  companyId: string;
  close: () => void;
}) {
  return (
    <Dialog title="Convites e perfis" onClose={close}>
      <InvitationManager controller={controller} companyId={companyId} />
    </Dialog>
  );
}
