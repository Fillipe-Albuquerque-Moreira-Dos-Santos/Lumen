import { resolve } from 'path';
import { engineRun, linkFeature } from '../engine/engine.js';

// `lumen build <feature>` — executa as tasks da feature no motor interno do Lumen.
// O Lumen documenta e autora; o motor executa. Tudo sob a marca Lumen.
export default async function build(args) {
  const { default: chalk } = await import('chalk');

  const feature = args[0];
  if (!feature) {
    console.error(chalk.red('\n  Uso: lumen build <feature> [--ide claude]\n'));
    process.exit(1);
  }

  const projectRoot = resolve(process.cwd());
  const link = linkFeature(projectRoot, feature);
  if (!link.ok) {
    console.error(chalk.red(`\n  ${link.reason}.\n`));
    process.exit(1);
  }

  console.log(chalk.hex('#f5c518')(`\n  Lumen: construindo a feature "${feature}"...\n`));

  const passthrough = args.slice(1);
  if (!passthrough.includes('--ide')) passthrough.push('--ide', 'claude');

  const res = engineRun(['tasks', 'run', feature, ...passthrough]);
  process.exit(res.status ?? 0);
}
