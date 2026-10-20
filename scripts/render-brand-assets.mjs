// Raster exports from the original outlined SVGs; no runtime image generation.
import sharp from "sharp";
import { fileURLToPath, URL } from "node:url";
import console from "node:console";
import { readFile, writeFile, copyFile, mkdir } from "node:fs/promises";
const base = new URL("../public/brand/", import.meta.url);
for (const variant of ["forest", "reverse", "black", "white"]) {
  for (const kind of ["logo", "symbol"]) {
    const source = new URL(`ambientis-${kind}-${variant}.svg`, base);
    await sharp(await readFile(source))
      .resize(kind === "logo" ? 1800 : 1024)
      .png()
      .toFile(fileURLToPath(new URL(`ambientis-${kind}-${variant}.png`, base)));
  }
}
for (const size of [32, 192, 512])
  await sharp(await readFile(new URL("ambientis-app-icon.svg", base)))
    .resize(size)
    .png()
    .toFile(fileURLToPath(new URL(`ambientis-app-icon-${size}.png`, base)));
await sharp(await readFile(new URL("ambientis-app-icon.svg", base)))
  .resize(180)
  .flatten({ background: "#235D50" })
  .png()
  .toFile(fileURLToPath(new URL("ambientis-apple-touch-icon.png", base)));
await copyFile(
  new URL("ambientis-apple-touch-icon.png", base),
  new URL("../src/app/apple-icon.png", import.meta.url),
);
await mkdir(new URL("fonts/", base), { recursive: true });
for (const [family, weight] of [
  ["manrope", 400],
  ["manrope", 600],
  ["manrope", 700],
  ["fraunces", 400],
])
  await copyFile(
    new URL(
      `../node_modules/@fontsource/${family}/files/${family}-latin-${weight}-normal.woff2`,
      import.meta.url,
    ),
    new URL(`fonts/${family}-${weight}.woff2`, base),
  );
for (const family of ["manrope", "fraunces"])
  await copyFile(
    new URL(`../node_modules/@fontsource/${family}/LICENSE`, import.meta.url),
    new URL(`fonts/${family}-LICENSE.txt`, base),
  );
const icons = {
  inicio: "Home",
  empresas: "Building2",
  trabalhos: "FolderOpen",
  evidencias: "FileText",
  pessoas: "Users",
  notificacoes: "Bell",
  atencao: "AlertCircle",
  revisao: "CheckCircle2",
  enviar: "Upload",
  camera: "Camera",
  fotos: "ImageIcon",
  baixar: "Download",
  acesso: "LockKeyhole",
};
const source = await readFile(
  new URL("../src/components/ui/icons.tsx", import.meta.url),
  "utf8",
);
for (const [name, fn] of Object.entries(icons)) {
  const block = source.slice(source.indexOf(`export function ${fn}(`));
  const match = block.match(/<Icon \{\.\.\.props\}>([\s\S]*?)<\/Icon>/);
  if (!match) throw new Error(`Missing glyph ${name}`);
  await writeFile(
    new URL(`icons/${name}.svg`, base),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1C302C" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${match[1]}</svg>`,
  );
}
console.log(
  "Brand PNGs, app icons, self-hosted fonts and 13 semantic SVG icons exported.",
);
