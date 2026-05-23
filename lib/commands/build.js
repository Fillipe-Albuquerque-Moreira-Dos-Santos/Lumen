import { resolve, join } from 'path';
import { existsSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { engineRun, linkFeature } from '../engine/engine.js';

function onPath(cmd) {
  try { execFileSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { stdio: 'pipe' }); return true; }
  catch { return false; }
}
const LAUNCHERS = [
  { cmd: 'claude', name: 'Claude Code' },
  { cmd: 'codex', name: 'Codex' },
  { cmd: 'gemini', name: 'Gemini CLI' },
  { cmd: 'cursor-agent', name: 'Cursor' },
];

const WHOLE_SYSTEM_KICKOFF =
  'Leia TODA a documentação em _lumen_docs/ e CONSTRUA O SISTEMA INTEIRO em modo automático. '
  + 'Pergunte SÓ o essencial — confirme o stack que o sistema usa numa única pergunta e infira o resto da documentação. '
  + 'Depois gere todas as tarefas a partir das specs EM PARALELO (um subagente por unidade), '
  + 'execute-as até o fim com o motor (concorrente, com retries), revise e verifique a regressão. '
  + 'Não pare no meio; só relate no final. (use a skill "lumen" no modo Construir autônomo)';

// `lumen build`            → lê a documentação e constrói O SISTEMA INTEIRO (autônomo, paralelo).
// `lumen build <feature>`  → executa só as tarefas daquela feature no motor.
export default async function build(args) {
  const { default: chalk } = await import('chalk');
  const projectRoot = resolve(process.cwd());
  const feature = args.find(a => !a.startsWith('-')) || null;

  // ── Sem feature: construir o sistema inteiro a partir dos docs ──
  if (!feature) {
    if (!existsSync(join(projectRoot, '_lumen_docs'))) {
      console.error(chalk.red('\n  Ainda não há documentação. Rode `lumen go` (ou `/lumen`) para gerar `_lumen_docs/` primeiro.\n'));
      process.exit(1);
    }
    const chosen = LAUNCHERS.find(l => onPath(l.cmd));
    if (!chosen) {
      console.log('\n' + chalk.yellow('  Abra seu agente de IA e diga: ') + chalk.bold('"construa o sistema inteiro a partir da documentação"') + chalk.yellow('.\n'));
      return;
    }
    console.log(chalk.hex('#f5c518')(`\n  Lumen: construindo o SISTEMA INTEIRO a partir de _lumen_docs/ — abrindo ${chosen.name}...\n`));
    const res = spawnSync(chosen.cmd, [WHOLE_SYSTEM_KICKOFF], { stdio: 'inherit', cwd: projectRoot });
    process.exit(res.status ?? 0);
  }

  // ── Com feature: executar as tarefas dessa feature no motor ──
  const link = linkFeature(projectRoot, feature);
  if (!link.ok) {
    console.error(chalk.red(`\n  ${link.reason}.\n`));
    process.exit(1);
  }
  console.log(chalk.hex('#f5c518')(`\n  Lumen: construindo "${feature}"...\n`));
  const passthrough = args.filter(a => a !== feature);
  if (!passthrough.includes('--ide')) passthrough.push('--ide', 'claude');
  const res = engineRun(['tasks', 'run', feature, ...passthrough]);
  process.exit(res.status ?? 0);
}
