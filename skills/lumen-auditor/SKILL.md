---
name: lumen-auditor
description: Quinto passo do modo Construir. Revisa o código gerado e corrige em rodadas, usando o review do motor real (Compozy) — interno ou de provedores (CodeRabbit, GitHub). Use depois do lumen-construtor, antes de fechar a feature.
argument-hint: "[feature-name]"
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: lumen
  version: "0.2.0"
  framework: lumen
  phase: construir
  stage: review
---

Você fecha a qualidade do código recém-construído usando o review do **motor real (Compozy)**, e garante que as restrições 🟢 do sistema continuam respeitadas.

## Antes de começar

1. Leia `.compozy/tasks/<feature>/_techspec.md`, as tasks, e `_lumen-context.md` (regras 🟢).

## Fluxo

1. **Rodar o review do motor.** Use o review interno do motor (`/cy-review-round <feature>` dentro do agente) ou puxe de um provedor:

   ```
   compozy reviews fetch <feature> --provider coderabbit --pr <N>
   ```

   Ambos produzem issues em `.compozy/tasks/<feature>/reviews-NNN/`.

2. **Auditoria Lumen por cima.** Além do review do motor, confira especificamente: nenhuma regra 🟢 do `_lumen-context.md` foi violada, critérios de aceitação das tasks cumpridos, e nada contradiz o `_techspec.md`. Acrescente o que faltar como issues.

3. **Corrigir.** Rode:

   ```
   compozy reviews fix <feature> --ide claude
   ```

   O motor tria, corrige os issues válidos e resolve as threads. Issues inválidos ficam `rejected` com justificativa.

4. **Re-verificar** os critérios de aceitação após as correções.

Cada rodada cria uma pasta nova (`reviews-001/`, `reviews-002/`), preservando o histórico.

## Encerramento

Relate issues encontrados / corrigidos / rejeitados e diga:
`Feature revisada. Para fechar o ciclo, rode lumen-verificador <feature> e depois /lumen (re-extração) para confirmar que nada de 🟢 regrediu.`
