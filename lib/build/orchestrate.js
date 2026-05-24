import { dirname, join } from 'path';
import { mkdirSync } from 'fs';
import { runPool } from './pool.js';
import { makePanel } from './panel.js';
import { headlessSpec } from './headless.js';
import { inGitRepo, prepareWorktree, commitWorktree, mergeBranch, removeWorktree, deleteBranch, cleanupWorktreeRoot } from './worktree.js';

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
// concorrência, isolamento por git worktree e painel ao vivo. Devolve os estados finais.
export async function runParallel({ chalk, projectRoot, streams, agentCmd, skip, concurrency = 2, isolate = true }) {
  const logDir = join(projectRoot, '.lumen', 'build-logs');
  mkdirSync(logDir, { recursive: true });
  const gold = chalk.hex('#f5c518');

  // Isolamento: cada agente no seu worktree+branch (se estivermos num repo git).
  const useWt = isolate && inGitRepo(projectRoot);
  const wt = new Map();
  if (useWt) {
    for (const s of streams) { try { wt.set(s.id, prepareWorktree(projectRoot, s.id)); } catch { /* fica sem isolamento */ } }
  }

  const jobs = streams.map(s => {
    const spec = headlessSpec(agentCmd, s.kickoff, { skip });
    const w = wt.get(s.id);
    return { id: s.id, label: s.label, cmd: spec.cmd, args: spec.args, cwd: w ? w.dir : projectRoot, logFile: join(logDir, `${s.id}.log`) };
  });

  const iso = useWt && wt.size ? ` · isolados em git worktree` : '';
  console.log(gold(`\n  ${jobs.length} agentes em paralelo (até ${concurrency} por vez)${iso}. Logs em .lumen/build-logs/\n`));
  const panel = makePanel(chalk);
  panel.render(jobs.map(j => ({ ...j, state: 'queued' })));

  let lastDraw = 0;
  const states = await runPool(jobs, {
    concurrency,
    onUpdate: (st) => { const now = Date.now(); if (now - lastDraw > 120) { lastDraw = now; panel.render(st); } },
  });
  panel.render(states);
  panel.done();

  // Merge das branches de volta (sequencial), depois limpa os worktrees.
  const merges = [];
  if (useWt && wt.size) {
    console.log(chalk.gray('\n  Mesclando o trabalho dos agentes…'));
    for (const s of streams) {
      const w = wt.get(s.id);
      if (!w) continue;
      const st = states.find(x => x.id === s.id);
      let conflict = false;
      if (st && st.state === 'done') {
        commitWorktree(w.dir, `lumen: ${s.id}`);
        const r = mergeBranch(projectRoot, w.branch);
        conflict = r.conflict;
        merges.push({ id: s.id, label: s.label, ...r });
      } else {
        merges.push({ id: s.id, label: s.label, ok: false, skipped: true });
      }
      removeWorktree(projectRoot, w.dir);
      // Conflito → mantém a branch pro merge manual. Senão (falhou/vazia/mesclada) → apaga.
      if (!conflict) deleteBranch(projectRoot, w.branch);
    }
    cleanupWorktreeRoot(projectRoot);
  }

  const ok = states.filter(s => s.state === 'done');
  const bad = states.filter(s => s.state === 'failed');
  console.log('');
  if (bad.length) {
    console.log(chalk.red(`  ${bad.length} stream(s) falharam:`));
    for (const b of bad) {
      const why = b.last ? chalk.gray(`  — ${b.last}`) : '';
      console.log(chalk.red(`    ✗ ${b.label}`) + why + chalk.gray(`  (.lumen/build-logs/${b.id}.log)`));
    }
    // Erro mais comum: conta do agente sem créditos.
    if (bad.some(b => /credit balance is too low/i.test(b.last || ''))) {
      console.log('\n' + chalk.yellow('  ⚠ Sem créditos no agente.') + chalk.gray(' Recarregue e rode `lumen build` de novo — nada foi perdido.'));
    }
  }
  console.log(chalk.green(`  ${ok.length}/${states.length} stream(s) concluídas.`) + (bad.length ? '' : chalk.gray('  Tudo certo.')));
  if (merges.length) {
    const conflicts = merges.filter(m => m.conflict);
    const merged = merges.filter(m => m.ok);
    if (merged.length) console.log(chalk.gray(`  Merge: ${merged.length} branch(es) integradas.`));
    if (conflicts.length) {
      console.log(chalk.yellow(`  ${conflicts.length} branch(es) precisam de merge manual:`));
      for (const c of conflicts) console.log(chalk.yellow(`    • lumen/${c.id}`) + chalk.gray('  → `git merge lumen/' + c.id + '`'));
    }
  }
  return states;
}
