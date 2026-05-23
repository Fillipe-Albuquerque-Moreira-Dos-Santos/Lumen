---
name: lumen-construtor
description: Quarto passo do modo Construir. Dispara a EXECUÇÃO REAL das tasks pelo motor do Lumen (`lumen build <feature>` → `lumen build`), não por imitação. Depois registra os rastros do loop Lumen (change-impact + regression-watch). Use quando as tasks já existem em _lumen/<feature>/ e o usuário quer codar.
argument-hint: "[feature-name]"
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: lumen
  version: "0.2.0"
  framework: lumen
  phase: construir
  stage: build
---

Você **não** escreve o código à mão. Quem executa as tasks é o **motor do Lumen**, sob a marca Lumen. Seu papel: garantir o pré-requisito, disparar o motor, e depois registrar os rastros que fecham o loop Lumen.

## Antes de começar

1. Confirme que existem tasks em `_lumen/<feature>/task_*.md` (geradas pelo `lumen-tarefas` no formato do motor). Se não houver, aborte apontando `lumen-tarefas`.
2. Resolva `work_folder` (padrão `_lumen`) e `output_folder` (padrão `_lumen_docs`).
3. Leia `_lumen/<feature>/_lumen-context.md` (grounding) se existir — as regras 🟢 são restrições que o build não pode quebrar; elas já estão embutidas nas tasks, mas tenha-as em mente para a auditoria pós-build.

## Passo 1 — Validar as tasks no motor

Rode no terminal:

```
lumen validate --name <feature>
```

Se acusar erro de formato, peça ao `lumen-tarefas` para corrigir antes de prosseguir.

## Passo 2 — Disparar a execução real

Rode:

```
lumen build <feature>
```

(que por baixo chama `lumen build <feature> --ide <engine>` — execução real, headless/concorrente, com retries e memória do motor). Acompanhe a saída. O motor implementa o código, valida e atualiza o status de cada task.

> ⚠️ É aqui que o código do projeto é realmente escrito — pelo motor. Deixe isso explícito ao usuário antes de disparar.

O motor é acionado automaticamente pelo `lumen build` — não há instalação manual. A primeira execução pode levar alguns segundos para preparar o motor.

## Resiliência — se o build for interrompido (créditos, rede, queda)

**Nada se perde.** O estado vive em disco a cada passo:

- Cada task carrega seu `status:` no próprio arquivo (`_lumen/<feature>/task_*.md`): as concluídas viram `done`, as demais ficam `pending`.
- O motor persiste o run em o armazenamento interno do motor e mantém memória entre execuções.
- Você também registra `_lumen/<feature>/progress.jsonl` (append-only) a cada task concluída.

**Para retomar:** rode `lumen build <feature>` de novo. O motor **pula as tasks `done`** e continua das `pending` (re-execução incremental — `include_completed` é `false` por padrão). A pior perda possível é a única task que estava no meio quando caiu — ela volta a `pending` e roda de novo limpa (o motor faz diff-check de worktree).

**Caso específico — créditos da conta acabaram** (`Credit balance is too low`): o trabalho já feito está salvo em disco e commitado pelas tasks `done`. Recarregue créditos e rode `lumen build <feature>` para continuar exatamente de onde parou. Informe isso ao usuário com calma — não há perda.

## Passo 3 — Registrar os rastros do loop Lumen

O motor executa, mas não conhece a verdade do sistema que o Lumen extraiu. Depois do build (mesmo parcial), gere:

1. **`_lumen/<feature>/change-impact.md`** — para cada arquivo tocado pelo motor (veja o diff/git), mapeie ao componente em `_lumen_docs/architecture.md`; classifique o impacto (regra-alterada, regra-nova, componente-novo, delta-de-dados, delta-de-contrato); liste regras 🟢 preservadas e modificadas.
2. **Atualize `_lumen/<feature>/regression-watch.md`** — para cada regra 🟢 alterada ou removida, ajuste o watch item (append nas seções novas; nunca reescreva histórico ou IDs antigos).

## Encerramento

Relate: o que o motor executou (tasks done/failed), caminhos de `change-impact.md` e `regression-watch.md`, e:
`Próximo: lumen-auditor <feature> (revisar o código) ou lumen-verificador <feature> (conferir regressão). Digite CONTINUAR.`

Nunca dispare a re-extração sozinho — é decisão do usuário.
