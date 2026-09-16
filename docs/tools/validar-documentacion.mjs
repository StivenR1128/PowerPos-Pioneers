import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const docs = path.join(root, 'docs');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.name.startsWith('.') ? [] : e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const failures = [];
const all = walk(docs);
for (const file of all.filter((p) => p.endsWith('.md'))) {
  const source = fs.readFileSync(file, 'utf8');
  if ((source.match(/^```/gm) || []).length % 2) failures.push(`Bloque sin cerrar: ${file}`);
  for (const match of source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    if (!fs.existsSync(path.resolve(path.dirname(file), target))) failures.push(`Enlace roto: ${file} -> ${target}`);
  }
}
const schema = fs.readFileSync(path.join(root, 'api/prisma/schema.prisma'), 'utf8');
const models = [...schema.matchAll(/^model (\w+) \{/gm)].map((m) => m[1]);
const dictionary = fs.readFileSync(path.join(docs, '06-diccionario-de-datos.md'), 'utf8');
const er = fs.readFileSync(path.join(docs, 'diagramas/er-completo.mmd'), 'utf8');
for (const model of models) {
  if (!dictionary.includes(`## ${model}\n`)) failures.push(`Modelo sin diccionario: ${model}`);
  if (!er.includes(`  ${model} {`)) failures.push(`Modelo sin diagrama: ${model}`);
}
const requirements = fs.readFileSync(path.join(docs, '02-requerimientos.md'), 'utf8');
const tests = fs.readFileSync(path.join(docs, '10-pruebas-y-trazabilidad.md'), 'utf8');
for (const id of new Set([...requirements.matchAll(/\b(?:RF|RNF)-\d{2}\b/g)].map((m) => m[0]))) {
  if (!tests.includes(id)) failures.push(`Requisito no trazado explícitamente: ${id}`);
}
for (const file of all.filter((p) => p.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, target] of html.matchAll(/href="([^"]+)"/g)) {
    if (target.startsWith('#') && !ids.has(target.slice(1))) failures.push(`Ancla inexistente: ${file} -> ${target}`);
    else if (!/^(https?:|#|mailto:)/.test(target) && !fs.existsSync(path.resolve(path.dirname(file), target))) failures.push(`Enlace HTML roto: ${target}`);
  }
  if (/<script[^>]+src=/.test(html)) failures.push(`Dependencia de red inesperada: ${file}`);
}
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Documentación válida: ${all.filter((p) => p.endsWith('.md')).length} Markdown, ${models.length} modelos, enlaces locales y anclas HTML comprobados.`);
