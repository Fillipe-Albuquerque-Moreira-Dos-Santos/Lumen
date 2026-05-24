import {
  existsSync, mkdirSync, writeFileSync, readFileSync,
  cpSync, appendFileSync, readdirSync,
} from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readJsonSafe } from '../utils/json-safe.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const SKILLS_DIR = join(REPO_ROOT, 'skills');
const TEMPLATES_DIR = join(REPO_ROOT, 'templates');

// Conteúdo do arquivo de entrada (CLAUDE.md, AGENTS.md, etc.). Igual para todas
// as engines — só avisa o agente que o Lumen está instalado e como começar.
function entryContent() {
  return `# Lumen

Este projeto tem o **Lumen** instalado — um único agente que **documenta o sistema** e depois **constrói** features novas ancoradas na verdade extraída.

## Como começar

Digite \`/lumen\` (ou \`lumen\` em engines sem slash) no chat. O Lumen detecta em que ponto do ciclo o projeto está e conduz a partir daí:

1. **Documentar** — lê o código do sistema e gera specs em \`_lumen_docs/\` (🟢 confirmado / 🟡 inferido / 🔴 lacuna). Nunca toca no seu código.
2. **Construir** — ao terminar de documentar, o Lumen sugere codar uma feature: \`lumen-fundamento → lumen-requisitos → lumen-projeto-tecnico → lumen-tarefas → lumen-construtor → lumen-auditor\`.
3. **Verificar** — depois do build, \`lumen-verificador\` confere que nenhuma regra 🟢 do sistema regrediu.

## Regra absoluta

Documentar e Verificar nunca escrevem código do projeto — só \`.lumen/\` e \`_lumen_docs/\`. Apenas o \`lumen-construtor\` escreve código, e só dentro do escopo das tasks aprovadas.
`;
}

export class Writer {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.createdFiles = [];
  }

  _rel(absPath) {
    return absPath.replace(this.projectRoot + '/', '').replace(this.projectRoot + '\\', '');
  }

  _register(absPath) {
    const rel = this._rel(absPath);
    if (!this.createdFiles.includes(rel)) this.createdFiles.push(rel);
  }

  _mkdir(dir) { mkdirSync(dir, { recursive: true }); }

  _writeNew(filePath, content) {
    if (existsSync(filePath)) return false;
    this._mkdir(dirname(filePath));
    writeFileSync(filePath, content, 'utf8');
    this._register(filePath);
    return true;
  }

  // Lista os IDs de skills disponíveis no pacote (lumen, lumen-*)
  static listSkills() {
    return readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .sort();
  }

  // Copia um skill para o diretório da engine
  installSkill(skillId, skillsDir) {
    const src = join(SKILLS_DIR, skillId);
    const dest = join(this.projectRoot, skillsDir, skillId);
    if (!existsSync(src)) { console.warn(`  Skill não encontrado: ${skillId}`); return; }
    if (existsSync(dest)) return;
    this._mkdir(dirname(dest));
    cpSync(src, dest, { recursive: true });
    this._register(dest);
  }

  // Escreve o arquivo de entrada da engine. Se já existe, faz merge (append).
  installEntryFile(engine) {
    if (!engine.entryFile) return;
    const destPath = join(this.projectRoot, engine.entryFile);
    const content = entryContent();
    if (!existsSync(destPath)) {
      this._mkdir(dirname(destPath));
      writeFileSync(destPath, content, 'utf8');
      this._register(destPath);
    } else if (!readFileSync(destPath, 'utf8').includes('# Lumen')) {
      appendFileSync(destPath, '\n\n---\n\n' + content, 'utf8');
    }
  }

  // Cria a estrutura .lumen/ (state.json, config.toml)
  createLumenDir(answers, version) {
    const dir = join(this.projectRoot, '.lumen');
    this._mkdir(dir);

    const stateTpl = readFileSync(join(TEMPLATES_DIR, 'state.json'), 'utf8');
    const state = JSON.parse(stateTpl.replace('{{VERSION}}', version));
    state.project = answers.project_name;
    state.user_name = answers.user_name;
    state.chat_language = answers.chat_language;
    state.doc_language = answers.doc_language;
    state.output_folder = answers.output_folder;
    state.engines = answers.engines;
    this._writeNew(join(dir, 'state.json'), JSON.stringify(state, null, 2));

    const configTpl = readFileSync(join(TEMPLATES_DIR, 'config.toml'), 'utf8');
    const enginesList = answers.engines.map(e => `  "${e}"`).join(',\n');
    const config = configTpl
      .replace('name = ""', `name = "${answers.project_name}"`)
      .replace('name = ""', `name = "${answers.user_name}"`)
      .replace('chat_language = "pt-br"', `chat_language = "${answers.chat_language}"`)
      .replace('doc_language = "Português"', `doc_language = "${answers.doc_language}"`)
      .replace('output_folder = "_lumen_docs"', `output_folder = "${answers.output_folder}"`)
      .replace('installed = []', `installed = [\n${enginesList}\n]`);
    this._writeNew(join(dir, 'config.toml'), config);

    // Constituição do projeto (princípios não-negociáveis: segurança, testes, convenções).
    this._writeNew(join(dir, 'principles.md'), readFileSync(join(TEMPLATES_DIR, 'principles.md'), 'utf8'));

    this._writeNew(join(dir, 'version'), version);
  }

  updateGitignore(outputFolder) {
    const gitignorePath = join(this.projectRoot, '.gitignore');
    const block = ['', '# Lumen', '.lumen/', `${outputFolder}/`, '_lumen/', '.compozy/'].join('\n');
    if (existsSync(gitignorePath)) {
      if (!readFileSync(gitignorePath, 'utf8').includes('# Lumen')) {
        appendFileSync(gitignorePath, block + '\n', 'utf8');
      }
    } else {
      writeFileSync(gitignorePath, block.trimStart() + '\n', 'utf8');
      this._register(gitignorePath);
    }
  }

  saveCreatedFiles() {
    const statePath = join(this.projectRoot, '.lumen', 'state.json');
    if (!existsSync(statePath)) return;
    const state = readJsonSafe(statePath);
    state.created_files = [...new Set([...(state.created_files ?? []), ...this.createdFiles])];
    writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
  }
}
