#!/usr/bin/env node
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

const [, , command, ...args] = process.argv;

const commands = {
  install: () => import('../lib/commands/install.js'),
  update: () => import('../lib/commands/update.js'),
  status: () => import('../lib/commands/status.js'),
  uninstall: () => import('../lib/commands/uninstall.js'),
  setup: () => import('../lib/commands/setup.js'),
  build: () => import('../lib/commands/build.js'),
};

if (command === '--version' || command === '-v') {
  console.log(pkg.version);
  process.exit(0);
}

if (!command || command === '--help' || command === '-h') {
  console.log(`
  Lumen v${pkg.version} — luz sobre o legado: documenta e constrói.

  Uso: npx lumen <comando>

  Comandos:
    install     Instala o Lumen no projeto atual
    update      Atualiza os skills preservando suas customizações (hash)
    setup       Prepara o motor de execução (Compozy) nos agentes
    build       Executa o build de uma feature: lumen build <feature>
    status      Mostra o estágio atual do ciclo
    uninstall   Remove o Lumen (só o que ele criou)

  Depois de instalar, abra seu agente de IA e digite /lumen.
  O build usa o motor Compozy por baixo (instale com: npm i -g @compozy/cli).
  `);
  process.exit(0);
}

if (!commands[command]) {
  console.error(`\n  Comando desconhecido: "${command}". Rode "lumen --help".\n`);
  process.exit(1);
}

const mod = await commands[command]();
await mod.default(args);
