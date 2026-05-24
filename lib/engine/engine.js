import { existsSync, mkdirSync, symlinkSync, lstatSync, cpSync } from 'fs';
import { join } from 'path';
import { execFileSync, spawnSync } from 'child_process';

// Motor de execução interno do Lumen. O usuário nunca o instala nem o invoca
// diretamente — os comandos `lumen` o acionam por baixo (global se presente,
// senão baixado sob demanda via npx). Toda a experiência é Lumen.

function onPath(cmd) {
  try {
    execFileSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

// Executa o motor. Por padrão repassa stdio (execuções interativas); passe
// { stdio: 'ignore' } para rodar em silêncio (ex.: o setup, que é ruidoso).
// Tenta o binário local; se ausente, npx baixa sob demanda.
export function engineRun(args, { stdio = 'inherit' } = {}) {
  if (onPath('compozy')) {
    return spawnSync('compozy', args, { stdio });
  }
  return spawnSync('npx', ['--yes', '-p', '@compozy/cli', 'compozy', ...args], { stdio });
}

function isSymlink(p) {
  try { return lstatSync(p).isSymbolicLink(); } catch { return false; }
}

// Aponta a pasta de trabalho do motor para `_lumen/<feature>` via symlink, para que
// o usuário e os skills só vejam `_lumen/`. O motor trabalha por baixo, transparente.
export function linkFeature(projectRoot, feature) {
  const src = join(projectRoot, '_lumen', feature);
  if (!existsSync(src)) {
    return { ok: false, reason: `_lumen/${feature} não existe — gere as tasks primeiro (lumen-tarefas)` };
  }
  const tasksRoot = join(projectRoot, '.compozy', 'tasks');
  mkdirSync(tasksRoot, { recursive: true });
  const link = join(tasksRoot, feature);
  if (isSymlink(link) || existsSync(link)) return { ok: true };
  try {
    symlinkSync(src, link, 'dir');
    return { ok: true };
  } catch {
    // Fallback (ex.: Windows sem privilégio de symlink): copia.
    try { cpSync(src, link, { recursive: true }); return { ok: true, copied: true }; }
    catch (e) { return { ok: false, reason: String(e) }; }
  }
}
