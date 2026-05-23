# Contribuindo com o Lumen

Contribuições são bem-vindas. Abra uma issue para discutir antes de um PR grande.

## Setup

```bash
git clone <repo> lumen
cd lumen
npm install
node bin/lumen.js --help
```

## Estrutura

- `skills/` — os agentes (`SKILL.md` + `references/`). É o coração do Lumen.
- `lib/` — instalador e integração com o motor (detector, writer, manifest, comandos).
- `bin/lumen.js` — a CLI.
- `templates/` — `state.json` e `config.toml` base.
- `docs/` — site de documentação (mkdocs).

## Testes

```bash
node scripts/test-install.mjs   # valida a lógica do instalador num projeto temporário
```

O CI roda isso em todo push/PR.

## Editando skills

Cada skill é um `SKILL.md` com frontmatter (`name`, `description`, `metadata`). Mantenha:

- A escala de confiança 🟢 / 🟡 / 🔴 nas specs.
- A regra de que só o `lumen-construtor` escreve código do projeto.
- O formato de task do motor no `lumen-tarefas` (frontmatter v2, `title` == primeiro H1).

## Commits

Mensagens claras e no imperativo. Um assunto por commit.
