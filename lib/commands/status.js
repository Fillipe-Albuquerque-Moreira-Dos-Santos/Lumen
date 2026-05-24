import { resolve, join } from 'path';
import { existsSync, readdirSync } from 'fs';
import { readJsonSafe } from '../utils/json-safe.js';
import { readTasks, listBlocks } from '../utils/plan.js';

// Barra de progresso curta: ▰▰▰▱▱ — para o done/total de um bloco.
function bar(done, total, width = 10) {
  const filled = total ? Math.round((done / total) * width) : 0;
  return '▰'.repeat(filled) + '▱'.repeat(width - filled);
}

// Lista as features em construção (_lumen/<feature>/ com task_*.md) e o progresso
// por bloco de cada uma.
function renderBuilds(chalk, projectRoot) {
  const root = join(projectRoot, '_lumen');
  if (!existsSync(root)) return;
  const features = readdirSync(root, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('.'))
    .map(e => e.name)
    .filter(name => readTasks(join(root, name)).length > 0)
    .sort();
  if (!features.length) return;

  console.log(chalk.bold('  Construção (por bloco)'));
  for (const feature of features) {
    const tasks = readTasks(join(root, feature));
    const blocks = listBlocks(tasks);
    const done = tasks.filter(t => t.status === 'done').length;
    console.log(`  ${chalk.hex('#f5c518')('▸')} ${chalk.white(feature)} ${chalk.gray(`(${done}/${tasks.length} tasks)`)}`);
    for (const b of blocks) {
      const color = b.done === b.total ? chalk.green : chalk.gray;
      console.log(`      ${color(bar(b.done, b.total))} ${chalk.white(b.name)} ${chalk.gray(`${b.done}/${b.total}`)}`);
    }
  }
  console.log('');
}

export default async function status() {
  const { default: chalk } = await import('chalk');
  const projectRoot = resolve(process.cwd());
  const statePath = join(projectRoot, '.lumen', 'state.json');

  if (!existsSync(statePath)) {
    console.log(chalk.gray('\n  Lumen não está instalado aqui. Rode "npx lumen install".\n'));
    return;
  }

  const s = readJsonSafe(statePath);
  const docsFolder = s.output_folder ?? '_lumen_docs';
  const documented = existsSync(join(projectRoot, docsFolder));

  console.log('');
  console.log(chalk.bold('  Lumen status'));
  console.log(`  ${chalk.yellow('Projeto:')}    ${s.project ?? '—'}`);
  console.log(`  ${chalk.yellow('Versão:')}     ${s.version ?? '—'}`);
  console.log(`  ${chalk.yellow('Engines:')}    ${(s.engines ?? []).join(', ') || '—'}`);
  console.log(`  ${chalk.yellow('Fase:')}       ${s.phase ?? 'ainda não iniciada'}`);
  console.log(`  ${chalk.yellow('Documentado:')} ${documented ? `sim (${docsFolder}/)` : 'ainda não'}`);
  console.log('');

  renderBuilds(chalk, projectRoot);
}
