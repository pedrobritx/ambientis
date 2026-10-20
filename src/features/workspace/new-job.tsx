"use client";
import { Select } from "../../components/ui/select";
import { useState } from "react";
import { Dialog, Field } from "../../components/ui/dialog";
import { selectProfile, type Job } from "../../domain/workflow";
import { sectorOptions } from "../../domain/registration";
import { serviceOptions } from "../../domain/catalogue";
import { LocationFields } from "../registry/location-fields";
import type { Controller } from "./controller";
export function NewJob({
  controller: c,
  close,
  initialCompanyId,
}: {
  controller: Controller;
  close: () => void;
  initialCompanyId?: string;
}) {
  const [company, setCompany] = useState(
    initialCompanyId ?? c.state.companies[0]?.id ?? "",
  );
  const selectedCompany = c.state.companies.find((item) => item.id === company);
  const [industry, setIndustry] = useState<Job["industry"]>(
    selectedCompany?.registration?.sector ??
      c.state.jobs.find((job) => job.companyId === company)?.industry ??
      "other",
  );
  const [region, setRegion] = useState<Job["state"]>("GO");
  const [water, setWater] = useState<"yes" | "no" | "unknown">("unknown");
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState({ facility: "", title: "", period: "" });
  const [address, setAddress] = useState({
    city: "",
    postcode: "",
    street: "",
  });
  const [services, setServices] = useState<string[]>(["diagnosis"]);
  const [included, setIncluded] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const profile = selectProfile(industry, region, water);
  return (
    <Dialog title="Novo trabalho" onClose={close}>
      <p className="muted">
        Etapa {step} de 2 · Você poderá adaptar os requisitos depois.
      </p>
      {step === 1 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const title =
              String(data.get("title") ?? "").trim() ||
              serviceOptions
                .filter((s) => services.includes(s.id))
                .map((s) => s.label)
                .join(" · ");
            if (!title || title.length > 160) {
              setError(
                "Selecione serviços ou dê um nome ao trabalho com até 160 caracteres.",
              );
              return;
            }
            setDraft({
              facility: String(data.get("facility")),
              title,
              period: String(data.get("period")),
            });
            setIncluded(null);
            setError("");
            setStep(2);
          }}
        >
          <div className="form-grid">
            <Field
              label="Empresa"
              hint={
                selectedCompany?.registration?.cnpj
                  ? `CNPJ ${selectedCompany.registration.cnpj}`
                  : "CNPJ ainda não informado no cadastro desta empresa."
              }
            >
              <Select
                value={company}
                onValueChange={(id) => {
                  setCompany(id);
                  setIndustry(
                    c.state.companies.find((entry) => entry.id === id)
                      ?.registration?.sector ?? "other",
                  );
                }}
                options={c.state.companies.map((entry) => ({
                  value: entry.id,
                  label: entry.name,
                }))}
              />
            </Field>
            <Field label="Unidade">
              <input
                name="facility"
                defaultValue={draft.facility}
                required
                maxLength={160}
                placeholder="Nome da unidade fictícia"
              />
            </Field>
            <Field
              label="Atividade efetiva"
              hint="Setor / ramo da unidade, separado da identificação da empresa. Confirme a atividade realizada, além do CNAE cadastral."
            >
              <Select
                value={industry}
                onValueChange={(value) => setIndustry(value as Job["industry"])}
                options={sectorOptions.map((s) => ({
                  ...s,
                  label: s.value === "hospital" ? "Hospital" : s.label,
                }))}
              />
            </Field>
            <Field label="Localização">
              <Select
                value={region}
                onValueChange={(value) => {
                  setRegion(value as Job["state"]);
                  setAddress({ city: "", postcode: "", street: "" });
                }}
                options={[
                  { value: "GO", label: "Goiás" },
                  { value: "DF", label: "Distrito Federal" },
                ]}
              />
            </Field>
            <Field label="Período do trabalho">
              <input
                name="period"
                defaultValue={draft.period}
                required
                maxLength={40}
                placeholder="Ex.: ano-base 2026"
              />
            </Field>
          </div>
          <LocationFields
            key={region}
            region={region}
            value={address}
            onChange={setAddress}
          />
          <fieldset className="choice-list">
            <legend>Serviços a entregar · selecione um ou mais</legend>
            {serviceOptions.map((service) => (
              <label className="checkbox-line" key={service.id}>
                <input
                  type="checkbox"
                  checked={services.includes(service.id)}
                  onChange={(e) =>
                    setServices((values) =>
                      e.target.checked
                        ? [...values, service.id]
                        : values.filter((id) => id !== service.id),
                    )
                  }
                />
                <span>{service.label}</span>
              </label>
            ))}
          </fieldset>
          <Field
            label="Serviço a entregar"
            hint="Nome personalizado opcional. Se ficar vazio, usamos os serviços selecionados como título."
          >
            <input
              name="title"
              defaultValue={draft.title}
              maxLength={160}
              placeholder="Ex.: diagnóstico documental"
            />
          </Field>
          <Field
            label="Há uso próprio de recursos hídricos?"
            hint="Uma resposta desconhecida mantém o item pendente de esclarecimento."
          >
            <Select
              value={water}
              onValueChange={(value) => setWater(value as typeof water)}
              options={[
                { value: "unknown", label: "A confirmar" },
                { value: "yes", label: "Sim" },
                { value: "no", label: "Não" },
              ]}
            />
          </Field>
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
            <button type="submit">Ver checklist sugerido</button>
          </div>
        </form>
      ) : (
        <>
          <div className="notice">
            {profile.supported
              ? "Sugestões ilustrativas; conteúdo técnico e aplicabilidade aguardam validação profissional. Desmarque o que não fará parte deste trabalho."
              : "Esta combinação ainda não tem um perfil. O trabalho será criado sem requisitos automáticos; adicione-os manualmente."}
          </div>
          <fieldset className="choice-list">
            <legend>Checklist inicial</legend>
            {profile.items.map((r) => (
              <label
                key={r.catalogueId}
                className="checkbox-line"
                aria-label={r.title}
              >
                <input
                  type="checkbox"
                  checked={
                    included === null || included.includes(r.catalogueId!)
                  }
                  onChange={(e) =>
                    setIncluded((current) => {
                      const all =
                        current ??
                        profile.items.map((entry) => entry.catalogueId!);
                      return e.target.checked
                        ? [...all, r.catalogueId!]
                        : all.filter((id) => id !== r.catalogueId);
                    })
                  }
                />
                <span>
                  <strong>{r.title}</strong>
                  <small>{r.help}</small>
                </span>
              </label>
            ))}
          </fieldset>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <button className="secondary" onClick={() => setStep(1)}>
              Voltar
            </button>
            <button
              onClick={() => {
                const result = c.execute({
                  type: "create",
                  companyId: company,
                  company: selectedCompany?.name ?? "",
                  ...draft,
                  ...address,
                  industry,
                  state: region,
                  water,
                  services: serviceOptions
                    .filter((s) => services.includes(s.id))
                    .map((s) => s.label),
                  catalogueIds:
                    included ?? profile.items.map((r) => r.catalogueId!),
                });
                if (result) {
                  location.hash = `trabalho/${result.jobs.at(-1)!.id}/requisitos`;
                  close();
                } else
                  setError(
                    "Não foi possível criar. Confira os campos e a mensagem no início da página.",
                  );
              }}
            >
              Criar trabalho de demonstração
            </button>
          </div>
        </>
      )}
    </Dialog>
  );
}
