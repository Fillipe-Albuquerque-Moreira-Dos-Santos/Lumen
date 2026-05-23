import { execFileSync, spawnSync } from 'child_process';

// Detecta o binário do Compozy (o motor de execução do Lumen).
// Lumen NÃO embute o Compozy — ele o usa como motor. Esta função confirma
// que o motor está presente e dá orientação clara quando não está.
export function findCompozy() {
  const finder = process.platform === 'win32' ? 'where' : 'which';
  try {
    const path = execFileSync(finder, ['compozy'], { stdio: 'pipe' }).toString().trim().split('\n')[0];
    let version = '';
    try { version = execFileSync('compozy', ['--version'], { stdio: 'pipe' }).toString().trim(); } catch { /* ignore */ }
    return { found: true, path, version };
  } catch {
    return { found: false };
  }
}

export const INSTALL_HINT = [
  'O motor de execução do Lumen (Compozy) não foi encontrado no PATH.',
  'Instale por um destes meios e rode o comando de novo:',
  '',
  '  brew install compozy/compozy/compozy',
  '  npm install -g @compozy/cli',
  '  go install github.com/compozy/compozy/cmd/compozy@latest',
].join('\n');

// Executa um subcomando do motor, repassando stdio (experiência interativa).
export function runCompozy(args) {
  return spawnSync('compozy', args, { stdio: 'inherit' });
}
