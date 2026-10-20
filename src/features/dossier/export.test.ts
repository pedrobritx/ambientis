import { describe, expect, it } from "vitest";
import { unzipSync, strFromU8 } from "fflate";
import { PDFDocument } from "pdf-lib";
import { seedState, releaseSnapshot } from "../../domain/workflow";
import { buildDossier, buildWorkbook } from "./export";

describe("dossier export", () => {
  it("produces a readable PDF, XLSX and explicit limitations without working notes", async () => {
    const state = seedState();
    state.jobs[0].concerns.push({
      id: "internal",
      text: "PRIVATE_NOTE_NOT_FOR_CLIENT",
      resolved: false,
    });
    const snapshot = releaseSnapshot(
      state,
      "technical",
      "industry-job",
      "intermediate",
      "Ensaio com documentos ainda pendentes.",
    );
    const contents = unzipSync(await buildDossier(snapshot));
    expect(Object.keys(contents)).toContain("01_Relatorio_de_entrega.pdf");
    expect(
      (
        await PDFDocument.load(contents["01_Relatorio_de_entrega.pdf"])
      ).getPageCount(),
    ).toBeGreaterThan(0);
    const sheets = unzipSync(contents["02_Matriz_e_indice.xlsx"]);
    expect(strFromU8(sheets["xl/worksheets/sheet1.xml"])).toContain(
      "Evidência em falta",
    );
    expect(strFromU8(contents["00_LEIA-ME.txt"])).toContain("DEMONSTRAÇÃO");
    expect(
      Object.values(contents).some((v) =>
        strFromU8(v).includes("PRIVATE_NOTE_NOT_FOR_CLIENT"),
      ),
    ).toBe(false);
  });
  it("keeps formula-like user input as literal inline text and escapes markup", () => {
    const snapshot = releaseSnapshot(
      seedState(),
      "technical",
      "industry-job",
      "intermediate",
      "Ensaio",
    );
    snapshot.requirements[0].title =
      '=HYPERLINK("https://example.invalid") <teste>';
    const xml = strFromU8(
      unzipSync(buildWorkbook(snapshot))["xl/worksheets/sheet1.xml"],
    );
    expect(xml).toContain('t="inlineStr"');
    expect(xml).toContain("&lt;teste&gt;");
    expect(xml).not.toContain("<f>");
  });
});

it("keeps released evidence separate from later uploads and source edits", async () => {
  const state = seedState();
  const document = {
    id: "accepted-original",
    jobId: "industry-job",
    name: "original.txt",
    mime: "text/plain" as const,
    size: 1,
    base64: "eA==",
    sha256: "2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881",
    at: new Date().toISOString(),
    actorId: "client-industry",
  };
  state.documents.push(document);
  const requirement = state.jobs[0].requirements[0];
  requirement.status = "accepted";
  requirement.submissions.push({
    id: "response",
    at: document.at,
    actorId: document.actorId,
    text: "Fictional response",
    documentIds: [document.id],
    confirmed: true,
  });
  const snapshot = releaseSnapshot(
    state,
    "technical",
    "industry-job",
    "intermediate",
    "Fictional partial version",
  );
  state.documents.push({
    ...document,
    id: "unreviewed-replacement",
    base64: "eQ==",
  });
  document.base64 = "eg==";
  const entries = unzipSync(await buildDossier(snapshot));
  const originals = Object.entries(entries).filter(([name]) =>
    name.startsWith("03_Evidencias/"),
  );
  expect(originals).toHaveLength(1);
  expect(strFromU8(originals[0][1])).toBe("x");
  const evidenceSheet = strFromU8(
    unzipSync(buildWorkbook(snapshot))["xl/worksheets/sheet2.xml"],
  );
  expect(evidenceSheet).toContain(requirement.title);
  expect(evidenceSheet).not.toContain("unreviewed-replacement");
});

it("uses the PDF's pagination for the in-app vector preview", async () => {
  const { buildReport, reportPreviewPages } = await import("./export");
  const snapshot = releaseSnapshot(
    seedState(),
    "technical",
    "industry-job",
    "intermediate",
    "Escopo e pendências de demonstração.",
  );
  snapshot.requirements = Array.from({ length: 80 }, (_, index) => ({
    ...snapshot.requirements[0],
    id: `row-${index}`,
    title: `Requisito ${index + 1} com uma descrição de demonstração para revisar a paginação do relatório`,
  }));
  const pages = await reportPreviewPages(snapshot);
  const pdf = await PDFDocument.load(await buildReport(snapshot));
  expect(pages.length).toBeGreaterThan(1);
  expect(pdf.getPageCount()).toBe(pages.length);
  for (const page of pages) {
    expect(
      page.every(
        (line) =>
          line.x >= 0 && line.y > 0 && line.y < 841.89 && line.width <= 490,
      ),
    ).toBe(true);
    expect(page.at(-1)?.text).toContain("sem validade profissional");
  }
});
