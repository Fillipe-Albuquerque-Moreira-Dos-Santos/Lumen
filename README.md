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

Quando a confiança geral fica **abaixo de 95%**, o Lumen não para no número — ele entrega um **plano priorizado de como chegar a ≥95%** (resolver 🔴, confirmar 🟡, destravar bloqueios como código corrompido ou ausência de testes), com o **ganho estimado** de cada ação.

---

## Passo a passo — do `git clone` ao uso

**Pré-requisitos:** Node.js 18+ e um agente de IA já instalado (Claude Code, Codex, Cursor...).

### ⚡ O jeito simples (3 passos)

```bash
# 1. Pegue o Lumen (uma vez na vida)
git clone https://github.com/Fillipe-Albuquerque-Moreira-Dos-Santos/Lumen.git && cd Lumen && npm install && npm link

# 2. Vá para o seu projeto
cd ~/dev/meu-projeto

# 3. Manda ver 🚀
lumen go
```

O **`lumen go`** faz tudo sozinho: instala os agentes, empacota o sistema e **abre seu agente de IA já documentando**. É só responder o que ele perguntar.

> Quer controlar cada etapa (ou entender o que acontece por baixo)? Veja o passo a passo detalhado abaixo.

---

### Passo a passo detalhado

> ### 🧭 A regra de ouro — onde cada comando roda
>
> - 🖥️ **No terminal** → tudo que começa com `lumen ...`
> - 💬 **Dentro do seu agente de IA** (ex.: Claude Code) → o comando `/lumen`
>
> E existem **duas pastas diferentes**: a pasta do **Lumen** (você clona uma vez) e a pasta do **seu projeto** (onde você de fato usa).

---

### Parte A — Preparar o Lumen 🖥️ *(só uma vez na máquina)*

```bash
git clone https://github.com/Fillipe-Albuquerque-Moreira-Dos-Santos/Lumen.git
cd Lumen
npm install
npm link            # cria o comando `lumen` global — passa a funcionar em qualquer pasta
```

Confira com `lumen --version`. Pronto — **você nunca mais precisa entrar nesta pasta.**

> Não quer usar `npm link`? Então, no lugar de `lumen`, use `node /caminho/para/Lumen/bin/lumen.js`.

---

### Parte B — Documentar o SEU projeto 📖

**B1.** 🖥️ No terminal, entre na pasta do **seu projeto** e instale os agentes:

```bash
cd ~/dev/meu-projeto      # o sistema que você quer documentar (qualquer stack)
lumen install             # detecta seu agente, cria .lumen/, escreve CLAUDE.md… (não toca no seu código)
```

**B2.** 🖥️ *(Opcional, recomendado)* Puxe o sistema comprimido — extração mais barata em tokens:

```bash
lumen pull
```

**B3.** 💬 Abra seu agente de IA **nessa mesma pasta** e digite:

```
/lumen
```

O Lumen documenta o sistema e gera tudo em **`_lumen_docs/`** (cada afirmação 🟢 / 🟡 / 🔴). No caminho ele pergunta o **nível de documentação** e a **organização das specs** — é só responder. Ao terminar, ele **sugere construir**.

> ✅ **Se você só quer a documentação, acabou aqui.** O resultado está em `_lumen_docs/`.

---

### Parte C — Construir 🔨 *(quando quiser evoluir o código)*

**C1.** 🖥️ Uma vez, prepare o motor (interno, automático — você não instala nada à parte):

```bash
lumen setup
```

**C2.** 🖥️ Um comando só — você escolhe o escopo:

```bash
lumen build
```

Ele pergunta:
- **O sistema inteiro** (a partir de toda a documentação), ou
- **Uma feature específica** (você descreve numa frase).

A criação é **guiada** (estilo workflow completo), perguntando só o essencial **com sugestões**:
- 🏷️ **Nome** — sugere 2–3 e deixa você digitar o seu;
- 🧩 **Linguagem/stack** — sugere o que o sistema já usa (ou ideal, em greenfield);
- 🏛️ **Arquitetura** — sugere 2–3 ideais com trade-offs e recomenda uma.

Depois roda **autônomo e em paralelo** (vários subagentes ao mesmo tempo) até o fim: requisitos → projeto técnico → tarefas → **código** → revisão. O código é escrito pelo **motor de execução** (concorrente, com retries), não à mão.

**C3.** 💬 Rode `/lumen` (modo **Verificar**) — confere que nenhuma regra 🟢 regrediu.

---

> 💡 **No futuro**, quando o Lumen estiver publicado no npm, a Parte A inteira some: você roda só `npx lumen install` direto no seu projeto, sem clonar nada.

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
lumen go           # ⭐ faz tudo: instala, empacota e abre seu agente já documentando
lumen install      # instala os agentes no projeto
lumen update       # atualiza os skills preservando suas customizações (hash SHA-256)
lumen pull         # puxa o sistema comprimido para extração barata e completa
lumen setup        # prepara o motor de execução (interno, automático)
lumen build        # constrói — pergunta: o SISTEMA INTEIRO (dos docs) ou uma feature
lumen build <f>    # executa direto as tarefas já geradas de uma feature
lumen review <f>   # revisa e corrige o código de uma feature
lumen validate <f> # confere as tarefas de uma feature
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
