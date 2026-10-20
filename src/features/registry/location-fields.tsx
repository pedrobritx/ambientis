"use client";
import { useEffect, useRef, useState } from "react";
import { Field } from "../../components/ui/dialog";
import { Select } from "../../components/ui/select";
import { lookupMunicipalities, lookupPostcode } from "./brasil-api";
export function LocationFields({
  region,
  value,
  onChange,
}: {
  region: "GO" | "DF";
  value: { city: string; postcode: string; street: string };
  onChange: (value: { city: string; postcode: string; street: string }) => void;
}) {
  const [places, setPlaces] = useState<{ name: string; code: string }[]>([]);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof lookupPostcode>
  > | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const active = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  useEffect(() => () => active.current?.abort(), [region]);
  async function consult(kind: "places" | "postcode") {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const id = ++sequence.current;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      if (kind === "places") {
        const list = await lookupMunicipalities(region, controller.signal);
        if (id === sequence.current) setPlaces(list);
      } else {
        const address = await lookupPostcode(value.postcode, controller.signal);
        if (id === sequence.current) {
          if (address.state !== region)
            throw new Error(
              `O CEP pertence a ${address.state}; confira a localização da unidade antes de aplicar.`,
            );
          setResult(address);
        }
      }
    } catch (e) {
      if (!controller.signal.aborted && id === sequence.current)
        setError(e instanceof Error ? e.message : "Consulta indisponível.");
    } finally {
      if (id === sequence.current) setBusy(false);
    }
  }
  return (
    <fieldset className="location-fields">
      <legend>Localização da unidade atendida</legend>
      <p className="source-note">
        Pode ser diferente do endereço cadastral da empresa. A seleção de
        requisitos considera esta unidade.
      </p>
      <div className="form-grid">
        <Field label={region === "GO" ? "Município" : "Localidade"}>
          <input
            name="city"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            required
            maxLength={120}
          />
        </Field>
        <div className="field lookup-action">
          <span>Municípios / IBGE</span>
          <button
            type="button"
            className="secondary"
            disabled={busy}
            onClick={() => void consult("places")}
          >
            Buscar localidades de {region}
          </button>
        </div>
        {places.length > 0 && (
          <Field label="Escolher localidade consultada">
            <Select
              value={value.city}
              options={[
                { value: "", label: "Escolha para preencher" },
                ...places.map((p) => ({ value: p.name, label: p.name })),
              ]}
              onValueChange={(city) => onChange({ ...value, city })}
            />
          </Field>
        )}
        <Field label="CEP da unidade">
          <input
            value={value.postcode}
            onChange={(e) => {
              sequence.current++;
              active.current?.abort();
              setBusy(false);
              setResult(null);
              onChange({ ...value, postcode: e.target.value });
            }}
            inputMode="numeric"
            maxLength={9}
          />
        </Field>
        <div className="field lookup-action">
          <span>Endereço pelo CEP</span>
          <button
            type="button"
            className="secondary"
            disabled={busy}
            onClick={() => void consult("postcode")}
          >
            {busy ? "Consultando…" : "Buscar endereço da unidade"}
          </button>
        </div>
        <Field label="Endereço da unidade">
          <input
            value={value.street}
            onChange={(e) => onChange({ ...value, street: e.target.value })}
            maxLength={200}
          />
        </Field>
      </div>
      {result && (
        <section
          className="lookup-result"
          aria-label="Endereço encontrado para a unidade"
        >
          <p>
            {result.street} · {result.city}/{result.state}
          </p>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              onChange({
                ...value,
                city: result.city,
                street: result.street,
                postcode: result.postcode,
              });
              setResult(null);
            }}
          >
            Aplicar endereço da unidade
          </button>
        </section>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
