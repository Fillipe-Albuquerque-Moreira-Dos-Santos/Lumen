import { execFileSync } from 'child_process';
import { existsSync, symlinkSync, mkdirSync, rmdirSync } from 'fs';
import { join, dirname, basename } from 'path';

// Isolamento por git worktree: cada agente paralelo trabalha numa cópia isolada
// (worktree próprio + branch), sem colidir com os outros. No fim, faz merge das
// branches de volta. Padrão usado pelos orquestradores maduros (ccswarm, parallel-code…).

function git(root, args, opts = {}) {
  return execFileSync('git', ['-C', root, ...args], { stdio: 'pipe', ...opts }).toString().trim();
}

export function inGitRepo(root) {
  try { return git(root, ['rev-parse', '--is-inside-work-tree']) === 'true'; }
  catch { return false; }
}

// Dirs gitignored que são ENTRADA/deps e devem ser compartilhados com cada worktree
// (o checkout limpo não os traz). Outputs de build ficam de fora de propósito.
const SHARE = ['node_modules', '_lumen_docs', '_lumen', '.lumen', '.claude', '.compozy', 'vendor', '.venv'];

// Cria o worktree do stream e linka as entradas compartilhadas. Devolve { dir, branch }.
export function prepareWorktree(root, id) {
  const base = basename(root);
  const wtRoot = join(dirname(root), '.lumen-worktrees', base);
  mkdirSync(wtRoot, { recursive: true });
  const dir = join(wtRoot, id);
  const branch = `lumen/${id}`;
  // -B reseta a branch se sobrou de uma execução anterior; --force reusa o dir.
  git(root, ['worktree', 'add', '-B', branch, '--force', dir, 'HEAD']);
  for (const rel of SHARE) {
    const src = join(root, rel);
    const dst = join(dir, rel);
    if (existsSync(src) && !existsSync(dst)) {
      try { symlinkSync(src, dst); } catch { /* best-effort */ }
    }
  }
  return { dir, branch };
}

// Commita o que o agente deixou no worktree (caso ele não tenha commitado tudo).
// Devolve true se há algo na branch para mesclar.
export function commitWorktree(dir, message) {
  try { git(dir, ['add', '-A']); } catch { /* ignore */ }
  try { git(dir, ['commit', '--no-verify', '-m', message]); } catch { /* nada a commitar */ }
  try { return git(dir, ['rev-list', '--count', 'HEAD', '^@{upstream}'], { stdio: 'pipe' }) !== '0'; }
  catch { return true; }
}

// Mescla a branch do stream de volta na branch atual. { ok, conflict }.
export function mergeBranch(root, branch) {
  try { git(root, ['merge', '--no-ff', '--no-edit', branch]); return { ok: true, conflict: false }; }
  catch {
    try { git(root, ['merge', '--abort']); } catch { /* ignore */ }
    return { ok: false, conflict: true };
  }
}

export function removeWorktree(root, dir) {
  try { git(root, ['worktree', 'remove', '--force', dir]); } catch { /* ignore */ }
}

// Remove a pasta-raiz dos worktrees (../.lumen-worktrees/<base>) se ficou vazia.
export function cleanupWorktreeRoot(root) {
  const wtRoot = join(dirname(root), '.lumen-worktrees', basename(root));
  try { rmdirSync(wtRoot); } catch { /* não vazia ou inexistente — ok */ }
  try { rmdirSync(join(dirname(root), '.lumen-worktrees')); } catch { /* ainda tem outros — ok */ }
}
