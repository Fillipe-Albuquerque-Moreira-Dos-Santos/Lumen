# Começando

## 1. Instalar o Lumen

Na raiz do seu projeto:

```bash
npx lumen install
```

O instalador detecta seus agentes de IA, copia os skills `lumen-*` para `.claude/skills/` e `.agents/skills/`, escreve o arquivo de entrada (CLAUDE.md / AGENTS.md / …), cria `.lumen/` e atualiza o `.gitignore`. Ele **nunca** modifica seu código — só cria arquivos novos.

## 2. Preparar o motor de execução

O build roda no motor **Compozy**, acionado pela CLI do Lumen. Instale uma vez:

```bash
npm install -g @compozy/cli   # ou: brew install compozy/compozy/compozy
lumen setup
```

Para um build que escreve código de verdade, você também precisa de um runtime ACP no PATH (ex.: `@zed-industries/claude-code-acp` para `--ide claude`).

## 3. Rodar o ciclo

No seu agente de IA:

```
/lumen
```

O Lumen detecta em que ponto o projeto está e conduz:

1. **Documenta** o sistema → `_lumen_docs/`.
2. **Sugere codar** uma feature; ao aceitar, pergunta o stack e sugere a arquitetura que o sistema já usa.
3. **Constrói** no motor real:

```bash
lumen build <feature>
```

4. **Verifica** a regressão:

```
/lumen   (modo Verificar)
```

## Comandos da CLI

```bash
lumen install      # instala os agentes Lumen
lumen update       # atualiza skills preservando suas customizações
lumen setup        # prepara o motor de execução
lumen build <f>    # executa o build de uma feature (motor real)
lumen status       # estágio atual do ciclo
lumen uninstall    # remove só o que o Lumen criou
```
