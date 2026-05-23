# O método Lumen

Lumen é um ciclo de **evolução de software ancorada na verdade extraída**, num projeto só. Em vez de pedir para um agente "mexer no código e torcer", você primeiro extrai a verdade do que existe, constrói em cima dela, e verifica que a verdade continua de pé.

Três modos, em loop, no mesmo agente.

---

## 1. Documentar — entender

Você roda `/lumen` num projeto legado. O modo Documentar lê o código e produz specs executáveis em `_lumen_docs/`, cada afirmação marcada:

- 🟢 **CONFIRMADO** — extraído direto do código, citável com arquivo e linha.
- 🟡 **INFERIDO** — deduzido de padrões, pode estar errado.
- 🔴 **LACUNA** — não dá para determinar pelo código, precisa de humano.

Este modo **nunca toca no seu código**. Só lê e escreve em `.lumen/` e `_lumen_docs/`.

Agentes: `lumen-scout → lumen-archaeologist → lumen-detective → lumen-architect → lumen-writer → lumen-reviewer`.

---

## 2. Construir — fazer

Para uma feature, o Lumen primeiro **fundamenta** (`lumen-ground`): lê de `_lumen_docs/` o que é relevante e produz um grounding pack onde as regras 🟢 viram **restrições que o build não pode quebrar**. Também semeia o `regression-watch.md`.

Depois constrói, fundamentado:

`lumen-prd → lumen-techspec → lumen-tasks → lumen-build → lumen-review`

Só o `lumen-build` **escreve código de verdade** — e isso é dito explícito ao usuário antes de começar.

Em projeto novo (greenfield), pula o `lumen-ground` e começa no `lumen-prd`.

---

## 3. Verificar — fechar o loop

Depois do build, `lumen-verify` re-extrai o sistema e compara cada watch item do `regression-watch.md` contra a nova realidade:

- 🟢 → a regra continua verdadeira.
- 🟡 → mudou de forma, revisar.
- 🔴 → a regra confirmada **regrediu**. Alerta destacado.

---

## Por que isso é melhor do que documentar OU codar isolado

- Documentar isolado vira papel parado que envelhece.
- Codar isolado quebra regras de negócio que ninguém lembrava que existiam.
- **Junto**, cada feature é construída sobre a verdade confirmada e verificada contra ela. A documentação não envelhece porque o loop a re-extrai; o código não regride porque o watch contract o vigia.

É o mesmo agente fazendo as duas coisas, com a spec como memória entre elas.
