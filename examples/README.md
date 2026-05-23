# Exemplo: do sistema ao código, em um ciclo

Um passo a passo do ciclo Lumen num projeto fictício `loja-api` (Node + Express + PostgreSQL).

## 1. Instalar

```bash
cd loja-api
npx lumen install
lumen setup
```

## 2. Documentar

```
/lumen
```

O Lumen roda o pipeline de documentação e gera, por exemplo:

```
_lumen_docs/
├── architecture.md          # camadas controller → service → repo
├── domain.md                # 🟢 "pedido só é faturado se pago"; 🟡 ...
├── erd-complete.md          # Pedido, Item, Cliente, Pagamento
└── pedidos/requirements.md  # spec da unit de pedidos
```

Ao terminar, ele sugere: *"Quer construir uma feature? Me diga em uma frase."*

## 3. Construir uma feature

Você: *"adicionar cupom de desconto no checkout"*.

- `lumen-fundamento` gera `_lumen/cupom-desconto/_lumen-context.md` com o **stack** (Node + Express + PG), os **componentes** do checkout e a regra 🟢 "pedido só é faturado se pago" como restrição.
- `lumen-projeto-tecnico` **pergunta o stack** — e como o sistema já é Node + Express + PG, **sugere manter**. Você confirma. Desenha a arquitetura no mesmo padrão de camadas.
- `lumen-tarefas` quebra em `task_01.md`, `task_02.md`… no formato do motor.
- `lumen build cupom-desconto` → o motor escreve o código de verdade.
- `lumen-auditor` revisa e corrige.

## 4. Verificar

```
/lumen   (modo Verificar)
```

`lumen-verificador` re-extrai e confere o `regression-watch`:

```
🟢 W001  "pedido só é faturado se pago"  — intacto
🟢 W002  "total nunca negativo"          — intacto
```

Nenhuma regra confirmada regrediu. Ciclo fechado.
