---
name: lumen-projeto-tecnico
description: Segundo passo do modo Construir. Na criação, PERGUNTA o stack desejado (linguagem, backend, frontend, banco, infra, testes) e SUGERE arquitetura/stack iguais aos que o sistema já usa (do grounding) para o código novo se encaixar. Produz o TechSpec em _lumen/<feature>/_techspec.md. Use quando há _prd.md e falta o desenho técnico.
argument-hint: "[feature-name]"
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: lumen
  version: "0.2.0"
  framework: lumen
  phase: construir
  stage: techspec
---

Você desenha o **como**. Toda decisão técnica é fundamentada: primeiro no que o sistema já faz, depois no que a feature precisa. Os artefatos vão para `_lumen/<feature>/` (o diretório que o motor de execução lê).

## Antes de começar

1. Leia `_lumen/<feature>/_prd.md` como input primário. Se ausente, peça contexto e registre a ausência no resumo.
2. **Leia `_lumen/<feature>/_lumen-context.md` (grounding) se existir** — é a verdade confirmada do sistema: stack atual, padrões arquiteturais, regras 🟢 (restrições que o design não pode quebrar), modelo de dados. Não re-explore o que já está confirmado lá.
3. Se NÃO há grounding (greenfield), explore a base de código (se houver) para entender padrões e stack.

## Regra dura

Não escreva o `_techspec.md` até todas as fases estarem completas e o usuário aprovar o rascunho. Todo TechSpec é informado pela arquitetura existente — nunca por suposição.

## Fase 1 — Stack e arquitetura

> **Modo automático / simples (poucas perguntas):** em projeto **documentado**, NÃO faça a bateria de perguntas — **confirme o stack que o sistema já usa numa ÚNICA pergunta** (ex.: *"Vou manter Java/Spring + Vue + PostgreSQL, que é o que o sistema usa. Ok? (Enter confirma)"*) e infira o resto da documentação; só pergunte algo a mais se houver um **fork de design real**. Em **greenfield**, pergunte linguagem + backend + frontend **de uma vez só**. Nada de questionário longo.

No modo **manual/detalhado**, aprofunde — **pergunte ao usuário como ele quer o sistema** (uma pergunta por vez, múltipla escolha quando der). Cubra:

- **Linguagem(ns)** principal
- **Backend** (framework/runtime)
- **Frontend** (framework, se aplicável)
- **Banco de dados / persistência**
- **Infra / deploy** (se relevante)
- **Testes** (framework e nível de cobertura)

**Como sugerir (faça por ele):**

- **Projeto documentado:** leia do grounding/`_lumen_docs/architecture.md` o que o sistema **já usa** e ofereça isso como a opção **recomendada e pré-selecionada** em cada pergunta. Ex.: *"O sistema já usa Node + Express + PostgreSQL. Recomendo manter para a feature encaixar. Confirma, ou quer outra coisa?"* Mudar de stack é permitido, mas você registra o porquê num ADR.
- **Greenfield:** não há o que espelhar — **sugira o stack e a arquitetura ideais** para o que ele quer construir (veja "Sugerir arquiteturas ideais" abaixo), recomende uma, e deixe escolher (sempre com "Outro — descreva").

O objetivo é que o usuário **só confirme** quando o sistema já tem um stack claro, e **escolha entre boas opções sugeridas** quando é projeto novo. Nunca invente o stack silenciosamente, nem deixe o usuário no vácuo — **sempre traga sugestões fundamentadas**.

### Sugerir arquiteturas ideais (greenfield ou quando o usuário quer melhorar)

Não pergunte "qual arquitetura?" no vácuo. **Proponha 2–3 arquiteturas adequadas** ao tipo de sistema e ao stack, cada uma com um trade-off em uma linha, e **recomende uma**. Ex. para uma API:

> "Para uma API nesse stack, sugiro:
> 1. **Camadas (controller→service→repository)** — simples e familiar; ideal pro tamanho atual. ⭐ recomendada
> 2. **Hexagonal / Ports & Adapters** — desacopla domínio de infra; melhor se for crescer muito.
> 3. **Vertical slices por feature** — cada caso de uso isolado; ótima pra times paralelos.
>
> Vou de **Camadas** se você não tiver preferência. Qual prefere?"

Registre a escolhida (e por que) num ADR.

## Fase 2 — Desenhar fundamentado

1. **Desenhe na arquitetura definida na Fase 1.** Em projeto documentado, **espelhe os padrões existentes** (camadas, repositórios, padrão de erro) — desvios só com ADR. Em greenfield, use a **arquitetura ideal escolhida** acima.
2. **ADRs** para cada decisão significativa, em `_lumen/<feature>/adrs/adr-NNN.md` (use `references/adr-template.md`): decisão, alternativas rejeitadas, consequências. Mudança de stack vs. o existente é sempre um ADR.
3. **Rascunhe o TechSpec** com `references/techspec-template.md`. YAGNI sem dó. Cada objetivo do PRD mapeia para um componente. Cada regra 🟢 do grounding aparece como restrição honrada. A seção de stack reflete as respostas da Fase 1.
4. **Revise** com o usuário (rascunho inteiro). Itere até aprovar.
5. **Salve** em `_lumen/<feature>/_techspec.md`.

## Encerramento

Confirme o caminho e diga: `Próximo: lumen-tarefas <feature>. Digite CONTINUAR.`
