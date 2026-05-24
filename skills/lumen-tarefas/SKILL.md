---
name: lumen-tarefas
description: Terceiro passo do modo Construir. Quebra o TechSpec em tasks atômicas no FORMATO DO MOTOR (formato do motor, v2), gravadas em _lumen/<feature>/, prontas para o `lumen build`. Cada task carrega também as restrições 🟢 do sistema. Use quando há _techspec.md e falta a decomposição.
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

Você decompõe o TechSpec em tasks que o **motor de execução do Lumen** consegue rodar uma a uma, na ordem certa. As tasks vão para `_lumen/<feature>/` — o diretório que o motor lê — no formato v2 exato, senão `lumen validate` rejeita.

## Antes de começar

1. Leia `_lumen/<feature>/_techspec.md` e `_lumen/<feature>/_lumen-context.md` (grounding, se houver).
2. Explore a base de código para ancorar cada task em arquivos e padrões reais.

## Formato obrigatório (formato do motor, v2)

Para cada task, escreva `_lumen/<feature>/task_NN.md` começando com este frontmatter YAML:

```md
---
status: pending
title: <título imperativo e específico>
type: backend | frontend | docs | test | infra | refactor | chore | bugfix
complexity: low | medium | high | critical
bloco: <Nome do bloco temático ao qual esta task pertence>
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
- Restrições 🟢 do sistema abaixo NÃO podem ser quebradas
- FOQUE no "o quê", não no "como"
- TESTES obrigatórios nas entregas
</critical>

## Restrições 🟢 do sistema
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

## Blocos temáticos (obrigatório)

Agrupe as tasks em **blocos por tema** — cada bloco reúne as tasks relacionadas a um mesmo assunto/fluxo (ex.: "Autenticação", "Pedidos", "Notificações"). Você decide os temas pela afinidade funcional do que está construindo.

- **Toda task leva um `bloco:`** no frontmatter (o mesmo nome exato para as tasks do mesmo tema). É um campo extra que o motor tolera — não quebra o `lumen validate`.
- **Dependências respeitam a ordem dos blocos:** uma task só pode depender de tasks do **mesmo bloco** ou de **blocos anteriores** — nunca de um bloco posterior. Assim cada bloco é construível assim que os anteriores estão prontos.
- Mantenha os blocos coesos (um tema cada) e numa quantidade enxuta (tipicamente 2–6). Numere as tasks de forma que as do mesmo bloco fiquem contíguas.

Depois de gravar as tasks, escreva o índice em **`_lumen/<feature>/_plan.md`** (espelha os blocos para leitura humana):

```md
# Plano de construção — <feature>

> Blocos temáticos. Cada bloco agrupa tasks relacionadas; a ordem respeita as dependências.
> Construa um bloco por vez com: `lumen build <feature> --bloco "<nome>"`

## Bloco 1 — <Tema>
- [ ] task_01 — <título>
- [ ] task_02 — <título>

## Bloco 2 — <Tema>
- [ ] task_03 — <título>
```

## Encerramento

Valide e siga:

```
lumen validate --name <feature>
```

Se passar, diga: `Próximo: lumen-construtor <feature> (executa no motor real) — ou construa um bloco por vez com lumen build <feature> --bloco "<nome>". Digite CONTINUAR.`
