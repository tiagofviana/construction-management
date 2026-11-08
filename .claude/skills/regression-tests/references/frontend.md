# Frontend (Vue 3 + TypeScript)

## Situação atual

O frontend **ainda não tem um runner de testes** (não há script `test` no `package.json` nem arquivos `*.spec.ts`). Não instale um runner nem adicione dependências sem pedir ao usuário.

## Verificação disponível hoje

Enquanto não houver runner, a regressão no frontend é feita com estes comandos, na raiz do repositório:

```sh
npm run type-check
npm run lint
```

- Os três devem terminar sem erros.
- Esses comandos não detectam bugs de comportamento. Diga isso ao usuário ao relatar o resultado.
