// Copia dist/index.html -> dist/404.html (truque SPA do GitHub Pages:
// rotas como /clientes passam a renderizar o app em vez de 404).
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const index = join(root, "dist", "index.html");

if (!existsSync(index)) {
  console.error("dist/index.html não encontrado. Rode `npm run build` antes.");
  process.exit(1);
}
copyFileSync(index, join(root, "dist", "404.html"));
console.log("404.html criado a partir de index.html");
