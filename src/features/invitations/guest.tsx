"use client";
import { useState } from "react";
import { BrandLogo } from "../../components/ui/brand";
import { AppearanceToggle } from "../../components/ui/appearance-toggle";
import { Field } from "../../components/ui/dialog";
import { resolveInvitation } from "../../domain/invitations";
import type { Controller } from "../workspace/controller";
export function GuestOnboarding({
  code,
  controller: c,
  created,
}: {
  code: string;
  controller: Controller;
  created: (actorId: string) => void;
}) {
  const [typedCode, setTypedCode] = useState(code);
  const [error, setError] = useState("");
  let resolved: ReturnType<typeof resolveInvitation> | null = null;
  let invalid = "";
  if (code) {
    try {
      resolved = resolveInvitation(c.state, code);
    } catch (e) {
      invalid = e instanceof Error ? e.message : "Convite indisponível.";
    }
  }
  return (
    <main className="guest-shell">
      <header>
        <a className="brand" aria-label="Ambientis" href="#inicio">
          <BrandLogo />
        </a>
        <AppearanceToggle />
      </header>
      <section className="surface">
        <h1>
          {resolved
            ? "Crie seu perfil de demonstração"
            : "Entrar com convite local"}
        </h1>
        <p className="notice">
          Ensaio de convite no mesmo navegador. Não é autenticação real, não
          confirma propriedade do e-mail e não cria senha. Use informações
          fictícias.
        </p>
        {!resolved ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              location.hash = `convite/${typedCode.trim().toUpperCase()}`;
            }}
          >
            <Field label="Código do convite">
              <input
                value={typedCode}
                onChange={(e) => setTypedCode(e.target.value)}
                required
                maxLength={32}
                autoCapitalize="characters"
              />
            </Field>
            {invalid && (
              <p role="alert" className="error">
                {invalid}
              </p>
            )}
            <button type="submit">Conferir convite</button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const values = new FormData(e.currentTarget);
              const before = resolved!;
              const result = c.execute({
                type: "accept-invitation",
                code,
                profile: {
                  name: String(values.get("name")),
                  position: String(values.get("position")),
                  phone: String(values.get("phone")),
                },
              });
              if (result) {
                created(`contact:${before.contact.id}`);
              } else
                setError(
                  "O perfil não foi criado. O convite pode ter sido renovado ou utilizado; peça um novo código à equipe.",
                );
            }}
          >
            <p>
              <strong>{resolved.company.name}</strong>
            </p>
            <Field label="E-mail convidado">
              <input value={resolved.invite.email} readOnly type="email" />
            </Field>
            <Field label="Seu nome">
              <input
                name="name"
                required
                defaultValue={resolved.contact.name}
                maxLength={120}
              />
            </Field>
            <Field label="Seu cargo">
              <input
                name="position"
                defaultValue={resolved.contact.position}
                maxLength={120}
              />
            </Field>
            <Field label="Seu WhatsApp">
              <input
                name="phone"
                type="tel"
                defaultValue={resolved.contact.phone}
                maxLength={40}
              />
            </Field>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button type="submit">Criar perfil e acompanhar empresa</button>
          </form>
        )}
        <p className="source-note">
          A equipe técnica pode renovar o código em “Convites e perfis”. Dados
          privados e documentos de clientes não devem ser usados nesta
          demonstração.
        </p>
        <a href="#inicio">Voltar à demonstração</a>
      </section>
    </main>
  );
}
