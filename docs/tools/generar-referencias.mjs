// Genera documentación de referencia sin dependencias ni acceso a la base de datos.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const docs = path.join(root, 'docs');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, s) => fs.writeFileSync(path.join(docs, p), s.trim() + '\n', 'utf8');
const cell = (s) => String(s).replaceAll('|', '\\|').replaceAll('\n', ' ');
fs.mkdirSync(path.join(docs, 'diagramas'), { recursive: true });
const schema = read('api/prisma/schema.prisma');
const models = [...schema.matchAll(/^model (\w+) \{([\s\S]*?)^\}/gm)].map((m) => ({
  name: m[1], body: m[2], table: m[2].match(/@@map\("([^"]+)"\)/)?.[1] || m[1],
}));
const names = new Set(models.map((m) => m.name));
for (const model of models) {
  model.fields = model.body.split('\n').map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//') && !line.startsWith('@@'))
    .map((line) => {
      const [, name, type, attrs = ''] = line.match(/^(\w+)\s+(\S+)\s*(.*)$/) || [];
      if (!name) throw new Error(`Campo no reconocido: ${line}`);
      const base = type.replace(/[?\[\]]/g, '');
      return { name, type, base, attrs: attrs.split('//')[0].trim(), comment: attrs.split('//').slice(1).join('//').trim(), relation: names.has(base) };
    });
}
const relations = models.flatMap((m) => m.fields.filter((f) => f.relation && f.attrs.includes('fields:')).map((f) => {
  const fks = f.attrs.match(/fields:\s*\[([^\]]+)\]/)[1].split(',').map((s) => s.trim());
  const refs = f.attrs.match(/references:\s*\[([^\]]+)\]/)[1].split(',').map((s) => s.trim());
  return { child: m.name, parent: f.base, optional: f.type.endsWith('?'), fks, refs, field: f.name };
}));
const enums = [...schema.matchAll(/^enum (\w+) \{([\s\S]*?)^\}/gm)];

let dictionary = '# 06. Diccionario de datos\n\nGenerado desde [schema.prisma](../api/prisma/schema.prisma). Describe el esquema del código, no confirma que una base desplegada haya aplicado sus migraciones.\n\n';
dictionary += `Incluye **${models.length} modelos**, **${relations.length} relaciones físicas** y **${enums.length} enumeraciones**.\n\n`;
dictionary += 'Convenciones: `?` admite nulo; `[]` es lista; `@id` identifica PK, `@unique` unicidad y `@relation` FK. Campos de relación Prisma no son columnas adicionales. `@updatedAt` lo administra Prisma; no implica un trigger de PostgreSQL. `Decimal(p,s)` conserva precisión y escala declaradas; los servicios pueden convertir valores a Number.\n\n';
dictionary += '## Enumeraciones\n\n| Nombre | Valores |\n| --- | --- |\n';
for (const e of enums) dictionary += `| ${e[1]} | ${e[2].trim().split(/\s+/).join(', ')} |\n`;
for (const m of models) {
  dictionary += `\n## ${m.name}\n\nTabla física: \`${m.table}\`.\n\n| Campo | Tipo Prisma | Admite nulo | Restricciones / valor inicial | Nota del esquema |\n| --- | --- | --- | --- | --- |\n`;
  for (const f of m.fields.filter((f) => !f.relation)) {
    const fk = relations.find((r) => r.child === m.name && r.fks.includes(f.name));
    dictionary += `| ${f.name} | ${cell(f.type)} | ${f.type.endsWith('?') ? 'Sí' : 'No'} | ${cell(f.attrs || '—')}${fk ? `; FK a ${fk.parent}.${fk.refs.join(',')}` : ''} | ${cell(f.comment || '—')} |\n`;
  }
  const constraints = m.body.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('@@') && !l.startsWith('@@map'));
  if (constraints.length) dictionary += '\nRestricciones de modelo: ' + constraints.map((c) => '`' + c + '`').join('; ') + '.\n';
  dictionary += '\nRelaciones de navegación Prisma:\n\n| Campo | Destino | Declaración |\n| --- | --- | --- |\n';
  for (const f of m.fields.filter((f) => f.relation)) dictionary += `| ${f.name} | ${f.type} | ${cell(f.attrs || 'Lado inverso; FK declarada en el otro modelo')} |\n`;
}
write('06-diccionario-de-datos.md', dictionary);

const diagram = (selected) => {
  const chosen = new Set(selected);
  let out = 'erDiagram\n';
  for (const m of models.filter((m) => chosen.has(m.name))) {
    out += `  ${m.name} {\n`;
    for (const f of m.fields.filter((f) => !f.relation)) {
      const fk = relations.some((r) => r.child === m.name && r.fks.includes(f.name));
      const key = f.attrs.includes('@id') ? ' PK' : fk ? ' FK' : f.attrs.includes('@unique') ? ' UK' : '';
      if (!key && !['nombre', 'numero', 'estado', 'cantidad', 'total', 'stock', 'empresaId'].includes(f.name)) continue;
      out += `    ${f.base} ${f.name}${key}${f.type.endsWith('?') ? ' "nullable"' : ''}\n`;
    }
    out += '  }\n';
  }
  for (const r of relations.filter((r) => chosen.has(r.child) && chosen.has(r.parent))) {
    out += `  ${r.parent} ${r.optional ? '|o' : '||'}..o{ ${r.child} : "${r.fks.join(',')}"\n`;
  }
  return out;
};
const groups = [
  ['01-organizacion', 'Organización y auditoría', ['Empresa', 'Sucursal', 'Usuario', 'Auditoria']],
  ['02-catalogo', 'Catálogo, recetas y adicionales', ['Empresa', 'Categoria', 'Producto', 'Ingrediente', 'ProductoIngrediente', 'Adicional', 'ProductoAdicional']],
  ['03-ventas-caja', 'Ventas, clientes y detalles', ['Cliente', 'Pedido', 'DetallePedido', 'Producto', 'Adicional', 'DetallePedidoAdicional']],
  ['04-preparaciones', 'Recetas de preparaciones', ['Ingrediente', 'Preparacion', 'PreparacionIngrediente', 'Producto', 'ProductoPreparacion']],
  ['05-consumo-empleados', 'Consumo de empleados', ['Empresa', 'Sucursal', 'Usuario', 'Producto', 'ConsumoEmpleado', 'ConsumoEmpleadoItem']],
  ['06-caja-finanzas', 'Caja y finanzas', ['Sucursal', 'Usuario', 'Pedido', 'Caja', 'EventoCaja', 'MovimientoFinanciero']],
  ['07-lotes-inventario', 'Lotes y movimientos de inventario', ['Usuario', 'Ingrediente', 'MovimientoInventario', 'Preparacion', 'LotePreparacion', 'LotePreparacionIngrediente']],
];
write('diagramas/er-completo.mmd', diagram([...names]));
let modelDoc = '# 05. Modelo entidad-relación\n\nFuente: [esquema Prisma](../api/prisma/schema.prisma). Modelo físico del código actual, no un diseño idealizado.\n\n';
modelDoc += `Hay **${models.length} entidades** y **${relations.length} relaciones con FK**. [Diagrama completo editable](diagramas/er-completo.mmd). Se muestran PK, FK, unicidad individual y algunos campos descriptivos; el [diccionario](06-diccionario-de-datos.md) incluye todos los campos y las restricciones compuestas.\n\n`;
modelDoc += '## Lectura de cardinalidades\n\n`||` significa exactamente uno; `o|` o `|o`, cero o uno; `o{`, cero o muchos. La FK obligatoria exige un padre por registro hijo, pero no obliga al padre a tener hijos. Las líneas discontinuas señalan relaciones no identificadoras: las tablas tienen PK propia. Los diagramas por dominio omiten relaciones externas al grupo; el completo y la tabla final incluyen todas.\n\n';
for (const [file, title, selected] of groups) {
  const d = diagram(selected);
  write(`diagramas/er-${file}.mmd`, d);
  modelDoc += `## ${title}\n\n[Archivo Mermaid](diagramas/er-${file}.mmd)\n\n\`\`\`mermaid\n${d}\`\`\`\n\n`;
}
modelDoc += '## Relaciones físicas completas\n\n| Tabla hija / modelo | FK | Modelo padre / clave | Padre por hijo | Hijos por padre |\n| --- | --- | --- | --- | --- |\n';
for (const r of relations) modelDoc += `| ${r.child} | ${r.fks.join(', ')} | ${r.parent}.${r.refs.join(', ')} | ${r.optional ? '0..1' : '1'} | 0..N |\n`;
modelDoc += '\n## Decisiones y limitaciones del modelo\n\n- Las tablas puente resuelven relaciones muchos a muchos; ProductoIngrediente, ProductoAdicional y ProductoPreparacion impiden pares duplicados mediante claves únicas compuestas.\n- Categoria contiene una autorrelación opcional parentId. La FK no evita ciclos jerárquicos por sí misma.\n- Usuario puede no tener empresa ni sucursal; esto permite representar SUPERADMIN, aunque el esquema no limita esa excepción a ese rol.\n- Ingrediente no tiene empresaId ni sucursalId: su stock es global. MovimientoInventario tampoco tiene FK directa a empresa o sucursal.\n- Pedido pertenece a empresa a través de Sucursal; ConsumoEmpleado y MovimientoFinanciero guardan empresa y sucursal, pero sus FKs independientes no aseguran coincidencia empresarial.\n- Auditoria.entidadId es una referencia lógica polimórfica, no una FK a cada entidad auditada.\n- ConsumoEmpleado.empleadoNombre es texto; usuarioId identifica quién registra. No existe entidad Empleado.\n- DetallePedido.exclusiones es un arreglo de nombres, no una tabla de relación con Ingrediente.\n- LotePreparacion no tiene saldo consumido, caducidad ni vínculo de asignación a ventas.\n- No hay entidades de factura electrónica, impuestos de línea, pagos múltiples por pedido ni stock por sucursal.\n- Activo y disponible expresan estados diferentes; desactivar no equivale a borrar físicamente.\n- No se declararon onDelete explícitos en estas relaciones. Este documento no atribuye borrado en cascada; revisar las migraciones antes de cualquier eliminación.\n';
write('05-modelo-de-datos.md', modelDoc);

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const controllers = walk(path.join(root, 'api/src')).filter((p) => p.endsWith('.controller.ts')).sort();
let catalog = '# Catálogo de rutas declarado en código\n\nGenerado desde controladores NestJS. Incluye decoradores, parámetros anotados y referencias; no es OpenAPI ni garantiza validación de cuerpos. `any` requiere consultar servicio. Los roles reflejan decoradores, no reglas inferidas de la interfaz.\n\n';
let routes = 0;
for (const file of controllers) {
  const src = fs.readFileSync(file, 'utf8');
  const prefix = src.match(/@Controller\(\s*['"]([^'"]*)['"]\s*\)/)?.[1] || '';
  const head = src.slice(0, src.indexOf('export class'));
  const guards = [...head.matchAll(/@UseGuards\(([^)]+)\)/g)].map((m) => m[1]).join(', ');
  const classRoles = head.match(/@Roles\(([^)]+)\)/)?.[1];
  const matches = [...src.matchAll(/@(Get|Post|Patch|Put|Delete|Sse)\(\s*(?:['"]([^'"]*)['"])?\s*\)/g)];
  const rel = path.relative(root, file).replaceAll('\\', '/');
  catalog += `## /${prefix}\n\nFuente: [${rel}](../../${rel}). Guards de clase: ${guards || 'ninguno declarado'}.\n\n| Método | Ruta | Roles declarados | Entradas anotadas |\n| --- | --- | --- | --- |\n`;
  matches.forEach((m, i) => {
    const end = matches[i + 1]?.index ?? src.length;
    const segment = src.slice(m.index + m[0].length, end);
    const roles = segment.match(/@Roles\(([^)]+)\)/)?.[1] || classRoles || 'Sin restricción de rol declarada';
    const inputs = [...segment.matchAll(/@(Body|Query|Param|UploadedFile)\(([^)]*)\)/g)].map((v) => `${v[1]}(${v[2]})`).join('; ') || '—';
    const url = '/' + [prefix, m[2]].filter(Boolean).join('/');
    catalog += `| ${m[1] === 'Sse' ? 'GET (SSE)' : m[1].toUpperCase()} | \`${url}\` | ${cell(roles)} | ${cell(inputs)} |\n`;
    routes++;
  });
  catalog += '\n';
}
fs.mkdirSync(path.join(docs, 'referencias'), { recursive: true });
write('referencias/catalogo-api.md', catalog);
console.log(JSON.stringify({ models: models.length, relations: relations.length, enums: enums.length, controllers: controllers.length, routes }, null, 2));
