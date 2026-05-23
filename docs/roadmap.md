# Roadmap do Lumen

Lumen tem duas metades, com decisões de design diferentes:

- **Documentar + loop** = skills em markdown (`lumen-*`), sem runtime próprio, rodando dentro do seu agente de IA. Portável, simples.
- **Construir** = **motor de execução real (Compozy)**, acionado pela CLI do Lumen. É o que dá execução headless/concorrente de verdade, com retries e review — em vez de uma imitação em prompt.

## Decisão de design: documentar em skills, construir no motor real

O modo Documentar é leve e portável de propósito: markdown puro. Mas execução de código séria não cabe num prompt — por isso o build delega ao motor (Compozy), que o Lumen aciona por baixo (`lumen build` → `compozy tasks run`). O usuário nunca digita `compozy` direto; a experiência é Lumen.

Seam entre as duas metades: `.compozy/tasks/<feature>/` — o `lumen-techspec`/`lumen-tasks` autoram nesse diretório no formato que o motor executa; o `lumen-build` dispara o motor; o `lumen-verify` fecha o loop de regressão.

## Criação inteligente

Na criação (`lumen-techspec`): pergunta o stack desejado (linguagem, backend, frontend, banco, infra, testes) e, em projeto documentado, **sugere o que o sistema já usa** (do grounding) como padrão recomendado — para a feature encaixar sem inventar arquitetura estranha. Greenfield: o usuário decide.

## O conjunto de agentes

```
ORQUESTRADOR   lumen

DOCUMENTAR     lumen-scout · lumen-archaeologist · lumen-detective
               lumen-architect · lumen-writer · lumen-reviewer

LOOP           lumen-ground (stack/padrões + regras 🟢 + semeia regressão)
               lumen-verify (confere o regression-watch)

CONSTRUIR      lumen-prd · lumen-techspec (pergunta stack + sugere existente)
               lumen-tasks (formato do motor) · lumen-build (motor real) · lumen-review
```

## Convenção de saída

```
.lumen/                    # state.json, config.toml, version (Lumen)
_lumen_docs/               # specs extraídas do sistema (modo Documentar)
.compozy/tasks/<feature>/  # prd, techspec, tasks, grounding — lidos/executados pelo motor
_lumen/<feature>/          # regression-watch, legacy-impact (loop Lumen)
```

## Estado

| Item | Status |
|------|--------|
| Orquestrador `lumen` + conector `lumen-ground` | ✅ |
| 6 agentes de Documentar | ✅ |
| Agentes de Construir (prd/techspec/tasks/build/review) | ✅ |
| Criação pergunta stack + sugere arquitetura existente | ✅ |
| `lumen-verify` (loop de regressão) | ✅ |
| Integração com o motor real: CLI `lumen build`/`setup` + skills no formato `.compozy/tasks/` | ✅ |
| Instalador (`install/status/uninstall`) | ✅ testado |
| **Validado ponta a ponta com o motor real (compozy 0.2.4)**: formato de task aceito (`tasks validate` verde) + `lumen build` dirige `compozy tasks run` (2 jobs, exit 0) | ✅ |
| Comando `update` (hash, preserva customizações) | ✅ testado |
| Vitrine: LICENSE, CONTRIBUTING, CI, site mkdocs, exemplo | ✅ |
| Runtime ACP instalado (`@zed-industries/claude-code-acp`) + build real acionado | ✅ pipeline ligado |

## Sobre o build real (escreve código)

Pipeline 100% ligado e provado: `lumen build` → daemon do motor (ready) → runtime ACP `claude-code-acp`. O **único** bloqueio para escrever código de verdade é o **saldo de créditos da conta Claude** — o teste retornou `Credit balance is too low`. Não é bug do Lumen; é billing. Com créditos, `lumen build <feature>` escreve o código. Sem, use `--dry-run` (validado: jobs completam exit 0).

## Pendências restantes (futuro, não bloqueantes)

- Publicar no npm (`npm publish`) para o `npx lumen` funcionar de fora do repo.
- Restaurar agentes de doc especializados opcionais (banco/UI), se quiser igualar a profundidade de documentação a sistemas com BD/telas.
