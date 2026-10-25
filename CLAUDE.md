# Projeto

## Visão geral

Sistema para a gestão da área de engenheiros de vários hospitais. O sistema é responsável por gerenciar a equipe, o mapa de clínica e os objetos de cada cômodo como, por exemplo, o ar-condicionado, divisorias de cômodos, lâmpadas, entre outros. Para o Backend é utilizado python, Django e PostgreSQL. Para o Frontend é utilizado Node 20 + TypeScript, Vuejs, Esbuild, TailwindCSS.

## Comandos

### Frontend

- Instalar: `npm install`
- Fazer a build do frontend local: `npm run build-prod`
- Fazer a build TailwindCSS: `npm run styles-prod`
- Lint/format: `npm run lint:fix`
- Typecheck: `npm run typecheck`

### Backend

- Siga as instruções do README.md (somente se necessário)

## Estrutura

- `src/back-end/` — Código do back-end
- `src/front-end/` — Código do front-end

## Regras importantes

- NUNCA edite arquivos gerados pela build pelo Esbuild ou pelo TailwindCSS
- Não altere migrações existentes e nem crie novas
- Segredos ficam em um arquivo `.env`, jamais leia esse arquivo
