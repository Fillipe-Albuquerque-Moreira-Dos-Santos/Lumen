import { spawn } from 'child_process';
import { createWriteStream } from 'fs';

// Pool de concorrência: roda `jobs` em paralelo, no máximo `concurrency` por vez.
// Cada job: { id, label, cmd, args, cwd, logFile }. Saída vai pro logFile (terminal
// fica limpo pro painel). onUpdate(states[]) é chamado a cada mudança de estado.
// Resolve com a lista final de estados ({ ...job, state, code, startedAt, endedAt, last }).
export function runPool(jobs, { concurrency = 2, onUpdate = () => {} } = {}) {
  return new Promise((resolve) => {
    const states = jobs.map(j => ({ ...j, state: 'queued', code: null, startedAt: null, endedAt: null, last: '' }));
    const byId = new Map(states.map(s => [s.id, s]));
    let next = 0;
    let active = 0;
    let finished = 0;

    const touch = () => onUpdate(states);

    const startOne = (job) => {
      const st = byId.get(job.id);
      st.state = 'running';
      st.startedAt = Date.now();
      active += 1;
      touch();

      const out = job.logFile ? createWriteStream(job.logFile) : null;
      const child = spawn(job.cmd, job.args, {
        cwd: job.cwd || process.cwd(),
        stdio: ['ignore', out ? 'pipe' : 'ignore', out ? 'pipe' : 'ignore'],
      });
      if (out && child.stdout) {
        child.stdout.pipe(out, { end: false });
        child.stdout.on('data', d => { const line = d.toString().trim().split('\n').pop(); if (line) { st.last = line; touch(); } });
      }
      if (out && child.stderr) child.stderr.pipe(out, { end: false });

      const done = (code) => {
        if (st.endedAt) return;
        active -= 1;
        finished += 1;
        st.state = code === 0 ? 'done' : 'failed';
        st.code = code;
        st.endedAt = Date.now();
        if (out) out.end();
        touch();
        pump();
      };
      child.on('exit', code => done(code ?? 1));
      child.on('error', err => { st.last = err.message; done(-1); });
    };

    const pump = () => {
      if (finished >= jobs.length) return resolve(states);
      while (active < concurrency && next < jobs.length) startOne(jobs[next++]);
    };

    if (!jobs.length) return resolve(states);
    pump();
  });
}
