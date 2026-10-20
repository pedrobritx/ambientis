"use client";
import {
  ArrowRight,
  ChevronRight,
  FolderOpen,
  Plus,
} from "../../components/ui/icons";
import { visibleJobs, actorById, type Job } from "../../domain/workflow";
import { Empty } from "../../components/ui/dialog";
import { eventLabel } from "../../messages/pt-BR";
import type { Controller } from "./controller";
export const jobHref = (job: Job, tab = "requisitos") =>
  `#trabalho/${job.id}/${tab}`;
export function jobStage(job: Job) {
  if (job.requirements.some((r) => r.status === "review"))
    return "Aguardando revisão";
  if (
    job.requirements.some(
      (r) => r.status === "requested" || r.status === "correction",
    )
  )
    return "Aguardando empresa";
  if (
    job.requirements.length &&
    job.requirements.every((r) => ["accepted", "excluded"].includes(r.status))
  )
    return "Preparar entrega";
  return "Coleta em andamento";
}
export function Dashboard({
  controller: c,
  newJob,
}: {
  controller: Controller;
  newJob: () => void;
}) {
  const jobs = visibleJobs(c.state, c.actorId);
  const latestJobId = c.state.events.findLast((e) =>
    jobs.some((j) => j.id === e.jobId),
  )?.jobId;
  const first = jobs.find((j) => j.id === latestJobId) ?? jobs[0];
  const actor = actorById(c.actorId, c.state);
  const actions = jobs
    .flatMap((j) =>
      j.requirements
        .filter((r) =>
          actor.role === "client"
            ? ["requested", "correction"].includes(r.status)
            : r.status !== "accepted" && r.status !== "excluded",
        )
        .map((r) => ({ job: j, requirement: r })),
    )
    .slice(0, 3);
  const ids = new Set(jobs.map((j) => j.id));
  const events = c.state.events
    .filter(
      (e) =>
        ids.has(e.jobId) &&
        e.type !== "concern" &&
        e.type !== "resolve-concern",
    )
    .slice(-3)
    .reverse();
  return (
    <>
      <header className="page-heading">
        <div>
          <h1>
            {actor.role === "client"
              ? "Seu trabalho, acompanhado"
              : "Olá, equipe"}
          </h1>
          <p>Seu próximo passo, com clareza.</p>
        </div>
        {actor.role === "technical" && (
          <button onClick={newJob}>
            <Plus size={20} /> Novo trabalho
          </button>
        )}
      </header>
      <div className="dashboard-columns">
        <div>
          <section aria-labelledby="continue-heading">
            <h2 id="continue-heading">Continuar trabalho</h2>
            {first ? (
              <div className="continue-panel">
                <h3>
                  {first.company} · {first.facility}
                </h3>
                <p className="muted">
                  {first.title} · {first.period}
                </p>
                <span className="status needed">{jobStage(first)}</span>
                <div className="continue-action">
                  <div>
                    <small>Próxima ação</small>
                    <p>
                      {actor.role === "client"
                        ? "Conferir solicitações da equipe"
                        : "Conferir requisitos e documentos"}
                    </p>
                  </div>
                  <a className="button secondary" href={jobHref(first)}>
                    Continuar <ChevronRight size={18} />
                  </a>
                </div>
              </div>
            ) : (
              <Empty title="Seu primeiro trabalho começa aqui">
                Crie um trabalho para organizar requisitos e evidências.
              </Empty>
            )}
          </section>
          <section aria-labelledby="attention-heading">
            <h2 id="attention-heading">Precisa de atenção</h2>
            <div className="row-group">
              {actions.length ? (
                actions.map(({ job, requirement: r }) => (
                  <a
                    className="action-row"
                    key={r.id}
                    href={`${jobHref(job)}/${r.id}`}
                  >
                    <div>
                      <strong>
                        {actor.role === "client"
                          ? "Responder solicitação"
                          : r.status === "review"
                            ? "Revisar envio da empresa"
                            : r.status === "requested"
                              ? "Acompanhar documento solicitado"
                              : "Solicitar evidência em falta"}
                      </strong>
                      <span>
                        {job.company} · {job.facility}
                      </span>
                    </div>
                    <p>{r.title}</p>
                    <span className="arrow-box">
                      <ChevronRight size={18} />
                    </span>
                  </a>
                ))
              ) : (
                <Empty title="Nenhuma ação pendente">
                  Seus trabalhos continuam disponíveis ao lado.
                </Empty>
              )}
            </div>
          </section>
        </div>
        <div>
          <section aria-labelledby="jobs-heading">
            <h2 id="jobs-heading">Seus trabalhos</h2>
            <div className="row-group">
              {jobs.map((j) => (
                <a className="job-row" key={j.id} href={jobHref(j)}>
                  <FolderOpen size={20} />
                  <div>
                    <strong>{j.company}</strong>
                    <span>
                      {j.state === "GO" ? "Goiás" : "Distrito Federal"}
                    </span>
                  </div>
                  <span className="status needed">{jobStage(j)}</span>
                  <ChevronRight size={18} />
                </a>
              ))}
            </div>
          </section>
          <section aria-labelledby="updates-heading">
            <h2 id="updates-heading">Atualizações</h2>
            <div className="row-group">
              {events.length ? (
                events.map((e) => (
                  <a
                    key={e.id}
                    className="update-row"
                    href={`#trabalho/${e.jobId}/${actor.role === "client" ? "requisitos" : "historico"}`}
                  >
                    <div>
                      <strong>
                        {eventLabel[e.type] ?? "Trabalho atualizado"}
                      </strong>
                      <span>{jobs.find((j) => j.id === e.jobId)?.company}</span>
                    </div>
                    <ArrowRight size={17} />
                  </a>
                ))
              ) : (
                <div className="update-row">
                  <div>
                    <strong>Demonstração iniciada</strong>
                    <span>Exemplos fictícios para explorar o fluxo.</span>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      <aside className="guidance" aria-label="Orientação para revisão">
        <h3>Como a revisão funciona</h3>
        <p>Informação recebida não significa informação aprovada.</p>
        <small>
          Os envios ficam separados da revisão técnica. Explore as perspectivas
          no perfil da equipe.
        </small>
      </aside>
    </>
  );
}
