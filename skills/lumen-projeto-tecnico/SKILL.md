---
name: lumen-projeto-tecnico
description: Segundo passo do modo Construir. Na criação, PERGUNTA o stack desejado (linguagem, backend, frontend, banco, infra, testes) e SUGERE arquitetura/stack iguais aos que o sistema já usa (do grounding) para o código novo se encaixar. Produz o TechSpec em .compozy/tasks/<feature>/_techspec.md. Use quando há _prd.md e falta o desenho técnico.
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

Você desenha o **como**. Toda decisão técnica é fundamentada: primeiro no que o sistema já faz, depois no que a feature precisa. Os artefatos vão para `.compozy/tasks/<feature>/` (o diretório que o motor de execução lê).

## Antes de começar

1. Leia `.compozy/tasks/<feature>/_prd.md` como input primário. Se ausente, peça contexto e registre a ausência no resumo.
2. **Leia `.compozy/tasks/<feature>/_lumen-context.md` (grounding) se existir** — é a verdade confirmada do sistema: stack atual, padrões arquiteturais, regras 🟢 (restrições que o design não pode quebrar), modelo de dados. Não re-explore o que já está confirmado lá.
3. Se NÃO há grounding (greenfield), explore a base de código (se houver) para entender padrões e stack.

## Regra dura

Não escreva o `_techspec.md` até todas as fases estarem completas e o usuário aprovar o rascunho. Todo TechSpec é informado pela arquitetura existente — nunca por suposição.

## Fase 1 — Perguntas de stack e arquitetura (obrigatória)

Antes de desenhar, **pergunte ao usuário como ele quer o sistema** — uma pergunta por vez, múltipla escolha quando der. Cubra:

- **Linguagem(ns)** principal
- **Backend** (framework/runtime)
- **Frontend** (framework, se aplicável)
- **Banco de dados / persistência**
- **Infra / deploy** (se relevante)
- **Testes** (framework e nível de cobertura)

**Como sugerir (faça por ele):**

- **Projeto documentado:** leia do grounding/`_lumen_docs/architecture.md` o que o sistema **já usa** e ofereça isso como a opção **recomendada e pré-selecionada** em cada pergunta. Ex.: *"O sistema já usa Node + Express + PostgreSQL. Recomendo manter para a feature encaixar. Confirma, ou quer outra coisa?"* Mudar de stack é permitido, mas você registra o porquê num ADR.
- **Greenfield:** não há o que espelhar — apresente opções comuns e peça a escolha, sempre com um fallback "Outro — descreva".

O objetivo é que o usuário **só confirme** quando o sistema já tem um stack claro, e **decida** quando é projeto novo. Nunca invente o stack silenciosamente.

## Fase 2 — Desenhar fundamentado

1. **Proponha a arquitetura espelhando os padrões existentes.** Se o sistema usa, por exemplo, arquitetura em camadas, repositórios, e um certo padrão de erro, a feature segue o **mesmo** padrão. Desvios só com justificativa explícita em ADR. (Quando documentado, isto vem do grounding; quando greenfield, do stack escolhido na Fase 1.)
2. **ADRs** para cada decisão significativa, em `.compozy/tasks/<feature>/adrs/adr-NNN.md` (use `references/adr-template.md`): decisão, alternativas rejeitadas, consequências. Mudança de stack vs. o existente é sempre um ADR.
3. **Rascunhe o TechSpec** com `references/techspec-template.md`. YAGNI sem dó. Cada objetivo do PRD mapeia para um componente. Cada regra 🟢 do grounding aparece como restrição honrada. A seção de stack reflete as respostas da Fase 1.
4. **Revise** com o usuário (rascunho inteiro). Itere até aprovar.
5. **Salve** em `.compozy/tasks/<feature>/_techspec.md`.

## Encerramento

Confirme o caminho e diga: `Próximo: lumen-tarefas <feature>. Digite CONTINUAR.`
