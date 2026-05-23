# O ciclo

Lumen é um ciclo de **evolução ancorada na verdade extraída**. Três modos, em loop.

## 1. Documentar

`/lumen` no projeto. Os agentes leem o código e produzem specs em `_lumen_docs/`, cada afirmação marcada:

- 🟢 **CONFIRMADO** — extraído direto do código, citável com arquivo e linha.
- 🟡 **INFERIDO** — deduzido de padrões, pode estar errado.
- 🔴 **LACUNA** — precisa de validação humana.

Pipeline: `lumen-mapeador → lumen-analista → lumen-investigador → lumen-arquiteto → lumen-redator → lumen-revisor`. Nunca toca no seu código.

## 2. Construir

Para uma feature, o Lumen primeiro **fundamenta** (`lumen-fundamento`): lê de `_lumen_docs/` o que é relevante, extrai o **stack e os padrões** do sistema, e marca as regras 🟢 como restrições. Também semeia o `regression-watch`.

Na **criação** (`lumen-projeto-tecnico`), o Lumen **pergunta o stack** (linguagem, backend, frontend, banco, testes) e, em projeto documentado, **sugere o que o sistema já usa** como padrão recomendado — para o código novo encaixar sem inventar arquitetura estranha.

Pipeline: `lumen-requisitos → lumen-projeto-tecnico → lumen-tarefas → lumen-construtor → lumen-auditor`. Os artefatos vão para `.compozy/tasks/<feature>/` (o diretório do motor). O `lumen-construtor` dispara o **motor real** — é onde o código é escrito.

## 3. Verificar

Depois do build, `lumen-verificador` re-extrai e compara cada watch item do `regression-watch.md` contra a nova realidade:

- 🟢 a regra continua verdadeira.
- 🟡 mudou de forma, revisar.
- 🔴 a regra confirmada **regrediu** — alerta destacado.

## Por que isso é melhor

A documentação não envelhece porque o loop a renova; o código não regride porque o contrato de regressão o vigia. Mesmo agente, mesma verdade entre documentar e construir.

## Onde fica o quê

```
.lumen/                    # state, config, manifest (Lumen)
_lumen_docs/               # specs extraídas do sistema
.compozy/tasks/<feature>/  # prd, techspec, tasks, grounding (executados pelo motor)
_lumen/<feature>/          # regression-watch, legacy-impact (loop Lumen)
```
