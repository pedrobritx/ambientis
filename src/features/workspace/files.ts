import { MAX_FILE_BYTES, type DocumentRecord } from "../../domain/workflow";
import { m } from "../../messages/pt-BR";
export async function prepareDocument(
  file: File,
  jobId: string,
  actorId: string,
): Promise<DocumentRecord> {
  if (!file.size || file.size > MAX_FILE_BYTES) throw new Error(m.uploadLimit);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const isPdf =
    file.name.toLowerCase().endsWith(".pdf") &&
    new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
  const isText =
    file.name.toLowerCase().endsWith(".txt") && !bytes.some((b) => b === 0);
  const ext = file.name.toLowerCase().split(".").pop();
  const starts = (values: number[]) => values.every((v, i) => bytes[i] === v);
  const ascii = (a: number, b: number) =>
    new TextDecoder().decode(bytes.slice(a, b));
  let mime: DocumentRecord["mime"] | undefined = isPdf
    ? "application/pdf"
    : isText
      ? "text/plain"
      : undefined;
  if (["jpg", "jpeg"].includes(ext ?? "") && starts([255, 216, 255]))
    mime = "image/jpeg";
  if (ext === "png" && starts([137, 80, 78, 71, 13, 10, 26, 10]))
    mime = "image/png";
  if (ext === "webp" && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP")
    mime = "image/webp";
  if (
    ["heic", "heif"].includes(ext ?? "") &&
    ascii(4, 8) === "ftyp" &&
    ["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(ascii(8, 12))
  )
    mime = ext === "heic" ? "image/heic" : "image/heif";
  if (!mime) throw new Error(m.fileMismatch);
  if (isText) {
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw new Error(m.fileMismatch);
    }
  }
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return {
    id: crypto.randomUUID(),
    jobId,
    actorId,
    name: file.name.slice(0, 200),
    size: bytes.length,
    mime,
    base64: btoa(binary),
    sha256: [...hash].map((b) => b.toString(16).padStart(2, "0")).join(""),
    at: new Date().toISOString(),
  };
}
