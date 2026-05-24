// Painel de progresso ao vivo para os agentes em paralelo.
// Redesenha as mesmas linhas no lugar (cursor up + limpa linha), então o terminal
// mostra um quadro estável que se atualiza enquanto os agentes trabalham.

const GOLD = '#f5c518';

export function makePanel(chalk) {
  let drawn = 0;
  const gold = chalk.hex(GOLD);
  const icon = (s) => ({
    queued: chalk.gray('•'),
    running: gold('▶'),
    done: chalk.green('✓'),
    failed: chalk.red('✗'),
  }[s] || ' ');

  const fmtDur = (st) => {
    if (!st.startedAt) return '';
    const ms = (st.endedAt || Date.now()) - st.startedAt;
    const s = Math.round(ms / 1000);
    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${String(s % 60).padStart(2, '0')}s`;
  };

  const padEndVis = (s, n) => (s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length));

  return {
    render(states) {
      const rows = states.map(st => {
        const tail = st.state === 'running' && st.last ? chalk.gray('  ' + st.last.slice(0, 44)) : '';
        const dur = chalk.gray(fmtDur(st).padStart(6));
        return `  ${icon(st.state)} ${chalk.white(padEndVis(st.label, 24))} ${chalk.gray(padEndVis(st.state, 8))} ${dur}${tail}`;
      });
      if (drawn) process.stdout.write(`\x1b[${drawn}A`);
      process.stdout.write(rows.map(r => '\x1b[2K' + r).join('\n') + '\n');
      drawn = rows.length;
    },
    done() { drawn = 0; },
  };
}
