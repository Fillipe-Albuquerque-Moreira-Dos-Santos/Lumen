# Os agentes

17 agentes, um conjunto só, no formato `SKILL.md`.

## Orquestrador

| Agente | Papel |
|--------|-------|
| `lumen` | Ponto de entrada. Detecta o estágio e conduz documentar → construir → verificar. |

## 📖 Documentar

| Agente | Papel |
|--------|-------|
| `lumen-mapeador` | Mapeia a superfície do sistema (estrutura, linguagens, dependências). |
| `lumen-analista` | Escava módulo a módulo: algoritmos, fluxos, estruturas de dados. |
| `lumen-investigador` | Extrai regras de negócio implícitas, ADRs retroativas, máquinas de estado. |
| `lumen-arquiteto` | Sintetiza C4, ERD completo, mapa de integração, arquitetura. |
| `lumen-redator` | Gera as specs como contratos operacionais rastreáveis. |
| `lumen-revisor` | Revisa specs, acha contradições, valida lacunas. |
| `lumen-banco` | Análise completa de banco: DDL, migrations, ORM, ERD, triggers. |
| `lumen-design` | Extrai design tokens: cores, tipografia, espaçamento, temas. |
| `lumen-telas` | Documenta a interface a partir de screenshots. |

## 🔁 Loop

| Agente | Papel |
|--------|-------|
| `lumen-fundamento` | Transforma a verdade extraída em input fundamentado para o build (stack, padrões, regras 🟢) e semeia o `regression-watch`. |
| `lumen-verificador` | Re-extrai e confere cada watch item (🟢/🟡/🔴) após o build. |

## 🔨 Construir

| Agente | Papel |
|--------|-------|
| `lumen-requisitos` | Ideia → PRD (o quê e o porquê). |
| `lumen-projeto-tecnico` | Pergunta o stack e sugere a arquitetura existente → TechSpec (o como). |
| `lumen-tarefas` | TechSpec → tasks no formato do motor (`.compozy/tasks/`). |
| `lumen-construtor` | Dispara o motor real (`compozy tasks run`) — escreve o código. |
| `lumen-auditor` | Revisa e corrige via review do motor. |

## Escala de confiança

Toda afirmação nas specs leva: 🟢 **CONFIRMADO** (do código), 🟡 **INFERIDO** (de padrões), 🔴 **LACUNA** (precisa de humano). As 🟢 viram restrições que o build não pode quebrar.
