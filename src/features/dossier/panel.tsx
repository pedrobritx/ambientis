"use client";
import { Select } from "../../components/ui/select";
import { useState } from "react";
import {
  Download,
  FileText,
  Package,
  CheckCircle2,
  LockKeyhole,
} from "../../components/ui/icons";
import { actorById, type Delivery, type Job } from "../../domain/workflow";
import { statusLabel } from "../../messages/pt-BR";
import type { Controller } from "../workspace/controller";
import { Empty, Field } from "../../components/ui/dialog";
import { DeliveryPreview } from "./preview";
import {
  buildDossier,
  buildReport,
  buildWorkbook,
  downloadBytes,
  decodeFile,
} from "./export";
export function DossierPanel({
  job,
  controller: c,
}: {
  job: Job;
  controller: Controller;
}) {
  const actor = actorById(c.actorId, c.state);
  const [note, setNote] = useState(
    "Entrega intermediária de demonstração. Há evidências e validações técnicas pendentes.",
  );
  const [kind, setKind] = useState<Delivery["kind"]>("intermediate");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<Delivery | null>(null);
  const deliveries = c.state.deliveries
    .filter((d) => d.jobId === job.id)
    .slice()
    .reverse();
  async function exportFile(d: Delivery, type: "zip" | "pdf" | "xlsx") {
    setBusy(true);
    try {
      const bytes =
        type === "zip"
          ? await buildDossier(d)
          : type === "pdf"
            ? await buildReport(d)
            : buildWorkbook(d);
      const mime =
        type === "zip"
          ? "application/zip"
          : type === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      downloadBytes(
        bytes,
        `ambientis-demonstracao-v${d.version}.${type}`,
        mime,
      );
      c.announce(
        "Arquivo gerado a partir desta versão fixa. Nenhum cliente foi notificado.",
      );
    } catch {
      c.announce(
        "Não foi possível gerar o arquivo. A versão foi preservada; tente novamente.",
        true,
      );
    } finally {
      setBusy(false);
    }
  }
  const blockers = [
    ...(!job.requirements.length ? ["Checklist ainda não definido"] : []),
    ...(!job.profileSupported
      ? ["Perfil sem cobertura técnica neste ensaio"]
      : []),
    ...job.requirements
      .filter((r) => !["accepted", "excluded"].includes(r.status))
      .map((r) => `${r.title}: ${statusLabel[r.status]}`),
    ...(!job.scopeReviewed ? ["Escopo do ensaio ainda não conferido"] : []),
    ...(!job.independentlyReviewed
      ? ["Revisão por outro perfil simulado pendente"]
      : []),
    ...job.concerns
      .filter((p) => !p.resolved)
      .map((p) => `Ponto de atenção em aberto: ${p.text}`),
  ];
  return (
    <>
      <div className="section-toolbar">
        <div>
          <h2>
            {actor.role === "client"
              ? "Entregas disponíveis"
              : "Preparar entrega"}
          </h2>
          <p className="muted">
            Relatório, matriz e evidências em uma versão fixa.
          </p>
        </div>
        <Package size={30} className="muted" />
      </div>
      {actor.role === "technical" && (
        <div className="delivery-grid">
          <section className="surface">
            <h3>Conteúdo do dossiê</h3>
            <ul className="document-checklist">
              <li>
                <FileText size={20} />
                <div>
                  <strong>Relatório de entrega</strong>
                  <span>PDF gerado com escopo, pendências e índice.</span>
                </div>
              </li>
              <li>
                <FileText size={20} />
                <div>
                  <strong>Matriz de requisitos e evidências</strong>
                  <span>Planilha XLSX com as versões incluídas.</span>
                </div>
              </li>
              <li>
                <Package size={20} />
                <div>
                  <strong>Evidências conferidas</strong>
                  <span>
                    Originais vinculados à última resposta aceita. Rascunhos não
                    entram.
                  </span>
                </div>
              </li>
            </ul>
            <p className="source-note">
              Inventários, RAPP e relatórios especializados não são gerados por
              este ensaio. Anexe exemplos sintéticos preparados externamente.
            </p>
          </section>
          <section className="surface">
            <h3>Antes da entrega final</h3>
            {blockers.length ? (
              <ul className="blocker-list">
                {blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : (
              <p className="status accepted">
                <CheckCircle2 size={17} /> Conferências demonstrativas
                registradas
              </p>
            )}
            <p className="source-note">
              Assinaturas não são validadas. Este fluxo não constitui aceite ou
              revisão profissional.
            </p>
          </section>
        </div>
      )}
      {actor.role === "technical" && (
        <form
          className="release-form"
          onSubmit={(e) => {
            e.preventDefault();
            c.execute({ type: "release", jobId: job.id, kind, note });
          }}
        >
          <Field label="Tipo de entrega">
            <Select
              value={kind}
              onValueChange={(value) => setKind(value as Delivery["kind"])}
              options={[
                {
                  value: "intermediate",
                  label: "Intermediária — pendências explícitas",
                },
                {
                  value: "final",
                  label: "Final simulada — exige conferências",
                },
              ]}
            />
          </Field>
          <Field label="Escopo e pendências que acompanharão a entrega">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              required
              maxLength={1200}
            />
          </Field>
          <button type="submit">
            <LockKeyhole size={18} /> Criar versão de demonstração
          </button>
          <p className="source-note">
            Não há envio de e-mail, assinatura válida ou protocolo oficial.
          </p>
        </form>
      )}
      <h2>
        {actor.role === "client"
          ? "Documentos para acompanhar"
          : "Versões preservadas"}
      </h2>
      {deliveries.length ? (
        deliveries.map((d) => (
          <article className="delivery-version" key={d.id}>
            <header>
              <div>
                <h3>
                  Versão {d.version} ·{" "}
                  {d.kind === "intermediate"
                    ? "Intermediária"
                    : "Final simulada"}
                </h3>
                <p className="muted">
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                    timeZone: "America/Sao_Paulo",
                  }).format(new Date(d.at))}
                </p>
              </div>
              <span className="status needed">Demonstração</span>
            </header>
            <p>{d.note}</p>
            <div className="export-actions">
              <button className="secondary" onClick={() => setPreview(d)}>
                <FileText size={18} />
                Visualizar dossiê
              </button>
              <button disabled={busy} onClick={() => void exportFile(d, "zip")}>
                <Download size={17} />
                {busy ? "Gerando arquivo…" : "Baixar dossiê ZIP"}
              </button>
              <button
                className="secondary"
                disabled={busy}
                onClick={() => void exportFile(d, "pdf")}
              >
                Baixar relatório PDF
              </button>
              <button
                className="secondary"
                disabled={busy}
                onClick={() => void exportFile(d, "xlsx")}
              >
                Baixar matriz XLSX
              </button>
            </div>
            <details>
              <summary>Conferir arquivos e requisitos desta versão</summary>
              <ul className="preview-list">
                {d.requirements.map((r) => (
                  <li key={r.id}>
                    <strong>{r.title}</strong>
                    <span>{statusLabel[r.status]}</span>
                  </li>
                ))}
              </ul>
              {d.documents.map((f) => (
                <div className="document-row" key={f.id}>
                  <span>{f.name}</span>
                  <button
                    className="text-button"
                    onClick={() =>
                      downloadBytes(decodeFile(f.base64), f.name, f.mime)
                    }
                  >
                    Baixar original
                  </button>
                </div>
              ))}
              {!d.documents.length && (
                <p className="muted">Sem evidências conferidas nesta versão.</p>
              )}
            </details>
            {actor.role === "client" &&
              (d.acknowledgedAt ? (
                <p className="status accepted">
                  Recebimento confirmado na demonstração
                </p>
              ) : (
                <button
                  className="secondary"
                  onClick={() =>
                    c.execute({
                      type: "acknowledge",
                      jobId: job.id,
                      deliveryId: d.id,
                    })
                  }
                >
                  Confirmar recebimento demonstrativo
                </button>
              ))}
          </article>
        ))
      ) : (
        <Empty title="Nenhuma entrega preparada">
          As versões liberadas na demonstração aparecerão aqui.
        </Empty>
      )}
      {preview && (
        <DeliveryPreview delivery={preview} close={() => setPreview(null)} />
      )}
    </>
  );
}
