// Requiere marked y @viz-js/viz en las dependencias de artefactos del entorno.
// Uso: node docs/tools/exportar-html.cjs RUTA_NODE_MODULES
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '../..');
const docs = path.join(root, 'docs');
const dependencies = process.argv[2];
if (!dependencies) throw new Error('Indique el directorio de dependencias con marked y @viz-js/viz.');
const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const quote = (s) => JSON.stringify(s);
const out = path.join(docs, 'entregables');
fs.mkdirSync(out, { recursive: true });

async function main() {
  const { marked } = await import(pathToFileURL(path.join(dependencies, 'marked/lib/marked.esm.js')));
  const { instance } = require(path.join(dependencies, '@viz-js/viz'));
  const viz = await instance();
  function erDot(mmd) {
    const nodes = [...mmd.matchAll(/^\s+(\w+) \{\n([\s\S]*?)^\s+\}/gm)];
    const relations = [...mmd.matchAll(/^\s+(\w+) (\|\||\|o)\.\.(o\{|o\|) (\w+) : "([^"]+)"/gm)];
    let dot = 'digraph G { graph [rankdir=LR, bgcolor="transparent", pad="0.3", nodesep="0.55", ranksep="1.0", splines=polyline]; node [shape=plain, fontname="Arial"]; edge [fontname="Arial", fontsize=10, color="#64748b", arrowsize=0.5];\n';
    for (const [, name, fields] of nodes) {
      const rows = fields.trim().split('\n').map((line) => `<TR><TD ALIGN="LEFT">${escape(line.trim().replaceAll('"', ''))}</TD></TR>`).join('');
      dot += `${name} [label=<<TABLE BORDER="1" COLOR="#94a3b8" CELLBORDER="0" CELLSPACING="0" CELLPADDING="7"><TR><TD BGCOLOR="#e2e8f0"><B>${name}</B></TD></TR>${rows}</TABLE>>];\n`;
    }
    for (const [, parent, optional, multiplicity, child, field] of relations) dot += `${parent} -> ${child} [label=${quote(field)}, taillabel=${quote(optional === '||' ? '1' : '0..1')}, headlabel=${quote(multiplicity === 'o|' ? '0..1' : '0..N')}, labeldistance=2, dir=none];\n`;
    return dot + '}';
  }
  function renderSvg(dot) {
    return viz.renderString(dot, { format: 'svg' }).replace(/<\?xml[^>]*>\s*/, '').replace(/<!DOCTYPE[\s\S]*?>\s*/, '').replace('<svg ', '<svg role="img" aria-label="Diagrama del proyecto" ');
  }
  const custom = {
    'flowchart LR': 'digraph G { rankdir=LR; node [shape=box,style="rounded,filled",fillcolor="#f1f5f9",fontname="Arial"]; edge [color="#64748b"]; "Superadministrador" -> "Administrar empresas"; "Administrador o gerente" -> {"Configurar catálogo" "Inventario y preparaciones" "Caja y reportes" "Consumo de empleados"}; "Cajero" -> "Registrar venta"; "Registrar venta" -> {"Cliente opcional" "Recibo o comanda"}; "Cocinero" -> "Preparar pedido"; "Preparar pedido" -> "Listo y entrega"; "Domiciliario" -> "Listo y entrega"; }',
    'sequenceDiagram': 'digraph G { rankdir=TB; node [shape=box,fontname="Arial",style="rounded,filled",fillcolor="#f1f5f9"]; "Cajero confirma" -> "POS envía POST pedidos con JWT" -> "API valida caja y catálogo" -> "DB crea pedido y detalles" -> "DB descuenta ingredientes" -> "DB registra ingreso y puntos si aplica" -> "Evento SSE a cocina" -> "Solicitud de notificación" -> "Respuesta al POS e impresión configurada"; "Transacción confirmada o revertida" [shape=note,fillcolor="#fff7ed"]; "Transacción confirmada o revertida" -> "DB descuenta ingredientes" [style=dashed,arrowhead=none]; }',
    'stateDiagram-v2': 'digraph G { rankdir=LR; node [shape=box,fontname="Arial",style="rounded,filled",fillcolor="#f1f5f9"]; PENDIENTE -> EN_COCINA -> LISTO -> ENTREGADO; PENDIENTE -> ANULADO; EN_COCINA -> ANULADO; }',
    'flowchart TB': 'digraph G { rankdir=TB; node [shape=box,fontname="Arial",style="rounded,filled",fillcolor="#f1f5f9"]; "Personal" -> "Next.js y React 3001" -> "NestJS 3000" [label="HTTP y JWT"]; "NestJS 3000" -> "Next.js y React 3001" [label="SSE"]; "Next.js y React 3001" -> "Pantallas cliente y llamado" [label="Comunicación del navegador"]; "NestJS 3000" -> "Servicios" -> "Prisma" -> "PostgreSQL 16"; "Servicios" -> {"SMTP opcional" "Twilio opcional" "Impresora TCP"}; "NestJS 3000" -> "Archivos uploads"; "Cron" -> "Servicios"; "Redis en Compose sin uso identificado" [shape=cylinder]; }',
    'deployment': 'digraph G { rankdir=LR; node [shape=box,fontname="Arial",style="rounded,filled",fillcolor="#f1f5f9"]; "Navegadores" -> "Entrada HTTPS por definir" -> {"Next.js" "NestJS"}; "NestJS" -> {"PostgreSQL persistente" "Logos persistentes"}; "PostgreSQL persistente" -> "Respaldo externo y restauración"; }',
  };
  const svgByMmd = new Map();
  for (const file of fs.readdirSync(path.join(docs, 'diagramas')).filter((f) => f.endsWith('.mmd'))) {
    const source = fs.readFileSync(path.join(docs, 'diagramas', file), 'utf8').trim();
    const svg = renderSvg(erDot(source));
    fs.writeFileSync(path.join(docs, 'diagramas', file.replace('.mmd', '.svg')), svg);
    svgByMmd.set(source, svg);
  }
  const stylesheet = `
    *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#eef2f6;color:#182334;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6}
    main{max-width:1160px;margin:32px auto;background:white;padding:64px 70px;box-shadow:0 8px 40px #12243a12}
    h1,h2,h3{color:#111827;line-height:1.22;scroll-margin-top:24px}h1{font-size:32px;margin:48px 0 22px}h2{font-size:23px;margin:36px 0 16px}h3{font-size:18px;margin-top:28px}
    .cover{padding:20px 0 42px}.cover h1{font-size:46px;margin:20px 0}.eyebrow{font-size:13px;letter-spacing:2px;font-weight:bold;color:#475569;text-transform:uppercase}.subtitle{font-size:23px;color:#475569}.meta{font-size:14px;color:#475569}
    nav{background:#f1f5f9;border-radius:8px;padding:22px 28px;margin:20px 0 44px}nav a{display:block;padding:4px 0}a{color:#165a9c;text-decoration:none}a:hover{text-decoration:underline}
    p,li{overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;font-size:13px;margin:20px 0 28px;line-height:1.5;table-layout:auto}th,td{border:1px solid #cbd5e1;padding:10px 12px;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#e2e8f0;color:#111827;font-weight:700}tbody tr:nth-child(even){background:#f8fafc}thead{display:table-header-group}
    code{font-family:Consolas,monospace;font-size:.9em;background:#f1f5f9;padding:2px 4px;overflow-wrap:anywhere}pre{background:#f1f5f9;border:1px solid #dbe2ea;padding:18px;white-space:pre-wrap;font-size:13px;line-height:1.5}pre code{padding:0}
    figure{margin:28px 0;padding:14px;border:1px solid #dbe2ea;overflow:auto}figure svg{display:block;width:100%;height:auto;max-height:760px}figure img{display:block;width:100%;height:auto}figcaption{font-size:12px;color:#475569;margin-top:12px}.chapter{margin-top:56px}.print{position:fixed;right:24px;bottom:24px;border:0;border-radius:8px;background:#16324f;color:white;padding:14px 20px;cursor:pointer}.note{padding:14px 18px;background:#fff7ed;border-left:4px solid #d97706}nav .sub{font-size:13px;padding-left:16px}
    @media(max-width:750px){main{margin:0;padding:28px 20px}.cover h1{font-size:34px}table{font-size:11px}th,td{padding:7px}.print{position:static;margin:16px}}
    @media print{@page{size:A4;margin:18mm 15mm}body{background:white;font-size:10pt;line-height:1.45}main{margin:0;padding:0;max-width:none;box-shadow:none}h1{font-size:23pt}h2{font-size:16pt}h3{font-size:12pt}h1,h2,h3{break-after:avoid}p{orphans:3;widows:3}.cover{break-after:page;padding:32mm 0}.cover h1{font-size:34pt}nav{break-after:page;background:none;padding:0}nav a{padding:3px 0}.chapter{break-before:page;margin:0}table{font-size:8pt}th,td{padding:6px 7px}tr{break-inside:avoid}figure{break-inside:avoid;padding:4px}figure svg{max-height:225mm}figure img{max-height:205mm;width:auto;max-width:100%;object-fit:contain;margin:auto}.print{display:none}a{color:inherit;text-decoration:none}pre{font-size:8pt}}
  `;
  function compile(title, subtitle, files, filename, introductory) {
    const anchors = new Map(files.map((f, i) => [path.resolve(docs, f), `chapter-${i + 1}`]));
    const chapters = files.map((file, i) => {
      let md = fs.readFileSync(path.join(docs, file), 'utf8');
      const titleText = md.match(/^# (.+)$/m)?.[1] || file;
      md = md.replace(/```mermaid\n([\s\S]*?)```/g, (_, mmd) => {
        let svg = svgByMmd.get(mmd.trim());
        if (!svg) {
          const key = mmd.includes('Entrada HTTPS') ? 'deployment' : mmd.trim().split('\n')[0];
          if (!custom[key]) throw new Error(`Diagrama no soportado: ${key}`);
          svg = renderSvg(custom[key]);
        }
        return `\n<figure>${svg}<figcaption>${mmd.trim().startsWith('erDiagram') ? 'Modelo físico. Cardinalidad indicada junto a cada extremo. Ver diccionario para todos los campos.' : 'Vista de proceso o arquitectura. Revisar las condiciones descritas en el texto.'}</figcaption></figure>\n`;
      });
      md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (full, label, target) => {
        if (/^(https?:|#)/.test(target)) return full;
        const dest = path.resolve(path.dirname(path.join(docs, file)), target);
        if (anchors.has(dest)) return `[${label}](#${anchors.get(dest)})`;
        const rel = path.relative(out, dest).replaceAll('\\', '/');
        return `[${label}](${rel})`;
      });
      let body = marked.parse(md);
      const sections = [];
      body = body.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, label) => {
        const id = `chapter-${i + 1}-section-${sections.length + 1}`;
        sections.push({ id, label: label.replace(/<[^>]+>/g, '') });
        return `<h2 id="${id}">${label}</h2>`;
      });
      body = body.replace(/<p><img src="([^"]+)" alt="([^"]*)"[^>]*><\/p>/g, (_, src, alt) => {
        const img = fs.readFileSync(path.resolve(out, src));
        const mime = src.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
        return `<figure><img src="data:${mime};base64,${img.toString('base64')}" alt="${alt}"><figcaption>${alt}. Interfaz real con datos de demostración.</figcaption></figure>`;
      });
      return { title: titleText, sections, html: `<section class="chapter" id="chapter-${i + 1}">${body}</section>` };
    });
    const toc = chapters.map((c, i) => `<a href="#chapter-${i + 1}">${escape(c.title)}</a>${files.length <= 2 ? c.sections.map((s) => `<a class="sub" href="#${s.id}">${escape(s.label)}</a>`).join('') : ''}`).join('');
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><style>${stylesheet}</style></head><body><main><header class="cover"><p class="eyebrow">PowerPOS Pioneers</p><h1>${escape(title)}</h1><p class="subtitle">${escape(subtitle)}</p><p class="meta">Versión documental 1.2 · 17 de septiembre de 2026</p><p>${escape(introductory)}</p></header><nav aria-label="Contenido"><h2>Contenido</h2>${toc}</nav>${chapters.map((c) => c.html).join('')}</main><button class="print" onclick="window.print()">Imprimir o guardar como PDF</button></body></html>`;
    fs.writeFileSync(path.join(out, filename), html);
  }
  compile('Documentación académica y técnica', 'Requerimientos, diseño, operación y validación', [
    '01-presentacion-y-alcance.md','02-requerimientos.md','03-casos-de-uso.md','04-arquitectura.md','05-modelo-de-datos.md',
    '06-diccionario-de-datos.md','07-api.md','08-instalacion-y-operacion.md','09-manual-de-usuario.md','10-pruebas-y-trazabilidad.md','11-brechas-y-evolucion.md','12-tiendas-domicilios-fidelizacion.md','referencias/catalogo-api.md',
  ], 'documentacion-academica-tecnica.html', 'Expediente para evaluación académica y mantenimiento del sistema. Diferencia capacidades observadas, requisitos propuestos y pruebas pendientes. Autor, institución, programa, docente y aprobación: por completar.');
  compile('Manual ilustrado del cliente', 'Operación por pantalla y rol', ['cliente/manual-operacion-detallado.md','cliente/tienda-domicilios-y-puntos.md','cliente/soporte-y-mantenimiento.md'], 'manual-del-cliente.html', 'Edición reutilizable para la empresa piloto y futuros adquirentes. Incluye instrucciones, ejemplos y capturas del sistema con datos ficticios. El sistema aún no está desplegado.');
  compile('Guía del piloto y entrega', 'Procedimientos, capacitación y resultados de validación', ['cliente/alcance-y-ficha-por-empresa.md','cliente/procedimientos-operativos.md','cliente/plan-piloto-y-capacitacion.md','cliente/informe-validacion.md','cliente/acta-de-entrega.md'], 'guia-piloto-y-entrega.html', 'Plan para implantar primero en una empresa y verificar condiciones antes de expandir a otras. Incluye procedimientos operativos, ensayos realizados y criterios de aceptación pendientes.');
  compile('Acta de entrega y aceptación', 'Registro de alcance, capacitación y pruebas', ['cliente/acta-de-entrega.md'], 'acta-de-entrega.html', 'Formulario por completar con proveedor y adquirente. Las pruebas, condiciones y firmas permanecen pendientes hasta que se registren sus evidencias.');
  console.log(`Generados 4 HTML imprimibles y ${svgByMmd.size} diagramas SVG sin dependencias de red.`);
}
main().catch((e) => { console.error(e); process.exit(1); });
