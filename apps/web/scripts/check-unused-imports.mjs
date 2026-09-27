/**
 * Comprobación de imports sin usar. Solo analiza los `import ... from` de cada
 * archivo y busca el identificador en el resto del archivo. Es una verificación
 * estática sencilla: no sustituye a un linter, pero evita arrastrar imports
 * muertos tras una refactorización.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const WEB_ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SRC_ROOT = join(WEB_ROOT, 'src');

const IMPORT_PATTERN = /import\s+([\s\S]*?)\s+from\s+['"][^'"]+['"]\s*;?/g;

function collectFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...collectFiles(full));
    else if (/\.(jsx?|mjs)$/.test(entry)) files.push(full);
  }
  return files;
}

/** Nombres introduzidos por una cláusula `import`, incluidos los alias `as`. */
function importedNames(clause) {
  const names = [];
  const braces = clause.match(/\{([\s\S]*)\}/);
  if (braces) {
    for (const part of braces[1].split(',')) {
      const cleaned = part.trim();
      if (!cleaned) continue;
      names.push(cleaned.split(/\s+as\s+/).pop().trim());
    }
  }
  const bare = clause.replace(/\{[\s\S]*\}/, '').replace(/,/g, ' ').trim();
  for (const part of bare.split(/\s+/)) {
    if (part && part !== '*') names.push(part);
  }
  return names;
}

const problems = [];

for (const file of collectFiles(SRC_ROOT)) {
  const source = readFileSync(file, 'utf8');
  // El operador de propagación `...` precede al identificador con un punto, igual
  // que un acceso a miembro (`obj.nombre`). Se separa para no confundir ambos.
  const body = source.replace(IMPORT_PATTERN, ' ').replace(/\.\.\./g, ' ');

  for (const match of source.matchAll(IMPORT_PATTERN)) {
    for (const name of importedNames(match[1])) {
      const used = new RegExp(`(?<![\\w$.])${name}(?![\\w$])`).test(body);
      if (!used) problems.push(`${file.replace(SRC_ROOT, 'src')}: ${name}`);
    }
  }
}

if (problems.length > 0) {
  console.error('Imports sin usar:');
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log('Imports sin usar: 0');
