# Começando

## 1. Instalar o Lumen

Setup único na máquina (uma vez só):

```bash
git clone https://github.com/Fillipe-Albuquerque-Moreira-Dos-Santos/Lumen.git
cd Lumen && npm install && npm link
```

> O Lumen ainda não está publicado no npm — por isso instale via `git clone` + `npm link` (não use `npx lumen`, que puxaria um pacote homônimo de outro projeto). Sem `npm link`? Use `node /caminho/para/Lumen/bin/lumen.js` no lugar de `lumen`.

Depois, na raiz do **seu projeto**:

```bash
lumen install
```

O instalador detecta seus agentes de IA, copia os skills `lumen-*` para `.claude/skills/` e `.agents/skills/`, escreve o arquivo de entrada (CLAUDE.md / AGENTS.md / …), cria `.lumen/` e atualiza o `.gitignore`. Ele **nunca** modifica seu código — só cria arquivos novos.

## 2. Preparar o motor de execução

O Lumen tem um motor de execução interno, acionado automaticamente — você não instala nada à parte. Apenas prepare-o nos seus agentes uma vez:

```bash
lumen setup
```

Para um build que escreve código de verdade, o runtime do seu agente de IA precisa estar disponível (ex.: o adaptador ACP do Claude).

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
lumen build <f> --bloco "<nome>"  # constrói só um bloco temático
lumen status       # estágio atual do ciclo (com progresso por bloco)
lumen uninstall    # remove só o que o Lumen criou
```
