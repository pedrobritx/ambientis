"use client";
import { type SupabaseClient } from "@supabase/supabase-js";
import { useMemo, useState, type FormEvent } from "react";
import { browserClient } from "../../lib/supabase/browser";
import { AppearanceToggle } from "../../components/ui/appearance-toggle";
import type { Database } from "../../lib/supabase/database.types";
type Row = Pick<
  Database["public"]["Tables"]["companies"]["Row"],
  "id" | "name"
>;
export function ConnectionPanel({
  config,
}: {
  config: { url: string; key: string } | null;
}) {
  const client = useMemo(
    () => (config ? browserClient(config) : null),
    [config],
  );
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [organizations, setOrganizations] = useState<Row[]>([]);
  const [companies, setCompanies] = useState<Row[]>([]);
  const [activeOrg, setActiveOrg] = useState("");
  async function api(path: string, method = "GET", values?: unknown) {
    const { data } = await (client as SupabaseClient).auth.getSession();
    if (!data.session) throw new Error("Entre na sua conta para continuar.");
    const response = await fetch(`/api/v1/${path}`, {
      method,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        ...(values ? { "Content-Type": "application/json" } : {}),
      },
      body: values ? JSON.stringify(values) : undefined,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return result.data;
  }
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await action();
    } catch (e) {
      setMessage(
        e instanceof TypeError
          ? "Conexão indisponível. Confira sua internet e tente novamente."
          : e instanceof Error
          ? e.message
          : "Não foi possível concluir. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function openOrganization(id: string) {
    const rows = await api(`companies?organization_id=${id}`);
    setActiveOrg(id);
    setCompanies(rows);
  }
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    await run(async () => {
      const result = await client!.auth.signInWithPassword({
        email: String(values.get("email")),
        password: String(values.get("password")),
      });
      if (result.error)
        throw new Error(
          "Não foi possível entrar. Confira a conta e a senha, e confirme seu e-mail se necessário.",
        );
      form.reset();
      setSignedIn(true);
      const orgs = await api("organizations");
      setOrganizations(orgs);
      if (orgs.length) await openOrganization(orgs[0].id);
    });
  }
  return (
    <main id="main-content" className="connection-shell">
      <div className="section-toolbar">
        <a className="button secondary" href="/">
          Voltar à demonstração
        </a>
        <AppearanceToggle />
      </div>
      <h1>Conexão da equipe</h1>
      <p>
        Área conectada ao Supabase. A demonstração e seus rascunhos continuam
        separados.
      </p>
      <p className="callout">
        Primeira conexão em avaliação. Use somente dados fictícios. Arquivos,
        convites e entregas ainda seguem em demonstração local.
      </p>
      {!config ? (
        <section className="surface">
          <h2>Configuração pendente</h2>
          <p>
            Configure a URL do projeto e a chave pública no ambiente local e
            reinicie o preview.
          </p>
        </section>
      ) : !signedIn ? (
        <section className="surface">
          <h2>Entrar na equipe</h2>
          <p>
            Use uma conta já cadastrada no Supabase Auth deste projeto. A senha
            não fica salva neste navegador.
          </p>
          <form onSubmit={login}>
            <label className="field">
              E-mail
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
              />
            </label>
            <label className="field">
              Senha
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={200}
              />
            </label>
            <button disabled={busy} type="submit">
              {busy ? "Entrando…" : "Entrar"}
            </button>
          </form>
          <p>
            O primeiro usuário deve ser criado pelo administrador no Supabase
            Auth. Não há cadastro público nem envio de convites nesta etapa.
          </p>
        </section>
      ) : (
        <>
          <div className="inline-actions">
            <button
              className="secondary"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const { error } = await client!.auth.signOut({
                    scope: "local",
                  });
                  if (error)
                    throw new Error("Não foi possível encerrar a sessão.");
                  setSignedIn(false);
                  setOrganizations([]);
                  setCompanies([]);
                  setActiveOrg("");
                })
              }
            >
              Sair da conta
            </button>
          </div>
          {!organizations.length ? (
            <section className="surface">
              <h2>Criar espaço da equipe</h2>
              <p>
                Sua conta será a proprietária. Outras pessoas não receberão
                acesso automaticamente.
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const name = String(
                    new FormData(event.currentTarget).get("name"),
                  );
                  void run(async () => {
                    const org = await api("organizations", "POST", { name });
                    setOrganizations(await api("organizations"));
                    await openOrganization(org.id);
                  });
                }}
              >
                <label className="field">
                  Nome da equipe
                  <input name="name" required maxLength={160} />
                </label>
                <button disabled={busy}>Criar espaço</button>
              </form>
            </section>
          ) : (
            <section className="surface">
              <h2>Empresas da equipe</h2>
              <div className="inline-actions">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    className="secondary"
                    aria-pressed={activeOrg === org.id}
                    disabled={busy}
                    onClick={() => void run(() => openOrganization(org.id))}
                  >
                    {org.name}
                  </button>
                ))}
              </div>
              {companies.length ? (
                <ul>
                  {companies.map((company) => (
                    <li key={company.id}>{company.name}</li>
                  ))}
                </ul>
              ) : (
                <p>Nenhuma empresa visível para sua conta nesta equipe.</p>
              )}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const name = String(new FormData(form).get("name"));
                  void run(async () => {
                    await api("companies", "POST", {
                      organization_id: activeOrg,
                      name,
                      sector: "other",
                    });
                    await openOrganization(activeOrg);
                    form.reset();
                  });
                }}
              >
                <label className="field">
                  Nome da empresa fictícia
                  <input name="name" required maxLength={200} />
                </label>
                <button disabled={busy}>Adicionar empresa fictícia</button>
              </form>
            </section>
          )}
        </>
      )}
      <p role="status" aria-live="polite">
        {message || (busy ? "Aguarde…" : "")}
      </p>
    </main>
  );
}
