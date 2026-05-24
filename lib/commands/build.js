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

const STACK_RULE =
  'As escolhas de STACK, VERSÃO e ARQUITETURA são INTERATIVAS e minhas: apresente as opções como lista numerada '
  + '(uma camada por vez — linguagem→versão, framework→versão, banco, etc., com a recomendada marcada) e ESPERE minha '
  + 'escolha de CADA item antes de seguir. NUNCA assuma versões nem diga "você escolheu X" sem perguntar. O resto '
  + '(contexto de negócio) infira da documentação. ';

const WHOLE_SYSTEM_KICKOFF =
  'Leia TODA a documentação em _lumen_docs/ e CONSTRUA O SISTEMA INTEIRO em modo automático. '
  + STACK_RULE
  + 'Depois gere as tarefas de cada unit EM PARALELO (um subagente por unit), execute tudo com o motor até o fim '
  + '(concorrente, com retries), revise e verifique a regressão. Não pare entre as etapas do pipeline; só relate no final. '
  + '(use a skill "lumen" no modo Construir autônomo)';

const featureKickoff = (desc) =>
  `Construa esta feature de ponta a ponta em modo automático, ancorado na documentação (_lumen_docs/): "${desc}". `
  + STACK_RULE
  + 'Depois gere as tarefas, execute com o motor até o fim, revise e verifique. '
  + '(use a skill "lumen" no modo Construir autônomo)';

async function launch(chalk, kickoff, label) {
  const available = LAUNCHERS.filter(l => onPath(l.cmd));
  if (!available.length) {
    console.log('\n' + chalk.yellow('  Nenhum agente de IA detectado no PATH. Abra o seu manualmente e diga o que quer construir.\n'));
    return 0;
  }
  let chosen = available[0];
  if (available.length > 1) {
    const { default: inquirer } = await import('inquirer');
    const { pick } = await inquirer.prompt([{
      type: 'list', name: 'pick', prefix: '',
      message: 'Qual agente abrir para construir?',
      choices: available.map(l => ({ name: l.name, value: l.cmd })),
    }]);
    chosen = available.find(l => l.cmd === pick);
  }
  console.log(chalk.hex('#f5c518')(`\n  Lumen: ${label} — abrindo ${chosen.name}...\n`));
  const res = spawnSync(chosen.cmd, [kickoff], { stdio: 'inherit', cwd: process.cwd() });
  return res.status ?? 0;
}

// `lumen build`            → pergunta: sistema inteiro OU uma feature, e constrói (autônomo, paralelo).
// `lumen build <feature>`  → executa direto as tarefas já geradas daquela feature no motor.
export default async function build(args) {
  const { default: chalk } = await import('chalk');
  const projectRoot = resolve(process.cwd());
  const feature = args.find(a => !a.startsWith('-')) || null;

  // ── Com feature nomeada: executar as tarefas dela no motor (caminho direto/avançado) ──
  if (feature) {
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

  // ── Sem feature: oferecer as DUAS opções ──
  if (!existsSync(join(projectRoot, '_lumen_docs'))) {
    console.error(chalk.red('\n  Ainda não há documentação. Rode `lumen go` (ou `/lumen`) para gerar `_lumen_docs/` primeiro.\n'));
    process.exit(1);
  }

  const { default: inquirer } = await import('inquirer');
  const { what } = await inquirer.prompt([{
    type: 'list', name: 'what', prefix: '',
    message: 'O que você quer construir?',
    choices: [
      { name: 'O sistema inteiro (a partir da documentação)', value: 'all' },
      { name: 'Uma feature específica', value: 'feature' },
    ],
  }]);

  if (what === 'all') {
    process.exit(await launch(chalk, WHOLE_SYSTEM_KICKOFF, 'construindo o SISTEMA INTEIRO a partir de _lumen_docs/'));
  }

  const { desc } = await inquirer.prompt([{
    type: 'input', name: 'desc', prefix: '',
    message: 'Descreva a feature em uma frase:',
    validate: v => v.trim() ? true : 'Diga o que você quer construir.',
  }]);
  process.exit(await launch(chalk, featureKickoff(desc.trim()), `construindo a feature: ${desc.trim()}`));
}
