---
name: lumen-tasks
description: Terceiro passo do modo Construir. Quebra o TechSpec em tasks atômicas no FORMATO DO MOTOR (Compozy task v2), gravadas em .compozy/tasks/<feature>/, prontas para o `compozy tasks run`. Cada task carrega também as restrições 🟢 do legado. Use quando há _techspec.md e falta a decomposição.
argument-hint: "[feature-name]"
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: lumen
  version: "0.2.0"
  framework: lumen
  phase: construir
  stage: tasks
---

Você decompõe o TechSpec em tasks que o **motor de execução (Compozy)** consegue rodar uma a uma, na ordem certa. As tasks vão para `.compozy/tasks/<feature>/` — o diretório que o motor lê — no formato v2 exato, senão `compozy tasks validate` rejeita.

## Antes de começar

1. Leia `.compozy/tasks/<feature>/_techspec.md` e `.compozy/tasks/<feature>/_lumen-context.md` (grounding, se houver).
2. Explore a base de código para ancorar cada task em arquivos e padrões reais.

## Formato obrigatório (Compozy task v2)

Para cada task, escreva `.compozy/tasks/<feature>/task_NN.md` começando com este frontmatter YAML:

```md
---
status: pending
title: <título imperativo e específico>
type: backend | frontend | docs | test | infra | refactor | chore | bugfix
complexity: low | medium | high | critical
dependencies:
  - task_01
  - task_02
---
```

E o corpo nesta estrutura (o motor espera estas seções):

```md
# Task N: <Título>

## Overview
<2-3 frases: o que entrega e por que importa.>

<critical>
- SEMPRE leia o _prd.md e _techspec.md antes de começar
- Restrições 🟢 do legado abaixo NÃO podem ser quebradas
- FOQUE no "o quê", não no "como"
- TESTES obrigatórios nas entregas
</critical>

## Restrições 🟢 do legado
- 🟢 <regra que esta task não pode quebrar> (de _lumen-context.md)

<requirements>
- <requisito técnico específico>
</requirements>

## Subtasks
- [ ] N.1 <o que fazer>

## Implementation Details
### Relevant Files
- `caminho/arquivo` — <motivo>
### Related ADRs
- [ADR-NNN: Título](../adrs/adr-NNN.md)

## Deliverables
- <saída concreta>
- Testes unitários **(OBRIGATÓRIO)**

## Tests
- Unit: [ ] caminho feliz / [ ] caminho de erro / [ ] casos de borda
- Cobertura alvo: >=80%

## Success Criteria
- Todos os testes passando
- <resultado mensurável>
```

## Regras

- **`title` (frontmatter) DEVE ser idêntico ao primeiro H1 sem o prefixo `Task N:`** — o motor valida isso (`title_h1_sync`). Ex.: frontmatter `title: Add JWT middleware` + corpo `# Task 1: Add JWT middleware`. Use o mesmo texto nos dois.
- `type` só pode ser: `backend`, `frontend`, `docs`, `test`, `infra`, `refactor`, `chore`, `bugfix`.
- `complexity`: `low`, `medium`, `high` ou `critical`.
- A primeira task (sem dependências) usa `dependencies: []`.
- Cada task é independentemente executável quando suas dependências estão satisfeitas.
- Grafo de dependências sem ciclos.
- Toda regra 🟢 relevante coberta por algum item de teste.
- Nunca crie task só de teste — testes vão dentro de cada task.

## Encerramento

Valide e siga:

```
compozy tasks validate --name <feature>
```

Se passar, diga: `Próximo: lumen-build <feature> (executa no motor real). Digite CONTINUAR.`
