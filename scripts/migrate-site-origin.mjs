/**
 * Replace legacy bentopdf.com URLs with production origin and drop twitter:site meta.
 * Run: node scripts/migrate-site-origin.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const OLD_ORIGIN = 'https://www.bentopdf.com';
const NEW_ORIGIN = 'https://mypdf.282913.xyz';

function transform(html) {
  let s = html.split(OLD_ORIGIN).join(NEW_ORIGIN);
  s = s.replace(/<meta[^>]*\bname=["']twitter:site["'][^>]*>\s*/gi, '');
  return s;
}

function walkHtmlFiles(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const fp = path.join(dir, name);
    const st = fs.statSync(fp);
    if (st.isDirectory()) walkHtmlFiles(fp, out);
    else if (name.endsWith('.html')) out.push(fp);
  }
}

const files = [];
walkHtmlFiles(path.join(ROOT, 'src', 'pages'), files);
for (const name of fs.readdirSync(ROOT)) {
  if (name.endsWith('.html')) files.push(path.join(ROOT, name));
}

let n = 0;
for (const fp of files) {
  const before = fs.readFileSync(fp, 'utf8');
  const after = transform(before);
  if (after !== before) {
    fs.writeFileSync(fp, after, 'utf8');
    n++;
    console.log(path.relative(ROOT, fp));
  }
}
console.log(`Done. ${n} HTML files updated.`);
