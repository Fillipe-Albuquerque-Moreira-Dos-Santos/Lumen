import { dirname, join } from 'path';
import { mkdirSync } from 'fs';
import { runPool } from './pool.js';
import { makePanel } from './panel.js';
import { headlessSpec } from './headless.js';

// Divide a construção em STREAMS independentes, cada uma para um agente próprio.
// - modernização (ou greenfield com front) → backend ∥ frontend (pastas desacopladas)
// - sistema documentado a evoluir → uma stream por unit (no lugar)
// - greenfield só backend → uma stream
export function computeStreams({ projectRoot, hasDocs, intent, name, stackLine, hasFrontend, units = [], desc = '', what = 'all' }) {
  const parent = dirname(projectRoot);
  const base = name;
  const common = `Modo HEADLESS autônomo: NÃO faça perguntas — decida o razoável seguindo a constituição .lumen/principles.md (OWASP + testes). `
    + `Gere as tarefas e RODE O MOTOR até o fim (lumen build <feature>). STACK travado (não troque): ${stackLine}`;

  const decoupled = (hasDocs && intent === 'pick') || (!hasDocs && hasFrontend);
  if (what === 'all' && decoupled) {
    const backDir = `${parent}/${base}-backend`;
    const frontDir = `${parent}/${base}-frontend`;
    const origin = hasDocs ? 'A partir de _lumen_docs/, construa' : `Crie do zero ("${desc}")`;
    return [
      { id: `${base}-backend`, label: 'Backend (API)',
        kickoff: `${origin} APENAS o BACKEND do sistema "${base}". Use a parte de backend do stack. DESTINO: ${backDir} (pasta própria, desacoplada do frontend e do legado). Exponha contratos REST conforme _lumen_docs/openapi/ se existir. Ao rodar o motor use a feature "${base}-backend". ${common}` },
      { id: `${base}-frontend`, label: 'Frontend (SPA)',
        kickoff: `${origin} APENAS o FRONTEND do sistema "${base}". Use a parte de frontend do stack. DESTINO: ${frontDir} (pasta própria, desacoplada do backend). Consuma a API do backend conforme os contratos documentados. Ao rodar o motor use a feature "${base}-frontend". ${common}` },
    ];
  }

  if (hasDocs && units.length) {
    return units.map(u => ({ id: u, label: `Unit: ${u}`,
      kickoff: `Construa a unit "${u}" a partir de _lumen_docs/${u}/ (requirements/design/tasks), NO LUGAR (dentro do projeto atual). Ao rodar o motor use a feature "${u}". ${common}` }));
  }

  return [{ id: base || 'app', label: 'Aplicação',
    kickoff: `${hasDocs ? 'Construa o sistema a partir de _lumen_docs/' : `Crie o sistema do zero ("${desc}")`} chamado "${base}". Ao rodar o motor use a feature "${base || 'app'}". ${common}` }];
}

// Roda as streams em paralelo (vários agentes ao mesmo tempo), com teto de
// concorrência e painel ao vivo. Devolve os estados finais.
export async function runParallel({ chalk, projectRoot, streams, agentCmd, skip, concurrency = 2 }) {
  const logDir = join(projectRoot, '.lumen', 'build-logs');
  mkdirSync(logDir, { recursive: true });

  const jobs = streams.map(s => {
    const spec = headlessSpec(agentCmd, s.kickoff, { skip });
    return { id: s.id, label: s.label, cmd: spec.cmd, args: spec.args, cwd: projectRoot, logFile: join(logDir, `${s.id}.log`) };
  });

  const gold = chalk.hex('#f5c518');
  console.log(gold(`\n  ${jobs.length} agentes em paralelo (até ${concurrency} por vez). Logs em .lumen/build-logs/\n`));
  const panel = makePanel(chalk);
  panel.render(jobs.map(j => ({ ...j, state: 'queued' })));

  let lastDraw = 0;
  const states = await runPool(jobs, {
    concurrency,
    onUpdate: (st) => { const now = Date.now(); if (now - lastDraw > 120) { lastDraw = now; panel.render(st); } },
  });
  panel.render(states);
  panel.done();

  const ok = states.filter(s => s.state === 'done');
  const bad = states.filter(s => s.state === 'failed');
  console.log('');
  if (bad.length) {
    console.log(chalk.red(`  ${bad.length} stream(s) falharam:`));
    for (const b of bad) console.log(chalk.red(`    ✗ ${b.label}`) + chalk.gray(`  → veja .lumen/build-logs/${b.id}.log`));
  }
  console.log(chalk.green(`  ${ok.length}/${states.length} stream(s) concluídas.`) + (bad.length ? '' : chalk.gray('  Tudo certo.')));
  return states;
}
