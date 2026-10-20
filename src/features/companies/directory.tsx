"use client";
import { useState } from "react";
import { Dialog, Empty, Field } from "../../components/ui/dialog";
import { Building2, Plus, Users } from "../../components/ui/icons";
import {
  actorById,
  type ContactInput,
  type Company,
} from "../../domain/workflow";
import type { Controller } from "../workspace/controller";
import { emptyRegistration, sectorOptions } from "../../domain/registration";
import { RegistrationFields } from "../registry/registration-fields";
import { InvitationDialog } from "../invitations/manager";
const blank = (): ContactInput => ({
  name: "",
  position: "",
  phone: "",
  email: "",
});
export function CompanyDirectory({
  controller: c,
  newJob,
}: {
  controller: Controller;
  newJob: (id: string) => void;
}) {
  const [modal, setModal] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [inviteCompany, setInviteCompany] = useState<string | null>(null);
  const [editing, setEditing] = useState<Company | null>(null);
  const actor = actorById(c.actorId, c.state);
  const companies = c.state.companies.filter(
    (company) =>
      (actor.role !== "client" || company.id === actor.companyId) &&
      `${company.name} ${company.contacts.map((p) => p.name + " " + p.email).join(" ")}`
        .toLocaleLowerCase("pt-BR")
        .includes(query.toLocaleLowerCase("pt-BR")),
  );
  return (
    <>
      <header className="page-heading">
        <div>
          <h1>{actor.role === "client" ? "Minha empresa" : "Empresas"}</h1>
          <p>Unidades, trabalhos e pessoas de contato.</p>
        </div>
        {actor.role === "technical" && (
          <button onClick={() => setModal("new")}>
            <Plus size={19} />
            Adicionar empresa
          </button>
        )}
      </header>
      <Field label="Buscar empresa ou contato">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome da empresa, contato ou e-mail"
        />
      </Field>
      <div className="company-grid">
        {companies.map((company) => (
          <article key={company.id} className="surface company-card">
            <header>
              <Building2 size={24} />
              <h2>{company.name}</h2>
            </header>
            <p className="muted">
              {c.state.jobs.filter((j) => j.companyId === company.id).length}{" "}
              trabalho(s) · {company.contacts.length} contato(s)
            </p>
            <p className="source-note">
              {sectorOptions.find(
                (entry) => entry.value === company.registration?.sector,
              )?.label ?? "Setor a confirmar"}{" "}
              ·{" "}
              {company.registration?.cnpj
                ? `CNPJ ${company.registration?.cnpj}`
                : "CNPJ pendente de cadastro"}
            </p>
            {company.registration?.cnae && (
              <p className="source-note">
                CNAE {company.registration?.cnae} ·{" "}
                {company.registration?.cnaeDescription}
              </p>
            )}
            <ul className="contact-list">
              {company.contacts.map((contact) => (
                <li key={contact.id}>
                  <Users size={18} />
                  <div>
                    <strong>{contact.name}</strong>
                    {contact.position && <span>{contact.position}</span>}
                    <span>{contact.email}</span>
                    {contact.phone && <span>WhatsApp: {contact.phone}</span>}
                  </div>
                </li>
              ))}
            </ul>
            {actor.role === "technical" && (
              <div className="inline-actions">
                <button className="primary" onClick={() => newJob(company.id)}>
                  <Plus size={18} />
                  Novo trabalho
                </button>
                <button
                  className="secondary"
                  onClick={() => setModal(company.id)}
                >
                  Adicionar contato
                </button>
                <button
                  className="secondary"
                  onClick={() => setInviteCompany(company.id)}
                >
                  Convites e perfis
                </button>
                <button
                  className="secondary"
                  onClick={() => setEditing(company)}
                >
                  Editar cadastro
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      {!companies.length && (
        <Empty title="Nenhuma empresa encontrada">
          Cadastre uma empresa ou tente outra busca.
        </Empty>
      )}
      {editing && (
        <CompanyRegistrationDialog
          company={editing}
          controller={c}
          close={() => setEditing(null)}
        />
      )}
      {inviteCompany && (
        <InvitationDialog
          controller={c}
          companyId={inviteCompany}
          close={() => setInviteCompany(null)}
        />
      )}
      {modal && (
        <CompanyDialog
          controller={c}
          companyId={modal === "new" ? undefined : modal}
          close={() => setModal(null)}
        />
      )}
    </>
  );
}
function CompanyDialog({
  controller: c,
  companyId,
  close,
}: {
  controller: Controller;
  companyId?: string;
  close: () => void;
}) {
  const [contacts, setContacts] = useState<ContactInput[]>([blank()]);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [registration, setRegistration] = useState(emptyRegistration);
  const company = c.state.companies.find((x) => x.id === companyId);
  function update(index: number, key: keyof ContactInput, value: string) {
    setContacts((items) =>
      items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  }
  return (
    <Dialog
      title={company ? "Adicionar contato" : "Cadastrar empresa"}
      onClose={close}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const result = c.execute(
            company
              ? {
                  type: "company-add-contact",
                  companyId: company.id,
                  contact: contacts[0],
                }
              : { type: "company-create", name, contacts, registration },
          );
          if (result) close();
          else
            setError(
              "Confira o CNPJ, os campos e os e-mails; contatos da mesma empresa devem ter e-mails diferentes.",
            );
        }}
      >
        <p className="notice subtle">
          Demonstração local: use contatos fictícios. A consulta pública de
          cadastro preenche sugestões para sua conferência. Contas reais e envio
          de e-mails ainda não estão ativos.
        </p>
        {company ? (
          <p className="context-line">{company.name}</p>
        ) : (
          <RegistrationFields
            value={registration}
            onChange={setRegistration}
            name={name}
            onNameChange={setName}
          />
        )}
        {contacts.map((contact, i) => (
          <fieldset className="contact-editor" key={i}>
            <legend>Contato {i + 1}</legend>
            <div className="form-grid">
              <Field label={`Nome do contato ${i + 1}`}>
                <input
                  value={contact.name}
                  onChange={(e) => update(i, "name", e.target.value)}
                  required
                  maxLength={120}
                  autoComplete="off"
                />
              </Field>
              <Field label={`Cargo do contato ${i + 1}`}>
                <input
                  value={contact.position}
                  onChange={(e) => update(i, "position", e.target.value)}
                  maxLength={120}
                />
              </Field>
              <Field label={`E-mail do contato ${i + 1}`}>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => update(i, "email", e.target.value)}
                  required
                  maxLength={254}
                  autoComplete="off"
                  placeholder="contato@example.test"
                />
              </Field>
              <Field label={`WhatsApp do contato ${i + 1}`}>
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => update(i, "phone", e.target.value)}
                  maxLength={40}
                  placeholder="País, DDD e número"
                />
              </Field>
            </div>
          </fieldset>
        ))}
        {!company && contacts.length < 20 && (
          <button
            type="button"
            className="secondary"
            onClick={() => setContacts((items) => [...items, blank()])}
          >
            <Plus size={18} />
            Adicionar outro contato
          </button>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button
            type="button"
            className="secondary"
            data-dialog-close
            onClick={close}
          >
            Cancelar
          </button>
          <button type="submit">
            {company ? "Salvar contato" : "Salvar empresa e contatos"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function CompanyRegistrationDialog({
  company,
  controller: c,
  close,
}: {
  company: Company;
  controller: Controller;
  close: () => void;
}) {
  const [name, setName] = useState(company.name);
  const [registration, setRegistration] = useState(
    company.registration ?? emptyRegistration(),
  );
  const [error, setError] = useState("");
  return (
    <Dialog title="Editar cadastro da empresa" onClose={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (
            c.execute({
              type: "company-update",
              companyId: company.id,
              name,
              registration,
            })
          )
            close();
          else
            setError(
              "Confira o CNPJ e a mensagem do cadastro. Para outra entidade jurídica, crie outra empresa.",
            );
        }}
      >
        <p className="notice subtle">
          Alterações cadastrais pedem nova conferência do escopo dos trabalhos.
          As versões já entregues ficam preservadas.
        </p>
        <RegistrationFields
          name={name}
          onNameChange={setName}
          value={registration}
          onChange={setRegistration}
        />
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button
            type="button"
            className="secondary"
            data-dialog-close
            onClick={close}
          >
            Cancelar
          </button>
          <button type="submit">Salvar cadastro</button>
        </div>
      </form>
    </Dialog>
  );
}
