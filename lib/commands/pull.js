import { mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { spawnSync } from 'child_process';

// `lumen pull` — empacota o sistema num arquivo AI-friendly usando repomix
// (compressão Tree-sitter). Reduz muito o custo em tokens da fase Documentar e
// dá visão completa de qualquer sistema de uma vez. Funciona em qualquer stack.
export default async function pull(args) {
  const { default: chalk } = await import('chalk');
  const projectRoot = resolve(process.cwd());
  const outDir = join(projectRoot, '.lumen', 'context');
  mkdirSync(outDir, { recursive: true });
  const out = join(outDir, 'pack.xml');

  console.log(chalk.hex('#f5c518')('\n  Puxando o sistema com repomix (compressão Tree-sitter)...\n'));

  // npx --yes baixa o repomix sob demanda; --compress reduz tokens preservando a estrutura.
  const res = spawnSync(
    'npx',
    ['--yes', 'repomix', '--compress', '--output', out, ...args],
    { stdio: 'inherit', cwd: projectRoot },
  );

  if (res.error || (res.status ?? 1) !== 0) {
    console.error(chalk.yellow(
      '\n  Não consegui rodar o repomix. Verifique a conexão (o npx baixa sob demanda) ' +
      'ou instale: npm i -g repomix\n',
    ));
    process.exit(res.status ?? 1);
  }

  console.log(chalk.gray('\n  Pacote do sistema em: .lumen/context/pack.xml'));
  console.log(chalk.gray('  Agora rode /lumen no seu agente — a documentação usa esse pacote como mapa eficiente.\n'));
}
