<template>
    <div>
        <div v-if="parserError" class="text-red-500">{{ parserError }}</div>

        <div class="editor-wrapper">
            <div role="editor" class="relative w-full">
                <textarea
                    v-model="data"
                    ref="textarea"
                    spellcheck="false"
                    @scroll="syncLeftScroll()"
                    @input="(updateHighlight(), syncLeftScroll())"
                    @keydown="editorActions($event)"
                ></textarea>

                <pre
                    ref="pre"
                    class="line-numbers"
                ><code ref="code" class="language-svg"></code></pre>
            </div>
        </div>
    </div>

    <div
        class="flex flex-nowrap items-center justify-between gap-4 rounded-b border border-black/20 bg-gray-200 py-1 whitespace-nowrap"
    >
        <ul class="flex items-center gap-8 overflow-hidden text-gray-600">
            <li class="flex items-center gap-1">
                <kbd
                    class="rounded border border-black/20 bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-900 shadow-sm"
                >
                    Ctrl
                </kbd>

                <span>+</span>

                <kbd
                    class="rounded border border-black/20 bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-900 shadow-sm"
                >
                    S
                </kbd>
                <span class="ml-1">Salvar</span>
            </li>

            <li class="flex items-center gap-1">
                <kbd
                    class="rounded border border-black/20 bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-900 shadow-sm"
                    >Ctrl</kbd
                >

                <span>+</span>

                <kbd
                    class="rounded border border-black/20 bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-900 shadow-sm"
                >
                    P
                </kbd>
                <span class="ml-1"> Prettier </span>
            </li>
        </ul>

        <p class="shrink-0 text-gray-600">
            <span class="font-mono text-gray-900">{{ data.length }}</span> caracteres
        </p>
    </div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef, onMounted } from 'vue'
import Prism from 'prismjs'
import 'prismjs/plugins/line-numbers/prism-line-numbers'
import 'prismjs/plugins/line-highlight/prism-line-highlight'
import 'prismjs/plugins/line-highlight/prism-line-highlight.css'
import 'prismjs/components/prism-markup'
import 'prismjs/themes/prism-tomorrow.css' // Theme
import prettier from 'prettier/standalone'
import type { Options as PrettierOptions } from 'prettier'
import { type Plugin } from 'prettier'
import * as htmlPlugin from 'prettier/plugins/html'

const props = defineProps({
    initialData: {
        type: String,
        required: true,
    },
})

const emit = defineEmits<{
    (e: 'compressedData', payload: string): void
}>()

const data = ref('')
const textarea = useTemplateRef<HTMLTextAreaElement>('textarea')
const pre = useTemplateRef<HTMLElement>('pre')
const code = useTemplateRef<HTMLElement>('code')
const parserError = ref('')

onMounted(() => {
    if (!props.initialData) return

    const textareaElmt = textarea.value as HTMLTextAreaElement
    textareaElmt.value = props.initialData
    prettifyTextarea()
})

function editorActions(event: KeyboardEvent) {
    const textareaElmt = textarea.value as HTMLTextAreaElement
    const text = textareaElmt.value

    const beforeCursor = text.substring(0, textareaElmt.selectionStart)
    const afterCursor = text.slice(textareaElmt.selectionEnd, textareaElmt.value.length)
    const currentLine = beforeCursor.substring(beforeCursor.lastIndexOf('\n') + 1)

    switch (event.key) {
        case 'Tab': {
            event.preventDefault()
            textareaElmt.value = `${beforeCursor}\t${afterCursor}`
            const position = beforeCursor.length + 1
            textareaElmt.setSelectionRange(position, position)
            break
        }

        case 'Enter':
            event.preventDefault()
            // Match leading whitespace (spaces and/or tabs)
            const indentMatch = currentLine.match(/^[ \t]*/)
            const indent = indentMatch ? indentMatch[0] : ''
            const insertion = `\n${indent}`
            textareaElmt.value = `${beforeCursor}${insertion}${afterCursor}`
            const position = beforeCursor.length + insertion.length
            textareaElmt.setSelectionRange(position, position)
            break

        case 'p':
            if (!(event.ctrlKey || event.metaKey)) return
            event.preventDefault()
            prettifyTextarea()
            break

        case 's':
            if (!(event.ctrlKey || event.metaKey)) return
            event.preventDefault()
            sendCompressData()
            break
    }

    updateHighlight()
}

function prettifyTextarea() {
    try {
        prettier
            .format(data.value, {
                parser: 'html',
                plugins: [htmlPlugin],
                tabWidth: 4,
                printWidth: 60,
            } as PrettierOptions)
            .then((formatted) => {
                data.value = formatted
                updateHighlight()
            })
    } catch (err) {
        console.error(err)
    } finally {
        updateHighlight()
    }
}

function updateHighlight() {
    let text = textarea.value?.value as string
    text = text.replace(/&/g, '&amp;')
    text = text.replace(/</g, '&lt')
    text = text.replace(/>/g, '&gt;')

    if (text[text.length - 1] == '\n') text += ' '

    const codeElmt = code.value as HTMLElement
    codeElmt.innerHTML = text

    Prism.highlightElement(codeElmt, false, () => {})
}

function syncLeftScroll() {
    pre.value!.scrollLeft = textarea.value!.scrollLeft
}

function sendCompressData() {
    const svg = textarea.value?.value as string
    const parser = new DOMParser()
    const doc = parser.parseFromString(svg, 'image/svg+xml')
    const error = doc.querySelector('parsererror')

    if (error) {
        parserError.value = error.textContent
        emit('compressedData', '')
        return
    }

    parserError.value = ''
    const compressedData = svg
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
        .trim()

    emit('compressedData', compressedData)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@100..700&display=swap');

.editor-wrapper {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    height: 100%;
    max-height: 720px;
    overflow-x: hidden;
    overflow-y: auto;
}

div[role='editor'] {
    &:deep(*) {
        box-sizing: border-box;
        margin: 0;
        tab-size: 4;
        font-family: 'Roboto Mono', monospace;
        font-size: 1em;
        line-height: 1.5;
    }

    &:deep(textarea),
    &:deep(pre),
    &:deep(pre code) {
        padding-right: 4px;
        white-space: pre-wrap;
        overflow-wrap: break-word;
        word-break: normal;
        letter-spacing: normal;
    }

    &:deep(textarea),
    &:deep(pre) {
        padding: 0 0 12px 58px;
        min-height: 320px;
        width: 100%;
        border: 0;
        outline: none;
    }

    &:deep(pre) {
        overflow: hidden;
    }

    &:deep(textarea) {
        position: absolute;
        inset: 0;
        height: 100%;
        overflow: hidden;
        color: transparent;
        z-index: 2;
        resize: none;
        background: transparent;
        caret-color: #eefd16;
    }

    &:deep(.line-numbers .line-numbers-rows) {
        position: absolute;
        top: 3px;
        left: 0;
        pointer-events: none;
        font-size: 100%;
        width: 50px;
        letter-spacing: -1px;
        border-right: 1px solid #359ac9;
        user-select: none;
    }

    &:deep(.line-numbers-rows > span) {
        display: block;
        counter-increment: linenumber;
    }

    &:deep(.line-numbers-rows > span:before) {
        content: counter(linenumber);
        color: #359ac9;
        display: block;
        padding-right: 0.8em;
        text-align: right;
        background: #2d2d2d;
    }
}
</style>
