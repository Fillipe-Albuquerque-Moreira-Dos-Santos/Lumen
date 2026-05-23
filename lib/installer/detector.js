import { existsSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';

// Engines suportadas. skillsDir é onde os SKILL.md vão; entryFile é o arquivo
// de entrada que avisa o agente que o Lumen está instalado.
export const ENGINES = [
  { id: 'claude-code', name: 'Claude Code', star: true,
    entryFile: 'CLAUDE.md', skillsDir: '.claude/skills', universalSkillsDir: '.agents/skills' },
  { id: 'codex', name: 'Codex', star: true,
    entryFile: 'AGENTS.md', skillsDir: '.agents/skills', universalSkillsDir: '.agents/skills' },
  { id: 'cursor', name: 'Cursor', star: true,
    entryFile: '.cursorrules', skillsDir: '.agents/skills', universalSkillsDir: '.agents/skills' },
  { id: 'gemini-cli', name: 'Gemini CLI', star: false,
    entryFile: 'GEMINI.md', skillsDir: '.agents/skills', universalSkillsDir: '.agents/skills' },
  { id: 'windsurf', name: 'Windsurf', star: false,
    entryFile: '.windsurfrules', skillsDir: '.agents/skills', universalSkillsDir: '.agents/skills' },
  { id: 'kiro', name: 'Kiro', star: false,
    entryFile: null, skillsDir: '.kiro/skills', universalSkillsDir: '.agents/skills' },
  { id: 'opencode', name: 'Opencode', star: false,
    entryFile: 'AGENTS.md', skillsDir: '.agents/skills', universalSkillsDir: '.agents/skills' },
  { id: 'cline', name: 'Cline', star: false,
    entryFile: '.clinerules', skillsDir: '.agents/skills', universalSkillsDir: '.agents/skills' },
  { id: 'roo-code', name: 'Roo Code', star: false,
    entryFile: '.roorules', skillsDir: '.agents/skills', universalSkillsDir: '.agents/skills' },
  { id: 'github-copilot', name: 'GitHub Copilot', star: false,
    entryFile: '.github/copilot-instructions.md', skillsDir: '.agents/skills', universalSkillsDir: '.agents/skills' },
];

function commandExists(cmd) {
  if (!/^[a-zA-Z0-9_-]+$/.test(cmd)) return false;
  try {
    const finder = process.platform === 'win32' ? 'where' : 'which';
    execFileSync(finder, [cmd], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function detectEngines(projectRoot) {
  const detectors = {
    'claude-code': (r) => existsSync(join(r, '.claude')) || commandExists('claude'),
    'codex': (r) => existsSync(join(r, 'AGENTS.md')) || commandExists('codex'),
    'cursor': (r) => existsSync(join(r, '.cursor')) || existsSync(join(r, '.cursorrules')),
    'gemini-cli': (r) => existsSync(join(r, 'GEMINI.md')) || commandExists('gemini'),
    'windsurf': (r) => existsSync(join(r, '.windsurf')) || existsSync(join(r, '.windsurfrules')),
    'kiro': (r) => existsSync(join(r, '.kiro')) || commandExists('kiro'),
    'opencode': (r) => existsSync(join(r, '.opencode')) || commandExists('opencode'),
    'cline': (r) => existsSync(join(r, '.clinerules')) || existsSync(join(r, '.cline')),
    'roo-code': (r) => existsSync(join(r, '.roorules')) || existsSync(join(r, '.roo')),
    'github-copilot': (r) => existsSync(join(r, '.github', 'copilot-instructions.md')),
  };

  return ENGINES.map(engine => ({
    ...engine,
    detected: detectors[engine.id]?.(projectRoot) ?? false,
  }));
}
