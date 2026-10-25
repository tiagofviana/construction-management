<template>
    <div
        class="flex h-full w-full flex-col overflow-hidden rounded-t border border-black/20 bg-slate-100 select-none"
        style="height: 640px"
    >
        <header
            class="flex w-full items-center justify-between overflow-x-auto border-b-2 border-slate-200 bg-slate-100"
        >
            <RoomSize
                class="flex flex-row"
                :min="20"
                :max="200"
                :step="10"
                :initial-size="roomSettings.size"
                @change="setMapSize"
            />

            <div class="flex flex-col justify-center px-4 py-1 text-gray-600">
                <label for="svgVisualizerRoomColor" class="text-xs font-bold">
                    Cor do cômodo
                </label>

                <div class="flex items-center gap-2 py-1">
                    <input
                        ref="color-input"
                        id="svgVisualizerRoomColor"
                        type="text"
                        autocomplete="off"
                        class="rounded border border-black/20 bg-white px-2 py-0.5 font-mono text-sm text-gray-900"
                        v-model="roomSettings.color"
                    />
                </div>
            </div>

            <div class="ml-auto flex flex-row items-center border-r border-black/10 px-4 py-2">
                <button
                    type="button"
                    class="cursor-pointer stroke-black hover:stroke-green-700"
                    aria-label="Aumentar zoom"
                    @click="svgCanvas?.eventsHandler.zoom.apply(0.25)"
                >
                    <Plus :size="18" :stroke-width="1.2" class="stroke-inherit" />
                </button>

                <button
                    type="button"
                    class="mx-3 w-12 cursor-pointer text-center font-mono text-sm text-yellow-700"
                    title="Centralizar"
                    @click="svgCanvas?.centralize()"
                >
                    {{ Math.round(zoom * 100) }}%
                </button>

                <button
                    type="button"
                    class="cursor-pointer stroke-black hover:stroke-red-700"
                    aria-label="Diminuir zoom"
                    @click="svgCanvas?.eventsHandler.zoom.apply(-0.25)"
                >
                    <Minus :size="18" :stroke-width="1.2" class="stroke-inherit" />
                </button>
            </div>
        </header>

        <div class="relative min-h-72 flex-1">
            <div ref="container" class="absolute inset-0"></div>

            <div
                class="pointer-events-none absolute inset-0 inset-shadow-sm inset-shadow-black/20"
            ></div>

            <p
                v-if="errorMessage"
                class="absolute inset-x-0 top-0 m-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
                {{ errorMessage }}
            </p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, shallowRef, useTemplateRef, watch, onMounted, onBeforeUnmount } from 'vue'
import { Plus, Minus } from '@lucide/vue'
import Coloris from '@melloware/coloris'
import '@melloware/coloris/dist/coloris.css'
import { SVGCanvas, SVGParseError } from './visualizer/index'
import RoomSize from './visualizer/RoomSize.vue'
import type { Size } from './visualizer/types'

const props = defineProps({
    svg: {
        type: String,
        required: true,
    },
})

const container = useTemplateRef('container')
const colorInput = useTemplateRef('color-input')
const svgCanvas = shallowRef<SVGCanvas | null>(null)
const zoom = ref(1)
const errorMessage = ref('')
const roomSettings = reactive({
    size: {
        width: 50,
        height: 50,
    },
    color: '#bcd9ff',
})

onMounted(() => {
    const canvas = new SVGCanvas(container.value as HTMLDivElement)
    canvas.eventsHandler.zoom.onZoomChange = (value) => {
        zoom.value = value
    }
    canvas.setColor(roomSettings.color)
    canvas.setMapSize(roomSettings.size)
    canvas.setup()

    svgCanvas.value = canvas
    renderSVG(props.svg)
    setupColorPicker()
})

onBeforeUnmount(() => {
    Coloris.close()
    svgCanvas.value?.destroy()
    svgCanvas.value = null
})

watch(
    () => props.svg,
    (svg) => renderSVG(svg),
)

function setupColorPicker() {
    Coloris.init()
    Coloris({
        el: colorInput.value as HTMLInputElement,
        theme: 'polaroid',
        themeMode: 'light',
        format: 'hex',
        formatToggle: false,
        alpha: false,
        wrap: false,
        defaultColor: roomSettings.color,
        swatches: [
            // Red
            '#fba7a7',

            // Orange
            '#f7de9b',

            // Yellow
            '#fef9c2',

            // Green
            '#78d99c',

            // Cyan
            '#9de9f0',

            // Blue
            '#b5d5ff',

            // Purple
            '#b49fce',

            // Stone
            '#b8b1b9',

            // Neutral
            '#d4d4d4',

            // Gray
            '#eaeaea',

            // White
            '#ffffff',
        ],
        onChange: (color) => {
            roomSettings.color = color
            svgCanvas.value?.setColor(color)
        },
    })
}

async function renderSVG(svg: string) {
    if (!svgCanvas.value) return

    try {
        if (await svgCanvas.value.setSVG(svg)) errorMessage.value = ''
    } catch (error) {
        if (!(error instanceof SVGParseError)) throw error
        errorMessage.value = error.message
    }
}

function setMapSize(size: Size) {
    roomSettings.size = size
    svgCanvas.value?.setMapSize(size)
}
</script>
