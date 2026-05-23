<div align="center">

# ✦ Lumen

**Luz sobre qualquer sistema — documenta o que existe e constrói o que vem a seguir.**

*Um único agente para todo o ciclo: entender o sistema, evoluí-lo, e garantir que nada se quebrou.*

<img src="https://img.shields.io/badge/license-MIT-f5c518?style=for-the-badge" alt="MIT">
<img src="https://img.shields.io/badge/node-%E2%89%A518-3c873a?style=for-the-badge&logo=node.js&logoColor=white" alt="Node 18+">
<img src="https://img.shields.io/badge/agentes-17-f5c518?style=for-the-badge" alt="17 agentes">
<br>
<img src="https://img.shields.io/badge/Claude%20Code-2d2d2d?style=flat-square">
<img src="https://img.shields.io/badge/Codex-2d2d2d?style=flat-square">
<img src="https://img.shields.io/badge/Cursor-2d2d2d?style=flat-square">
<img src="https://img.shields.io/badge/Gemini-2d2d2d?style=flat-square">
<img src="https://img.shields.io/badge/Windsurf-2d2d2d?style=flat-square">
<img src="https://img.shields.io/badge/+6%20engines-2d2d2d?style=flat-square">

</div>

---

## O que é

Lumen é **um só** agente — uma única instalação, uma única marca, um conjunto de skills em markdown que rodam dentro do seu agente de IA. Ele cobre **todo o ciclo** de evolução de software, em três modos amarrados por um loop:

| Modo | O que faz | Toca no seu código? |
|------|-----------|---------------------|
| 📖 **Documentar** | Lê o sistema e extrai specs executáveis e rastreáveis (🟢 confirmado · 🟡 inferido · 🔴 lacuna) | **Nunca** |
| 🔨 **Construir** | Pega a spec e constrói: requisitos → projeto técnico → tarefas → código → revisão | Sim, é o trabalho dele |
| 🔁 **Verificar** | Re-extrai e confere que nenhuma regra confirmada (🟢) regrediu | **Nunca** |

```
        ┌──────────────────── Lumen ────────────────────┐
        │                                                │
        │   📖 DOCUMENTAR          🔨 CONSTRUIR           │
        │   sistema → specs   ──►   specs → código        │
        │        ▲                      │                 │
        │        │   🔁 VERIFICAR       │                 │
        │        └──── regressão ◄──────┘                 │
        │                                                │
        └────────────────────────────────────────────────┘
```

Funciona para **qualquer sistema** — legado, moderno ou em desenvolvimento; qualquer stack ou tipo (API, web, mobile, CLI, dados, infra, monolito, microsserviços).

---

## Por que o Lumen existe

Todo sistema carrega conhecimento preso no código: regras de negócio implícitas, decisões de arquitetura nunca escritas, lógica crítica que ninguém quer tocar. Agentes de IA são poderosos para evoluir software, mas precisam de **especificação confiável** para agir com segurança — e ela quase nunca existe.

Documentar e codar costumam viver separados: a documentação envelhece, e o código novo quebra regras que ninguém lembrava. **Lumen une os dois num ciclo só:**

1. **Extrai a verdade** do sistema, com cada afirmação rastreável até o código (`arquivo:linha`).
2. **Constrói** cada feature ancorada nessa verdade — sugerindo o stack e a arquitetura que o sistema já usa.
3. **Re-extrai e verifica** que as regras confirmadas continuam de pé.

A documentação não envelhece porque o loop a renova; o código não regride porque o contrato de regressão o vigia.

---

## Os 17 agentes

**Orquestrador** — `lumen` conduz documentar → construir → verificar.

### 📖 Documentar
| Agente | Papel |
|--------|-------|
| `lumen-mapeador` | Mapeia a superfície: estrutura, stack, dependências, **tipo de sistema** e docs/testes já existentes |
| `lumen-analista` | Análise profunda do código, módulo a módulo: algoritmos, fluxos, estruturas |
| `lumen-investigador` | Regras de negócio implícitas, ADRs, máquinas de estado + **DDD estratégico** (subdomínios, bounded contexts) |
| `lumen-arquiteto` | C4, ERD, integrações + **análise de acoplamento** (força/distância/volatilidade) |
| `lumen-redator` | Gera as specs como contratos operacionais rastreáveis |
| `lumen-revisor` | Revisa specs, acha contradições, valida lacunas |
| `lumen-banco` | Banco de dados: DDL, migrations, ORM, ERD, triggers |
| `lumen-design` | Design tokens: cores, tipografia, espaçamento, temas |
| `lumen-telas` | Documenta a interface a partir de screenshots |

### 🔁 Loop
| Agente | Papel |
|--------|-------|
| `lumen-fundamento` | Transforma a verdade extraída em input fundamentado para o build + semeia o contrato de regressão |
| `lumen-verificador` | Re-extrai e confere cada watch item (🟢/🟡/🔴) após o build |

### 🔨 Construir
| Agente | Papel |
|--------|-------|
| `lumen-requisitos` | Ideia → requisitos (o quê e o porquê) |
| `lumen-projeto-tecnico` | **Pergunta o stack** e **sugere a arquitetura que o sistema já usa** → projeto técnico |
| `lumen-tarefas` | Projeto técnico → tarefas executáveis |
| `lumen-construtor` | Constrói: executa as tarefas e escreve o código de verdade |
| `lumen-auditor` | Revisa e corrige o código gerado |

---

## A escala de confiança

Toda afirmação nas specs leva uma marca — é o que torna a documentação **confiável** e a base do contrato de regressão:

| Marca | Significado |
|-------|-------------|
| 🟢 **CONFIRMADO** | Extraído direto do código — citável com `arquivo:linha` |
| 🟡 **INFERIDO** | Deduzido de padrões — pode estar errado |
| 🔴 **LACUNA** | Não determinável pelo código — precisa de validação humana |

---

## Passo a passo — do `git clone` ao uso

**Pré-requisitos:** Node.js 18+ e um agente de IA (Claude Code, Codex, Cursor, Gemini...).

### 1. Clone o Lumen e instale as dependências

```bash
git clone https://github.com/Fillipe-Albuquerque-Moreira-Dos-Santos/Lumen.git
cd Lumen
npm install
```

### 2. Deixe o comando `lumen` disponível no sistema

```bash
npm link        # agora `lumen` funciona em qualquer pasta
```

> Sem o `npm link`? Use `node /caminho/para/Lumen/bin/lumen.js` no lugar de `lumen` nos passos abaixo.

### 3. Vá para o SEU projeto (o sistema que você quer documentar)

```bash
cd /caminho/do/seu-projeto      # legado, moderno ou novo — qualquer stack
```

### 4. Instale os agentes Lumen nesse projeto

```bash
lumen install
```

Ele detecta seu agente de IA, copia os skills para `.claude/skills/` (e `.agents/skills/`), escreve o arquivo de entrada (`CLAUDE.md` / `AGENTS.md` / …), cria `.lumen/` e atualiza o `.gitignore`. **Nunca toca no seu código** — só cria arquivos novos.

### 5. Prepare o motor de execução (para construir código)

```bash
lumen setup
```

### 6. (Opcional, recomendado) Puxe o sistema comprimido

```bash
lumen pull      # extração barata e completa, reduz tokens — funciona em qualquer stack
```

### 7. Documente o sistema

Abra seu agente de IA no projeto e digite:

```
/lumen
```

O Lumen mapeia, escava, interpreta e gera as specs em `_lumen_docs/` — cada afirmação marcada 🟢 / 🟡 / 🔴. Ao terminar, ele **sugere construir**.

### 8. Construa uma feature

Diga ao `/lumen` o que quer ("adicionar cupom de desconto"), responda o stack (ele sugere o que o sistema já usa), e então:

```bash
lumen build cupom-desconto      # executa as tarefas e escreve o código de verdade
lumen review cupom-desconto     # revisa e corrige
```

### 9. Verifique que nada regrediu

```
/lumen        # modo Verificar — confere o regression-watch (🟢/🟡/🔴)
```

---

> 💡 **Atalho futuro:** quando o Lumen estiver publicado no npm, os passos 1–2 viram um só — `npx lumen install` — direto no seu projeto, sem clonar nada.

O modo Documentar e o loop rodam dentro do seu agente de IA. A **execução** do build usa um **motor interno**, acionado automaticamente — você só usa comandos `lumen`.

---

## Resiliência — interrupção nunca perde tudo

O estado vive em disco a cada passo. Se a sessão cair ou os créditos acabarem:

- **Documentar** tem checkpoint por agente em `.lumen/state.json` → `/lumen` retoma de onde parou.
- **Construir** tem `status:` por tarefa → `lumen build <feature>` continua as `pending` (pula as `done`).

A pior perda possível é o único passo que estava em andamento. É um **pause**, não um **reset**.

---

## O que é gerado

```
.lumen/                 # estado, config, manifest (interno do Lumen)
_lumen_docs/            # as specs extraídas do sistema (a documentação)
  ├── inventory.md, dependencies.md, code-analysis.md
  ├── domain.md, architecture.md, erd-complete.md, c4-*.md
  ├── confidence-report.md, gaps.md
  └── <unit>/requirements.md · design.md · tasks.md
_lumen/<feature>/       # artefatos de cada feature construída + regression-watch
```

---

## CLI

```bash
lumen install      # instala os agentes no projeto
lumen update       # atualiza os skills preservando suas customizações (hash SHA-256)
lumen pull         # puxa o sistema comprimido para extração barata e completa
lumen setup        # prepara o motor de execução
lumen validate <f> # confere as tarefas de uma feature
lumen build <f>    # constrói uma feature
lumen review <f>   # revisa e corrige o código de uma feature
lumen status       # mostra o estágio atual do ciclo
lumen uninstall    # remove só o que o Lumen criou
```

## Engines suportadas

Claude Code · Codex · Cursor · Gemini CLI · Windsurf · Kiro · Opencode · Cline · Roo Code · GitHub Copilot

---

## Documentação

- 🧭 [Começando](docs/getting-started.md) · [O ciclo](docs/the-cycle.md) · [Os agentes](docs/agents.md) · [O motor](docs/engine.md)
- 📘 Exemplo passo a passo: [`examples/`](examples/README.md)
- 🗺️ [Roadmap](docs/roadmap.md)

> Site de docs (mkdocs Material): `mkdocs serve`.

## Licença

[MIT](LICENSE)
