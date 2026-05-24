import { join } from 'path';
import { existsSync, readdirSync, renameSync, readFileSync } from 'fs';

// Blocos temáticos do Lumen — uma camada de organização POR CIMA do motor.
// O motor (Compozy) só conhece a lista plana de task_*.md ligada por dependências;
// o "bloco" é metadado do Lumen, gravado no frontmatter de cada task (`bloco:`)
// e espelhado em _plan.md (índice humano). Isto NÃO altera o formato v2 que o
// motor valida — `bloco:` é um campo extra tolerado (confirmado no validate).

const TASK_RE = /^task_\d+\.md$/;
const HELD_SUFFIX = '.held';

// Normaliza para comparação tolerante (sem acento, minúsculo, espaços colapsados).
function norm(s) {
  return String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/\s+/g, ' ');
}

// Lê o frontmatter mínimo de uma task v2: id, status, title, bloco, dependencies.
function parseTask(dir, file) {
  const raw = readFileSync(join(dir, file), 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = m ? m[1] : '';
  const id = file.replace(/\.md$/, '');
  const out = { id, file, status: 'pending', title: '', bloco: '', deps: [] };

  const scalar = (key) => {
    const r = fm.match(new RegExp(`^${key}:[ \\t]*(.*)$`, 'm'));
    return r ? r[1].trim().replace(/^["']|["']$/g, '') : '';
  };
  out.status = scalar('status') || 'pending';
  out.title = scalar('title');
  out.bloco = scalar('bloco');

  // dependencies: ou inline `[]` / `[a, b]`, ou bloco YAML com `- item`.
  const depInline = fm.match(/^dependencies:[ \t]*\[(.*)\][ \t]*$/m);
  if (depInline) {
    out.deps = depInline[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  } else if (/^dependencies:[ \t]*$/m.test(fm)) {
    const after = fm.slice(fm.search(/^dependencies:[ \t]*$/m));
    for (const line of after.split('\n').slice(1)) {
      const d = line.match(/^[ \t]*-[ \t]*(.+?)[ \t]*$/);
      if (d) out.deps.push(d[1].replace(/^["']|["']$/g, ''));
      else if (line.trim() && !/^[ \t]/.test(line)) break; // próxima chave
    }
  }
  return out;
}

// Lê todas as tasks de _lumen/<feature> (ignora .held e arquivos não-task).
export function readTasks(featureDir) {
  if (!existsSync(featureDir)) return [];
  return readdirSync(featureDir)
    .filter(f => TASK_RE.test(f))
    .sort()
    .map(f => parseTask(featureDir, f));
}

// Agrupa as tasks em blocos, na ordem da primeira task de cada bloco.
// Tasks sem `bloco:` caem num bloco "Sem bloco".
export function listBlocks(tasks) {
  const order = [];
  const byName = new Map();
  for (const t of tasks) {
    const name = t.bloco || 'Sem bloco';
    if (!byName.has(name)) { byName.set(name, []); order.push(name); }
    byName.get(name).push(t);
  }
  return order.map(name => {
    const items = byName.get(name);
    const done = items.filter(t => t.status === 'done').length;
    return { name, tasks: items, taskIds: items.map(t => t.id), total: items.length, done };
  });
}

export function hasBlocks(tasks) {
  return tasks.some(t => t.bloco);
}

// Resolve um bloco pelo nome (tolerante a acento/caixa; exato > prefixo > contém).
export function resolveBlock(blocks, query) {
  const q = norm(query);
  if (!q) return null;
  return (
    blocks.find(b => norm(b.name) === q) ||
    blocks.find(b => norm(b.name).startsWith(q)) ||
    blocks.find(b => norm(b.name).includes(q)) ||
    null
  );
}

// Fecho de dependências: o bloco-alvo + todas as tasks de que ele depende
// (transitivo). Garante que nenhuma referência fique pendurada ao esconder o resto.
export function dependencyClosure(tasks, targetIds) {
  const byId = new Map(tasks.map(t => [t.id, t]));
  const keep = new Set(targetIds);
  const stack = [...targetIds];
  while (stack.length) {
    const t = byId.get(stack.pop());
    if (!t) continue;
    for (const d of t.deps) if (byId.has(d) && !keep.has(d)) { keep.add(d); stack.push(d); }
  }
  return keep;
}

// Esconde do motor toda task_*.md cujo id NÃO esteja em keepIds, renomeando para
// `*.md.held` (o scan do motor só enxerga `task_*.md`). Devolve o nº escondido.
export function hideExcept(featureDir, keepIds) {
  let hidden = 0;
  for (const f of readdirSync(featureDir)) {
    if (!TASK_RE.test(f)) continue;
    const id = f.replace(/\.md$/, '');
    if (keepIds.has(id)) continue;
    renameSync(join(featureDir, f), join(featureDir, f + HELD_SUFFIX));
    hidden++;
  }
  return hidden;
}

// Restaura qualquer `*.md.held` para `*.md`. Idempotente — serve de rede de
// segurança no início de todo build, caso um run anterior tenha sido interrompido.
export function restoreHeld(featureDir) {
  if (!existsSync(featureDir)) return 0;
  let restored = 0;
  for (const f of readdirSync(featureDir)) {
    if (!f.endsWith(HELD_SUFFIX)) continue;
    renameSync(join(featureDir, f), join(featureDir, f.slice(0, -HELD_SUFFIX.length)));
    restored++;
  }
  return restored;
}
