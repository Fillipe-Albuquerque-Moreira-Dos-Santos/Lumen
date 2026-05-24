import { resolve, basename, join } from 'path';
import { existsSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { detectEngines, ENGINES } from '../installer/detector.js';
import { Writer } from '../installer/writer.js';
import { buildManifest, saveManifest } from '../installer/manifest.js';
import { readJsonSafe } from '../utils/json-safe.js';
import { renderHeader, makeStepper, summaryBox, hint } from '../utils/ui.js';

function getVersion() {
  try {
    const here = resolve(new URL('.', import.meta.url).pathname, '..', '..');
    return readJsonSafe(join(here, 'package.json')).version ?? '0.0.0';
  } catch { return '0.0.0'; }
}
function onPath(cmd) {
  try { execFileSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { stdio: 'pipe' }); return true; }
  catch { return false; }
}

// Agentes que o Lumen consegue ABRIR pelo terminal já documentando.
const LAUNCHERS = [
  { id: 'claude-code', cmd: 'claude', name: 'Claude Code' },
  { id: 'codex', cmd: 'codex', name: 'Codex' },
  { id: 'gemini-cli', cmd: 'gemini', name: 'Gemini CLI' },
  { id: 'cursor', cmd: 'cursor-agent', name: 'Cursor' },
];

// Flag de "rodar sem pedir permissão a cada comando", por agente.
const AUTO_FLAGS = {
  claude: ['--dangerously-skip-permissions'],
  codex: ['--full-auto'],
  gemini: ['--yolo'],
};

// Profundidade da documentação — vira o doc_level do pipeline.
const DEPTH = [
  { name: 'Essencial — o panorama e o que importa (mais rápido)', value: 'Essencial' },
  { name: 'Completo — visão sólida de ponta a ponta ⭐', value: 'Completo' },
  { name: 'Detalhado — fundo, para auditoria/migração', value: 'Detalhado' },
];

function kickoffFor(depth, auto) {
  return `Inicie o Lumen e documente este sistema de ponta a ponta no nível "${depth}". `
    + (auto
      ? 'MODO AUTOMÁTICO: rode tudo de uma vez até terminar, paralelizando ao máximo com subagentes, sem pausar nem pedir confirmação. Se eu não responder algo, siga com a organização sugerida pelo Mapeador. '
      : 'Paralelize com subagentes e me pergunte só o essencial. ')
    + '(use a skill "lumen")';
}

// `lumen go` — o comando "manda a ver": instala (se preciso), empacota o sistema,
// e abre seu agente de IA já começando a documentar. Um comando só, agora guiado.
export default async function go() {
  const { default: chalk } = await import('chalk');
  const { default: inquirer } = await import('inquirer');
  const { default: ora } = await import('ora');
  const projectRoot = resolve(process.cwd());
  const version = getVersion();

  console.log(renderHeader(chalk, 'documentar', 'lê o sistema e extrai specs confiáveis e rastreáveis'));
  const step = makeStepper(chalk);

  // ── Bastidores: instalar (se preciso) + empacotar o sistema ──
  step('Preparando', 'instalação e empacotamento do sistema');
  let installedMsg = 'Lumen já instalado neste projeto.';
  if (!existsSync(join(projectRoot, '.lumen', 'state.json'))) {
    const sp = ora({ text: 'Instalando os agentes Lumen…', indent: 2 }).start();
    const detected = detectEngines(projectRoot).filter(e => e.detected);
    const engineIds = (detected.length ? detected : ENGINES.filter(e => e.id === 'claude-code')).map(e => e.id);
    let userName = process.env.USER || process.env.USERNAME || '';
    try { userName = userName || execFileSync('git', ['config', 'user.name'], { stdio: 'pipe' }).toString().trim(); } catch { /* ignore */ }

    const answers = {
      engines: engineIds, project_name: basename(projectRoot), user_name: userName || 'você',
      chat_language: 'pt-br', doc_language: 'Português', output_folder: '_lumen_docs', answer_mode: 'chat',
    };
    const selected = ENGINES.filter(e => answers.engines.includes(e.id));
    const w = new Writer(projectRoot);
    for (const s of Writer.listSkills()) for (const e of selected) {
      w.installSkill(s, e.skillsDir);
      if (e.universalSkillsDir !== e.skillsDir) w.installSkill(s, e.universalSkillsDir);
    }
    const seen = new Set();
    for (const e of selected) { if (!e.entryFile || seen.has(e.entryFile)) continue; seen.add(e.entryFile); w.installEntryFile(e); }
    w.createLumenDir(answers, version);
    w.updateGitignore(answers.output_folder);
    w.saveCreatedFiles();
    const roots = [...new Set(selected.flatMap(e => [e.skillsDir, e.universalSkillsDir]))].map(d => join(projectRoot, d));
    saveManifest(projectRoot, buildManifest(projectRoot, roots));
    installedMsg = `Instalado: ${Writer.listSkills().length} agentes (${selected.map(e => e.name).join(', ')}).`;
    sp.succeed(chalk.gray(installedMsg));
  } else {
    hint(chalk, '✓ ' + installedMsg);
  }

  const pack = ora({ text: 'Empacotando o sistema (extração barata e completa)…', indent: 2 }).start();
  try {
    spawnSync('npx', ['--yes', 'repomix', '--compress', '--output', '.lumen/context/pack.xml'], { stdio: 'ignore', cwd: projectRoot });
    pack.succeed(chalk.gray('Sistema empacotado em .lumen/context/pack.xml'));
  } catch { pack.warn(chalk.gray('Empacotamento pulado (segue sem ele).')); }

  // ── Perguntas (só o essencial) ──
  step('Profundidade', 'quão fundo a documentação vai');
  const { depth } = await inquirer.prompt([{
    type: 'list', name: 'depth', prefix: '', message: 'Nível da documentação:', loop: false, default: 'Completo', choices: DEPTH,
  }]);

  step('Agente', 'quem vai documentar');
  const launchable = LAUNCHERS.filter(l => onPath(l.cmd));
  let chosen = launchable[0];
  if (launchable.length > 1) {
    const { pick } = await inquirer.prompt([{
      type: 'list', name: 'pick', prefix: '', message: 'Qual agente abrir para documentar?',
      choices: launchable.map(l => ({ name: l.name, value: l.cmd })),
    }]);
    chosen = launchable.find(l => l.cmd === pick);
  } else if (chosen) {
    hint(chalk, `Único agente disponível: ${chalk.white(chosen.name)}.`);
  }

  if (!chosen) {
    console.log('\n' + chalk.yellow('  Nenhum agente de IA no PATH. Abra o seu neste projeto e digite ') + chalk.bold('/lumen') + chalk.yellow(' para começar.\n'));
    return;
  }

  let flags = [];
  let auto = true;
  if (AUTO_FLAGS[chosen.cmd]) {
    step('Modo', 'como o agente vai trabalhar');
    const { mode } = await inquirer.prompt([{
      type: 'list', name: 'mode', prefix: '', message: 'Como rodar?', loop: false,
      choices: [
        { name: 'Automático, sem aprovações — roda até o fim (mais rápido) ⭐', value: 'skip' },
        { name: 'Automático, mas confirmo os comandos', value: 'auto' },
        { name: 'Guiado — me pergunta o essencial', value: 'guided' },
      ],
    }]);
    flags = mode === 'skip' ? AUTO_FLAGS[chosen.cmd] : [];
    auto = mode !== 'guided';
  }

  // ── Resumo do plano + confirmação ──
  console.log(summaryBox(chalk, 'Plano de documentação', [
    ['Projeto', basename(projectRoot)],
    ['Profundidade', depth],
    ['Agente', chosen.name],
    ['Modo', auto ? (flags.length ? 'automático, sem aprovações' : 'automático, confirma comandos') : 'guiado'],
    ['Saída', '_lumen_docs/'],
  ]));

  const { go: confirm } = await inquirer.prompt([{
    type: 'confirm', name: 'go', prefix: '', default: true, message: 'Começar a documentar agora?',
  }]);
  if (!confirm) { console.log(chalk.gray('\n  Ok, cancelado. Rode `lumen go` quando quiser.\n')); return; }

  console.log(chalk.hex('#f5c518')(`\n  Abrindo ${chosen.name}${flags.length ? ' (sem aprovações)' : ''} e iniciando a documentação…\n`));
  const res = spawnSync(chosen.cmd, [...flags, kickoffFor(depth, auto)], { stdio: 'inherit', cwd: projectRoot });
  if (res.error) {
    console.log('\n' + chalk.yellow(`  Não consegui abrir ${chosen.name} automaticamente. Abra-o neste projeto e digite `) + chalk.bold('/lumen') + '.\n');
  }
}
