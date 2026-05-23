<div align="center">
  <h1>✦ Lumen</h1>
  <p><strong>Luz sobre o legado: documenta o que já existe e constrói o que vem a seguir.</strong></p>
  <p><em>Um único agente para todo o ciclo — entender o sistema, evoluí-lo, e garantir que nada se quebrou.</em></p>
  <p>
    <img src="https://img.shields.io/badge/license-MIT-f5c518" alt="MIT">
    <img src="https://img.shields.io/badge/node-%E2%89%A518-3c873a" alt="Node 18+">
    <img src="https://img.shields.io/badge/agentes-17-f5c518" alt="17 agentes">
    <img src="https://img.shields.io/badge/engines-Claude%20%C2%B7%20Codex%20%C2%B7%20Cursor%20%C2%B7%20Gemini-2d2d2d" alt="engines">
  </p>
</div>

---

## Um projeto, um ciclo

Lumen é **um só** — uma única instalação, uma única marca, um único conjunto de agentes em markdown que rodam dentro do seu agente de IA (Claude Code, Codex, Cursor...). Ele tem dois **modos** e um **loop** que os amarra:

| Modo | O que faz | Toca no seu código? |
|------|-----------|---------------------|
| 📖 **Documentar** | Lê o sistema e extrai specs executáveis e rastreáveis (🟢 confirmado / 🟡 inferido / 🔴 lacuna) | Nunca |
| 🔨 **Construir** | Pega a spec e constrói: PRD → TechSpec → Tasks → Código → Review | Sim, é o trabalho dele |
| 🔁 **Verificar** | Depois de construir, re-extrai e confere que nada de 🟢 regrediu | Nunca |

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
              npx lumen install  →  /lumen  (o resto ele conduz)
```

## Por que o Lumen existe

Sistemas reais carregam anos de conhecimento preso no código: regras de negócio implícitas, decisões de arquitetura nunca escritas, lógica crítica que ninguém quer tocar. Agentes de IA são poderosos para evoluir software, mas precisam de especificação para agir com segurança — e no código legado essa spec não existe.

Documentar e codar costumam viver separados: a documentação envelhece, e o código novo quebra regras que ninguém lembrava. **Lumen une os dois num ciclo só.** Primeiro ele extrai a verdade do sistema (com cada afirmação rastreável até o código). Depois constrói cada feature ancorada nessa verdade. E, por fim, re-extrai para confirmar que as regras confirmadas continuam de pé. A documentação não envelhece porque o loop a renova; o código não regride porque o contrato de regressão o vigia.

## Os agentes

```
ORQUESTRADOR
  lumen                  ponto de entrada; conduz documentar → construir → verificar

📖 DOCUMENTAR
  lumen-scout            mapeia a superfície do sistema
  lumen-archaeologist    escava módulo a módulo
  lumen-detective        extrai regras de negócio, ADRs, máquinas de estado
  lumen-architect        sintetiza C4, ERD, arquitetura
  lumen-writer           gera as specs como contratos operacionais
  lumen-reviewer         revisa specs e valida lacunas
  lumen-data-master      análise de banco: DDL, migrations, ORM, ERD
  lumen-design-system    extrai design tokens: cores, tipografia, temas
  lumen-visor            documenta a UI a partir de screenshots

🔁 LOOP
  lumen-ground           transforma a spec extraída em input fundamentado p/ construir + semeia regressão
  lumen-verify           re-extrai e confere o regression-watch

🔨 CONSTRUIR
  lumen-prd              ideia → PRD
  lumen-techspec         pergunta o stack + sugere a arquitetura que o sistema já usa → TechSpec
  lumen-tasks            TechSpec → tasks no formato do motor
  lumen-build            dispara o motor de execução real (escreve o código)
  lumen-review           revisa e corrige via motor
```

17 agentes cobrindo o ciclo inteiro, do entendimento ao código revisado — incluindo análise de banco, design tokens e documentação de telas.

Na criação, o `lumen-techspec` **pergunta como você quer o sistema** (linguagem, backend, frontend, banco, testes) e, em projeto já documentado, **sugere o stack e a arquitetura que o sistema já usa** — para o código novo encaixar sem inventar padrões estranhos.

## Motor de execução

O modo Documentar e o loop são 100% Lumen. Para a **execução** do build, o Lumen usa o **Compozy** como motor (execução headless/concorrente real, com retries e review). O `lumen build` aciona o motor por baixo — você nunca digita `compozy` direto.

Instale o motor uma vez:

```bash
npm install -g @compozy/cli   # ou: brew install compozy/compozy/compozy
lumen setup                   # prepara o motor nos seus agentes
```

## Quickstart

```bash
npx lumen install            # 1. instala os agentes Lumen
lumen setup                  # 2. prepara o motor de execução
/lumen                       # 3. documenta → sugere codar → constrói → verifica
lumen build <feature>        #    (o build roda no motor real, sob a marca Lumen)
```

## Status

✅ **Funcional.** 17 agentes + instalador testado (`install`, `status`, `uninstall`). `npx lumen install` copia os skills para `.claude/skills/` e `.agents/skills/`, escreve o entry file da engine (CLAUDE.md / AGENTS.md / …), cria `.lumen/` e atualiza `.gitignore`.

Próximos passos em [`docs/roadmap.md`](docs/roadmap.md): polimento de vitrine (demo, site de docs, exemplos, CI) e o comando `update`.

## Documentação e exemplo

- 📖 Site de docs: `docs/` (rode `mkdocs serve` — tema Material).
- 🧭 Passo a passo completo: [`examples/README.md`](examples/README.md).
- 🗺️ Roadmap e decisões: [`docs/roadmap.md`](docs/roadmap.md).

## Licença

MIT — veja [LICENSE](LICENSE).
