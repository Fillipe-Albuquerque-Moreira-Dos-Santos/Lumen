---
name: lumen-fundamento
description: Conector do loop Lumen. Pega a verdade extraída no modo Documentar (`_lumen_docs/`) e produz um grounding pack que o modo Construir consome, carregando a escala de confiança — regras 🟢 viram restrições que o build não pode quebrar. Também semeia o contrato de regressão. Use logo antes de lumen-projeto-tecnico, numa feature de projeto que já foi documentado.
argument-hint: "[feature-name]"
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI e demais agentes compatíveis com Agent Skills.
metadata:
  author: lumen
  version: "0.1.0"
  framework: lumen
  role: bridge
---

Você fundamenta o modo Construir na verdade que o modo Documentar já extraiu, para que o build comece de fatos confirmados — não de uma exploração às cegas.

Você escreve apenas dois arquivos, ambos aditivos, nunca sobrescrevendo código:

1. `.compozy/tasks/<feature>/_lumen-context.md` — o pack que o `lumen-projeto-tecnico` (e o motor) leem.
2. `_lumen/<feature>/regression-watch.md` — o contrato que o `lumen-verificador` confere depois do build.

## Antes de começar

1. Resolva os caminhos em `.lumen/state.json`: `output_folder` (padrão `_lumen_docs`), `work_folder` (padrão `_lumen`), `doc_language`.

## Passo 0 — Detectar a documentação

- Se `_lumen_docs/` não existe ou está vazio:
  > 🛑 O loop Lumen precisa do sistema documentado antes. Não achei `_lumen_docs/`.
  > Rode o modo Documentar (`/lumen`) primeiro. Sem isso não há verdade para fundamentar — se o projeto é novo (greenfield), pule este skill e vá direto para `lumen-requisitos`.

  Pare. Não escreva nada.
- Se existe, continue.

## Passo 1 — Selecionar o que é relevante para a feature

Não despeje a extração inteira. Pegue só o que toca `<feature>`:

1. `_lumen_docs/architecture.md` → componentes que a feature toca ou vizinha **+ o stack e os padrões arquiteturais que o sistema usa** (linguagens, frameworks back/front, banco, padrão de camadas, tratamento de erro, convenções). Isso é o que o `lumen-projeto-tecnico` vai sugerir para a feature se encaixar.
2. `_lumen_docs/domain.md` → regras de negócio em escopo, **preservando a marca de confiança** 🟢 / 🟡 / 🔴.
3. `_lumen_docs/erd-complete.md` (se houver) → entidades que a feature lê ou escreve.
4. Specs por unit relevantes em `_lumen_docs/<unit>/`.
5. `_lumen_docs/traceability/code-spec-matrix.md` (se houver) → arquivos do sistema a editar.

Se não der para inferir as units em escopo pelo nome da feature, faça **uma** pergunta listando os candidatos.

## Passo 2 — Escrever o grounding pack

Crie `.compozy/tasks/<feature>/` se preciso. Escreva `_lumen-context.md` com `references/grounding-template.md`. O pack deve:

- Listar o **stack e os padrões arquiteturais do sistema** (linguagens, frameworks back/front, banco, padrão de camadas, convenções) — para o techspec **sugerir o mesmo** na criação.
- Listar **componentes em escopo** com responsabilidade (de `architecture.md`).
- Listar **regras a honrar**, cada uma com sua marca. 🟢 = restrição que o build **não pode quebrar**; 🟡 = validar no techspec; 🔴 = questão aberta para o usuário.
- Incluir a **fatia do modelo de dados** que a feature toca.
- Incluir os **arquivos do sistema a editar** (da matriz de rastreabilidade).
- Terminar com: `Próximo: lumen-projeto-tecnico <feature> — este pack é seu input fundamentado; não re-explore o que já está confirmado aqui.`

## Passo 3 — Semear o contrato de regressão

Para cada regra 🟢 do pack, gere um watch item em `_lumen/<feature>/regression-watch.md`:

| ID | Origem (arquivo, seção) | Regra que deve seguir verdadeira | Tipo de verificação | Sinal de violação |
|----|-------------------------|----------------------------------|---------------------|-------------------|

- IDs estáveis `W001`, `W002`, … Recicle IDs se o arquivo já existir; append-only, nunca reescreva histórico.
- **Nunca** ponha regras 🟡 ou 🔴 na tabela principal — vão para uma seção "Observações" sem peso de regressão.
- Deixe uma seção "Histórico de re-extrações" vazia; o `lumen-verificador` preenche depois.

## Passo 4 — Relatar

Diga ao usuário: caminho do `_lumen-context.md` (quantos componentes / regras 🟢 / entidades + stack detectado), caminho do `regression-watch.md` (quantos watch items), e o handoff: `Rode lumen-projeto-tecnico <feature>. Depois do build, rode lumen-verificador para conferir os watch items.`

## Regra absoluta

Nunca apague, mova ou modifique código pré-existente. Este skill escreve só em `.compozy/tasks/<feature>/_lumen-context.md` e `_lumen/<feature>/regression-watch.md`, e só cria o que está ausente.
