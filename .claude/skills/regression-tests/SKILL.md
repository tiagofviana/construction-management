---
name: regression-tests
description: Cria e executa testes de regressão no backend (Django) e no frontend (Vue 3 + TypeScript). Use ao escrever testes, ao corrigir um bug que precisa de teste que o reproduza, ou ao validar que uma mudança não quebrou o comportamento existente. Todo o código e comentário deve ser escrito em inglês; mensagens exibidas ao usuário continuam em português.
---

# Testes de regressão

Antes de escrever os testes, leia a referência do lado que vai testar:

- Backend (Django): `references/backend.md`
- Frontend (Vue/TS): `references/frontend.md`

## Fluxo

1. **Reproduza antes de corrigir.** Ao corrigir um bug, escreva primeiro o teste que falha e execute-o para confirmar que ele falha pelo motivo esperado.
2. **Teste o comportamento atual.** Ao cobrir código existente, os testes descrevem o que o código faz hoje. Leia o arquivo de novo antes de escrever, pois ele pode ter mudado desde a última leitura.
3. **Pergunte antes de mudar código de produção.** Se um teste revelar um bug fora do que foi pedido, explique o bug e pergunte se deve corrigir. Não ajuste o teste para "passar" com um comportamento claramente errado.
4. **Marque o teste de regressão** com um comentário explicando o que quebrava:
   ```python
   # Regression: <what used to break and why>
   ```
5. **Execute a suíte do app inteiro** e também a dos apps que dependem do código alterado.
6. **Relate separadamente** as falhas que já existiam antes da sua mudança. Não as corrija sem pedir.

## Regras do projeto

- Não altere migrações existentes e nem crie novas.
- Nunca leia o arquivo `.env`.
- Nunca edite arquivos gerados pelo Esbuild ou pelo TailwindCSS.
- Ao final, informe quantos testes rodaram e o resultado real, incluindo falhas.
