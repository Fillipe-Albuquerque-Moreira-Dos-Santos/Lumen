import { resolve } from 'path';
import { engineRun, linkFeature } from '../engine/engine.js';

// `lumen validate <feature>` — confere se as tasks de _lumen/<feature>/ estão no
// formato que o motor executa, antes de construir.
export default async function validate(args) {
  const { default: chalk } = await import('chalk');

  const feature = args[0];
  if (!feature) {
    console.error(chalk.red('\n  Uso: lumen validate <feature>\n'));
    process.exit(1);
  }

  const projectRoot = resolve(process.cwd());
  const link = linkFeature(projectRoot, feature);
  if (!link.ok) {
    console.error(chalk.red(`\n  ${link.reason}.\n`));
    process.exit(1);
  }

  const res = engineRun(['tasks', 'validate', '--name', feature, ...args.slice(1)]);
  process.exit(res.status ?? 0);
}
