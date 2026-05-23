# O motor de execução

O modo **Documentar** e o **loop** são skills em markdown que rodam dentro do seu agente de IA, sem runtime próprio.

Para a **execução** do build — escrever código de verdade, em lote, com retries e review — o Lumen tem um **motor de execução interno**. Você nunca o instala nem o invoca diretamente: o `lumen build` o aciona por baixo (preparado sob demanda na primeira vez). Toda a experiência é Lumen.

## Como funciona

```
lumen-projeto-tecnico / lumen-tarefas   →   _lumen/<feature>/   →   lumen build
        (autoram as tasks)                       (a fronteira)        (executa de verdade)
```

- `lumen-tarefas` grava as tasks em `_lumen/<feature>/` no formato que o motor executa (confira com `lumen validate`).
- `lumen build <feature>` executa as tasks de verdade — concorrência, retries, memória entre runs. **Você só usa comandos `lumen`.**
- `lumen review <feature>` roda a revisão sobre o código gerado.

## Não precisa instalar nada à parte

O motor é acionado automaticamente pelo `lumen build` / `lumen validate` / `lumen review`. Para um build que **escreve código**, o runtime do seu agente de IA precisa estar disponível (ex.: o adaptador ACP do Claude). Use `lumen build <feature> --dry-run` para validar o pipeline sem escrever código.

## Por que um motor

Execução de código séria — concorrente, com retries, memória e review — não cabe num prompt. O Lumen foca no que é dele (documentar, fundamentar, verificar regressão) e delega a execução a um motor maduro, sob a marca Lumen.
