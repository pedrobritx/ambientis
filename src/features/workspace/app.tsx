"use client";
import { BrandLogo } from "../../components/ui/brand";
import { InvitationManager } from "../invitations/manager";
import { GuestOnboarding } from "../invitations/guest";
import { AppearanceToggle } from "../../components/ui/appearance-toggle";
import { flushSync } from "react-dom";
import { ZodError } from "zod";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  Home,
  Building2,
  FolderOpen,
  FileText,
  Users,
  Search,
  Bell,
  AlertCircle,
  ChevronRight,
  Plus,
} from "../../components/ui/icons";
import {
  actorById,
  actorsForState,
  applyCommand,
  seedState,
  stateSchema,
  visibleJobs,
  type Command,
} from "../../domain/workflow";
import { m, eventLabel } from "../../messages/pt-BR";
import { Dialog, Empty } from "../../components/ui/dialog";
import { Dashboard, jobHref, jobStage } from "./dashboard";
import { JobPanel } from "./job-panel";
import { Select } from "../../components/ui/select";
import { CompanyDirectory } from "../companies/directory";
import { NewJob } from "./new-job";
import type { Controller } from "./controller";
import { decodeFile, downloadBytes } from "../dossier/export";

const KEY = "ambientis-local-review-v1";
function readDraft() {
  try {
    const raw = localStorage.getItem(KEY);
    return {
      state: raw ? stateSchema.parse(JSON.parse(raw)) : seedState(),
      error: "",
      writable: true,
    };
  } catch {
    return { state: seedState(), error: m.damaged, writable: false };
  }
}
const subscribeHydration = () => () => {};
const routeDepth = (hash: string) => {
  const parts = hash.replace(/^#/, "").split("/");
  if (!parts[0] || parts[0] === "inicio") return 0;
  return parts[0] === "trabalho" ? (parts[3] ? 3 : 2) : 1;
};
const subscribeHash = (callback: () => void) => {
  let previous = location.hash;
  let transition: ViewTransition | undefined;
  const navigate = () => {
    const next = location.hash;
    document.documentElement.dataset.routeDirection =
      routeDepth(next) < routeDepth(previous) ? "back" : "forward";
    previous = next;
    if (
      document.startViewTransition &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      transition?.skipTransition();
      const current = document.startViewTransition(() => flushSync(callback));
      transition = current;
      // Rapid navigation may legitimately skip the decorative animation.
      void current.ready.catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.warn("Page transition could not animate", error);
        }
      });
      void current.finished.then(
        () => {
          if (transition === current) transition = undefined;
        },
        (error: unknown) => console.error("Page navigation failed", error),
      );
    } else callback();
  };
  window.addEventListener("hashchange", navigate);
  return () => {
    window.removeEventListener("hashchange", navigate);
    transition?.skipTransition();
  };
};
export function WorkspaceApp() {
  const mounted = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  return mounted ? (
    <WorkspaceReady />
  ) : (
    <main className="loading-shell" aria-busy="true">
      Preparando ambiente de revisão…
    </main>
  );
}
function WorkspaceReady() {
  const [initial] = useState(readDraft);
  const [state, setState] = useState(initial.state);
  const [canPersist, setCanPersist] = useState(initial.writable);
  const [actorId, setActorId] = useState("technical");
  const [notice, setNotice] = useState({
    text: initial.error,
    error: !!initial.error,
  });
  const [modal, setModal] = useState<
    "profile" | "notifications" | "new" | null
  >(null);
  const [newCompanyId, setNewCompanyId] = useState<string | undefined>(
    undefined,
  );
  const [query, setQuery] = useState("");
  const route = useSyncExternalStore(
    subscribeHash,
    () => location.hash.slice(1) || "inicio",
    () => "inicio",
  );
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);
  const actor = actorById(actorId, state);
  const jobs = visibleJobs(state, actorId);
  const announce = (text: string, error = false) => setNotice({ text, error });
  const execute = (command: Command) => {
    try {
      if (canPersist) {
        const latest = readDraft();
        if (!latest.writable) throw new Error(m.damaged);
        if (latest.state.revision !== state.revision) throw new Error(m.stale);
      }
      const next = applyCommand(state, actorId, command, state.revision);
      setState(next);
      if (canPersist) {
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
          announce(
            command.type === "invitation"
              ? "Convite simulado registrado; nenhum e-mail enviado."
              : "Alteração salva neste navegador.",
          );
        } catch {
          setCanPersist(false);
          announce(m.persistence, true);
        }
      } else announce(m.persistence, true);
      return next;
    } catch (e) {
      announce(
        e instanceof ZodError
          ? (e.issues.find((issue) => issue.code === "custom")?.message ??
              m.required)
          : e instanceof Error
            ? e.message
            : m.required,
        true,
      );
      return null;
    }
  };
  const c: Controller = { state, actorId, execute, announce };
  const [section, jobId, tab = "requisitos", requirementId] = route.split("/");
  const job = jobs.find((j) => j.id === jobId);
  const matches = jobs.filter((j) =>
    `${j.company} ${j.facility} ${j.title} ${j.requirements.map((r) => r.title).join(" ")}`
      .toLocaleLowerCase("pt-BR")
      .includes(query.toLocaleLowerCase("pt-BR")),
  );
  const sharedIds = new Set(
    state.deliveries
      .filter((d) => jobs.some((j) => j.id === d.jobId))
      .flatMap((d) => d.documents.map((f) => f.id)),
  );
  const docs = state.documents.filter(
    (d) =>
      jobs.some((j) => j.id === d.jobId) &&
      (actor.role !== "client" || d.actorId === actorId || sharedIds.has(d.id)),
  );
  const navigation = [
    { id: "inicio", label: "Início", icon: Home },
    {
      id: "empresas",
      label: actor.role === "client" ? "Minha empresa" : "Empresas",
      icon: Building2,
    },
    { id: "trabalhos", label: "Trabalhos", icon: FolderOpen },
    { id: "documentos", label: "Documentos", icon: FileText },
  ];
  if (section === "convite")
    return (
      <GuestOnboarding
        key={jobId ?? ""}
        code={jobId ?? ""}
        controller={c}
        created={(id) => {
          setActorId(id);
          location.hash = "inicio";
        }}
      />
    );
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Pular para o conteúdo
      </a>
      <aside className="sidebar" aria-label="Área de navegação">
        <a className="brand" href="#inicio" aria-label="Ambientis">
          <BrandLogo />
        </a>
        <p className="brand-description">
          Ambiente de revisão
          <br />
          para consultoria ambiental.
        </p>
        <nav aria-label="Navegação principal">
          {navigation.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={
                section === id || (section === "trabalho" && id === "trabalhos")
                  ? "page"
                  : undefined
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </a>
          ))}
        </nav>
        <button
          className="profile-trigger"
          aria-expanded={modal === "profile"}
          onClick={() => setModal("profile")}
        >
          <Users size={22} />
          <span>Perfil da equipe</span>
        </button>
      </aside>
      <div className="workspace">
        <header aria-label="Contexto e controles da demonstração">
          <div className="demo-notice">
            <AlertCircle size={19} />
            <span>{m.demo}</span>
          </div>
          <div className="utility-bar">
            <span>
              {canPersist
                ? "Salvo neste navegador · Demonstração"
                : "Sem salvamento persistente · Demonstração"}
            </span>
            <div>
              <div className="perspective">
                <span>Perspectiva</span>
                <Select
                  aria-label="Perspectiva de demonstração"
                  value={actorId}
                  options={actorsForState(state).map((a) => ({
                    value: a.id,
                    label: a.label,
                  }))}
                  onValueChange={(value) => {
                    setActorId(value);
                    location.hash = "inicio";
                    setNotice({
                      text: "Perspectiva simulada. Todos os exemplos compartilham o mesmo navegador; isto não é autenticação.",
                      error: false,
                    });
                  }}
                />
              </div>
              <AppearanceToggle />
              <button
                className="icon-button mobile-profile"
                onClick={() => setModal("profile")}
                aria-label="Perfil da equipe"
              >
                <Users size={19} />
              </button>
              <button
                className="icon-button"
                onClick={() => setModal("notifications")}
                aria-label="Ver atualizações"
              >
                <Bell size={19} />
              </button>
            </div>
          </div>
        </header>
        {notice.text && (
          <div
            className={`feedback ${notice.error ? "error" : ""}`}
            role={notice.error ? "alert" : "status"}
          >
            {notice.text}
          </div>
        )}
        <main id="main-content" tabIndex={-1}>
          {section === "convites" && (
            <>
              <header className="page-heading">
                <div>
                  <h1>Convites e perfis</h1>
                  <p>Contatos convidados e renovação de códigos locais.</p>
                </div>
              </header>
              <InvitationManager controller={c} />
            </>
          )}
          {section === "inicio" && (
            <Dashboard controller={c} newJob={() => setModal("new")} />
          )}
          {section === "empresas" && (
            <CompanyDirectory
              controller={c}
              newJob={(id) => {
                setNewCompanyId(id);
                setModal("new");
              }}
            />
          )}
          {section === "trabalhos" && (
            <>
              <header className="page-heading">
                <div>
                  <h1>Trabalhos</h1>
                  <p>Encontre o trabalho e continue de onde parou.</p>
                </div>
                {actor.role === "technical" && (
                  <button onClick={() => setModal("new")}>
                    <Plus size={19} /> Novo trabalho
                  </button>
                )}
              </header>
              <label className="search-field">
                <Search size={20} />
                <input
                  aria-label="Buscar empresa ou trabalho"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar empresa, trabalho ou requisito"
                />
              </label>
              <div className="row-group">
                {matches.map((j) => (
                  <a className="directory-row" key={j.id} href={jobHref(j)}>
                    <Building2 size={24} />
                    <div>
                      <h3>{j.company}</h3>
                      <p>
                        {j.title} · {j.facility} · {j.period}
                      </p>
                    </div>
                    <span className="status needed">{jobStage(j)}</span>
                    <ChevronRight size={20} />
                  </a>
                ))}
                {!matches.length && (
                  <Empty title="Nenhum resultado">
                    Tente outro nome ou requisito.
                  </Empty>
                )}
              </div>
            </>
          )}
          {section === "trabalho" &&
            (job ? (
              <JobPanel
                key={`${job.id}-${actorId}-${requirementId ?? ""}`}
                job={job}
                tab={tab}
                requirementId={requirementId}
                controller={c}
              />
            ) : (
              <Empty title="Trabalho indisponível">
                Este perfil não tem acesso ao trabalho solicitado. Volte ao
                início.
              </Empty>
            ))}
          {section === "documentos" && (
            <>
              <header className="page-heading">
                <div>
                  <h1>Documentos</h1>
                  <p>Arquivos disponíveis no escopo desta perspectiva.</p>
                </div>
              </header>
              <div className="row-group">
                {docs.map((d) => (
                  <div key={d.id} className="document-row">
                    <FileText size={22} />
                    <div>
                      <strong>{d.name}</strong>
                      <a href={`#trabalho/${d.jobId}/documentos`}>
                        {jobs.find((j) => j.id === d.jobId)?.company}
                      </a>
                    </div>
                    <button
                      className="secondary"
                      onClick={() =>
                        downloadBytes(decodeFile(d.base64), d.name, d.mime)
                      }
                    >
                      Baixar original
                    </button>
                  </div>
                ))}
                {!docs.length && (
                  <Empty title="Seu acervo começa com a primeira evidência">
                    Abra um trabalho para adicionar um arquivo sintético.
                  </Empty>
                )}
              </div>
            </>
          )}
          {![
            "inicio",
            "empresas",
            "trabalhos",
            "trabalho",
            "documentos",
            "convites",
          ].includes(section) && (
            <Empty title="Página não encontrada">
              Use a navegação para continuar.
            </Empty>
          )}
        </main>
        <footer className="app-footer">
          Ambiente local de avaliação. Sem autenticação real, assinatura
          validada, envio de e-mails ou aprovação regulatória.
          {" "}<a href="/conexao">Conexão da equipe</a>
        </footer>
      </div>
      {modal === "new" && (
        <NewJob
          controller={c}
          initialCompanyId={newCompanyId}
          close={() => {
            setModal(null);
            setNewCompanyId(undefined);
          }}
        />
      )}
      {modal === "profile" && (
        <Dialog title="Perfil da equipe" onClose={() => setModal(null)}>
          {actor.role === "technical" && (
            <button
              className="secondary"
              onClick={() => {
                setModal(null);
                location.hash = "convites";
              }}
            >
              Gerenciar convites e renovar códigos
            </button>
          )}
          {actor.role === "client" && (
            <p className="context-line">{actor.label}</p>
          )}
          <p>
            Explore os papéis usando o seletor “Perspectiva”. A equipe prepara o
            trabalho; os clientes respondem às solicitações; o revisor simulado
            confere o ensaio.
          </p>
          <div className="notice">
            Nenhum perfil é uma conta real. Não use informações privadas. A
            conversa com a responsável técnica e a interface de revisão serão em
            português.
          </div>
          <p className="muted">
            Acesso real, recuperação de conta, MFA e permissões no servidor são
            etapas posteriores, antes de dados de clientes.
          </p>
        </Dialog>
      )}
      {modal === "notifications" && (
        <Dialog title="Atualizações" onClose={() => setModal(null)}>
          <ul className="preview-list">
            {state.events
              .filter(
                (e) =>
                  jobs.some((j) => j.id === e.jobId) &&
                  !["concern", "resolve-concern"].includes(e.type),
              )
              .slice(-8)
              .reverse()
              .map((e) => (
                <li key={e.id}>
                  <strong>{eventLabel[e.type] ?? "Trabalho atualizado"}</strong>
                  <span>{jobs.find((j) => j.id === e.jobId)?.company}</span>
                </li>
              ))}
          </ul>
          {!state.events.length && (
            <Empty title="Sem novas atualizações">
              Suas próximas ações aparecerão no início.
            </Empty>
          )}
        </Dialog>
      )}
    </div>
  );
}
