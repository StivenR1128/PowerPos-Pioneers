import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require('C:/Users/jesti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'logos-v2');
await mkdir(dir, { recursive: true });

const variants = [
  {
    id: '01-minimalista',
    icon: `<path d="M27 22h67c31 0 48 17 48 43s-17 43-48 43H66v30H27V22zm39 32v23h27c8 0 12-4 12-12s-4-11-12-11H66z" fill="#102B27" fill-rule="evenodd"/>
      <path d="M20 91h46l35-29-14 36-67 43V91z" fill="#FF713D"/>`,
    word: `<text x="222" y="142" font-family="Segoe UI,Arial,sans-serif" font-weight="700" font-size="128" letter-spacing="-6" fill="#102B27">Power<tspan fill="#F26B39">POS</tspan></text>`,
    bg: '#F7FAF8',
  },
  {
    id: '02-elegante',
    icon: `<circle cx="80" cy="80" r="73" fill="#F8F9F5" stroke="#17352F" stroke-width="4"/>
      <path d="M55 126V37h40c27 0 43 14 43 35s-16 36-43 36H55" fill="none" stroke="#17352F" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M68 111h47" stroke="#C5774E" stroke-width="7" stroke-linecap="round"/>
      <circle cx="130" cy="118" r="7" fill="#C5774E"/>`,
    word: `<text x="221" y="130" font-family="Georgia,serif" font-size="116" letter-spacing="-5" fill="#17352F">Power</text>
      <text x="645" y="130" font-family="Georgia,serif" font-size="116" letter-spacing="-5" fill="#C5774E">POS</text>
      <path d="M224 154H913" stroke="#C7D3CA" stroke-width="2"/>
      <text x="226" y="190" font-family="Segoe UI,Arial,sans-serif" font-size="26" letter-spacing="8" fill="#6A7D70">PUNTO DE VENTA</text>`,
    bg: '#F8F9F5',
  },
  {
    id: '03-energico',
    icon: `<rect width="160" height="160" rx="34" fill="#172130"/>
      <path d="M37 35h69L76 75h45l-76 54 22-41H37z" fill="#FF713D"/>
      <path d="M40 45h46L65 75H40z" fill="#FFFFFF" opacity=".95"/>`,
    word: `<text x="220" y="141" font-family="Arial,Segoe UI,sans-serif" font-weight="900" font-size="116" letter-spacing="-4" fill="#172130">POWER<tspan fill="#FF713D">POS</tspan></text>`,
    bg: '#F7F9FB',
  },
];

for (const v of variants) {
  const full = `<svg xmlns="http://www.w3.org/2000/svg" width="1160" height="220" viewBox="0 0 1160 220" role="img" aria-label="PowerPOS"><g transform="translate(22 30)">${v.icon}</g>${v.word}</svg>`;
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" role="img" aria-label="Símbolo PowerPOS">${v.icon}</svg>`;
  const avatar = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><rect width="1080" height="1080" fill="${v.bg}"/><g transform="translate(220 220) scale(4)">${v.icon}</g></svg>`;
  await writeFile(path.join(dir, `logo-${v.id}.svg`), full);
  await writeFile(path.join(dir, `icono-${v.id}.svg`), icon);
  await sharp(Buffer.from(full), { density: 150 }).png().toFile(path.join(dir, `logo-${v.id}.png`));
  await sharp(Buffer.from(icon), { density: 300 }).png().toFile(path.join(dir, `icono-${v.id}.png`));
  await sharp(Buffer.from(avatar), { density: 150 }).png().toFile(path.join(dir, `perfil-${v.id}.png`));
}
