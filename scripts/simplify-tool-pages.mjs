/**
 * Strip Related Tools + FAQ blocks, swap footer partial, tighten layout,
 * replace visible BentoPDF branding — without parsing Handlebars through JSDOM
 * (serializing would escape {{> partials }}).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAGES_DIR = path.resolve(__dirname, '../src/pages');

const MIN_H_REPLACEMENTS = [
  [
    'min-h-screen flex flex-col items-center justify-start py-12 p-4 bg-gray-900',
    'flex flex-col items-center justify-start py-6 md:py-8 p-4 bg-gray-900',
  ],
  [
    'min-h-screen flex items-center justify-center p-4 bg-gray-900',
    'flex items-center justify-center min-h-0 py-8 p-4 bg-gray-900',
  ],
  ['min-h-screen py-8 px-4', 'py-8 px-4'],
];

function processHtml(raw) {
  let text = raw.replace(/\{\{>\s*footer\s*\}\}/g, '{{> footer-minimal}}');

  text = text.replace(
    /\r?\n\s*<!-- Related Tools Section -->[\s\S]*?<\/section>/gi,
    ''
  );
  text = text.replace(/\r?\n\s*<!-- FAQ Section -->[\s\S]*?<\/section>/gi, '');

  text = text.replace(
    /<section[^>]*>[\s\S]*?data-i18n="relatedTools\.title"[\s\S]*?<\/section>/gi,
    ''
  );
  text = text.replace(
    /<section[^>]*>[\s\S]*?data-i18n="faq\.sectionTitle"[\s\S]*?<\/section>/gi,
    ''
  );

  text = text.replace(/\s*<!-- Related Tools Section -->\s*/g, '');
  text = text.replace(/\s*<!-- FAQ Section -->\s*/g, '');

  text = text.replace(
    /<section class="max-w-4xl mx-auto px-4 py-12"/g,
    '<section class="max-w-4xl mx-auto px-4 py-6 md:py-8"'
  );

  for (const [from, to] of MIN_H_REPLACEMENTS) {
    text = text.split(from).join(to);
  }

  text = text.replace(/(?<!@)\bBentoPDF\b/g, 'MyPDF');

  return text;
}

function main() {
  const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.html'));
  let changed = 0;
  for (const file of files) {
    const fp = path.join(PAGES_DIR, file);
    const before = fs.readFileSync(fp, 'utf-8');
    const after = processHtml(before);
    if (after !== before) {
      fs.writeFileSync(fp, after, 'utf-8');
      changed++;
      console.log('updated', file);
    }
  }
  console.log(`Done. ${changed} files changed.`);
}

main();
