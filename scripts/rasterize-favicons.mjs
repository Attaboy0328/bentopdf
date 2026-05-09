/**
 * Rasterize public/images/favicon.svg → PNG sizes + multi-size favicon.ico
 * for bookmarks, iOS, and PWA manifest (run after updating the SVG).
 */
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import toIco from 'to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const svgPath = path.join(root, 'public/images/favicon.svg');

function renderPng(svgBuffer, size) {
  const resvg = new Resvg(svgBuffer, {
    fitTo: {
      mode: 'width',
      width: size,
    },
  });
  return Buffer.from(resvg.render().asPng());
}

async function main() {
  const svg = await fs.readFile(svgPath);

  const out = [
    ['public/images/favicon-192x192.png', 192],
    ['public/images/favicon-512x512.png', 512],
    ['public/images/apple-touch-icon.png', 180],
  ];

  for (const [rel, w] of out) {
    const png = renderPng(svg, w);
    await fs.writeFile(path.join(root, rel), png);
    console.log('wrote', rel);
  }

  const png16 = renderPng(svg, 16);
  const png32 = renderPng(svg, 32);
  const ico = await toIco([png16, png32]);
  await fs.writeFile(path.join(root, 'public/favicon.ico'), ico);
  console.log('wrote public/favicon.ico');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
