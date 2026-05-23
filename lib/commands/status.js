import { resolve, join } from 'path';
import { existsSync } from 'fs';
import { readJsonSafe } from '../utils/json-safe.js';

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
}
