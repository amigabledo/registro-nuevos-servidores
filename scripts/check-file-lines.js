import fs from "fs";
import path from "path";

const MAX_LINES = 300;
const EXEMPT = new Set(["types.ts", "supabase.ts"]);

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js") || file.endsWith(".jsx")) {
      results.push(fullPath);
    }
  }
  return results;
}

const startTime = performance.now();
const allFiles = getFiles("./src");
const violations = [];

for (const f of allFiles) {
  const base = path.basename(f);
  if (EXEMPT.has(base)) continue;
  const content = fs.readFileSync(f, "utf8");
  const lines = content.split("\n").length;
  if (lines > MAX_LINES) {
    violations.push({ file: f.replace(/\\/g, "/"), lines });
  }
}

const elapsed = (performance.now() - startTime).toFixed(1);

if (violations.length > 0) {
  console.error(`[Error] Se encontraron ${violations.length} archivo(s) que superan el límite de ${MAX_LINES} líneas:`);
  violations.sort((a, b) => b.lines - a.lines).forEach((v) => {
    console.error(`  - ${v.lines} líneas: ${v.file}`);
  });
  console.error(`\nTiempo de escaneo: ${elapsed} ms`);
  console.error(`Es obligatorio modularizar y descomponer estos archivos en subcomponentes o utilidades.`);
  process.exit(1);
} else {
  console.log(`[Correcto] Auditoría de líneas completada en ${elapsed} ms. Todos los ${allFiles.length} archivos en src/ cumplen con el tope de ${MAX_LINES} líneas.`);
  process.exit(0);
}
