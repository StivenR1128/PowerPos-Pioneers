import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require('C:/Users/jesti/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(root, 'logo-powerpos-elegido-original.png');

// Recortes mecánicos: conserva exactamente las formas y colores elegidos.
const full = await sharp(source).extract({ left: 127, top: 78, width: 1824, height: 538 }).png().toBuffer();
await sharp(full).toFile(path.join(root, 'logo-powerpos-oficial.png'));

const iconRegion = await sharp(source).extract({ left: 0, top: 0, width: 480, height: 793 }).png().toBuffer();
const icon = await sharp(iconRegion).trim({ background: '#00000000', threshold: 2 }).png().toBuffer();
await sharp(icon).toFile(path.join(root, 'icono-powerpos-oficial.png'));

const iconSized = await sharp(icon).resize(700, 700, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
await sharp({ create: { width: 1080, height: 1080, channels: 4, background: '#f7faf8' } })
  .composite([{ input: iconSized, gravity: 'centre' }])
  .png().toFile(path.join(root, 'perfil-powerpos-oficial.png'));

await sharp(icon).resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png()
  .toFile(path.join(root, '..', 'landing', 'dist', 'assets', 'favicon-powerpos.png'));
await sharp(full).png().toFile(path.join(root, '..', 'landing', 'dist', 'assets', 'logo-powerpos.png'));
