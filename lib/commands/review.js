import { resolve } from 'path';
import { engineRun, linkFeature } from '../engine/engine.js';

// `lumen review <feature>` — revisa e corrige o código gerado de uma feature.
//   lumen review <feature>                       → triagem + correção (review interno)
//   lumen review <feature> --fetch --provider coderabbit --pr 42  → puxa review externo
export default async function review(args) {
  const { default: chalk } = await import('chalk');

  const feature = args[0];
  if (!feature) {
    console.error(chalk.red('\n  Uso: lumen review <feature> [--fetch --provider <p> --pr <N>]\n'));
    process.exit(1);
  }

  const projectRoot = resolve(process.cwd());
  linkFeature(projectRoot, feature);

  const rest = args.slice(1);
  const sub = rest.includes('--fetch') ? 'fetch' : 'fix';
  const cleaned = rest.filter(a => a !== '--fetch');
  if (sub === 'fix' && !cleaned.includes('--ide')) cleaned.push('--ide', 'claude');

  const res = engineRun(['reviews', sub, feature, ...cleaned]);
  process.exit(res.status ?? 0);
}
