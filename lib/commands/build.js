import { resolve } from 'path';
import { findCompozy, INSTALL_HINT, runCompozy } from '../compozy/ensure.js';

// `lumen build <feature>` — executa as tasks da feature usando o motor real
// (Compozy), sob a marca Lumen. O Lumen documenta e autora; o motor executa.
export default async function build(args) {
  const { default: chalk } = await import('chalk');

  const feature = args[0];
  if (!feature) {
    console.error(chalk.red('\n  Uso: lumen build <feature> [--ide claude]\n'));
    process.exit(1);
  }

  const engine = findCompozy();
  if (!engine.found) {
    console.error(chalk.yellow('\n  ' + INSTALL_HINT.replace(/\n/g, '\n  ') + '\n'));
    process.exit(1);
  }

  console.log(chalk.gray(`\n  Motor: ${engine.version || 'compozy'} (${engine.path})`));
  console.log(chalk.hex('#f5c518')(`  Executando build da feature "${feature}"...\n`));

  // Repassa flags extras (ex.: --ide claude). Default --ide claude se nenhum dado.
  const passthrough = args.slice(1);
  if (!passthrough.includes('--ide')) passthrough.push('--ide', 'claude');

  const res = runCompozy(['tasks', 'run', feature, ...passthrough]);
  process.exit(res.status ?? 0);
}
