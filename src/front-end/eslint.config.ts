import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'

export default defineConfigWithVueTs(
    {
        name: 'app/files-to-lint',
        files: ['**/*.{ts,mts,tsx,vue}'],
    },

    globalIgnores(['**/venv/*', '**/env/*', '**/node_modules/*', '**/*.min.*']),

    pluginVue.configs['flat/essential'],
    vueTsConfigs.recommended,
    eslintConfigPrettier,
)
