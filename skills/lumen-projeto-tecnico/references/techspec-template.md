# TechSpec — `<feature>`

## Resumo executivo
Uma frase do que será construído + o principal trade-off técnico da abordagem escolhida.

## Restrições do sistema honradas
> Das regras 🟢 do `_lumen-context.md` (grounding). Estas NÃO podem ser quebradas pela implementação.

- 🟢 `<regra>` → como o design a respeita.

## Arquitetura do sistema
Componentes, suas responsabilidades e fronteiras. Onde cada um vive na base de código.

## Modelo de dados
Entidades, relações, mudanças de schema. Em projeto documentado, reuse o ERD de `_lumen_docs/`.

## Design de API / contratos
Endpoints, payloads, eventos, contratos internos.

## Interfaces core
Pelo menos uma definição de tipo/interface principal da qual outros componentes dependem (bloco de código, ≤20 linhas).

## Estratégia de testes
O que testar e como provar que as restrições 🟢 continuam válidas.

## Ordem de construção (sequencing)
Passos numerados; cada passo após o primeiro declara de quais passos anteriores depende.

## Architecture Decision Records
- ADR-001 — `<título>` — `<uma linha>` → [`adrs/adr-001.md`](adrs/adr-001.md)
