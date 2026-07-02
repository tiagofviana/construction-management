<template>
    <section
        class="min-h-content flex h-full w-11/12 max-w-full overflow-hidden rounded border border-black/20 select-none"
        :class="isDarkTheme ? 'bg-slate-700 text-white' : 'bg-slate-100 text-black'"
    >
        <AlertModal
            v-if="eraserAlertKey > 0"
            type="info"
            title="Deseja continuar?"
            message="Tem certeza que deseja apagar o desenho?"
            ok-label="Confirmar"
            :has-cancel-button="true"
            cancel-label="Cancelar"
            :key="eraserAlertKey"
            @ok="clearPath()"
        />

        <aside
            class="flex w-full max-w-44 flex-1 flex-col overflow-y-auto border-r border-black/10"
            :class="isDarkTheme ? 'border-slate-600 bg-slate-800' : 'border-black/10 bg-slate-100'"
        >
            <template v-if="floorCanvas !== null">
                <div
                    class="flex h-12 items-center border-b-2"
                    :class="isDarkTheme ? 'border-slate-600' : 'border-slate-200'"
                >
                    <label
                        class="relative mx-auto flex w-13 cursor-pointer flex-row justify-between gap-2 overflow-hidden rounded-full border border-black/10 p-0.5 transition-all"
                        :class="isDarkTheme ? 'bg-slate-400' : 'bg-slate-500'"
                    >
                        <input type="checkbox" class="hidden" v-model="isDarkTheme" />

                        <Moon
                            :size="17"
                            class="stroke-gray-600 transition-all duration-500"
                            :class="{ 'opacity-0': !isDarkTheme }"
                        />

                        <Sun
                            :size="18"
                            class="stroke-gray-100 transition-all duration-500"
                            :class="{ 'opacity-0': isDarkTheme }"
                        />

                        <span
                            class="absolute top-1/2 table size-4 -translate-y-1/2 rounded-full bg-gray-100 transition-all duration-500"
                            :class="isDarkTheme ? 'left-full -ml-1 -translate-x-full' : 'left-1'"
                        ></span>
                    </label>
                </div>

                <!-- Tools -->
                <div>
                    <h2 class="px-4 pt-4 pb-2 text-center text-lg">Ferramentas</h2>

                    <ul>
                        <li
                            class="flex cursor-pointer items-center justify-center gap-2 border-t border-b border-transparent p-2 hover:border-black/10"
                            :class="{
                                'hover:bg-slate-600': isDarkTheme,
                                'hover:bg-slate-200': !isDarkTheme,
                                'text-orange-700': activeTool === 'select',
                            }"
                            @click="changeTool('select')"
                        >
                            <MousePointer :size="20" :stroke-width="1.6" />

                            <span
                                class="transition-all"
                                :class="{
                                    'text-lg font-bold': activeTool === 'select',
                                    'text-xs font-semibold': activeTool !== 'select',
                                }"
                            >
                                Selecionar
                            </span>

                            <span class="font-mono text-xs text-purple-700">[S]</span>
                        </li>

                        <li
                            class="flex cursor-pointer items-center justify-center gap-2 border-t border-b border-transparent p-2 hover:border-black/10"
                            :class="{
                                'hover:bg-slate-600': isDarkTheme,
                                'hover:bg-slate-200': !isDarkTheme,
                                'text-blue-700': activeTool === 'line',
                            }"
                            @click="changeTool('line')"
                        >
                            <Ruler :size="activeTool === 'line' ? 23 : 20" :stroke-width="1.6" />

                            <span
                                class="transition-all"
                                :class="{
                                    'text-lg font-bold': activeTool === 'line',
                                    'text-xs font-semibold': activeTool !== 'line',
                                }"
                            >
                                Linha
                            </span>

                            <span class="font-mono text-xs text-purple-700">[D]</span>
                        </li>

                        <li
                            class="flex cursor-pointer items-center justify-center gap-2 border-t border-b border-transparent p-2 hover:border-black/10"
                            :class="{
                                'hover:bg-slate-600': isDarkTheme,
                                'hover:bg-slate-200': !isDarkTheme,
                                'text-blue-700': activeTool === 'curve',
                            }"
                            @click="changeTool('curve')"
                        >
                            <DraftingCompass
                                :size="activeTool === 'curve' ? 23 : 20"
                                :stroke-width="1.6"
                            />
                            <span
                                class="transition-all"
                                :class="{
                                    'text-lg font-bold': activeTool === 'curve',
                                    'text-xs font-semibold': activeTool !== 'curve',
                                }"
                            >
                                Arco
                            </span>

                            <span class="font-mono text-xs text-purple-700">[A]</span>
                        </li>
                    </ul>
                </div>

                <hr
                    class="mt-auto border border-t"
                    :class="isDarkTheme ? 'border-slate-600' : 'border-slate-200'"
                />

                <p
                    class="flex flex-row items-center justify-center gap-2 border-b border-black/10 px-4 py-3 text-xs text-gray-500"
                >
                    <span
                        class="transition-all"
                        :class="{
                            'font-base text-lg text-red-600':
                                mousePosition.x < 0 || mousePosition.x > floorCanvas.config.width,
                        }"
                    >
                        x: {{ mousePosition.x }}
                    </span>

                    <span
                        class="transition-all"
                        :class="{
                            'font-base text-lg text-red-600':
                                mousePosition.y < 0 || mousePosition.y > floorCanvas.config.height,
                        }"
                    >
                        y: {{ mousePosition.y }}
                    </span>
                </p>

                <div class="flex flex-row items-center justify-center px-4 py-3">
                    <button
                        type="button"
                        class="cursor-pointer stroke-black hover:stroke-green-700"
                        @click="floorCanvas.applyZoom(0.25)"
                    >
                        <Plus :size="18" :stroke-width="1.2" class="stroke-inherit" />
                    </button>

                    <button
                        type="button"
                        class="mx-3 w-12 cursor-pointer text-center font-mono text-sm text-yellow-700"
                        @click="floorCanvas.resetZoom()"
                    >
                        {{ Math.round(zoomScale * 100) }}%
                    </button>

                    <button
                        type="button"
                        class="cursor-pointer stroke-black hover:stroke-red-700"
                        @click="floorCanvas.applyZoom(-0.25)"
                    >
                        <Minus :size="18" :stroke-width="1.2" class="stroke-inherit" />
                    </button>
                </div>
            </template>
        </aside>

        <div class="flex flex-1 flex-col">
            <div
                class="flex h-12 items-center justify-start gap-2 border-r border-b-2 border-black/10 px-3"
                :class="
                    isDarkTheme ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-slate-100'
                "
            >
                <header class="flex flex-row gap-4">
                    <button
                        type="button"
                        class="action-btn flex cursor-pointer items-center gap-1 rounded border px-2 py-1 font-semibold transition-all"
                        :class="{
                            'border-black/20 bg-blue-200 text-blue-900': isGridVisible,
                            'border-transparent': !isGridVisible,
                        }"
                        @click="toggleGrid"
                    >
                        <Grid2X2 :size="18" :stroke-width="1.2" /> <span>Grade</span>
                    </button>

                    <button
                        type="button"
                        class="action-btn flex cursor-pointer items-center gap-1 rounded border px-2 py-1 font-semibold transition-all"
                        :class="{
                            'border-black/20 bg-red-200 text-red-900': isSnapOn,
                            'border-transparent': !isSnapOn,
                        }"
                        @click="toggleSnap"
                    >
                        <Magnet :size="18" :stroke-width="1.2" /> <span>Encaixe</span>
                    </button>

                    <button
                        type="button"
                        class="action-btn roundedpx-2 flex cursor-pointer items-center gap-1 py-1 font-semibold transition-all"
                        @click="eraserAlertKey += 1"
                    >
                        <Eraser :size="18" :stroke-width="1.2" /> <span>Limpar</span>
                    </button>
                </header>
            </div>

            <div class="relative flex-1">
                <div ref="container" class="size-full overflow-hidden" :class="cursorClass"></div>

                <div
                    class="absolute top-0 right-0 bottom-0 left-0 inset-shadow-sm inset-shadow-black/30"
                    style="pointer-events: none"
                ></div>
            </div>
        </div>

        <aside
            class="flex max-h-full w-full max-w-56 flex-1 flex-col overflow-y-auto border-l border-black/10"
            :class="isDarkTheme ? 'border-slate-600 bg-slate-800' : 'border-black/10 bg-slate-100'"
        >
            <div
                class="flex h-12 items-center justify-center border-b-2"
                :class="isDarkTheme ? 'border-slate-600' : 'border-slate-200'"
            >
                <h2 class="px-4 text-center text-lg">Propriedades</h2>
            </div>

            <form @submit.prevent="handleSubmit()" class="px-2 py-8">
                <div class="field" :class="{ 'invalid-field': formErrors.name }">
                    <label for="name">Nome:</label>

                    <input
                        id="name"
                        type="text"
                        placeholder=""
                        autocomplete="off"
                        v-model="form.name"
                        @input="delete formErrors.name"
                        required
                    />

                    <FieldError v-if="formErrors.name" :message="formErrors.name[0]" />
                </div>

                <div class="field" :class="{ 'invalid-field': formErrors.description }">
                    <label for="description">Descrição:</label>

                    <textarea
                        id="description"
                        name="description"
                        v-model="form.description"
                        @input="delete formErrors.description"
                        required
                    ></textarea>

                    <FieldError
                        v-if="formErrors.description"
                        :message="formErrors.description[0]"
                    />
                </div>

                <div class="field" :class="{ 'invalid-field': formErrors.area }">
                    <label for="area">Área total (m²):</label>

                    <input
                        id="area"
                        name="area"
                        type="number"
                        inputmode="decimal"
                        min="0"
                        step="0.1"
                        placeholder=""
                        autocomplete="off"
                        v-model="form.area"
                        @input="delete formErrors.area"
                        required
                    />

                    <FieldError v-if="formErrors.area" :message="formErrors.area[0]" />
                </div>

                <div class="field" :class="{ 'invalid-field': formErrors.color }">
                    <label for="identificationColor">Cor de identificação:</label>

                    <input
                        ref="color-input"
                        id="identificationColor"
                        name="identificationColor"
                        type="text"
                        placeholder=""
                        autocomplete="off"
                        v-model="form.color"
                        @input="delete formErrors.color"
                        required
                    />

                    <FieldError v-if="formErrors.color" :message="formErrors.color[0]" />
                </div>

                <button type="submit" class="btn btn-blue mx-auto mt-4" disabled>
                    <TextLoading text="SALVAR" :isLoading="isFormLoading" class="stroke-white" />
                </button>
            </form>

            <hr
                class="mt-auto border border-t"
                :class="isDarkTheme ? 'border-slate-600' : 'border-slate-200'"
            />

            <div v-if="path.length > 0" class="py-3">
                <h2 class="px-2.5 text-center">Resultado</h2>

                <ul class="max-h-44 overflow-y-auto px-2.5">
                    <li v-for="(cmd, index) in path" :key="index">
                        <p class="p-1 font-mono text-gray-500">
                            <span class="pr-0.5 font-bold text-blue-700">
                                {{ cmd.cmd }}
                            </span>

                            <span v-if="cmd.cmd === 'C'" class="text-xs">
                                {{ `${cmd.x1},${cmd.y1}, ${cmd.x2} ${cmd.y2}, ${cmd.x} ${cmd.y}` }}
                            </span>

                            <span v-if="cmd.cmd === 'L'" class="text-xs">
                                {{ `${cmd.x}, ${cmd.y}` }}
                            </span>

                            <span v-if="cmd.cmd === 'M'" class="text-xs">
                                {{ `${cmd.x}, ${cmd.y}` }}
                            </span>
                        </p>
                    </li>
                </ul>
            </div>
        </aside>
    </section>
</template>

<script lang="ts" setup>
import { ref, shallowRef, useTemplateRef, computed, onMounted, onUnmounted } from 'vue'
import {
    Moon,
    Sun,
    MousePointer,
    DraftingCompass,
    Ruler,
    Plus,
    Minus,
    Grid2X2,
    Magnet,
    Eraser,
} from '@lucide/vue'
import Coloris from '@melloware/coloris'
import type { Point, PathCommand, ToolOptions } from '@/entities/editor/floor/types'
import { FloorCanvas } from '@/entities/editor/floor'
import AlertModal from '@/components/alerts/AlertModal.vue'
import FieldError from '@/components/form/FieldError.vue'
import TextLoading from '@/components/loading/TextLoading.vue'
import { PathSerializer } from '@/entities/editor/floor/serializers'

const formErrors = ref<{
    name?: string[]
    description?: string[]
    path?: string[]
    color?: string[]
    area?: string[]
}>({})

interface FormData {
    name: string
    description: string
    path: string
    color: string
    area: number
}

const form = defineModel<FormData>({
    required: true,
    default: () => ({
        name: '',
        description: '',
        color: '#bcd9ff',
        area: 0,
    }),
})

const isDarkTheme = ref(false)
const isFormLoading = ref(false)
const container = useTemplateRef('container')
const colorInput = useTemplateRef('color-input')
const floorCanvas = shallowRef<null | FloorCanvas>(null)
const isGridVisible = ref(true)
const isSnapOn = ref(false)
const activeTool = ref<ToolOptions>(null)
const zoomScale = ref(1)
const mousePosition = ref<Point>({ x: 0, y: 0 })
const path = ref<Array<PathCommand>>([])
const eraserAlertKey = ref(0)

const cursorClass = computed(() => ({
    'cursor-grab active:cursor-grabbing': activeTool.value === null,
    'cursor-default': activeTool.value === 'select',
    'cursor-crosshair': activeTool.value === 'line' || activeTool.value === 'curve',
}))

onMounted(() => {
    const el = container.value as HTMLDivElement
    const fc = new FloorCanvas(el)

    fc.onMouseTrackChange = (value) => {
        mousePosition.value = value
    }

    fc.onZoomChange = (value) => {
        zoomScale.value = value
    }

    fc.onPathChange = (value) => {
        path.value = value
    }

    fc.setColor(form.value.color)

    floorCanvas.value = fc

    Coloris({
        el: colorInput.value as HTMLInputElement,
        theme: 'polaroid',
        themeMode: 'light',
        format: 'hex',
        formatToggle: false,
        alpha: false,
        wrap: false,
        defaultColor: form.value.color,
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
            form.value.color = color
            floorCanvas.value?.setColor(color)
        },
    })

    window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)

    Coloris.close()

    floorCanvas.value?.destroy()
    floorCanvas.value = null
})

function toggleGrid() {
    isGridVisible.value = !isGridVisible.value
    floorCanvas.value?.gridVisibility(isGridVisible.value)
}

function toggleSnap() {
    isSnapOn.value = !isSnapOn.value
    floorCanvas.value?.snapActivation(isSnapOn.value)
}

function clearPath() {
    path.value = []
    floorCanvas.value?.clearPath()
}

function changeTool(tool: ToolOptions) {
    if (!floorCanvas.value) return

    if (activeTool.value === tool) {
        tool = null
    }

    floorCanvas.value.activeTool = tool
    activeTool.value = tool
}

function onKeyDown(event: KeyboardEvent) {
    const key = event.key

    if (key === 's' || key === 'S') changeTool('select')
    if (key === 'd' || key === 'D') changeTool('line')
    if (key === 'a' || key === 'C') changeTool('curve')
    if (key === 'Escape') changeTool(null)

    // if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected()
}

function handleSubmit() {
    const data = PathSerializer.toString(path.value)
    console.log(data)
}
</script>
