"use client";
import { useEffect, useState } from "react";
import { Dialog } from "../../components/ui/dialog";
import type { Delivery } from "../../domain/workflow";
import { reportPreviewPages, workbookSheets, type ReportLine } from "./export";
/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- Scrollable table regions need keyboard focus to pan horizontally. */
export function DeliveryPreview({
  delivery: d,
  close,
}: {
  delivery: Delivery;
  close: () => void;
}) {
  const [section, setSection] = useState("summary");
  const [pages, setPages] = useState<ReportLine[][] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (section !== "pdf") return;
    let active = true;
    void reportPreviewPages(d).then(
      (value) => {
        if (active) setPages(value);
      },
      () => {
        if (active)
          setError(
            "Não foi possível preparar o relatório. O resumo e a matriz continuam disponíveis; tente novamente.",
          );
      },
    );
    return () => {
      active = false;
    };
  }, [d, section]);
  return (
    <Dialog title={`Visualizar dossiê · versão ${d.version}`} onClose={close}>
      <p className="context-line">
        {d.company} · {d.facility} · {d.period}
      </p>
      {d.registration?.cnpj && (
        <p className="source-note">
          CNPJ desta versão: {d.registration.cnpj} · CNAE{" "}
          {d.registration.cnae || "não informado"}
        </p>
      )}
      <p className="notice subtle">
        Prévia da versão preservada, sem download automático. Alterações
        posteriores no trabalho não mudam esta entrega.
      </p>
      <nav className="preview-tabs" aria-label="Conteúdo da prévia">
        {[
          ["summary", "Resumo"],
          ["pdf", "Relatório PDF"],
          ["matrix", "Matriz"],
          ["evidence", "Evidências"],
        ].map(([id, label]) => (
          <button
            type="button"
            key={id}
            className="secondary"
            aria-pressed={section === id}
            onClick={() => {
              if (id !== section) {
                setPages(null);
                setError("");
                setSection(id);
              }
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      {section === "summary" && (
        <section aria-label="Resumo da entrega">
          <h3>{d.title}</h3>
          <p>
            <strong>
              Versão {d.version} ·{" "}
              {d.kind === "final" ? "Final simulada" : "Intermediária"}
            </strong>
          </p>
          <p>{d.note}</p>
          <p>
            {d.requirements.length} requisito(s) · {d.documents.length}{" "}
            evidência(s) conferida(s)
          </p>
          <p className="source-note">
            Demonstração, sem validade técnica ou regulatória. Somente os
            arquivos desta versão serão incluídos no ZIP.
          </p>
          <ul className="preview-list">
            {d.requirements.map((r) => (
              <li key={r.id}>
                <strong>{r.title}</strong>
                <span>{r.help}</span>
                <small>{r.source}</small>
              </li>
            ))}
          </ul>
        </section>
      )}
      {section === "pdf" && (
        <section aria-label="Relatório PDF da entrega">
          {error ? (
            <p role="alert" className="error">
              {error}
            </p>
          ) : pages ? (
            <div className="report-pages">
              {pages.map((lines, index) => (
                <figure className="report-page" key={index}>
                  <svg
                    viewBox="0 0 595.28 841.89"
                    role="img"
                    aria-label={`Página ${index + 1} do relatório da versão ${d.version}`}
                  >
                    <title>Relatório de entrega · página {index + 1}</title>
                    <rect width="595.28" height="841.89" fill="#ffffff" />
                    {lines.map((line, i) => (
                      <text
                        key={i}
                        x={line.x}
                        y={line.y}
                        fontFamily="Arial, Helvetica, sans-serif"
                        fontSize={line.size}
                        fontWeight={line.bold ? 700 : 400}
                        fill={line.color}
                        textLength={line.width || undefined}
                        lengthAdjust="spacingAndGlyphs"
                      >
                        {line.text}
                      </text>
                    ))}
                  </svg>
                  <figcaption>
                    Página {index + 1} de {pages.length}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p role="status">Preparando relatório para visualização…</p>
          )}
          <p className="source-note">
            Prévia vetorial com o mesmo conteúdo, quebras de linha e paginação
            do PDF gerado. Não usa o visualizador de PDF do navegador e não
            inicia um download.
          </p>
        </section>
      )}
      {section === "matrix" && (
        <section aria-label="Matriz da entrega">
          {workbookSheets(d).map((sheet) => (
            <div
              className="table-scroll"
              key={sheet.name}
              role="region"
              aria-label={`Planilha ${sheet.name}`}
              tabIndex={0}
            >
              <table className="preview-table">
                <caption>{sheet.name}</caption>
                <thead>
                  <tr>
                    {sheet.rows[0].map((cell, i) => (
                      <th key={i} scope="col">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheet.rows.slice(1).map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>{cell || "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>
      )}
      {section === "evidence" && (
        <section aria-label="Índice de evidências">
          {d.documents.length ? (
            <ul className="preview-list">
              {d.documents.map((file) => (
                <li key={file.id}>
                  <strong>{file.name}</strong>
                  <span>
                    {file.size.toLocaleString("pt-BR")} bytes · {file.mime}
                  </span>
                  <small className="hash-value">SHA-256: {file.sha256}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>Sem evidências conferidas nesta versão.</p>
          )}
        </section>
      )}
    </Dialog>
  );
}
