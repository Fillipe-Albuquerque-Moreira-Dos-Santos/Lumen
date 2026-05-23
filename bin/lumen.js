#!/usr/bin/env node
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

const [, , command, ...args] = process.argv;

const commands = {
  go: () => import('../lib/commands/go.js'),
  install: () => import('../lib/commands/install.js'),
  update: () => import('../lib/commands/update.js'),
  status: () => import('../lib/commands/status.js'),
  uninstall: () => import('../lib/commands/uninstall.js'),
  setup: () => import('../lib/commands/setup.js'),
  pull: () => import('../lib/commands/pull.js'),
  validate: () => import('../lib/commands/validate.js'),
  review: () => import('../lib/commands/review.js'),
  build: () => import('../lib/commands/build.js'),
};

if (command === '--version' || command === '-v') {
  console.log(pkg.version);
  process.exit(0);
}

if (!command || command === '--help' || command === '-h') {
  console.log(`
  Lumen v${pkg.version} — luz sobre o sistema: documenta e constrói.

  Uso: lumen <comando>

  ✨ Comece aqui:
    go          Faz tudo: instala, empacota e ABRE seu agente já documentando

  Comandos:
    install     Instala o Lumen no projeto atual
    update      Atualiza os skills preservando suas customizações (hash)
    pull        Puxa o sistema (comprimido) para uma extração barata e completa
    setup       Prepara o motor de execução do Lumen nos agentes
    validate    Confere as tasks de uma feature: lumen validate <feature>
    build       Constrói o SISTEMA INTEIRO a partir da documentação (ou: lumen build <feature>)
    review      Revisa e corrige o código de uma feature: lumen review <feature>
    status      Mostra o estágio atual do ciclo
    uninstall   Remove o Lumen (só o que ele criou)

  Depois de instalar, abra seu agente de IA e digite /lumen.
  O motor de execução é interno e automático — você só usa comandos lumen.
  `);
  process.exit(0);
}

if (!commands[command]) {
  console.error(`\n  Comando desconhecido: "${command}". Rode "lumen --help".\n`);
  process.exit(1);
}

const mod = await commands[command]();
await mod.default(args);
