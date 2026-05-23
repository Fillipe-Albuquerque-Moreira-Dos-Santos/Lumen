# Template — _lumen_docs/confidence-report.md

Gerado pelo Revisor ao final da revisão.

---

## Estrutura do relatório

```markdown
# Relatório de Confiança — [Nome do Projeto]

> Gerado pelo Revisor em [data]

---

## Resumo Geral

| Nível | Quantidade | Percentual |
|-------|-----------|------------|
| 🟢 CONFIRMADO | [N] | [X%] |
| 🟡 INFERIDO   | [N] | [X%] |
| 🔴 LACUNA     | [N] | [X%] |
| **Total**     | [N] | 100% |

**Confiança geral:** [X%] (soma de 🟢 + metade dos 🟡)

---

## Por Spec

| Spec | 🟢 | 🟡 | 🔴 | Confiança |
|------|----|----|-----|-----------|
| `sdd/auth.md` | 8 | 3 | 1 | 79% |
| `sdd/orders.md` | 12 | 5 | 2 | 74% |
| `sdd/payments.md` | 6 | 8 | 4 | 56% |

---

## Lacunas Pendentes 🔴

Itens que permaneceram sem confirmação após a revisão:

### [Nome da Spec]
- **[Afirmação]** — [por que não foi possível confirmar]
  - Pergunta correspondente: `questions.md#pergunta-N`

---

## Como chegar a ≥95% (plano de melhoria)

> Inclua esta seção SEMPRE que a confiança geral estiver abaixo de 95%. Ordene as ações por **ganho ÷ esforço**.

**Confiança atual: [X]% → meta: ≥95%**

| # | Ação | O que fazer | Ganho estimado | Esforço |
|---|------|-------------|----------------|---------|
| 1 | Resolver 🔴 [tema] | Responder `questions.md#N` (ex.: qual rota é a oficial) | +[X]% | baixo |
| 2 | Confirmar 🟡 [tema] | Ler `arquivo:linha` / rodar o fluxo / validar com o time | +[X]% | médio |
| 3 | Destravar [bloqueio] | Ex.: restaurar arquivo corrompido (`git checkout`), adicionar testes | +[X]% | médio |

**Projeção:** passos 1–2 → ~[X]% · + passo 3 → ~[X]% ✅

> Se já estiver ≥95%: escreva "✅ Meta de confiança atingida — documentação pronta para evoluir com segurança."

---

## Histórico de Reclassificações

| De | Para | Afirmação | Evidência |
|----|------|-----------|-----------|
| 🔴 | 🟢 | [afirmação] | [arquivo:linha] |
| 🟡 | 🟢 | [afirmação] | [arquivo:linha] |
```

---

## Como calcular "Confiança geral"

```
confiança = (total_verde + total_amarelo * 0.5) / total * 100
```

Exemplo: 20 🟢 + 10 🟡 + 5 🔴 = 35 total
→ (20 + 5) / 35 = 71%
