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

## Fase 1 — Intenção, stack e arquitetura

### Passo 1 — Qual é a intenção? (define tudo)

Saiba o que o usuário quer (pergunte se não estiver claro):

| Intenção | Como sugerir o stack |
|----------|----------------------|
| **Evoluir no stack atual** (add/altera mantendo a tecnologia) | Confirme o que o sistema já usa (do grounding/`architecture.md`) — pré-selecionado. Em modo simples, **uma única pergunta** de confirmação. |
| **Modernizar / reconstruir** (trocar stack ou subir versões) | **🛑 NUNCA sugira "manter como está".** Proponha o **moderno** e deixe o usuário escolher **cada detalhe, com versão exata** (Passo 2). |
| **Greenfield** (sistema novo) | Não há o que espelhar — sugira o stack ideal e deixe escolher, sempre com versão exata. |

### Passo 2 — Escolha granular do stack (sempre versão exata, decisão do usuário)

**Nada genérico** ("Java", "Node"). Para **cada camada**, ofereça opções e, ao escolher uma linguagem/framework, **abra um submenu da versão exata**. Você marca a recomendada com ⭐ (LTS/atual), mas **quem decide cada item é o usuário** — sempre com **"outra — eu digito"**.

**Linguagem → versão (submenu):**
- **Java** → 17 (LTS) ⭐ · 21 (LTS) · 26 · outra
- **Node.js** → 20 (LTS) · 22 (LTS) ⭐ · 24 · outra
- **Python** → 3.11 · 3.12 ⭐ · 3.13 · outra
- **Go** → 1.22 · 1.23 ⭐ · outra
- **C# / .NET** → 8 (LTS) ⭐ · 9 · outra
- (ou outra linguagem que o usuário pedir → pergunte a versão)

**Backend framework → versão:** se escolheu Java → Spring Boot 3.3.x ⭐ · 3.4.x · Quarkus 3.x · Micronaut 4.x · outra. Node → NestJS 11 · Express 5 · Fastify 5 · outra. Python → FastAPI · Django 5.x · Flask 3.x · outra. (Sempre com submenu de versão.)

**Frontend (se houver) → versão:** React 19 · Vue 3.x · Angular 18+ · Svelte 5 · outra.
**Banco → versão:** PostgreSQL 17 · MySQL 8.x · MongoDB 7 · outra.
**Testes / infra-deploy:** idem — opção + versão.

> Em **modernização**, percorra todas as camadas com esses submenus. Em **evoluir no stack atual** (modo simples), basta confirmar o stack existente numa pergunta. Em qualquer caso, **registre as escolhas num ADR**.

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
