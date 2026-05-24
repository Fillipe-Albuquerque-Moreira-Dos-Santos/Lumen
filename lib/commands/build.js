import { resolve, join } from 'path';
import { existsSync, readdirSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { engineRun, linkFeature } from '../engine/engine.js';

// Lista as features/units já documentadas (pastas em _lumen_docs/ com specs).
function listDocumentedUnits(projectRoot) {
  const docs = join(projectRoot, '_lumen_docs');
  if (!existsSync(docs)) return [];
  const skip = new Set(['traceability', 'openapi', 'database', 'design-system', 'ui', 'adrs', 'sequences', 'flowcharts', 'user-stories', 'context']);
  const out = [];
  for (const e of readdirSync(docs, { withFileTypes: true })) {
    if (!e.isDirectory() || skip.has(e.name) || e.name.startsWith('.')) continue;
    const files = readdirSync(join(docs, e.name));
    if (files.includes('requirements.md') || files.some(f => f.endsWith('.md'))) out.push(e.name);
  }
  return out.sort();
}

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

// Flag de "rodar sem pedir permissão a cada comando", por agente.
const AUTO_FLAGS = {
  claude: ['--dangerously-skip-permissions'],
  codex: ['--full-auto'],
  gemini: ['--yolo'],
};

// Pergunta se o usuário quer rodar sem aprovações; devolve os flags do agente.
async function askAutoFlags(inquirer, chalk, agentCmd) {
  const flags = AUTO_FLAGS[agentCmd];
  if (!flags) return [];
  const { skip } = await inquirer.prompt([{
    type: 'confirm', name: 'skip', prefix: '', default: false,
    message: `Rodar sem pedir permissão a cada comando? (${agentCmd} ${flags.join(' ')}) — mais rápido, mas o agente executa sem confirmar.`,
  }]);
  if (skip) console.log(chalk.gray('  Modo sem aprovações ativado.'));
  return skip ? flags : [];
}

// ── Escolha interativa no terminal (listas reais + "digito a versão exata") ──
const OTHER = '✎ Outra — eu digito a versão exata';
async function choose(inquirer, message, options) {
  if (!options || !options.length) {
    const { v } = await inquirer.prompt([{ type: 'input', name: 'v', prefix: '', message }]);
    return v.trim();
  }
  const { pick } = await inquirer.prompt([{
    type: 'list', name: 'pick', prefix: '', message, choices: [...options, OTHER], loop: false, pageSize: 14,
  }]);
  if (pick !== OTHER) return pick;
  const { custom } = await inquirer.prompt([{
    type: 'input', name: 'custom', prefix: '', message: '  Digite exatamente (ex.: Angular 18.2.1):',
    validate: v => v.trim() ? true : 'Não pode ser vazio.',
  }]);
  return custom.trim();
}

const LANG_VERSIONS = {
  'Java': ['Java 17 (LTS) ⭐', 'Java 21 (LTS)', 'Java 26'],
  'Node.js (TypeScript)': ['Node 20 (LTS)', 'Node 22 (LTS) ⭐', 'Node 24'],
  'Python': ['Python 3.11', 'Python 3.12 ⭐', 'Python 3.13'],
  'Go': ['Go 1.22', 'Go 1.23 ⭐'],
  'C# / .NET': ['.NET 8 (LTS) ⭐', '.NET 9'],
  'PHP': ['PHP 8.3 ⭐', 'PHP 8.4'],
  'Ruby': ['Ruby 3.3 ⭐', 'Ruby 3.4'],
  'Rust': ['Rust (stable) ⭐'],
};
const BACKEND = {
  'Java': ['Spring Boot 3.3.x ⭐', 'Spring Boot 3.4.x', 'Quarkus 3.x', 'Micronaut 4.x'],
  'Node.js (TypeScript)': ['NestJS 11 ⭐', 'Express 5', 'Fastify 5', 'Next.js (full-stack)'],
  'Python': ['FastAPI ⭐', 'Django 5.x', 'Flask 3.x'],
  'Go': ['net/http (stdlib) ⭐', 'Gin', 'Echo', 'Fiber'],
  'C# / .NET': ['ASP.NET Core ⭐'],
  'PHP': ['Laravel 11 ⭐', 'Symfony 7'],
  'Ruby': ['Rails 7 ⭐', 'Sinatra'],
  'Rust': ['Axum ⭐', 'Actix'],
};
const FRONT_VERSIONS = {
  'React': ['React 19 ⭐', 'React 18'],
  'Vue': ['Vue 3.x ⭐'],
  'Angular': ['Angular 19 ⭐', 'Angular 18', 'Angular 17'],
  'Svelte': ['Svelte 5 ⭐'],
};
const DB_VERSIONS = {
  'PostgreSQL': ['PostgreSQL 17 ⭐', 'PostgreSQL 16', 'PostgreSQL 15'],
  'MySQL': ['MySQL 8.4 ⭐', 'MySQL 8.0'],
  'MongoDB': ['MongoDB 7 ⭐', 'MongoDB 8'],
  'SQLite': ['SQLite 3 ⭐'],
};

async function pickStack(inquirer, chalk) {
  console.log(chalk.bold('\n  Vamos definir o stack — você escolhe cada item (e pode digitar a versão exata):\n'));
  const lang = await choose(inquirer, 'Linguagem principal:', Object.keys(LANG_VERSIONS));
  const langVersion = await choose(inquirer, `Versão de ${lang}:`, LANG_VERSIONS[lang]);
  const backend = await choose(inquirer, 'Framework de backend:', BACKEND[lang]);
  const frontend = await choose(inquirer, 'Frontend:', ['React', 'Vue', 'Angular', 'Svelte', 'Nenhum (API/CLI)']);
  const frontendVersion = (frontend === 'Nenhum (API/CLI)') ? null : await choose(inquirer, `Versão de ${frontend}:`, FRONT_VERSIONS[frontend]);
  const db = await choose(inquirer, 'Banco de dados:', ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Nenhum']);
  const dbVersion = (db === 'Nenhum') ? null : await choose(inquirer, `Versão de ${db}:`, DB_VERSIONS[db]);
  const tests = await choose(inquirer, 'Testes:', ['Sim — framework padrão da linguagem ⭐', 'Não por enquanto']);

  const parts = [
    `linguagem=${langVersion || lang}`,
    `backend=${backend}`,
    frontendVersion ? `frontend=${frontendVersion}` : (frontend === 'Nenhum (API/CLI)' ? 'frontend=nenhum' : `frontend=${frontend}`),
    dbVersion ? `banco=${dbVersion}` : 'banco=nenhum',
    `testes=${tests}`,
  ];
  console.log(chalk.gray(`\n  Stack escolhido: ${parts.join(' · ')}\n`));
  return parts.join('; ');
}

function launchAgent(chalk, agentCmd, flags, kickoff, label) {
  console.log(chalk.hex('#f5c518')(`\n  Lumen: ${label} — abrindo ${agentCmd}${flags.length ? ' (sem aprovações)' : ''}...\n`));
  const res = spawnSync(agentCmd, [...flags, kickoff], { stdio: 'inherit', cwd: process.cwd() });
  return res.status ?? 0;
}

// `lumen build`            → guiado: escopo, intenção, STACK (no terminal), e abre o agente já travado.
// `lumen build <feature>`  → executa direto as tarefas já geradas no motor.
export default async function build(args) {
  const { default: chalk } = await import('chalk');
  const projectRoot = resolve(process.cwd());
  const feature = args.find(a => !a.startsWith('-')) || null;

  // ── Caminho direto: executar tarefas já geradas de uma feature ──
  if (feature) {
    const link = linkFeature(projectRoot, feature);
    if (!link.ok) { console.error(chalk.red(`\n  ${link.reason}.\n`)); process.exit(1); }
    console.log(chalk.hex('#f5c518')(`\n  Lumen: construindo "${feature}"...\n`));
    const passthrough = args.filter(a => a !== feature);
    if (!passthrough.includes('--ide')) passthrough.push('--ide', 'claude');
    const res = engineRun(['tasks', 'run', feature, ...passthrough]);
    process.exit(res.status ?? 0);
  }

  // ── Caminho guiado ──
  if (!existsSync(join(projectRoot, '_lumen_docs'))) {
    console.error(chalk.red('\n  Ainda não há documentação. Rode `lumen go` (ou `/lumen`) para gerar `_lumen_docs/` primeiro.\n'));
    process.exit(1);
  }
  const { default: inquirer } = await import('inquirer');

  // 1. Escopo
  const { what } = await inquirer.prompt([{
    type: 'list', name: 'what', prefix: '', message: 'O que você quer construir?',
    choices: [
      { name: 'O sistema inteiro (a partir da documentação)', value: 'all' },
      { name: 'Uma feature específica', value: 'feature' },
    ],
  }]);

  let desc = '';
  let fromDocs = false;
  if (what === 'feature') {
    const units = listDocumentedUnits(projectRoot);
    const WRITE = '✎ Outra — escrevo a minha';
    let pickedUnit = WRITE;
    if (units.length) {
      const a = await inquirer.prompt([{
        type: 'list', name: 'unit', prefix: '', loop: false, pageSize: 16,
        message: 'Qual feature construir? (escolha uma documentada ou escreva a sua)',
        choices: [...units, WRITE],
      }]);
      pickedUnit = a.unit;
    }
    if (pickedUnit !== WRITE) {
      desc = pickedUnit; fromDocs = true;
    } else {
      const a = await inquirer.prompt([{ type: 'input', name: 'desc', prefix: '', message: 'Descreva a feature em uma frase:', validate: v => v.trim() ? true : 'Diga o que construir.' }]);
      desc = a.desc.trim();
    }
  }

  // 2. Intenção (define se escolhemos stack agora)
  const { intent } = await inquirer.prompt([{
    type: 'list', name: 'intent', prefix: '', message: 'Stack:',
    choices: [
      { name: 'Manter o stack atual do sistema (evoluir)', value: 'keep' },
      { name: 'Escolher o stack agora (modernizar / projeto novo)', value: 'pick' },
    ],
  }]);

  // 3. Escolha do stack no terminal (garantido — o agente não decide)
  let stackLine = 'use EXATAMENTE o stack que o sistema já usa (do _lumen_docs/).';
  if (intent === 'pick') {
    const stack = await pickStack(inquirer, chalk);
    stackLine = `use EXATAMENTE este stack já escolhido pelo usuário (NÃO reabra nem assuma, NÃO troque versões): ${stack}.`;
  }

  // 4. Escolher o agente
  const available = LAUNCHERS.filter(l => onPath(l.cmd));
  if (!available.length) {
    console.log('\n' + chalk.yellow('  Nenhum agente de IA no PATH. Abra o seu e diga o que quer construir.\n'));
    return;
  }
  let agentCmd = available[0].cmd;
  if (available.length > 1) {
    const { pick } = await inquirer.prompt([{ type: 'list', name: 'pick', prefix: '', message: 'Qual agente abrir para construir?', choices: available.map(l => ({ name: l.name, value: l.cmd })) }]);
    agentCmd = pick;
  }
  const flags = await askAutoFlags(inquirer, chalk, agentCmd);

  // 5. Kickoff com o stack TRAVADO
  const scope = what === 'all'
    ? 'CONSTRUA O SISTEMA INTEIRO a partir de _lumen_docs/'
    : fromDocs
      ? `construa a feature da unit já documentada "${desc}" — use _lumen_docs/${desc}/ (requirements/design/tasks) como base`
      : `construa esta feature: "${desc}"`;
  const kickoff =
    `${scope}, em modo automático, ancorado na documentação. STACK: ${stackLine} `
    + 'NÃO pergunte stack/versão de novo — já está definido. Gere o techspec COMPLETO (estrutura, modelo de dados, '
    + 'contratos, auth, testes); o que faltar de detalhe técnico que você não souber, PERGUNTE (não chute). '
    + 'Depois gere as tarefas EM PARALELO (um subagente por unit), execute com o motor até o fim, revise e verifique. '
    + 'Não pare entre as etapas do pipeline; só relate no final. (use a skill "lumen" no modo Construir autônomo)';

  process.exit(launchAgent(chalk, agentCmd, flags, kickoff, what === 'all' ? 'construindo o SISTEMA INTEIRO' : `construindo a feature: ${desc}`));
}
