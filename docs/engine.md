# O motor de execução

O modo **Documentar** e o **loop** são 100% Lumen — skills em markdown que rodam dentro do seu agente, sem runtime próprio.

Para a **execução** do build, o Lumen usa o **Compozy** como motor: execução headless e concorrente de verdade, com retries, memória entre runs e review. Em vez de imitar isso num prompt, o Lumen delega ao motor real.

## Como funciona

```
lumen-techspec / lumen-tasks   →   .compozy/tasks/<feature>/   →   lumen build
   (autoram no formato do motor)        (o seam)                    (= compozy tasks run)
```

- `lumen-tasks` grava as tasks em `.compozy/tasks/<feature>/` no formato v2 que o motor executa (validado por `compozy tasks validate`).
- `lumen build <feature>` aciona `compozy tasks run` por baixo. **Você nunca digita `compozy` direto** — a experiência é Lumen.
- `lumen-review` usa o review do motor (`compozy reviews`).

## Instalação do motor

```bash
npm install -g @compozy/cli   # ou brew/go
lumen setup                   # prepara o motor nos seus agentes
```

## Build real vs. dry-run

- `lumen build <feature> --dry-run` valida o pipeline sem executar o agente de código.
- Um build que **escreve código** precisa de um runtime ACP no PATH para o `--ide` escolhido — ex.: `@zed-industries/claude-code-acp` para `--ide claude`.

## Por que não foi tudo embutido

Execução de código séria não cabe num prompt de 60 linhas. Reescrever um motor de execução completo seria reinventar (e manter) algo enorme. Lumen foca no que é seu — documentar e fechar o loop de regressão — e usa um motor maduro para executar.
