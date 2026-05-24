import { resolve, basename, join } from 'path';
import { existsSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { detectEngines, ENGINES } from '../installer/detector.js';
import { Writer } from '../installer/writer.js';
import { buildManifest, saveManifest } from '../installer/manifest.js';
import { readJsonSafe } from '../utils/json-safe.js';
import { renderBanner } from '../utils/banner.js';

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

const KICKOFF = 'Inicie o Lumen e documente este sistema de ponta a ponta em MODO AUTOMÁTICO: '
  + 'rode tudo de uma vez até terminar, paralelizando ao máximo com subagentes, sem pausar '
  + 'nem pedir confirmação. Se eu não responder algo, use doc_level Essencial e a organização '
  + 'sugerida pelo Mapeador. (use a skill "lumen")';

// `lumen go` — o comando "manda a ver": instala (se preciso), empacota o sistema,
// e abre seu agente de IA já começando a documentar. Um comando só.
export default async function go() {
  const { default: chalk } = await import('chalk');
  const { default: inquirer } = await import('inquirer');
  const projectRoot = resolve(process.cwd());
  const version = getVersion();

  console.log(renderBanner(chalk));

  // 1. Instala (em silêncio, com defaults espertos) se ainda não estiver instalado.
  if (!existsSync(join(projectRoot, '.lumen', 'state.json'))) {
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
    console.log(chalk.gray(`  Instalado: ${Writer.listSkills().length} agentes (${selected.map(e => e.name).join(', ')}).`));
  } else {
    console.log(chalk.gray('  Lumen já instalado neste projeto.'));
  }

  // 2. Empacota o sistema (extração barata). Best-effort — não bloqueia se falhar.
  process.stdout.write(chalk.gray('  Empacotando o sistema... '));
  try {
    spawnSync('npx', ['--yes', 'repomix', '--compress', '--output', '.lumen/context/pack.xml'], { stdio: 'ignore', cwd: projectRoot });
    console.log(chalk.gray('ok.'));
  } catch { console.log(chalk.gray('(pulado).')); }

  // 3. Abre o agente já documentando.
  const launchable = LAUNCHERS.filter(l => onPath(l.cmd));
  let chosen = launchable[0];
  if (launchable.length > 1) {
    const { pick } = await inquirer.prompt([{
      type: 'list', name: 'pick', prefix: '', message: 'Qual agente abrir para documentar?',
      choices: launchable.map(l => ({ name: l.name, value: l.cmd })),
    }]);
    chosen = launchable.find(l => l.cmd === pick);
  }

  if (!chosen) {
    console.log('\n' + chalk.yellow('  Abra seu agente de IA neste projeto e digite ') + chalk.bold('/lumen') + chalk.yellow(' para começar.\n'));
    return;
  }

  let flags = [];
  if (AUTO_FLAGS[chosen.cmd]) {
    const { skip } = await inquirer.prompt([{
      type: 'confirm', name: 'skip', prefix: '', default: false,
      message: `Rodar sem pedir permissão a cada comando? (${chosen.cmd} ${AUTO_FLAGS[chosen.cmd].join(' ')}) — mais rápido, sem confirmar.`,
    }]);
    if (skip) flags = AUTO_FLAGS[chosen.cmd];
  }

  console.log(chalk.hex('#f5c518')(`\n  Abrindo ${chosen.name}${flags.length ? ' (sem aprovações)' : ''} e iniciando a documentação...\n`));
  const res = spawnSync(chosen.cmd, [...flags, KICKOFF], { stdio: 'inherit', cwd: projectRoot });
  if (res.error) {
    console.log('\n' + chalk.yellow(`  Não consegui abrir ${chosen.name} automaticamente. Abra-o neste projeto e digite `) + chalk.bold('/lumen') + '.\n');
  }
}
