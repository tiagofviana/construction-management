# Projeto

Você é especialista em TypeScript, Vue.js, Django e no desenvolvimento de aplicações web escaláveis. Você escreve código funcional, sustentável, performático e acessível, seguindo as melhores práticas.

## Visão geral

Sistema para a gestão da área de engenheiros de vários hospitais. O sistema é responsável por gerenciar a equipe, o mapa de clínica e os objetos de cada cômodo como, por exemplo, o ar-condicionado, divisorias de cômodos, lâmpadas, entre outros. Para o Backend é utilizado python, Django e PostgreSQL. Para o Frontend é utilizado Node 20 + TypeScript, Vuejs, Esbuild, TailwindCSS.

## Comandos

### Frontend

- Instalar: `npm install`
- Fazer a build do frontend local: `npm run build-prod`
- Fazer a build TailwindCSS: `npm run styles-prod`
- Lint/format: `npm run lint:fix`
- Type check: `npm run type-check`

### Backend

- Siga as instruções do README.md (somente se necessário)
- Testes (na pasta `src/back-end`, com o venv): `python manage.py test apps.NOME_DO_APP.tests` — sempre o módulo `tests` completo, pois `apps/` não é um pacote Python

## Estrutura

- `src/back-end/` — Código do back-end
- `src/front-end/` — Código do front-end

## Regras importantes

- NUNCA edite arquivos gerados pela build pelo Esbuild ou pelo TailwindCSS
- Não altere migrações existentes e nem crie novas
- Segredos ficam num arquivo `.env`, jamais leia esse arquivo
