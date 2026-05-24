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

<br>

[Quickstart](#-quickstart) · [O que é](#o-que-é) · [O ciclo](#como-funciona) · [Os 17 agentes](#os-17-agentes) · [CLI](#referência-da-cli) · [FAQ](#faq)

</div>

---

## Índice

- [⚡ Quickstart](#-quickstart)
- [O que é](#o-que-é)
- [Como funciona](#como-funciona)
- [Por que o Lumen existe](#por-que-o-lumen-existe)
- [A escala de confiança](#a-escala-de-confiança)
- [Os 17 agentes](#os-17-agentes)
- [🔨 Construir em detalhe](#-construir-em-detalhe)
- [O motor de execução](#o-motor-de-execução)
- [Resiliência](#resiliência)
- [O que é gerado](#o-que-é-gerado)
- [Referência da CLI](#referência-da-cli)
- [Engines suportadas](#engines-suportadas)
- [Requisitos](#requisitos)
- [FAQ](#faq)
- [Documentação](#documentação)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## ⚡ Quickstart

Todo o fluxo cabe em dois comandos:

```bash
lumen go       # 📖 DOCUMENTA o seu sistema   → specs confiáveis em _lumen_docs/
lumen build    # 🔨 CONSTRÓI a aplicação       → escreve o código de verdade
```

**Primeira vez?** Setup único na máquina (≈10s):

```bash
git clone https://github.com/Fillipe-Albuquerque-Moreira-Dos-Santos/Lumen.git
cd Lumen && npm install && npm link
```

Depois, em **qualquer projeto**:

```bash
cd ~/dev/seu-projeto
lumen go       # documenta
lumen build    # constrói
```

> 💡 `lumen ...` roda no **terminal**. Prefere o modo manual, passo a passo? Digite `/lumen` **dentro** do seu agente de IA.
>
> Sem `npm link`? Use `node /caminho/para/Lumen/bin/lumen.js` no lugar de `lumen`.

---

## O que é

Lumen é **um só** agente — uma única instalação, uma única marca, um conjunto de skills em markdown que rodam dentro do seu agente de IA. Ele cobre **todo o ciclo** de evolução de software, em três modos amarrados por um loop:

| Modo | O que faz | Toca no seu código? |
|------|-----------|---------------------|
| 📖 **Documentar** | Lê o sistema e extrai specs executáveis e rastreáveis (🟢 confirmado · 🟡 inferido · 🔴 lacuna) | **Nunca** |
| 🔨 **Construir** | Pega a spec e constrói: requisitos → projeto técnico → tarefas → código → revisão | Sim, é o trabalho dele |
| 🔁 **Verificar** | Re-extrai e confere que nenhuma regra confirmada (🟢) regrediu | **Nunca** |

Funciona para **qualquer sistema** — legado, moderno ou em desenvolvimento; qualquer stack ou tipo (API, web, mobile, CLI, dados, infra, monolito, microsserviços).

⚡ **Trabalha em paralelo — com um agente só.** Ao **documentar**, o Lumen dispara **vários subagentes ao mesmo tempo** (um por módulo). Ao **construir**, o **mesmo agente** toca **várias funcionalidades de uma vez** (subagentes internos + execução concorrente do motor) — porque cada unit tem seu spec completo em `_lumen_docs/`, que serve de contrato e evita colisão. Tudo numa sessão só.

---

## Como funciona

Três modos, em loop, no mesmo agente — a spec é a memória entre eles:

```
        ┌──────────────────── Lumen ────────────────────┐
        │                                                │
        │   📖 DOCUMENTAR          🔨 CONSTRUIR          │
        │   sistema → specs   ──►   specs → código       │
        │        ▲                      │                │
        │        │   🔁 VERIFICAR       │                │
        │        └──── regressão ◄──────┘                │
        │                                                │
        └────────────────────────────────────────────────┘
```

1. **Documentar** — os agentes leem o código e produzem specs rastreáveis em `_lumen_docs/`, cada afirmação marcada 🟢/🟡/🔴. Nunca toca no código.
2. **Construir** — o Lumen **fundamenta** a feature (lê o que é relevante das specs, extrai o stack e os padrões do sistema, e marca as regras 🟢 como restrições que o build não pode quebrar), depois constrói ancorado nessa verdade.
3. **Verificar** — re-extrai o sistema e confere cada item do contrato de regressão: o que era 🟢 continua de pé?

A documentação não envelhece porque o loop a renova; o código não regride porque o contrato de regressão o vigia.

---

## Por que o Lumen existe

Todo sistema carrega conhecimento preso no código: regras de negócio implícitas, decisões de arquitetura nunca escritas, lógica crítica que ninguém quer tocar. Agentes de IA são poderosos para evoluir software, mas precisam de **especificação confiável** para agir com segurança — e ela quase nunca existe.

Documentar e codar costumam viver separados: a documentação envelhece, e o código novo quebra regras que ninguém lembrava. **Lumen une os dois num ciclo só:**

1. **Extrai a verdade** do sistema, com cada afirmação rastreável até o código (`arquivo:linha`).
2. **Constrói** cada feature ancorada nessa verdade — sugerindo o stack e a arquitetura que o sistema já usa.
3. **Re-extrai e verifica** que as regras confirmadas continuam de pé.

- Documentar isolado vira papel parado que envelhece.
- Codar isolado quebra regras de negócio que ninguém lembrava que existiam.
- **Junto**, cada feature é construída sobre a verdade confirmada e verificada contra ela.

---

## A escala de confiança

Toda afirmação nas specs leva uma marca — é o que torna a documentação **confiável** e a base do contrato de regressão:

| Marca | Significado |
|-------|-------------|
| 🟢 **CONFIRMADO** | Extraído direto do código — citável com `arquivo:linha` |
| 🟡 **INFERIDO** | Deduzido de padrões — pode estar errado |
| 🔴 **LACUNA** | Não determinável pelo código — precisa de validação humana |

A **confiança geral** é calculada e reportada por spec e no total:

```
confiança = (🟢 + 🟡 × 0.5) / total
```

> **Regra de ouro:** na dúvida, o Lumen usa o nível mais baixo. Uma 🔴 honesta vale mais que uma 🟡 enganosa.

### Ele te leva até ≥95% — passo a passo

O Lumen **não para no número**. Enquanto a confiança geral estiver **abaixo de 95%**, ele entrega um **plano priorizado** de como chegar lá — ordenado por **ganho ÷ esforço**, com o **ganho estimado** e a **confiança projetada** de cada ação:

```
📈 Para chegar a ≥95%, recomendo (em ordem de impacto):
  1. Resolver 🔴 "qual rota de pagamento é a oficial?"   → +6%   (responder 1 pergunta)
  2. Confirmar 🟡 regras de domínio em orders.service     → +4%   (ler arquivo:linha / rodar o fluxo)
  3. Destravar: restaurar checkout.js corrompido (git)    → +3%

Projeção: passos 1–2 → ~92% · + passo 3 → ~96% ✅
```

Você resolve o que quiser, roda de novo, e ele recalcula — **iterando com você até a documentação ficar completa**. Se já estiver ≥95%, ele registra "✅ meta atingida" e vai direto para sugerir construir. E documentar sozinho é um uso completo — ele nunca força o build.

### Acha os erros — e sugere a correção

Na revisão, o Lumen é um **revisor técnico independente**. Ele varre as specs e o código atrás de:

- **Inconsistências internas** — regras que se contradizem dentro do mesmo módulo.
- **Contradições cruzadas** — módulos que conflitam entre si.
- **Possíveis bugs** — quando o comportamento esperado **contradiz o que está no código** (marcado 🔴: possível bug ou lógica oculta).

Para cada problema, ele aponta o **módulo afetado, o arquivo, o trecho exato, o tipo do problema e uma sugestão de correção** — não só "tem algo errado", mas *o quê*, *onde* e *como arrumar*.

### Funciona até num sistema com bug

Você não precisa de um código limpo para começar — o Lumen documenta o que existe **e** sinaliza o que está te impedindo de confiar nele, tratando como **bloqueios destraváveis** com a ação concreta:

| Bloqueio | O que o Lumen sugere |
|----------|----------------------|
| Arquivo corrompido / ilegível | Restaurar via `git checkout` |
| Ausência de testes | Sem eles o comportamento não pode ser confirmado — adicionar para travar como 🟢 |
| Configs divergentes | Apontar a divergência para validação |
| Contrato front ≠ back | Sinalizar o desencontro entre os lados |

O resultado: mesmo um sistema legado, bagunçado ou com defeitos vira documentação honesta — com os problemas **nomeados, localizados e com caminho de correção**.

---

## Os 17 agentes

**Orquestrador** — `lumen` conduz o ciclo documentar → construir → verificar.

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

> Detalhe de cada agente em [`docs/agents.md`](docs/agents.md).

---

## 🔨 Construir em detalhe

`lumen build` é uma **CLI guiada**: pergunta só o essencial, **trava** suas escolhas e conduz a construção de ponta a ponta.

**O que ele pergunta:**

1. **Escopo** — o sistema inteiro (a partir dos docs) ou uma feature.
2. **Stack** — linguagem, versão, framework, banco, frontend… *item por item, com a versão exata que você quiser* (nunca assume).
3. **Nome** — sugestões prontas **+ sempre a opção de digitar o seu**.

Aí mostra o **plano** e pede confirmação:

```
  Plano de construção
  ───────────────────
  Alvo      sistema inteiro (da documentação)
  Stack     Node 22 · NestJS 11 · React 19 · PostgreSQL 17
  Destino   fora do legado · front/back desacoplados
  Agente    Claude Code
```

**Onde o código nasce — nunca misturado ao legado:**

| Intenção | Onde |
|----------|------|
| **Evoluir** (mesmo stack) | no lugar, no projeto atual |
| **Modernizar** | sistema **novo (v2) FORA** do legado, com **front e back desacoplados** em pastas separadas |
| **Greenfield** | pasta própria isolada |

> **Atalhos:** `lumen build <feature>` executa direto as tarefas já geradas; `lumen build <feature> --bg` roda em background (acompanhe com `lumen runs watch <id>`); `lumen build <feature> --dry-run` valida o pipeline **sem escrever código**.

### Blocos temáticos — construa um tema por vez

Ao gerar as tarefas, o Lumen as **agrupa em blocos por tema** (ex.: *Autenticação*, *Pedidos*, *Notificações*) — cada bloco reúne as tasks relacionadas àquele assunto. O agrupamento vai no campo `bloco:` de cada task e num índice `_lumen/<feature>/_plan.md`:

```
# Plano de construção — checkout
## Bloco 1 — Autenticação
  - task_01  JWT middleware
  - task_02  Login endpoint
## Bloco 2 — Pedidos
  - task_03  Criar pedido
  - task_04  Calcular total
```

Assim você constrói **um bloco de cada vez**, em vez de tudo de uma vez:

```bash
lumen build checkout --bloco "Autenticação"   # roda só esse bloco (+ dependências pendentes)
lumen build checkout --bloco                   # lista os blocos e o progresso de cada um
lumen status                                    # progresso por bloco de cada feature
```

O motor continua executando a lista de tasks ligada por dependências; o bloco é uma **camada de organização do Lumen por cima** — as tasks de outros blocos ficam em espera enquanto o bloco-alvo roda. Como cada bloco só depende dos anteriores, dá pra avançar tema a tema, revisando entre eles.

---

## O motor de execução

O modo **Documentar** e o **loop** são skills em markdown — rodam dentro do seu agente de IA, sem runtime próprio. Mas a **execução** do build — escrever código de verdade, em lote, com concorrência, retries e revisão — não cabe num prompt. Para isso o Lumen tem um **motor de execução interno**.

Você **nunca o instala nem o invoca diretamente**: o `lumen build` o aciona por baixo (preparado sob demanda na primeira vez via `lumen setup`). Toda a experiência é Lumen.

```
lumen-projeto-tecnico / lumen-tarefas   →   _lumen/<feature>/   →   lumen build
        (autoram as tasks)                       (a fronteira)        (executa de verdade)
```

- `lumen-tarefas` grava as tasks em `_lumen/<feature>/` no formato que o motor executa (confira com `lumen validate <feature>`).
- `lumen build <feature>` executa as tasks de verdade — concorrência, retries, memória entre runs.
- `lumen review <feature>` roda a revisão sobre o código gerado.

> Para um build que **escreve código**, o runtime do seu agente de IA precisa estar disponível (ex.: o adaptador ACP do Claude). Mais detalhes em [`docs/engine.md`](docs/engine.md).

---

## Resiliência

O estado vive em disco a cada passo. Se a sessão cair ou os créditos acabarem:

- **Documentar** tem checkpoint por agente em `.lumen/state.json` → `/lumen` retoma de onde parou.
- **Construir** tem `status:` por tarefa → `lumen build <feature>` continua as `pending` (pula as `done`).

A pior perda possível é o único passo que estava em andamento. É um **pause**, não um **reset**.

---

## O que é gerado

```
.lumen/                 # estado, config, manifest, principles (interno do Lumen)
_lumen_docs/            # as specs extraídas do sistema (a documentação)
  ├── inventory.md, dependencies.md, code-analysis.md
  ├── domain.md, architecture.md, erd-complete.md, c4-*.md
  ├── confidence-report.md, gaps.md
  └── <unit>/requirements.md · design.md · tasks.md
_lumen/<feature>/       # tasks (task_NN.md) + _plan.md (blocos) + regression-watch

# Ao MODERNIZAR, o sistema novo nasce FORA do legado (não mistura):
../<sistema>-backend/   # backend novo, desacoplado
../<sistema>-frontend/  # frontend novo, desacoplado
```

O Lumen **nunca modifica seu código no modo Documentar** — só cria arquivos novos e atualiza o `.gitignore`.

---

## Referência da CLI

| Comando | O que faz |
|---------|-----------|
| `lumen go` | ⭐ Faz tudo: instala, empacota e abre seu agente já documentando |
| `lumen install` | Instala os agentes Lumen no projeto atual |
| `lumen update` | Atualiza os skills preservando suas customizações (hash SHA-256) |
| `lumen pull` | Puxa o sistema comprimido para uma extração barata e completa |
| `lumen setup` | Prepara o motor de execução nos agentes (interno, automático) |
| `lumen build` | Constrói — guiado: **sistema inteiro** (dos docs) ou uma **feature** |
| `lumen build <feature>` | Executa direto as tarefas já geradas de uma feature |
| `lumen build <feature> --bloco "<nome>"` | Constrói só um **bloco temático** (+ dependências). Sem nome: lista os blocos |
| `lumen build <feature> --bg` | Constrói em background |
| `lumen build <feature> --dry-run` | Valida o pipeline sem escrever código |
| `lumen runs watch <id>` | Acompanha uma construção em background |
| `lumen review <feature>` | Revisa e corrige o código de uma feature |
| `lumen validate <feature>` | Confere as tarefas de uma feature |
| `lumen status` | Mostra o estágio atual do ciclo |
| `lumen uninstall` | Remove só o que o Lumen criou |

`lumen --help` lista tudo; `lumen --version` mostra a versão.

---

## Engines suportadas

Claude Code · Codex · Cursor · Gemini CLI · Windsurf · Kiro · Opencode · Cline · Roo Code · GitHub Copilot

O instalador detecta os agentes presentes, copia os skills `lumen-*` para `.claude/skills/` e `.agents/skills/`, e escreve o arquivo de entrada apropriado (`CLAUDE.md` / `AGENTS.md` / …).

---

## Requisitos

- **Node.js 18+**
- Um **agente de IA** instalado (Claude Code, Codex, Cursor, Gemini CLI…)
- Para builds que escrevem código: o **runtime do seu agente** disponível (ex.: adaptador ACP do Claude)

---

## FAQ

**O Lumen modifica meu código?**
Só no modo **Construir** — e ele avisa explicitamente antes de escrever. Documentar e Verificar **nunca** tocam no código; só leem e escrevem em `.lumen/` e `_lumen_docs/`.

**Onde meu código é processado?**
Tudo roda dentro do **seu** agente de IA, na sua máquina/conta. O Lumen é um conjunto de skills + um motor local — não é um serviço que recebe seu código.

**Funciona com qualquer linguagem/stack?**
Sim. O Lumen detecta o tipo de sistema e o stack, e no build **pergunta** o stack item por item (sugerindo o que o sistema já usa quando há documentação).

**E se meu sistema tiver bugs ou código corrompido?**
Não tem problema — é justamente onde o Lumen ajuda. Ele documenta o que existe, **acha contradições e possíveis bugs** (com arquivo, trecho e sugestão de correção) e trata o que trava a análise como **bloqueio destravável** (arquivo corrompido → `git checkout`, falta de testes, configs divergentes). Veja [A escala de confiança](#a-escala-de-confiança).

**Posso parar no meio?**
Sim. O estado é persistido a cada passo — `/lumen` ou `lumen build <feature>` retomam de onde parou. Veja [Resiliência](#resiliência).

**Preciso instalar o motor de execução?**
Não. Ele é interno e acionado automaticamente pelo `lumen build`. Veja [O motor de execução](#o-motor-de-execução).

**Como removo o Lumen?**
`lumen uninstall` — remove só o que ele criou.

---

## Documentação

- 🧭 [Começando](docs/getting-started.md) · [O ciclo](docs/the-cycle.md) · [Os agentes](docs/agents.md) · [O motor](docs/engine.md)
- 🧪 Exemplo passo a passo: [`examples/`](examples/README.md)
- 📐 O método, em uma página: [`METHOD.md`](METHOD.md)
- 🗺️ [Roadmap](docs/roadmap.md)

> Site de docs (mkdocs Material): `mkdocs serve`.

---

## Contribuindo

Contribuições são bem-vindas — veja [`CONTRIBUTING.md`](CONTRIBUTING.md). Abra uma issue para discutir antes de um PR grande.

---

## Licença

[MIT](LICENSE)
