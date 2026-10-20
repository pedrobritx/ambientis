import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { strToU8, zipSync } from "fflate";
import type { Delivery } from "../../domain/workflow";
import { statusLabel } from "../../messages/pt-BR";

const encode = (s: string) => strToU8(s);
const xml = (s: string) =>
  [...s]
    .filter(
      (c) => c.charCodeAt(0) >= 32 || [9, 10, 13].includes(c.charCodeAt(0)),
    )
    .join("")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
const pdfText = (s: string) =>
  [...s]
    .map((c) => (c.charCodeAt(0) < 32 ? " " : c))
    .join("")
    .replace(/[^\u0020-\u00ff]/g, " ");
const fileName = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(-100) || "arquivo";
export function decodeFile(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}
export function indexRows(d: Delivery): string[][] {
  return [
    ["Requisito", "Situação", "Origem", "Exclusão / justificativa"],
    ...d.requirements.map((r) => [
      r.title,
      statusLabel[r.status],
      r.source,
      r.exclusionReason ?? "",
    ]),
  ];
}

// A small write-only OOXML export: inline strings avoid interpreting user text as formulas.
export function workbookSheets(
  d: Delivery,
): { name: string; rows: string[][] }[] {
  return [
    { name: "Requisitos", rows: indexRows(d) },
    {
      name: "Evidências",
      rows: [
        ["Requisito", "Arquivo", "Versão (ID)", "SHA-256"],
        ...d.requirements
          .filter((r) => r.status === "accepted")
          .flatMap((r) =>
            d.documents
              .filter((f) => r.submissions.at(-1)?.documentIds.includes(f.id))
              .map((f) => [r.title, f.name, f.id, f.sha256]),
          ),
      ],
    },
    {
      name: "Entrega",
      rows: [
        ["Campo", "Valor"],
        ["Aviso", "DEMONSTRAÇÃO — sem validade técnica ou regulatória"],
        ["Empresa", d.company],
        ...(d.registration.cnpj
          ? [
              ["CNPJ", d.registration.cnpj],
              [
                "CNAE",
                `${d.registration.cnae} ${d.registration.cnaeDescription}`.trim(),
              ],
            ]
          : []),
        ["Unidade", d.facility],
        ["Período", d.period],
        ["Versão", String(d.version)],
        ["Tipo", d.kind === "final" ? "Final simulada" : "Intermediária"],
        ["Escopo e pendências", d.note],
      ],
    },
  ];
}
export function buildWorkbook(d: Delivery): Uint8Array {
  const sheets = workbookSheets(d);
  const entries: Record<string, Uint8Array> = {};
  entries["[Content_Types].xml"] = encode(
    `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`,
  );
  entries["_rels/.rels"] = encode(
    '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
  );
  entries["xl/workbook.xml"] = encode(
    `<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((s, i) => `<sheet name="${xml(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets></workbook>`,
  );
  entries["xl/_rels/workbook.xml.rels"] = encode(
    `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}</Relationships>`,
  );
  sheets.forEach((s, i) => {
    const cols = s.rows[0]
      .map(
        (_, c) =>
          `<col min="${c + 1}" max="${c + 1}" width="${c === 0 ? 48 : 65}" customWidth="1"/>`,
      )
      .join("");
    entries[`xl/worksheets/sheet${i + 1}.xml`] = encode(
      `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>${cols}</cols><sheetData>${s.rows.map((row, r) => `<row r="${r + 1}">${row.map((value, c) => `<c r="${String.fromCharCode(65 + c)}${r + 1}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`).join("")}</row>`).join("")}</sheetData></worksheet>`,
    );
  });
  return zipSync(entries, { mtime: new Date(d.at), level: 6 });
}
export type ReportLine = {
  text: string;
  x: number;
  y: number;
  size: number;
  width: number;
  bold: boolean;
  color: string;
};
async function reportDocument(d: Delivery) {
  const pages: ReportLine[][] = [[]];
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Dossiê de demonstração - ${d.company} - v${d.version}`);
  pdf.setAuthor("Ambientis - demonstração local");
  pdf.setCreationDate(new Date(d.at));
  pdf.setModificationDate(new Date(d.at));
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595.28, 841.89]);
  let y = 785;
  const line = (value: string, heading = false) => {
    const font = heading ? bold : regular;
    const size = heading ? 14 : 10;
    const words = pdfText(value).split(/\s+/);
    let current = "";
    const draw = () => {
      if (y < 65) {
        page = pdf.addPage([595.28, 841.89]);
        pages.push([]);
        y = 785;
      }
      pages.at(-1)!.push({
        text: current,
        x: 48,
        y: 841.89 - y,
        size,
        width: font.widthOfTextAtSize(current, size),
        bold: heading,
        color: "#0f332e",
      });
      page.drawText(current, {
        x: 48,
        y,
        size,
        font,
        color: rgb(0.06, 0.2, 0.18),
      });
      y -= heading ? 24 : 16;
    };
    for (const word of words) {
      if (font.widthOfTextAtSize(`${current} ${word}`, size) > 490 && current) {
        draw();
        current = "";
      }
      if (font.widthOfTextAtSize(word, size) > 490) {
        for (const character of word) {
          if (font.widthOfTextAtSize(current + character, size) > 490) {
            draw();
            current = "";
          }
          current += character;
        }
      } else current += `${current ? " " : ""}${word}`;
    }
    draw();
  };
  line("ambientis", true);
  line("DEMONSTRAÇÃO LOCAL - SEM VALIDADE PROFISSIONAL");
  line("Relatório de entrega e índice de evidências", true);
  line(`${d.company} - ${d.facility}`);
  if (d.registration?.cnpj) line(`CNPJ ${d.registration.cnpj}`);
  if (d.registration?.cnae)
    line(`CNAE ${d.registration.cnae} - ${d.registration.cnaeDescription}`);
  line(`${d.title} - Período ${d.period}`);
  line(
    `Versão ${d.version} - ${d.kind === "final" ? "Final simulada" : "Entrega intermediária"}`,
  );
  line(
    `Gerada em ${new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }).format(new Date(d.at))}`,
  );
  line("Escopo e limitações", true);
  line(d.note || "Ensaio de entrega; não constitui validação profissional.");
  line(
    "Este relatório organiza o trabalho. Não substitui inventário, RAPP, licença, análise técnica ou protocolo oficial.",
  );
  line("Matriz de requisitos", true);
  d.requirements.forEach((r, i) => {
    line(`${i + 1}. ${r.title} - ${statusLabel[r.status]}`);
    if (r.exclusionReason) line(`Justificativa: ${r.exclusionReason}`);
  });
  line("Evidências incluídas", true);
  if (!d.documents.length)
    line("Nenhuma evidência aprovada foi incluída nesta versão.");
  d.documents.forEach((f, i) => {
    line(`${i + 1}. ${f.name}`);
    line(`Versão: ${f.id}`);
    line(`SHA-256: ${f.sha256}`);
  });
  for (const [i, p] of pdf.getPages().entries()) {
    const footer = `Ambientis - demonstração sem validade profissional | ${i + 1}`;
    p.drawText(footer, { x: 48, y: 35, size: 8, font: regular });
    pages[i].push({
      text: footer,
      x: 48,
      y: 841.89 - 35,
      size: 8,
      width: regular.widthOfTextAtSize(footer, 8),
      bold: false,
      color: "#000000",
    });
  }
  return { pdf, pages };
}
export async function buildReport(d: Delivery): Promise<Uint8Array> {
  return (await reportDocument(d)).pdf.save();
}
// The in-app preview shares wrapping, coordinates and pagination with the PDF writer.
export async function reportPreviewPages(d: Delivery): Promise<ReportLine[][]> {
  return (await reportDocument(d)).pages;
}

export async function buildDossier(d: Delivery): Promise<Uint8Array> {
  const entries: Record<string, Uint8Array> = {
    "00_LEIA-ME.txt": encode(
      `DEMONSTRAÇÃO LOCAL - SEM VALIDADE PROFISSIONAL\n${d.company}\nVersão ${d.version}\n${d.note}\n\nSomente evidências conferidas e vinculadas à última resposta aceita foram incluídas.\nAssinaturas e aceite profissional não são validados por esta demonstração.\nRelatórios especializados precisam ser preparados e revisados fora deste ensaio.\n`,
    ),
    "01_Relatorio_de_entrega.pdf": await buildReport(d),
    "02_Matriz_e_indice.xlsx": buildWorkbook(d),
  };
  const files = d.documents.map((f) => {
    const path = `03_Evidencias/${fileName(f.id)}_${fileName(f.name)}`;
    entries[path] = decodeFile(f.base64);
    return { path, id: f.id, sha256: f.sha256, size: f.size };
  });
  entries["04_Manifesto.json"] = encode(
    JSON.stringify(
      {
        demo: true,
        version: d.version,
        deliveryId: d.id,
        createdAt: d.at,
        files,
      },
      null,
      2,
    ),
  );
  return zipSync(entries, { mtime: new Date(d.at), level: 6 });
}
export function downloadBytes(bytes: Uint8Array, name: string, mime: string) {
  const url = URL.createObjectURL(
    new Blob([Uint8Array.from(bytes)], { type: mime }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
