import { resolve, join } from 'path';
import { existsSync, rmSync, statSync } from 'fs';
import { readJsonSafe } from '../utils/json-safe.js';

export default async function uninstall() {
  const { default: chalk } = await import('chalk');
  const { default: inquirer } = await import('inquirer');

  const projectRoot = resolve(process.cwd());
  const statePath = join(projectRoot, '.lumen', 'state.json');

  if (!existsSync(statePath)) {
    console.log(chalk.gray('\n  Lumen não está instalado aqui.\n'));
    return;
  }

  const state = readJsonSafe(statePath);
  const created = state.created_files ?? [];

  console.log(chalk.yellow(`\n  Isso remove apenas o que o Lumen criou (${created.length} caminhos).`));
  console.log(chalk.gray('  Nada do seu código é tocado. Specs geradas em _lumen_docs/ e _lumen/ são preservadas.\n'));

  const { proceed } = await inquirer.prompt([{
    type: 'confirm', name: 'proceed', prefix: '', message: 'Remover o Lumen?', default: false,
  }]);
  if (!proceed) { console.log(chalk.gray('\n  Cancelado.\n')); return; }

  // Remove arquivos primeiro, diretórios depois (mais específicos antes)
  const sorted = [...created].sort((a, b) => b.length - a.length);
  for (const rel of sorted) {
    const abs = join(projectRoot, rel);
    try {
      if (existsSync(abs)) rmSync(abs, { recursive: true, force: true });
    } catch { /* ignore */ }
  }
  // Remove .lumen/ por último
  try {
    const lumenDir = join(projectRoot, '.lumen');
    if (existsSync(lumenDir) && statSync(lumenDir).isDirectory()) {
      rmSync(lumenDir, { recursive: true, force: true });
    }
  } catch { /* ignore */ }

  console.log(chalk.hex('#f5c518')('\n  Lumen removido.\n'));
}
