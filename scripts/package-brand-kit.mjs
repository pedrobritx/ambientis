// Package portable brand files; never include a previous archive inside itself.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { URL } from "node:url";
import { TextDecoder } from "node:util";
import console from "node:console";
import { zipSync, strToU8 } from "fflate";
const base = new URL("../public/brand/", import.meta.url);
const entries = {};
async function collect(relative = "") {
  for (const item of await readdir(new URL(relative, base), {
    withFileTypes: true,
  })) {
    if (item.name.startsWith(".") || item.name.endsWith(".zip")) continue;
    const name = relative + item.name;
    if (item.isDirectory()) await collect(name + "/");
    else if (item.isFile()) {
      let bytes = new Uint8Array(await readFile(new URL(name, base)));
      if (name === "index.html") {
        // The extracted guide points to its own board instead of a missing nested ZIP.
        const html = new TextDecoder()
          .decode(bytes)
          .replaceAll(
            'href="ambientis-brand-kit.zip" download',
            'href="ambientis-brand-board.png"',
          )
          .replaceAll("Baixar kit da marca", "Ver prancha da marca")
          .replaceAll("Baixar kit completo", "Ver prancha completa")
          .replaceAll(
            'href="/#inicio"',
            'href="http://127.0.0.1:3411/#inicio"',
          );
        bytes = strToU8(html);
      }
      entries[`ambientis-brand-kit/${name}`] = bytes;
    }
  }
}
await collect();
entries["ambientis-brand-kit/identity.json"] = new Uint8Array(
  await readFile(new URL("../src/brand/identity.json", import.meta.url)),
);
await writeFile(
  new URL("ambientis-brand-kit.zip", base),
  zipSync(entries, { level: 6 }),
);
console.log(`Packaged ${Object.keys(entries).length} brand files.`);
