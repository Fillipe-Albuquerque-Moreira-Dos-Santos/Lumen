# Princípios do projeto (constituição)

Regras **não-negociáveis** que toda construção do Lumen deve respeitar.
Edite à vontade — o `lumen-construtor` e o `lumen-auditor` honram este arquivo (tem precedência sobre os defaults).

## 🔒 Segurança (OWASP Top 10)
- Nunca segredos hardcoded — use variáveis de ambiente / secrets.
- Valide toda entrada externa; trate dados sensíveis com cuidado.
- Controle de acesso em cada rota/endpoint protegido.
- Sem injeção (SQL, comando, template) — use parametrização.
- Dependências confiáveis e atualizadas; sem pacotes suspeitos.

## 🧪 Testes (TDD)
- Cada tarefa tem testes que provam o comportamento.
- Nada é "concluído" sem teste passando (evidência de verificação).
- Meta de cobertura: defina aqui (ex.: ≥ 80%).

## 📐 Convenções
- Siga o lint/format do projeto e os padrões da arquitetura escolhida.
- Conventional commits; sem código morto.
- Mensagens, logs e erros claros e consistentes.

## 🟢 Integridade do sistema
- As regras 🟢 confirmadas da documentação são restrições — não quebrar.
- Na dúvida sobre regra ou comportamento, **pergunte** — nunca chute.
