---
name: lumen-requisitos
description: Primeiro passo do modo Construir. Transforma uma ideia de feature num PRD (documento de requisitos de produto) com decisões de negócio registradas. Use quando o usuário quer construir algo novo e ainda não há PRD. Em projeto documentado, ancore no que o sistema já faz.
argument-hint: "[feature-name] [descrição]"
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: lumen
  version: "0.1.0"
  framework: lumen
  phase: construir
  stage: prd
---

Você cria o PRD da feature: o **quê** e o **porquê**, nunca o **como**. O como é do `lumen-projeto-tecnico`.

## Antes de começar

1. Resolva `output_folder` (padrão `_lumen_docs`) em `.lumen/state.json`. Os artefatos de feature vão para `_lumen/<feature>/` (diretório do motor de execução).
2. Se existir `_lumen/<feature>/_lumen-context.md` (grounding), leia: ele diz quais regras 🟢 do sistema a feature precisa respeitar. Não duplique o conteúdo, referencie.

## Fluxo

1. **Entender a ideia.** Se o usuário passou uma descrição, parta dela. Senão, peça uma frase descrevendo o que ele quer.
2. **Nome (sugira + deixe escolher).** Proponha um nome curto em kebab-case a partir da ideia e ofereça **2–3 sugestões + a opção de digitar o próprio**. Ex.:
   > "Sugiro um destes nomes: `busca-cliente-cpf` · `consulta-cpf` · `cliente-por-cpf`. Use um deles, ou me diga o nome que você prefere."

   O nome escolhido vira a pasta `_lumen/<nome>/`. **Se for um sistema novo inteiro (greenfield)**, peça também o **nome do projeto** do mesmo jeito (sugestões + custom) e registre-o.
3. **Perguntas de negócio** (uma por vez, múltipla escolha quando possível): quem usa, qual problema resolve, qual o critério de sucesso, o que está fora de escopo. Nunca pergunte detalhes técnicos — isso é do techspec.
4. **Registrar decisões** que mudam o produto como mini-ADRs no corpo do PRD.
5. **Rascunhar o PRD** e apresentar inteiro para revisão (não seção por seção). Itere até o usuário aprovar.
6. **Salvar** em `_lumen/<feature>/_prd.md`.

## Estrutura do PRD

- **Resumo executivo** — uma frase do valor + o principal trade-off de produto.
- **Problema e contexto** — em projeto documentado, cite o que o sistema já faz (de `_lumen_docs/`) que esta feature estende ou altera.
- **Usuários e jobs-to-be-done**.
- **Requisitos** em MoSCoW (Must / Should / Could / Won't).
- **Critérios de sucesso** mensuráveis.
- **Fora de escopo**.
- **Regras do sistema a respeitar** — se há grounding, liste os 🟢 relevantes (são restrições, não negociáveis).

## Encerramento

Confirme o caminho do `prd.md` e diga: `Próximo: lumen-projeto-tecnico <feature>. Digite CONTINUAR.`
