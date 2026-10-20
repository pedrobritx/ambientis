"use client";
import { useState } from "react";
import { Dialog, Field } from "../../components/ui/dialog";
import { catalogueFor, requirementCatalogue } from "../../domain/catalogue";
import type { Job } from "../../domain/workflow";
import type { Controller } from "./controller";
export function CatalogueDialog({
  job,
  controller: c,
  close,
  manual,
}: {
  job: Job;
  controller: Controller;
  close: () => void;
  manual: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [all, setAll] = useState(false);
  const [error, setError] = useState("");
  const entries = (
    all ? requirementCatalogue : catalogueFor(job.industry)
  ).filter((r) =>
    `${r.title} ${r.help}`
      .toLocaleLowerCase("pt-BR")
      .includes(search.toLocaleLowerCase("pt-BR")),
  );
  return (
    <Dialog title="Selecionar requisitos" onClose={close}>
      <p className="notice">
        Catálogo operacional ilustrativo. Cada sugestão precisa de confirmação
        de aplicabilidade pela responsável técnica; não é uma lista automática
        de obrigações legais.
      </p>
      <Field label="Buscar no catálogo">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Resíduos, licença, água…"
        />
      </Field>
      <label className="checkbox-line">
        <input
          type="checkbox"
          checked={all}
          onChange={(e) => setAll(e.target.checked)}
        />
        Mostrar sugestões de outros setores
      </label>
      <fieldset className="choice-list">
        <legend>Selecione um ou mais requisitos</legend>
        {entries.map((r) => {
          const exists = job.requirements.some(
            (entry) => entry.catalogueId === r.id || entry.title === r.title,
          );
          return (
            <label className="checkbox-line" key={r.id} aria-label={r.title}>
              <input
                type="checkbox"
                disabled={exists}
                checked={selected.includes(r.id) || exists}
                onChange={(e) =>
                  setSelected((values) =>
                    e.target.checked
                      ? [...values, r.id]
                      : values.filter((id) => id !== r.id),
                  )
                }
              />
              <span>
                <strong>
                  {r.title}
                  {exists ? " · já incluído" : ""}
                </strong>
                <small>{r.help}</small>
              </span>
            </label>
          );
        })}
      </fieldset>
      {!entries.length && (
        <p>Nenhuma sugestão encontrada. Você pode criar um requisito manual.</p>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="dialog-actions">
        <button className="secondary" onClick={manual}>
          Criar requisito manual
        </button>
        <button
          disabled={!selected.length}
          onClick={() => {
            if (
              c.execute({
                type: "add-catalogue",
                jobId: job.id,
                catalogueIds: selected,
              })
            )
              close();
            else
              setError(
                "Não foi possível adicionar. Confira a mensagem do trabalho.",
              );
          }}
        >
          Adicionar selecionados ({selected.length})
        </button>
      </div>
    </Dialog>
  );
}
