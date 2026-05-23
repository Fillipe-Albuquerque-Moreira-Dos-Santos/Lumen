import { resolve, join, basename } from 'path';
import { existsSync } from 'fs';
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

export default async function install() {
  const { default: chalk } = await import('chalk');
  const { default: inquirer } = await import('inquirer');
  const { default: ora } = await import('ora');

  const projectRoot = resolve(process.cwd());
  const version = getVersion();

  console.log(renderBanner(chalk));
  console.log(chalk.bold('  Instalação\n'));

  // Já instalado?
  const statePath = join(projectRoot, '.lumen', 'state.json');
  if (existsSync(statePath)) {
    const { proceed } = await inquirer.prompt([{
      type: 'confirm', name: 'proceed', prefix: '',
      message: 'Lumen já está instalado aqui. Reinstalar / atualizar config?', default: false,
    }]);
    if (!proceed) { console.log(chalk.gray('\n  Cancelado.\n')); return; }
  }

  const detected = detectEngines(projectRoot);
  const detectedNames = detected.filter(e => e.detected).map(e => e.name).join(', ');
  if (detectedNames) console.log(chalk.gray(`  Detectado: ${detectedNames}\n`));

  // Perguntas express (poucas, com defaults espertos)
  const answers = await inquirer.prompt([
    {
      type: 'checkbox', name: 'engines', prefix: '',
      message: 'Quais engines suportar?',
      choices: detected.map(e => ({
        name: `${e.name}${e.star ? ' (recomendado)' : ''}`,
        value: e.id, checked: e.detected,
      })),
      validate: v => v.length > 0 || 'Selecione ao menos uma engine.',
      loop: false, pageSize: 12,
    },
    { type: 'input', name: 'project_name', prefix: '',
      message: 'Nome do projeto:', default: basename(projectRoot) },
    { type: 'input', name: 'user_name', prefix: '',
      message: 'Como os agentes devem te chamar?', validate: v => v.trim() ? true : 'Não pode ser vazio.' },
    { type: 'input', name: 'chat_language', prefix: '',
      message: 'Idioma das conversas:', default: 'pt-br' },
    { type: 'input', name: 'doc_language', prefix: '',
      message: 'Idioma dos documentos gerados:', default: 'Português' },
  ]);

  // Defaults inferidos (sem perguntar — simplicidade)
  answers.output_folder = '_lumen_docs';
  answers.answer_mode = 'chat';

  const selectedEngines = ENGINES.filter(e => answers.engines.includes(e.id));
  const skills = Writer.listSkills();
  const writer = new Writer(projectRoot);

  const spinner = ora({ text: 'Instalando skills...', color: 'yellow' }).start();
  try {
    for (const skill of skills) {
      for (const engine of selectedEngines) {
        writer.installSkill(skill, engine.skillsDir);
        if (engine.universalSkillsDir && engine.universalSkillsDir !== engine.skillsDir) {
          writer.installSkill(skill, engine.universalSkillsDir);
        }
      }
    }

    spinner.text = 'Escrevendo arquivos de entrada...';
    const seen = new Set();
    for (const engine of selectedEngines) {
      if (!engine.entryFile || seen.has(engine.entryFile)) continue;
      seen.add(engine.entryFile);
      writer.installEntryFile(engine);
    }

    spinner.text = 'Criando estrutura .lumen/...';
    writer.createLumenDir(answers, version);
    writer.updateGitignore(answers.output_folder);
    writer.saveCreatedFiles();

    spinner.text = 'Gerando manifest (para updates seguros)...';
    const skillRoots = [...new Set(selectedEngines.flatMap(e => [e.skillsDir, e.universalSkillsDir]))]
      .map(d => join(projectRoot, d));
    saveManifest(projectRoot, buildManifest(projectRoot, skillRoots));

    spinner.succeed(chalk.hex('#f5c518')('Instalação concluída!'));
  } catch (err) {
    spinner.fail(chalk.red('Erro na instalação.'));
    throw err;
  }

  console.log('');
  console.log(chalk.bold('  Resumo:'));
  console.log(`  ${chalk.yellow('Projeto:')}  ${answers.project_name}`);
  console.log(`  ${chalk.yellow('Engines:')}  ${selectedEngines.map(e => e.name).join(', ')}`);
  console.log(`  ${chalk.yellow('Skills:')}   ${skills.length} agentes`);
  console.log('');
  const slash = selectedEngines.some(e => e.id !== 'codex' && e.id !== 'opencode');
  console.log(chalk.yellow(`  → Abra seu agente e digite ${slash ? '/lumen' : 'lumen'} para começar a documentar.\n`));
}
