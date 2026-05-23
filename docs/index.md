# ✦ Lumen

**Luz sobre o legado: documenta o que já existe e constrói o que vem a seguir.**

Um único agente para todo o ciclo de evolução de software — entender o sistema, evoluí-lo, e garantir que nada se quebrou. Roda dentro do seu agente de IA (Claude Code, Codex, Cursor...).

## Um projeto, um ciclo

| Modo | O que faz | Toca no seu código? |
|------|-----------|---------------------|
| 📖 **Documentar** | Lê o sistema e extrai specs rastreáveis (🟢 confirmado / 🟡 inferido / 🔴 lacuna) | Nunca |
| 🔨 **Construir** | Pega a spec e constrói: PRD → TechSpec → Tasks → Código → Review | Sim |
| 🔁 **Verificar** | Re-extrai e confere que nada de 🟢 regrediu | Nunca |

```
        📖 DOCUMENTAR  ──►  🔨 CONSTRUIR
             ▲                   │
             └── 🔁 VERIFICAR ───┘
```

## Por que

Sistemas reais carregam conhecimento preso no código. Documentar e codar costumam viver separados: a documentação envelhece, e o código novo quebra regras que ninguém lembrava. **Lumen une os dois num ciclo só** — extrai a verdade, constrói ancorado nela, e verifica que ela continua de pé.

## Próximo

- [Começando](getting-started.md) — instalar e rodar o primeiro ciclo.
- [O ciclo](the-cycle.md) — documentar → construir → verificar em detalhe.
- [Os agentes](agents.md) — os 17 agentes do Lumen.
- [O motor de execução](engine.md) — como o build roda de verdade.
