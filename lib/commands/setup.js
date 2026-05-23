import { findCompozy, INSTALL_HINT, runCompozy } from '../compozy/ensure.js';

// `lumen setup` — prepara o motor de execução (instala os skills do motor nos
// agentes). Repassa para `compozy setup`.
export default async function setup(args) {
  const { default: chalk } = await import('chalk');
  const engine = findCompozy();
  if (!engine.found) {
    console.error(chalk.yellow('\n  ' + INSTALL_HINT.replace(/\n/g, '\n  ') + '\n'));
    process.exit(1);
  }
  const res = runCompozy(['setup', ...args]);
  process.exit(res.status ?? 0);
}
