// Teste do instalador + update do Lumen, num projeto temporário.
// Roda no CI. Não depende do motor (Compozy).
import { mkdirSync, rmSync, readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { detectEngines } from '../lib/installer/detector.js';
import { Writer } from '../lib/installer/writer.js';
import { buildManifest, saveManifest } from '../lib/installer/manifest.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const proj = join(process.env.TMPDIR || '/tmp', 'lumen-selftest');
rmSync(proj, { recursive: true, force: true });
mkdirSync(join(proj, '.claude'), { recursive: true });

let failed = 0;
const check = (label, cond) => { console.log(`${cond ? '✅' : '❌'} ${label}`); if (!cond) failed++; };

// --- INSTALL (via Writer, como o comando install faz) ---
const engines = detectEngines(proj);
const answers = {
  engines: ['claude-code'], project_name: 'selftest', user_name: 'CI',
  chat_language: 'pt-br', doc_language: 'Português', output_folder: '_lumen_docs', answer_mode: 'chat',
};
const selected = engines.filter(e => answers.engines.includes(e.id));
const skills = Writer.listSkills();
const w = new Writer(proj);
for (const s of skills) for (const e of selected) {
  w.installSkill(s, e.skillsDir);
  if (e.universalSkillsDir !== e.skillsDir) w.installSkill(s, e.universalSkillsDir);
}
for (const e of selected) w.installEntryFile(e);
w.createLumenDir(answers, '0.1.0');
w.updateGitignore(answers.output_folder);
w.saveCreatedFiles();
const skillRoots = [...new Set(selected.flatMap(e => [e.skillsDir, e.universalSkillsDir]))].map(d => join(proj, d));
saveManifest(proj, buildManifest(proj, skillRoots));

check('17 skills instalados', skills.length === 17);
check('orquestrador lumen presente', existsSync(join(proj, '.claude/skills/lumen/SKILL.md')));
check('CLAUDE.md criado', existsSync(join(proj, 'CLAUDE.md')));
check('.lumen/state.json', existsSync(join(proj, '.lumen/state.json')));
check('.lumen/_manifest.json', existsSync(join(proj, '.lumen/_manifest.json')));

// --- UPDATE: deve preservar edits do usuário e restaurar arquivos apagados ---
const userEdited = join(proj, '.claude/skills/lumen-scout/SKILL.md');
appendFileSync(userEdited, '\n\n<!-- USER EDIT -->\n', 'utf8');
const deleted = join(proj, '.claude/skills/lumen-prd/SKILL.md');
rmSync(deleted);

process.chdir(proj);
const update = (await import('../lib/commands/update.js')).default;
await update();

check('edit do usuário preservado', readFileSync(userEdited, 'utf8').includes('<!-- USER EDIT -->'));
check('arquivo apagado restaurado', existsSync(deleted));

// limpeza
rmSync(proj, { recursive: true, force: true });

if (failed) { console.error(`\n${failed} verificação(ões) falharam`); process.exit(1); }
console.log('\nTodos os checks passaram.');
