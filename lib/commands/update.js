import { resolve, join, dirname } from 'path';
import { existsSync, readdirSync, statSync, copyFileSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { ENGINES } from '../installer/detector.js';
import { Writer } from '../installer/writer.js';
import { hashFile, loadManifest, saveManifest } from '../installer/manifest.js';
import { readJsonSafe } from '../utils/json-safe.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const SKILLS_DIR = join(REPO_ROOT, 'skills');

function pkgVersion() {
  try { return readJsonSafe(join(REPO_ROOT, 'package.json')).version ?? '0.0.0'; } catch { return '0.0.0'; }
}

// Lista caminhos relativos de todos os arquivos dentro de um skill do pacote.
function skillFiles(skillRoot) {
  const out = [];
  const walk = (rel) => {
    const abs = join(skillRoot, rel);
    if (statSync(abs).isDirectory()) for (const e of readdirSync(abs)) walk(rel ? join(rel, e) : e);
    else out.push(rel);
  };
  walk('');
  return out;
}

export default async function update() {
  const { default: chalk } = await import('chalk');
  const projectRoot = resolve(process.cwd());
  const statePath = join(projectRoot, '.lumen', 'state.json');

  if (!existsSync(statePath)) {
    console.log(chalk.gray('\n  Lumen não está instalado aqui. Rode "lumen install".\n'));
    return;
  }

  const state = readJsonSafe(statePath);
  const engines = state.engines ?? [];
  const selected = ENGINES.filter(e => engines.includes(e.id));
  const skillDirs = [...new Set(selected.flatMap(e => [e.skillsDir, e.universalSkillsDir]))];

  const manifest = loadManifest(projectRoot);
  const next = { ...manifest };
  let added = 0, updated = 0, preserved = 0, same = 0;
  const preservedList = [];

  for (const skill of Writer.listSkills()) {
    const skillRoot = join(SKILLS_DIR, skill);
    const files = skillFiles(skillRoot);
    for (const dir of skillDirs) {
      for (const rel of files) {
        const srcAbs = join(skillRoot, rel);
        const destAbs = join(projectRoot, dir, skill, rel);
        const destRel = `${dir}/${skill}/${rel}`.replace(/\\/g, '/');
        const srcHash = hashFile(srcAbs);

        if (!existsSync(destAbs)) {
          mkdirSync(dirname(destAbs), { recursive: true });
          copyFileSync(srcAbs, destAbs);
          next[destRel] = srcHash; added++;
          continue;
        }
        const cur = hashFile(destAbs);
        if (cur === srcHash) { next[destRel] = srcHash; same++; continue; }
        if (manifest[destRel] && manifest[destRel] === cur) {
          // Intacto desde a instalação → seguro atualizar.
          copyFileSync(srcAbs, destAbs);
          next[destRel] = srcHash; updated++;
        } else {
          // Modificado pelo usuário (ou sem registro) → preservar.
          preserved++; preservedList.push(`${dir}/${skill}/${rel}`);
        }
      }
    }
  }

  saveManifest(projectRoot, next);

  const version = pkgVersion();
  const versionPath = join(projectRoot, '.lumen', 'version');
  try { writeFileSync(versionPath, version, 'utf8'); } catch { /* ignore */ }
  try {
    state.version = version;
    writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
  } catch { /* ignore */ }

  console.log('');
  console.log(chalk.bold(`  Lumen atualizado para v${version}`));
  console.log(`  ${chalk.green('Atualizados:')} ${updated}   ${chalk.cyan('Novos:')} ${added}   ${chalk.gray('Já atuais:')} ${same}   ${chalk.yellow('Preservados (seus edits):')} ${preserved}`);
  if (preservedList.length) {
    console.log(chalk.yellow('\n  Mantidos como estão (você modificou):'));
    for (const p of preservedList.slice(0, 20)) console.log(chalk.gray(`    - ${p}`));
    if (preservedList.length > 20) console.log(chalk.gray(`    … e mais ${preservedList.length - 20}`));
  }
  console.log('');
}
