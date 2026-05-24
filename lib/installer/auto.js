import { resolve, basename, join } from 'path';
import { existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { detectEngines, ENGINES } from './detector.js';
import { Writer } from './writer.js';
import { buildManifest, saveManifest } from './manifest.js';
import { readJsonSafe } from '../utils/json-safe.js';
import { engineRun } from '../engine/engine.js';

function pkgVersion() {
  try {
    const here = resolve(new URL('.', import.meta.url).pathname, '..', '..');
    return readJsonSafe(join(here, 'package.json')).version ?? '0.0.0';
  } catch { return '0.0.0'; }
}

// Instala os agentes Lumen no projeto (silencioso, defaults espertos) se ainda não estiver.
// Devolve true se instalou agora, false se já estava.
export function ensureInstalled(projectRoot) {
  if (existsSync(join(projectRoot, '.lumen', 'state.json'))) return false;
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
  w.createLumenDir(answers, pkgVersion());
  w.updateGitignore(answers.output_folder);
  w.saveCreatedFiles();
  const roots = [...new Set(selected.flatMap(e => [e.skillsDir, e.universalSkillsDir]))].map(d => join(projectRoot, d));
  saveManifest(projectRoot, buildManifest(projectRoot, roots));
  return true;
}

// O motor já está preparado (skills cy-* instaladas)?
export function engineSetupDone(projectRoot) {
  for (const d of ['.claude/skills', '.agents/skills', '.kiro/skills']) {
    if (existsSync(join(projectRoot, d, 'cy-execute-task'))) return true;
  }
  return false;
}

// Garante o motor preparado (roda o setup uma vez). Best-effort — não bloqueia o build se falhar.
export function ensureEngineSetup(projectRoot) {
  if (engineSetupDone(projectRoot)) return false;
  // Silencioso: o setup do motor é muito verboso (centenas de linhas). O usuário só
  // vê o spinner "Preparando…" e o ✓ final.
  try { engineRun(['setup', '--all', '--yes'], { stdio: 'ignore' }); } catch { /* segue mesmo assim */ }
  return true;
}
