import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { readJsonSafe } from '../utils/json-safe.js';

const MANIFEST_NAME = '_manifest.json';

export function hashFile(absPath) {
  return createHash('sha256').update(readFileSync(absPath)).digest('hex');
}

function walk(p, cb) {
  if (!existsSync(p)) return;
  if (statSync(p).isDirectory()) {
    for (const e of readdirSync(p)) walk(join(p, e), cb);
  } else {
    cb(p);
  }
}

// Constrói { relPath: sha256 } para todos os arquivos sob os diretórios dados,
// chaveado por caminho relativo ao projeto.
export function buildManifest(projectRoot, absDirs) {
  const manifest = {};
  for (const dir of absDirs) {
    walk(dir, (f) => {
      const rel = f.slice(projectRoot.length + 1).replace(/\\/g, '/');
      manifest[rel] = hashFile(f);
    });
  }
  return manifest;
}

export function saveManifest(projectRoot, manifest) {
  writeFileSync(join(projectRoot, '.lumen', MANIFEST_NAME), JSON.stringify(manifest, null, 2), 'utf8');
}

export function loadManifest(projectRoot) {
  const p = join(projectRoot, '.lumen', MANIFEST_NAME);
  return existsSync(p) ? readJsonSafe(p) : {};
}
