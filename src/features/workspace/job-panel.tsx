"use client";
import { Select } from "../../components/ui/select";
import { UploadField } from "../../components/ui/upload-field";
import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Mail,
  Check,
  FileText,
  Download,
  ChevronRight,
} from "../../components/ui/icons";
import {
  actorById,
  type Command,
  type Job,
  type Requirement,
} from "../../domain/workflow";
import { statusLabel, eventLabel, m } from "../../messages/pt-BR";
import { Dialog, Empty, Field } from "../../components/ui/dialog";
import { prepareDocument } from "./files";
import { decodeFile, downloadBytes } from "../dossier/export";
import { DossierPanel } from "../dossier/panel";
import type { Controller } from "./controller";
import { jobHref, jobStage } from "./dashboard";
import { CatalogueDialog } from "./catalogue-dialog";
import { InvitationDialog } from "../invitations/manager";

type Modal = {
  type:
    | "add"
    | "edit"
    | "request"
    | "exclude"
    | "review"
    | "concern"
    | "resolve"
    | "invite";
  requirement?: Requirement;
  concernId?: string;
};
export function JobPanel({
  job,
  tab,
  requirementId,
  controller: c,
}: {
  job: Job;
  tab: string;
  requirementId?: string;
  controller: Controller;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    requirementId ?? null,
  );
  const [modal, setModal] = useState<Modal | null>(null);
  const [catalogue, setCatalogue] = useState(false);
  const [busy, setBusy] = useState(false);
  const [includeExcluded, setIncludeExcluded] = useState(false);
  const actor = actorById(c.actorId, c.state);
  const technical = actor.role === "technical";
  const req = job.requirements.find((r) => r.id === selectedId);
  const deliveryDocIds = new Set(
    c.state.deliveries
      .filter((d) => d.jobId === job.id)
      .flatMap((d) => d.documents.map((f) => f.id)),
  );
  const docs = c.state.documents.filter(
    (d) =>
      d.jobId === job.id &&
      (actor.role !== "client" ||
        d.actorId === c.actorId ||
        deliveryDocIds.has(d.id)),
  );
  const attentionCount = job.concerns.filter((p) => !p.resolved).length;
  const tabs = [
    ["requisitos", "Requisitos"],
    ["documentos", "Documentos"],
    ["entregaveis", "Entregáveis"],
    ...(actor.role === "client" ? [] : [["historico", "Histórico"]]),
  ];
  const at = (value: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(new Date(value));
  async function upload(file: File | undefined) {
    if (!file) return false;
    setBusy(true);
    try {
      const d = await prepareDocument(file, job.id, c.actorId);
      return !!c.execute({ type: "upload", jobId: job.id, document: d });
    } catch (e) {
      c.announce(e instanceof Error ? e.message : m.fileMismatch, true);
      return false;
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <a className="back-link" href="#inicio">
        <ArrowLeft size={17} /> Voltar ao início
      </a>
      <header className="page-heading compact">
        <div>
          <p className="context-line">
            {job.company} · {job.facility} · {job.period}
          </p>
          <h1>{job.title}</h1>
          <span className="status needed">{jobStage(job)}</span>
        </div>
        {technical && (
          <button
            className="secondary"
            onClick={() => setModal({ type: "invite" })}
          >
            <Mail size={18} /> Preparar convite
          </button>
        )}
      </header>
      <nav className="job-tabs" aria-label="Seções do trabalho">
        {tabs.map(([id, label]) => (
          <a
            key={id}
            href={jobHref(job, id)}
            aria-current={tab === id ? "page" : undefined}
          >
            {label}
          </a>
        ))}
      </nav>
      {tab === "requisitos" && (
        <>
          <div className="notice subtle">
            {job.profileSupported
              ? m.profilePending
              : "Perfil não coberto. Os requisitos precisam ser definidos manualmente e revisados."}
          </div>
          <div className="section-toolbar">
            <div>
              <h2>Requisitos do trabalho</h2>
              <p className="muted">
                {job.requirements.filter((r) => r.status === "accepted").length}{" "}
                conferidos ·{" "}
                {
                  job.requirements.filter(
                    (r) => !["accepted", "excluded"].includes(r.status),
                  ).length
                }{" "}
                pendentes
              </p>
            </div>
            {technical && (
              <button className="secondary" onClick={() => setCatalogue(true)}>
                <Plus size={18} /> Adicionar requisito
              </button>
            )}
          </div>
          <div className="work-columns">
            <div>
              <div className="row-group">
                {job.requirements
                  .filter((r) => includeExcluded || r.status !== "excluded")
                  .map((r) => (
                    <button
                      key={r.id}
                      className={`requirement-row ${selectedId === r.id ? "selected" : ""}`}
                      onClick={() => setSelectedId(r.id)}
                      aria-expanded={selectedId === r.id}
                      aria-controls="requirement-detail"
                    >
                      <span>
                        <strong>{r.title}</strong>
                        <small>
                          {r.conditional
                            ? "Aplicabilidade a confirmar"
                            : r.submissions.length
                              ? `${r.submissions.length} resposta(s) preservada(s)`
                              : "Confira a informação e a evidência"}
                        </small>
                      </span>
                      <span className={`status ${r.status}`}>
                        {statusLabel[r.status]}
                      </span>
                      <ChevronRight size={18} />
                    </button>
                  ))}
                {!job.requirements.length && (
                  <Empty title="Checklist ainda não definido">
                    Adicione os requisitos apropriados para este escopo.
                  </Empty>
                )}
              </div>
              {technical && (
                <label className="check-line">
                  <input
                    type="checkbox"
                    checked={includeExcluded}
                    onChange={(e) => setIncludeExcluded(e.target.checked)}
                  />{" "}
                  Mostrar itens fora do escopo
                </label>
              )}
            </div>
            <aside id="requirement-detail" className="detail-panel">
              {req ? (
                <>
                  <span className={`status ${req.status}`}>
                    {statusLabel[req.status]}
                  </span>
                  <h3>{req.title}</h3>
                  <p>{req.help}</p>
                  <p className="source-note">Origem: {req.source}</p>
                  {req.exclusionReason && (
                    <p>
                      <strong>Exclusão registrada:</strong>{" "}
                      {req.exclusionReason}
                    </p>
                  )}
                  {req.request && (
                    <div className="request-note">
                      <strong>Solicitação à empresa</strong>
                      <p>{req.request}</p>
                      {req.deadline && (
                        <small>
                          Prazo solicitado:{" "}
                          {req.deadline.split("-").reverse().join("/")}
                        </small>
                      )}
                    </div>
                  )}
                  {req.submissions.map((s, i) => (
                    <div className="submission" key={s.id}>
                      <strong>Resposta {i + 1}</strong>
                      <small>{at(s.at)}</small>
                      <p>{s.text}</p>
                      <p className="muted">
                        {s.documentIds.length} arquivo(s) vinculado(s) ·
                        declaração demonstrativa registrada
                      </p>
                    </div>
                  ))}
                  {req.reviewNote && (
                    <p>
                      <strong>Retorno da revisão:</strong> {req.reviewNote}
                    </p>
                  )}
                  {technical && (
                    <div className="button-stack">
                      {req.status === "excluded" ? (
                        <button
                          className="secondary"
                          onClick={() =>
                            c.execute({
                              type: "restore",
                              jobId: job.id,
                              requirementId: req.id,
                            })
                          }
                        >
                          Restaurar requisito
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              setModal({
                                type:
                                  req.status === "review"
                                    ? "review"
                                    : "request",
                                requirement: req,
                              })
                            }
                          >
                            {req.status === "review"
                              ? "Revisar resposta"
                              : "Solicitar à empresa"}
                          </button>
                          <div className="inline-actions">
                            <button
                              className="text-button"
                              onClick={() =>
                                setModal({ type: "edit", requirement: req })
                              }
                            >
                              Editar requisito
                            </button>
                            <button
                              className="text-button"
                              onClick={() =>
                                setModal({ type: "exclude", requirement: req })
                              }
                            >
                              Excluir do escopo
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {actor.role === "client" &&
                    ["requested", "correction"].includes(req.status) && (
                      <form
                        className="response-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const f = new FormData(e.currentTarget);
                          const result = c.execute({
                            type: "submit",
                            jobId: job.id,
                            requirementId: req.id,
                            text: String(f.get("response")),
                            documentIds: f.getAll("documents").map(String),
                            confirmed: f.get("confirmed") === "on",
                          });
                          if (result) e.currentTarget.reset();
                        }}
                      >
                        <Field label="Sua resposta">
                          <textarea
                            name="response"
                            rows={3}
                            maxLength={1200}
                            required
                          />
                        </Field>
                        <UploadField
                          label="Anexar evidência sintética"
                          disabled={busy}
                          onFile={upload}
                        />
                        <fieldset>
                          <legend>Vincular arquivos à resposta</legend>
                          {docs.map((d) => (
                            <label className="check-line" key={d.id}>
                              <input
                                type="checkbox"
                                name="documents"
                                value={d.id}
                              />
                              {d.name}
                            </label>
                          ))}
                          {!docs.length && (
                            <p className="muted">
                              Anexe um arquivo para poder vinculá-lo.
                            </p>
                          )}
                        </fieldset>
                        <label className="check-line">
                          <input type="checkbox" name="confirmed" required />{" "}
                          Confirmo este envio fictício. Isto não é uma
                          assinatura eletrônica.
                        </label>
                        <p className="source-note">
                          Assinatura externa e validação de identidade serão
                          integradas antes do uso real.
                        </p>
                        <button type="submit" disabled={busy}>
                          Enviar resposta demonstrativa
                        </button>
                      </form>
                    )}
                </>
              ) : (
                <Empty title="Escolha um requisito">
                  Veja a orientação, as evidências e o próximo passo.
                </Empty>
              )}
            </aside>
          </div>
          {actor.role !== "client" && (
            <section className="concerns">
              <div className="section-toolbar">
                <div>
                  <h2>Pontos de atenção</h2>
                  <p className="muted">
                    Notas internas · {attentionCount} em aberto · sem detecção
                    automática
                  </p>
                </div>
                {technical && (
                  <button
                    className="secondary"
                    onClick={() => setModal({ type: "concern" })}
                  >
                    <Plus size={18} /> Registrar ponto
                  </button>
                )}
              </div>
              {job.concerns.length ? (
                <ul className="plain-list">
                  {job.concerns.map((p) => (
                    <li key={p.id}>
                      <div>
                        <strong>{p.text}</strong>
                        <p className="muted">
                          {p.resolved
                            ? `Resolvido: ${p.resolution}`
                            : "Aguardando conferência da equipe"}
                        </p>
                      </div>
                      {technical && !p.resolved && (
                        <button
                          className="secondary"
                          onClick={() =>
                            setModal({ type: "resolve", concernId: p.id })
                          }
                        >
                          Registrar resolução
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">
                  Registre uma dúvida quando precisar confrontar informações ou
                  pedir esclarecimento.
                </p>
              )}
            </section>
          )}
          {technical && (
            <div className="scope-review">
              <label className="check-line">
                <input
                  type="checkbox"
                  checked={job.scopeReviewed}
                  disabled={job.scopeReviewed}
                  onChange={() =>
                    c.execute({ type: "validate-scope", jobId: job.id })
                  }
                />{" "}
                Conferi o escopo deste ensaio. O catálogo continua sem aprovação
                profissional.
              </label>
            </div>
          )}
          {actor.role === "reviewer" && (
            <div className="guidance">
              <h3>Revisão independente simulada</h3>
              <p>
                A troca de perfil não é uma revisão profissional independente.
              </p>
              <button
                onClick={() =>
                  c.execute({ type: "independent-review", jobId: job.id })
                }
                disabled={job.independentlyReviewed}
              >
                <Check size={18} />
                {job.independentlyReviewed
                  ? "Revisão simulada registrada"
                  : "Conferir o ensaio"}
              </button>
            </div>
          )}
        </>
      )}
      {tab === "documentos" && (
        <>
          <div className="section-toolbar">
            <div>
              <h2>Documentos deste trabalho</h2>
              <p className="muted">
                Originais preservados. Cada envio cria um novo registro.
              </p>
            </div>
          </div>
          <UploadField
            label="Adicionar arquivo sintético"
            disabled={busy || actor.role === "reviewer"}
            onFile={upload}
          />
          <div className="row-group">
            {docs.map((d) => (
              <div className="document-row" key={d.id}>
                <FileText size={22} />
                <div>
                  <strong>{d.name}</strong>
                  <span>
                    {new Intl.NumberFormat("pt-BR", {
                      maximumFractionDigits: 1,
                    }).format(d.size / 1024)}{" "}
                    KB · {at(d.at)}
                  </span>
                </div>
                <button
                  className="secondary"
                  onClick={() =>
                    downloadBytes(decodeFile(d.base64), d.name, d.mime)
                  }
                  aria-label={`Baixar ${d.name}`}
                >
                  <Download size={17} /> Baixar
                </button>
              </div>
            ))}
            {!docs.length && (
              <Empty title="Nenhum documento disponível">
                Adicione apenas exemplos fictícios para explorar o fluxo.
              </Empty>
            )}
          </div>
        </>
      )}
      {tab === "entregaveis" && <DossierPanel job={job} controller={c} />}
      {tab === "historico" && actor.role !== "client" && (
        <>
          <h2>Histórico do trabalho</h2>
          <ol className="timeline">
            {c.state.events
              .filter((e) => e.jobId === job.id)
              .slice()
              .reverse()
              .map((e) => (
                <li key={e.id}>
                  <div>
                    <strong>{eventLabel[e.type] ?? e.type}</strong>
                    <small>
                      {at(e.at)} · {actorById(e.actorId, c.state).label}
                    </small>
                    <p>{e.detail}</p>
                  </div>
                </li>
              ))}
          </ol>
          {!c.state.events.some((e) => e.jobId === job.id) && (
            <Empty title="As alterações aparecerão aqui">
              Sem registros neste ensaio ainda.
            </Empty>
          )}
        </>
      )}
      {catalogue && (
        <CatalogueDialog
          job={job}
          controller={c}
          close={() => setCatalogue(false)}
          manual={() => {
            setCatalogue(false);
            setModal({ type: "add" });
          }}
        />
      )}
      {modal?.type === "invite" && (
        <InvitationDialog
          controller={c}
          companyId={job.companyId}
          close={() => setModal(null)}
        />
      )}
      {modal && modal.type !== "invite" && (
        <ActionDialog
          modal={modal}
          job={job}
          controller={c}
          close={() => setModal(null)}
        />
      )}
    </>
  );
}
function ActionDialog({
  modal,
  job,
  controller: c,
  close,
}: {
  modal: Modal;
  job: Job;
  controller: Controller;
  close: () => void;
}) {
  const [error, setError] = useState("");
  const titles = {
    add: "Adicionar requisito",
    edit: "Editar requisito",
    request: "Solicitar à empresa",
    exclude: "Excluir do escopo",
    review: "Revisar resposta",
    concern: "Registrar ponto de atenção",
    resolve: "Registrar resolução",
    invite: "Preparar convite de demonstração",
  };
  const r = modal.requirement;
  return (
    <Dialog title={titles[modal.type]} onClose={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const val = (name: string) => String(f.get(name) ?? "");
          let command: Command;
          switch (modal.type) {
            case "add":
              command = {
                type: "add",
                jobId: job.id,
                title: val("title"),
                help: val("help"),
              };
              break;
            case "edit":
              command = {
                type: "edit",
                jobId: job.id,
                requirementId: r!.id,
                title: val("title"),
                help: val("help"),
              };
              break;
            case "request":
              command = {
                type: "request",
                jobId: job.id,
                requirementId: r!.id,
                message: val("message"),
                deadline: val("deadline"),
              };
              break;
            case "exclude":
              command = {
                type: "exclude",
                jobId: job.id,
                requirementId: r!.id,
                reason: val("reason"),
              };
              break;
            case "review":
              command = {
                type: "review",
                jobId: job.id,
                requirementId: r!.id,
                decision: val("decision") as "accepted" | "correction",
                reason: val("reason"),
              };
              break;
            case "concern":
              command = { type: "concern", jobId: job.id, text: val("reason") };
              break;
            case "resolve":
              command = {
                type: "resolve-concern",
                jobId: job.id,
                concernId: modal.concernId!,
                reason: val("reason"),
              };
              break;
            case "invite":
              command = {
                type: "invitation",
                jobId: job.id,
                email: val("email"),
              };
              break;
          }
          const result = c.execute(command);
          if (result) close();
          else
            setError(
              "A ação não foi concluída. Confira a mensagem no início da página e os dados abaixo.",
            );
        }}
      >
        {r && <p className="context-line">{r.title}</p>}
        {["add", "edit"].includes(modal.type) && (
          <>
            <Field label="Título do requisito">
              <input
                name="title"
                defaultValue={r?.title}
                maxLength={200}
                required
              />
            </Field>
            <Field label="Orientação e evidência esperada">
              <textarea
                name="help"
                defaultValue={r?.help}
                rows={4}
                maxLength={1200}
                required
              />
            </Field>
          </>
        )}
        {modal.type === "request" && (
          <>
            <Field
              label="O que a empresa deve fornecer?"
              hint="Explique o período, o documento e como ele será utilizado."
            >
              <textarea
                name="message"
                rows={4}
                maxLength={1200}
                defaultValue={
                  r?.request ??
                  `Por favor, forneça a evidência de “${r?.title}” referente ao período ${job.period}.`
                }
                required
              />
            </Field>
            <Field label="Prazo solicitado (opcional)">
              <input type="date" name="deadline" defaultValue={r?.deadline} />
            </Field>
            <p className="notice">
              A solicitação fica registrada neste navegador. Nenhum e-mail será
              enviado.
            </p>
          </>
        )}
        {modal.type === "review" && (
          <Field label="Resultado da revisão">
            <Select
              name="decision"
              defaultValue="correction"
              options={[
                { value: "correction", label: "Pedir correção" },
                { value: "accepted", label: "Conferir evidência do ensaio" },
              ]}
            />
          </Field>
        )}
        {["exclude", "review", "concern", "resolve"].includes(modal.type) && (
          <Field
            label={
              modal.type === "concern"
                ? "O que precisa ser conferido?"
                : "Justificativa / retorno"
            }
          >
            <textarea name="reason" rows={4} maxLength={1200} required />
          </Field>
        )}
        {modal.type === "invite" && (
          <>
            <Field label="E-mail fictício do contato">
              <input
                type="email"
                name="email"
                placeholder="contato@example.test"
                required
              />
            </Field>
            <p className="notice">
              Este registro não cria uma conta nem envia e-mail. Use
              “Perspectiva” para explorar o perfil de cliente da empresa
              exemplo.
            </p>
          </>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button
            className="secondary"
            type="button"
            data-dialog-close
            onClick={close}
          >
            Cancelar
          </button>
          <button type="submit">
            {modal.type === "invite"
              ? "Registrar convite simulado"
              : "Salvar e continuar"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
