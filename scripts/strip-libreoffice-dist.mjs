/**
 * Remove libreoffice-wasm from dist/ after build so deploy targets with a per-file
 * size limit (e.g. Cloudflare Workers/Pages, 25 MiB) can skip the large data archive.
 *
 * Pair with VITE_LIBREOFFICE_BASE_URL pointing at the same files on R2, S3, or another HTTPS origin.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');

const externalBase =
  typeof process.env.VITE_LIBREOFFICE_BASE_URL === 'string'
    ? process.env.VITE_LIBREOFFICE_BASE_URL.trim()
    : '';
if (!externalBase) {
  console.warn(
    '[strip-libreoffice-dist] VITE_LIBREOFFICE_BASE_URL is not set. Set it to your R2 (or other HTTPS) URL prefix where libreoffice-wasm files are hosted, e.g. https://wasm.example.com/libreoffice-wasm/'
  );
}

function removeLibreOfficeWasmDirs(dir) {
  if (!fs.existsSync(dir)) {
    console.warn('[strip-libreoffice-dist] dist not found:', dir);
    return;
  }

  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      const full = path.join(current, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === 'libreoffice-wasm') {
          fs.rmSync(full, { recursive: true, force: true });
          console.log('[strip-libreoffice-dist] removed', full);
        } else {
          stack.push(full);
        }
      }
    }
  }
}

removeLibreOfficeWasmDirs(DIST_DIR);
console.log('[strip-libreoffice-dist] complete');
