"use client";
import { useEffect, useRef, useState } from "react";
import { Field } from "../../components/ui/dialog";
import { Select } from "../../components/ui/select";
import { sectorOptions, type Registration } from "../../domain/registration";
import { lookupCompany, lookupPostcode } from "./brasil-api";
export function RegistrationFields({
  value,
  onChange,
  name,
  onNameChange,
}: {
  value: Registration;
  onChange: (value: Registration) => void;
  name: string;
  onNameChange: (name: string) => void;
}) {
  const [companyResult, setCompanyResult] = useState<Awaited<
    ReturnType<typeof lookupCompany>
  > | null>(null);
  const [addressResult, setAddressResult] = useState<Awaited<
    ReturnType<typeof lookupPostcode>
  > | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  useEffect(() => () => request.current?.abort(), []);
  function change(key: keyof Registration, text: string) {
    if (key === "cnpj" || key === "postcode") {
      sequence.current++;
      request.current?.abort();
      setBusy(null);
      setCompanyResult(null);
      setAddressResult(null);
      setError("");
    }
    onChange({ ...value, [key]: text });
  }
  async function consult(kind: "company" | "address") {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const id = ++sequence.current;
    setBusy(kind);
    setError("");
    setCompanyResult(null);
    setAddressResult(null);
    try {
      if (kind === "company") {
        const result = await lookupCompany(value.cnpj, controller.signal);
        if (id === sequence.current) setCompanyResult(result);
      } else {
        const result = await lookupPostcode(value.postcode, controller.signal);
        if (id === sequence.current) setAddressResult(result);
      }
    } catch (error) {
      if (!controller.signal.aborted && id === sequence.current)
        setError(
          error instanceof Error
            ? error.message
            : "Consulta indisponível; preencha manualmente.",
        );
    } finally {
      if (id === sequence.current) setBusy(null);
    }
  }
  return (
    <fieldset className="registration-fields">
      <legend>Cadastro da empresa</legend>
      <div className="form-grid">
        <Field
          label="CNPJ"
          hint="Obrigatório para novas empresas. Aceita formato numérico ou alfanumérico; dados antigos permanecem preservados."
        >
          <input
            value={value.cnpj}
            onChange={(e) => change("cnpj", e.target.value)}
            required
            maxLength={18}
            autoCapitalize="characters"
            placeholder="12.ABC.345/01DE-35"
          />
        </Field>
        <div className="field lookup-action">
          <span>Consulta cadastral pública</span>
          <button
            type="button"
            className="secondary"
            disabled={!!busy}
            onClick={() => void consult("company")}
          >
            {busy === "company"
              ? "Consultando CNPJ…"
              : "Consultar CNPJ na BrasilAPI"}
          </button>
          <small>
            Envie apenas o CNPJ. Confira o resultado antes de aplicar.
          </small>
        </div>
        <Field label="Nome da empresa ou contratante">
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required
            maxLength={160}
            autoComplete="off"
            placeholder="Empresa fictícia"
          />
        </Field>
        <Field label="Setor / ramo">
          <Select
            value={value.sector}
            onValueChange={(sector) =>
              onChange({ ...value, sector: sector as Registration["sector"] })
            }
            options={sectorOptions}
          />
        </Field>
        <Field label="CNAE principal">
          <input
            value={value.cnae}
            onChange={(e) => change("cnae", e.target.value)}
            maxLength={12}
            placeholder="Código cadastral"
          />
        </Field>
        <Field label="Descrição do CNAE">
          <input
            value={value.cnaeDescription}
            onChange={(e) => change("cnaeDescription", e.target.value)}
            maxLength={240}
          />
        </Field>
      </div>
      {companyResult && (
        <section
          className="lookup-result"
          aria-label="Resultado da consulta CNPJ"
        >
          <h3>Confira o cadastro encontrado</h3>
          <p>
            <strong>{companyResult.name}</strong>
          </p>
          <p>
            {companyResult.cnpj} · {companyResult.cnaeDescription}
          </p>
          <p>
            {companyResult.street}, {companyResult.number} ·{" "}
            {companyResult.city}/{companyResult.state}
          </p>
          <p className="muted">
            O CNAE descreve o cadastro; confirme a atividade efetiva da unidade
            e os requisitos aplicáveis.
          </p>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              onNameChange(companyResult.name);
              onChange({ ...value, ...companyResult });
              setCompanyResult(null);
            }}
          >
            Aplicar dados públicos conferidos
          </button>
        </section>
      )}
      <details>
        <summary>Endereço cadastral e CNAEs secundários</summary>
        <div className="form-grid">
          <Field label="CEP da empresa">
            <input
              value={value.postcode}
              onChange={(e) => change("postcode", e.target.value)}
              inputMode="numeric"
              maxLength={9}
            />
          </Field>
          <div className="field lookup-action">
            <span>Endereço pelo CEP</span>
            <button
              className="secondary"
              type="button"
              disabled={!!busy}
              onClick={() => void consult("address")}
            >
              {busy === "address"
                ? "Consultando CEP…"
                : "Consultar CEP na BrasilAPI"}
            </button>
          </div>
          <Field label="Logradouro da empresa">
            <input
              value={value.street}
              onChange={(e) => change("street", e.target.value)}
              maxLength={200}
            />
          </Field>
          <Field label="Número da empresa">
            <input
              value={value.number}
              onChange={(e) => change("number", e.target.value)}
              maxLength={30}
            />
          </Field>
          <Field label="Bairro da empresa">
            <input
              value={value.district}
              onChange={(e) => change("district", e.target.value)}
              maxLength={120}
            />
          </Field>
          <Field label="Município cadastral">
            <input
              value={value.city}
              onChange={(e) => change("city", e.target.value)}
              maxLength={120}
            />
          </Field>
          <Field label="UF cadastral">
            <input
              value={value.state}
              onChange={(e) => change("state", e.target.value.toUpperCase())}
              maxLength={2}
            />
          </Field>
        </div>
        {addressResult && (
          <section
            className="lookup-result"
            aria-label="Resultado da consulta CEP"
          >
            <p>
              {addressResult.street} · {addressResult.district} ·{" "}
              {addressResult.city}/{addressResult.state}
            </p>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                onChange({ ...value, ...addressResult });
                setAddressResult(null);
              }}
            >
              Aplicar endereço conferido
            </button>
          </section>
        )}
        {value.secondaryCnaes.length > 0 && (
          <ul>
            {value.secondaryCnaes.map((cnae) => (
              <li key={cnae.code}>
                {cnae.code} · {cnae.description}
              </li>
            ))}
          </ul>
        )}
      </details>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {value.registryCheckedAt && (
        <p className="source-note">
          Dados públicos consultados na BrasilAPI em{" "}
          {new Date(value.registryCheckedAt).toLocaleDateString("pt-BR")}.
          Campos editáveis; confirme o cadastro e a unidade atendida.
        </p>
      )}
    </fieldset>
  );
}
