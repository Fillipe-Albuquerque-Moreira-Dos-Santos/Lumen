# Os agentes

17 agentes, um conjunto só, no formato `SKILL.md`.

## Orquestrador

| Agente | Papel |
|--------|-------|
| `lumen` | Ponto de entrada. Detecta o estágio e conduz documentar → construir → verificar. |

## 📖 Documentar

| Agente | Papel |
|--------|-------|
| `lumen-scout` | Mapeia a superfície do sistema (estrutura, linguagens, dependências). |
| `lumen-archaeologist` | Escava módulo a módulo: algoritmos, fluxos, estruturas de dados. |
| `lumen-detective` | Extrai regras de negócio implícitas, ADRs retroativas, máquinas de estado. |
| `lumen-architect` | Sintetiza C4, ERD completo, mapa de integração, arquitetura. |
| `lumen-writer` | Gera as specs como contratos operacionais rastreáveis. |
| `lumen-reviewer` | Revisa specs, acha contradições, valida lacunas. |
| `lumen-data-master` | Análise completa de banco: DDL, migrations, ORM, ERD, triggers. |
| `lumen-design-system` | Extrai design tokens: cores, tipografia, espaçamento, temas. |
| `lumen-visor` | Documenta a interface a partir de screenshots. |

## 🔁 Loop

| Agente | Papel |
|--------|-------|
| `lumen-ground` | Transforma a verdade extraída em input fundamentado para o build (stack, padrões, regras 🟢) e semeia o `regression-watch`. |
| `lumen-verify` | Re-extrai e confere cada watch item (🟢/🟡/🔴) após o build. |

## 🔨 Construir

| Agente | Papel |
|--------|-------|
| `lumen-prd` | Ideia → PRD (o quê e o porquê). |
| `lumen-techspec` | Pergunta o stack e sugere a arquitetura existente → TechSpec (o como). |
| `lumen-tasks` | TechSpec → tasks no formato do motor (`.compozy/tasks/`). |
| `lumen-build` | Dispara o motor real (`compozy tasks run`) — escreve o código. |
| `lumen-review` | Revisa e corrige via review do motor. |

## Escala de confiança

Toda afirmação nas specs leva: 🟢 **CONFIRMADO** (do código), 🟡 **INFERIDO** (de padrões), 🔴 **LACUNA** (precisa de humano). As 🟢 viram restrições que o build não pode quebrar.
