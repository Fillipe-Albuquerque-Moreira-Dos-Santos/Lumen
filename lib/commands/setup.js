import { engineRun } from '../engine/engine.js';

// `lumen setup` — prepara o motor de execução do Lumen nos seus agentes.
export default async function setup(args) {
  const { default: chalk } = await import('chalk');
  console.log(chalk.hex('#f5c518')('\n  Preparando o motor de execução do Lumen...\n'));
  const res = engineRun(['setup', ...args]);
  process.exit(res.status ?? 0);
}
