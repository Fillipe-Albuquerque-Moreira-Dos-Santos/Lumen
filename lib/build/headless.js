// Como rodar cada agente em modo HEADLESS (sem TTY, não interativo) — é o que
// permite ter VÁRIOS agentes trabalhando ao mesmo tempo, cada um no seu processo,
// com a saída indo pra um log (o terminal fica livre pro painel).

const BUILDERS = {
  // Claude Code: -p/--print roda o prompt e sai; skip-permissions deixa autônomo.
  claude: (prompt, { skip }) => ({ cmd: 'claude', args: [...(skip ? ['--dangerously-skip-permissions'] : []), '-p', prompt] }),
  // Codex: `exec` já é não-interativo e autônomo.
  codex: (prompt, { skip }) => ({ cmd: 'codex', args: ['exec', ...(skip ? ['--full-auto'] : []), prompt] }),
};

// Agentes que sabemos rodar em paralelo (headless). Cursor/Gemini ficam no
// caminho de um-agente-interativo por enquanto.
export const HEADLESS_AGENTS = Object.keys(BUILDERS);

export function supportsHeadless(agentCmd) {
  return Boolean(BUILDERS[agentCmd]);
}

// Devolve { cmd, args } para spawnar o agente headless, ou null se não suportado.
export function headlessSpec(agentCmd, prompt, opts = {}) {
  const f = BUILDERS[agentCmd];
  return f ? f(prompt, opts) : null;
}
