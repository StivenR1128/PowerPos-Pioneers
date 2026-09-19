const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const deps = process.argv[2];
if (!deps) throw new Error('Indique dependencias de artefactos con playwright.');
const { chromium } = require(path.join(deps, 'playwright'));
const root = path.resolve(__dirname, '../..');
async function main() {
  const out = path.join(root, 'output/pdf');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage();
    for (const file of ['documentacion-academica-tecnica', 'manual-del-cliente', 'guia-piloto-y-entrega', 'acta-de-entrega']) {
      await page.goto(pathToFileURL(path.join(root, 'docs/entregables', file + '.html')).href, { waitUntil: 'load' });
      await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode())));
      await page.emulateMedia({ media: 'print' });
      await page.pdf({
        path: path.join(out, file + '.pdf'), format: 'A4', preferCSSPageSize: true,
        printBackground: true, displayHeaderFooter: true,
        headerTemplate: '<span></span>',
        footerTemplate: '<div style="font-family:Arial;font-size:8px;width:100%;margin:0 15mm;display:flex;justify-content:space-between;color:#64748b"><span>PowerPOS Pioneers · Documentación 1.2 · Piloto</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
      });
      console.log(file + '.pdf');
    }
  } finally { await browser.close(); }
}
main().catch((e) => { console.error(e); process.exit(1); });
