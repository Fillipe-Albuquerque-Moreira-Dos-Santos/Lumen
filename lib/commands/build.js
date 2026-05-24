import { resolve, join, basename, dirname } from 'path';
import { existsSync, readdirSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { engineRun, linkFeature } from '../engine/engine.js';
import { ensureInstalled, ensureEngineSetup } from '../installer/auto.js';
import { renderHeader, makeStepper, summaryBox, hint } from '../utils/ui.js';
import { computeStreams, runParallel } from '../build/orchestrate.js';
import { supportsHeadless } from '../build/headless.js';

// Slug seguro para nome de pasta/feature.
function slug(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'app';
}

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

// O diretório atual está "vazio" (só metadados)? Usado no greenfield para decidir
// se o sistema novo nasce aqui mesmo ou numa pasta própria, sem misturar.
function dirIsEmptyish(root) {
  const ignore = new Set(['.git', '.lumen', '_lumen', '_lumen_docs', '.idea', '.vscode', '.DS_Store', 'node_modules']);
  try { return readdirSync(root).filter(e => !ignore.has(e) && !e.startsWith('.')).length === 0; }
  catch { return true; }
}

// Decide ONDE o código nasce, sem misturar com o legado.
// - evoluir  → no lugar (mesmo projeto)
// - modernizar → sistema novo (v2) FORA do legado, front/back DESACOPLADOS
// - greenfield → pasta própria isolada (ou aqui, se o diretório estiver vazio)
function resolveDestination({ projectRoot, hasDocs, intent }) {
  const parent = dirname(projectRoot);
  const base = basename(projectRoot);
  if (hasDocs && intent === 'keep') {
    return {
      summary: 'no lugar (evolui o projeto atual)',
      line: `DESTINO DO CÓDIGO: evolua o sistema NO LUGAR, dentro deste projeto (${projectRoot}). NÃO crie projeto paralelo nem duplique pastas.`,
    };
  }
  if (hasDocs && intent === 'pick') {
    return {
      summary: `fora do legado · ${base}-v2 · front/back desacoplados`,
      line: `DESTINO DO CÓDIGO: este é o sistema NOVO (v2). Crie-o FORA do projeto legado, em pasta(s) IRMÃ(S) dentro de "${parent}". NUNCA escreva código de aplicação dentro de "${projectRoot}" — é o legado, não toque nele. Use o NOME escolhido pelo usuário como base da pasta (sugestão: "${base}-v2"). MANTENHA FRONTEND E BACKEND DESACOPLADOS, em pastas/repos separados (ex.: "${parent}/<nome>-backend" e "${parent}/<nome>-frontend"), cada um com seu próprio projeto.`,
    };
  }
  // greenfield
  if (dirIsEmptyish(projectRoot)) {
    return {
      summary: 'aqui (diretório vazio) · front/back desacoplados se houver',
      line: `DESTINO DO CÓDIGO: o diretório atual está vazio — crie o sistema novo AQUI (${projectRoot}). Se tiver frontend e backend, mantenha-os DESACOPLADOS em pastas separadas (ex.: backend/ e frontend/, ou repos separados).`,
    };
  }
  return {
    summary: 'pasta própria (fora) · front/back desacoplados se houver',
    line: `DESTINO DO CÓDIGO: crie o sistema novo na SUA PRÓPRIA pasta, em "${parent}/<nome>" — NUNCA misturado ao código existente em "${projectRoot}". Se tiver frontend e backend, mantenha-os DESACOPLADOS em pastas separadas.`,
  };
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
    const passthrough = args.filter(a => a !== feature).map(a => a === '--bg' ? '--detach' : a);
    if (!passthrough.includes('--ide')) passthrough.push('--ide', 'claude');
    const bg = passthrough.includes('--detach');
    console.log(chalk.hex('#f5c518')(`\n  Lumen: construindo "${feature}"${bg ? ' em background' : ''}...\n`));
    const res = engineRun(['tasks', 'run', feature, ...passthrough]);
    if (bg) console.log(chalk.gray('\n  Rodando em background. Acompanhe com: `lumen runs watch <run-id>` (o id apareceu acima).'));
    process.exit(res.status ?? 0);
  }

  // ── Caminho guiado (tudo embutido: instala, prepara o motor e constrói) ──
  const { default: inquirer } = await import('inquirer');
  const { default: ora } = await import('ora');

  console.log(renderHeader(chalk, 'construir', 'lê a documentação e constrói a aplicação de verdade'));
  const step = makeStepper(chalk);

  step('Preparando', 'instalação e motor de execução');
  if (ensureInstalled(projectRoot)) hint(chalk, '✓ Agentes Lumen instalados neste projeto.');
  else hint(chalk, '✓ Lumen já instalado neste projeto.');
  const eng = ora({ text: 'Preparando o motor de execução…', indent: 2 }).start();
  const didSetup = ensureEngineSetup(projectRoot);
  eng.succeed(chalk.gray(didSetup ? 'Motor de execução preparado (skills instaladas).' : 'Motor de execução pronto.'));

  const hasDocs = existsSync(join(projectRoot, '_lumen_docs'));

  // 1. Escopo
  step('Escopo', 'o sistema inteiro ou uma feature');
  const { what } = await inquirer.prompt([{
    type: 'list', name: 'what', prefix: '', message: 'O que você quer construir?', loop: false,
    choices: [
      { name: hasDocs ? 'O sistema inteiro (a partir da documentação) ⭐' : 'Um sistema novo, do zero (greenfield) ⭐', value: 'all' },
      { name: 'Uma feature específica', value: 'feature' },
    ],
  }]);

  // 2. Descrição / feature
  let desc = '';
  let fromDocs = false;
  if (what === 'feature') {
    step('Feature', hasDocs ? 'escolha uma documentada ou escreva a sua' : 'descreva a feature');
    const units = hasDocs ? listDocumentedUnits(projectRoot) : [];
    const WRITE = '✎ Outra — escrevo a minha';
    let picked = WRITE;
    if (units.length) {
      const a = await inquirer.prompt([{
        type: 'list', name: 'unit', prefix: '', loop: false, pageSize: 16,
        message: 'Qual feature construir?',
        choices: [...units, WRITE],
      }]);
      picked = a.unit;
    }
    if (picked !== WRITE) { desc = picked; fromDocs = true; }
    else {
      const a = await inquirer.prompt([{ type: 'input', name: 'desc', prefix: '', message: 'Descreva a feature em uma frase:', validate: v => v.trim() ? true : 'Diga o que construir.' }]);
      desc = a.desc.trim();
    }
  } else if (!hasDocs) {
    step('Sistema', 'descreva o que vamos criar');
    const a = await inquirer.prompt([{ type: 'input', name: 'desc', prefix: '', message: 'Descreva o sistema que você quer criar:', validate: v => v.trim() ? true : 'Diga o que construir.' }]);
    desc = a.desc.trim();
  }

  // 3. Intenção + stack (greenfield: sempre escolher; documentado: manter ou escolher)
  step('Stack', 'tecnologias e versões exatas');
  let intent = 'pick';
  if (hasDocs) {
    const a = await inquirer.prompt([{
      type: 'list', name: 'intent', prefix: '', message: 'Stack:', loop: false,
      choices: [
        { name: 'Manter o stack atual do sistema (evoluir)', value: 'keep' },
        { name: 'Escolher o stack agora (modernizar / novo)', value: 'pick' },
      ],
    }]);
    intent = a.intent;
  }
  let stackLine = 'use EXATAMENTE o stack que o sistema já usa (do _lumen_docs/).';
  let stackSummary = 'manter o stack atual do sistema';
  if (intent === 'pick') {
    const stack = await pickStack(inquirer, chalk);
    stackLine = `use EXATAMENTE este stack já escolhido pelo usuário (NÃO reabra nem assuma, NÃO troque versões): ${stack}.`;
    stackSummary = stack.replace(/;\s*/g, ' · ');
  }

  // 4. Agente + permissões
  step('Agente', 'quem vai construir');
  const available = LAUNCHERS.filter(l => onPath(l.cmd));
  if (!available.length) {
    console.log('\n' + chalk.yellow('  Nenhum agente de IA no PATH. Abra o seu e diga o que quer construir.\n'));
    return;
  }
  let agentCmd = available[0].cmd;
  let agentName = available[0].name;
  if (available.length > 1) {
    const { pick } = await inquirer.prompt([{ type: 'list', name: 'pick', prefix: '', message: 'Qual agente abrir para construir?', choices: available.map(l => ({ name: l.name, value: l.cmd })) }]);
    agentCmd = pick;
    agentName = available.find(l => l.cmd === pick).name;
  } else {
    hint(chalk, `Único agente disponível: ${chalk.white(agentName)}.`);
  }
  const flags = await askAutoFlags(inquirer, chalk, agentCmd);

  // 4b. Execução em PARALELO (vários agentes ao mesmo tempo) — só no sistema inteiro
  //     e com agente que roda headless (claude/codex). Caso contrário, um agente interativo.
  if (what === 'all' && supportsHeadless(agentCmd)) {
    const { mode } = await inquirer.prompt([{
      type: 'list', name: 'mode', prefix: '', message: 'Execução:', loop: false,
      choices: [
        { name: 'Vários agentes em paralelo — backend ∥ frontend / por unit (mais rápido) ⭐', value: 'parallel' },
        { name: 'Um agente interativo (ele pergunta o nome, você acompanha)', value: 'single' },
      ],
    }]);

    if (mode === 'parallel') {
      step('Nome', 'usado nas pastas e no título — você decide');
      const base = basename(projectRoot);
      const guess = hasDocs && intent === 'pick' ? `${slug(base)}-v2` : slug(desc || base);
      const sugg = [...new Set([guess, `${slug(base)}-app`, slug(base)])];
      const NAMEW = '✎ Outra — eu digito o nome';
      const { picked } = await inquirer.prompt([{ type: 'list', name: 'picked', prefix: '', loop: false, message: 'Nome do sistema:', choices: [...sugg, NAMEW] }]);
      let name = picked;
      if (picked === NAMEW) {
        const a = await inquirer.prompt([{ type: 'input', name: 'n', prefix: '', message: 'Digite o nome:', validate: v => v.trim() ? true : 'Não pode ser vazio.' }]);
        name = a.n.trim();
      }
      name = slug(name);

      const hasFrontend = /frontend=(?!nenhum)/.test(stackSummary);
      const units = hasDocs ? listDocumentedUnits(projectRoot) : [];
      const streams = computeStreams({ projectRoot, hasDocs, intent, name, stackLine, hasFrontend, units, desc, what });

      step('Paralelismo', 'quantos agentes ao mesmo tempo');
      const max = streams.length;
      const { jobs } = await inquirer.prompt([{
        type: 'list', name: 'jobs', prefix: '', loop: false,
        message: `${max} stream(s) para construir. Quantos agentes em paralelo?`,
        default: Math.min(max, 4),
        choices: [...new Set([Math.min(max, 2), Math.min(max, 3), Math.min(max, 4), max])].filter(Boolean).map(n => ({ name: `${n} por vez`, value: n })),
      }]);

      const destP = resolveDestination({ projectRoot, hasDocs, intent });
      console.log(summaryBox(chalk, 'Plano de construção (paralelo)', [
        ['Projeto', basename(projectRoot)],
        ['Sistema', name],
        ['Stack', stackSummary],
        ['Destino', destP.summary],
        ['Agentes', `${agentName} · ${streams.length} streams, ${jobs} em paralelo`],
        ['Streams', streams.map(s => s.label).join(' · ')],
        ['Isolamento', 'git worktree + branch por agente (merge no fim)'],
        ['Modo', flags.length ? 'headless, sem aprovações' : 'headless'],
      ]));

      const { go: confirmP } = await inquirer.prompt([{ type: 'confirm', name: 'go', prefix: '', default: true, message: 'Disparar os agentes agora?' }]);
      if (!confirmP) { console.log(chalk.gray('\n  Ok, cancelado.\n')); return; }

      const states = await runParallel({ chalk, projectRoot, streams, agentCmd, skip: flags.length > 0, concurrency: jobs });
      process.exit(states.some(s => s.state === 'failed') ? 1 : 0);
    }
  }

  // 5. Kickoff com o stack TRAVADO e o DESTINO definido (caminho de um agente interativo)
  const dest = resolveDestination({ projectRoot, hasDocs, intent });
  const grounded = hasDocs ? ' ancorado na documentação (_lumen_docs/)' : '';
  const scope = what === 'feature'
    ? (fromDocs ? `construa a feature da unit documentada "${desc}" — use _lumen_docs/${desc}/ (requirements/design/tasks) como base` : `construa esta feature: "${desc}"`)
    : (hasDocs ? 'CONSTRUA O SISTEMA INTEIRO a partir de _lumen_docs/' : `CRIE UM SISTEMA NOVO do zero: "${desc}"`);
  const kickoff =
    `${scope}, em modo automático${grounded}. STACK: ${stackLine} ${dest.line} `
    + 'Pergunte o NOME do sistema: ofereça 2–3 sugestões fiéis ao domínio E SEMPRE inclua, como última opção, "✎ Outra — eu digito o nome" aceitando texto livre (NUNCA decida o nome sozinho; use exatamente o que o usuário digitar). NÃO pergunte stack/versão de novo — já está definido. '
    + 'Gere o techspec COMPLETO (estrutura, modelo de dados, contratos, auth, testes) seguindo as boas práticas e a constituição `.lumen/principles.md`; '
    + 'o que faltar de detalhe que você não souber, PERGUNTE (não chute). '
    + 'Depois gere as tarefas EM PARALELO (um subagente por unit), execute com o motor até o fim, revise (auditor) e verifique. '
    + 'Não pare entre as etapas do pipeline; só relate no final. (use a skill "lumen" no modo Construir autônomo)';

  // ── Resumo do plano + confirmação ──
  const alvo = what === 'feature' ? `feature: ${desc}` : (hasDocs ? 'sistema inteiro (da documentação)' : `sistema novo: ${desc}`);
  console.log(summaryBox(chalk, 'Plano de construção', [
    ['Projeto', basename(projectRoot)],
    ['Alvo', alvo],
    ['Stack', stackSummary],
    ['Destino', dest.summary],
    ['Agente', agentName],
    ['Modo', flags.length ? 'automático, sem aprovações' : 'automático, confirma comandos'],
    ['Motor', 'execução em paralelo · revisão · verificação'],
  ]));

  const { go: confirm } = await inquirer.prompt([{
    type: 'confirm', name: 'go', prefix: '', default: true, message: 'Construir agora?',
  }]);
  if (!confirm) { console.log(chalk.gray('\n  Ok, cancelado. Rode `lumen build` quando quiser.\n')); return; }

  const label = what === 'feature' ? `construindo a feature: ${desc}` : (hasDocs ? 'construindo o SISTEMA INTEIRO' : `criando o sistema: ${desc}`);
  process.exit(launchAgent(chalk, agentCmd, flags, kickoff, label));
}
