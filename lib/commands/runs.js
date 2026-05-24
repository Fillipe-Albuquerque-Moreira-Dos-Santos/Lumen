import { engineRun } from '../engine/engine.js';

// `lumen runs <watch|attach|purge> [run-id]` — acompanha/gerencia execuções do motor
// que estão rodando em background (detached). Ex.:
//   lumen runs watch <run-id>    → acompanha o progresso (texto)
//   lumen runs attach <run-id>   → abre a TUI interativa do run
//   lumen runs purge             → limpa runs terminados
export default async function runs(args) {
  const res = engineRun(['runs', ...args]);
  process.exit(res.status ?? 0);
}
