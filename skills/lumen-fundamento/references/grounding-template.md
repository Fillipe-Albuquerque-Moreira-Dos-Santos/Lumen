# Grounding pack — `<feature>`

> Gerado pelo `lumen-fundamento` a partir de `_lumen_docs/`.
> Input fundamentado para `lumen-projeto-tecnico`. Verdade confirmada — não re-explore o que está resolvido aqui.

## Stack e padrões do sistema

> O `lumen-projeto-tecnico` usa isto para **sugerir o mesmo stack/arquitetura** na criação, para a feature se encaixar.

| Aspecto | O sistema usa | Origem |
|---------|---------------|--------|
| Linguagem(ns) | `<ex.: TypeScript>` | `architecture.md` |
| Backend | `<ex.: Node + Express>` | `architecture.md` |
| Frontend | `<ex.: React, ou n/a>` | `architecture.md` |
| Banco / persistência | `<ex.: PostgreSQL via Prisma>` | `erd-complete.md` |
| Padrões | `<ex.: camadas controller→service→repo, erros via Result>` | `architecture.md` / `adrs/` |
| Testes | `<ex.: Jest, ~70% cobertura>` | `architecture.md` |

## Componentes em escopo

| Componente | Responsabilidade | Origem |
|------------|------------------|--------|
| `<nome>` | `<uma linha>` | `architecture.md#<seção>` |

## Regras a honrar

> 🟢 = confirmado no código, restrição que o build NÃO pode quebrar.
> 🟡 = inferido, validar no techspec. 🔴 = lacuna, questão aberta para o usuário.

| Conf. | Regra | Origem |
|-------|-------|--------|
| 🟢 | `<regra>` | `domain.md#<seção>` |
| 🟡 | `<regra>` | `domain.md#<seção>` |
| 🔴 | `<questão aberta>` | `gaps.md` / `questions.md` |

## Fatia do modelo de dados

```mermaid
erDiagram
  %% só a parte relevante de erd-complete.md
```

## Arquivos do legado a editar

| Arquivo | Unit que cobre | Nota |
|---------|----------------|------|
| `<caminho>` | `<unit>/` | `<por que a feature toca aqui>` |

## Questões abertas (🔴) para levantar no techspec

- `<questão>` — precisa de decisão humana antes de implementar.

---

Próximo: `lumen-projeto-tecnico <feature>` — este pack é seu input fundamentado; não re-explore o que já está confirmado aqui.
