/**
 * Build libreoffice-wasm folder matching runtime URLs (soffice.*.gz) from npm package + public/.
 * Run from repo root: node scripts/gzip-libreoffice-for-r2.mjs [outputDir]
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outRoot = path.resolve(
  root,
  process.argv[2] || 'r2-libreoffice-staging/libreoffice-wasm'
);

const wasmPkg = path.join(
  root,
  'node_modules/@matbee/libreoffice-converter/wasm'
);
const pubLo = path.join(root, 'public/libreoffice-wasm');

async function gzipFile(src, dest) {
  await pipeline(
    fs.createReadStream(src),
    zlib.createGzip({ level: 9 }),
    fs.createWriteStream(dest)
  );
  const st = fs.statSync(dest);
  console.log(`[gzip-lo] ${path.basename(dest)} ${(st.size / 1024 / 1024).toFixed(2)} MiB`);
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`[gzip-lo] copy ${path.basename(dest)}`);
}

async function main() {
  fs.mkdirSync(outRoot, { recursive: true });

  await gzipFile(
    path.join(wasmPkg, 'soffice.data'),
    path.join(outRoot, 'soffice.data.gz')
  );
  await gzipFile(
    path.join(wasmPkg, 'soffice.wasm'),
    path.join(outRoot, 'soffice.wasm.gz')
  );

  copyFile(path.join(wasmPkg, 'soffice.js'), path.join(outRoot, 'soffice.js'));
  copyFile(
    path.join(wasmPkg, 'soffice.worker.js'),
    path.join(outRoot, 'soffice.worker.js')
  );
  copyFile(
    path.join(pubLo, 'browser.worker.global.js'),
    path.join(outRoot, 'browser.worker.global.js')
  );

  console.log('[gzip-lo] done →', outRoot);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
