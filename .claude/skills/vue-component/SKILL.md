---
name: vue-component
description: Cria componentes, páginas e stores no frontend Vue 3 com TypeScript. Use ao criar ou refatorar arquivos .vue, composables, stores Pinia ou chamadas à API no frontend. Todo o código e comentário deve ser escrito em inglês.
---

# Componentes Vue 3 + TypeScript

## Convenções

- Sempre `<script setup lang="ts">` (Composition API, nunca Options API).
- Props com `defineProps<{...}>()` e emits com `defineEmits<{...}>()`.
- Estado compartilhado em stores Pinia em `src/front-end/spa/stores/`.

## Estrutura

Use `templates/Component.vue` como ponto de partida.

## Validação

- `npm run type-check` (vue-tsc) sem erros
- `npm run lint`
