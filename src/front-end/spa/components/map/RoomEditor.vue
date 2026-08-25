<template>
    <Teleport to="body">
        <section
            v-if="!isHidden"
            class="fixed top-0 left-0 z-100 flex h-full max-h-dvh w-full overflow-hidden bg-black/40 py-8 shadow-2xl shadow-black/10 backdrop-blur-sm select-none"
        >
            <ModalAlert
                v-if="modalAlert.key > 0"
                :key="modalAlert.key"
                :type="modalAlert.type"
                :title="modalAlert.title"
                :message="modalAlert.message"
                :ok-label="modalAlert.okLabel"
                :has-cancel-button="modalAlert.hasCancelButton"
                :cancel-label="modalAlert.cancelLabel"
                @ok="modalAlert.okFunction"
            />

            <div
                class="mx-auto flex h-full w-11/12 overflow-hidden rounded-lg border border-black/20 bg-slate-100"
                ref="editor"
            >
                <aside
                    class="flex w-full max-w-44 flex-1 flex-col overflow-y-auto border-r border-black/10 bg-slate-100"
                >
                    <template v-if="roomCanvas !== null">
                        <div
                            class="flex h-12 items-center justify-center border-b border-slate-200"
                        >
                            <h2 class="px-4 text-center text-lg">Ferramentas</h2>
                        </div>

                        <ul>
                            <li
                                class="flex cursor-pointer items-center justify-center gap-2 border-t border-b border-transparent p-2 hover:border-black/10 hover:bg-slate-200"
                                :class="{
                                    'text-orange-700': controller.tool === 'select',
                                }"
                                @click="changeTool('select')"
                            >
                                <SquareMousePointer :size="20" :stroke-width="1.6" />

                                <span
                                    class="transition-all"
                                    :class="{
                                        'text-lg font-bold': controller.tool === 'select',
                                        'text-xs font-semibold': controller.tool !== 'select',
                                    }"
                                >
                                    Selecionar
                                </span>

                                <span class="font-mono text-xs text-purple-700">[S]</span>
                            </li>

                            <li
                                class="flex cursor-pointer items-center justify-center gap-2 border-t border-b border-transparent p-2 hover:border-black/10 hover:bg-slate-200"
                                :class="{
                                    'text-blue-700': controller.tool === 'line',
                                }"
                                @click="changeTool('line')"
                            >
                                <Ruler
                                    :size="controller.tool === 'line' ? 23 : 20"
                                    :stroke-width="1.6"
                                />

                                <span
                                    class="transition-all"
                                    :class="{
                                        'text-lg font-bold': controller.tool === 'line',
                                        'text-xs font-semibold': controller.tool !== 'line',
                                    }"
                                >
                                    Linha
                                </span>

                                <span class="font-mono text-xs text-purple-700">[D]</span>
                            </li>

                            <li
                                class="flex cursor-pointer items-center justify-center gap-2 border-t border-b border-transparent p-2 hover:border-black/10 hover:bg-slate-200"
                                :class="{
                                    'text-blue-700': controller.tool === 'curve',
                                }"
                                @click="changeTool('curve')"
                            >
                                <DraftingCompass
                                    :size="controller.tool === 'curve' ? 23 : 20"
                                    :stroke-width="1.6"
                                />
                                <span
                                    class="transition-all"
                                    :class="{
                                        'text-lg font-bold': controller.tool === 'curve',
                                        'text-xs font-semibold': controller.tool !== 'curve',
                                    }"
                                >
                                    Arco
                                </span>

                                <span class="font-mono text-xs text-purple-700">[A]</span>
                            </li>
                        </ul>

                        <hr class="mt-auto border border-t border-slate-200" />

                        <p
                            class="flex flex-row items-center justify-center gap-2 border-b border-black/10 px-4 py-3 text-xs text-gray-500"
                        >
                            <span
                                class="transition-all"
                                :class="{
                                    'font-base text-lg text-blue-600': controller.mouse.isDragging,
                                    'font-base text-lg text-red-600':
                                        controller.mouse.point.x < 0 ||
                                        controller.mouse.point.x > roomCanvas.settings.map.width,
                                }"
                            >
                                x: {{ controller.mouse.point.x }}
                            </span>

                            <span
                                class="transition-all"
                                :class="{
                                    'font-base text-lg text-blue-600': controller.mouse.isDragging,
                                    'font-base text-lg text-red-600':
                                        controller.mouse.point.y < 0 ||
                                        controller.mouse.point.y > roomCanvas.settings.map.height,
                                }"
                            >
                                y: {{ controller.mouse.point.y }}
                            </span>
                        </p>

                        <div class="flex flex-row items-center justify-center px-4 py-3">
                            <button
                                type="button"
                                class="cursor-pointer stroke-black hover:stroke-green-700"
                                @click="roomCanvas.eventsHandler.zoom.apply(0.25)"
                            >
                                <Plus :size="18" :stroke-width="1.2" class="stroke-inherit" />
                            </button>

                            <button
                                type="button"
                                class="mx-3 w-12 cursor-pointer text-center font-mono text-sm text-yellow-700"
                                @click="roomCanvas.centralize()"
                            >
                                {{ Math.round(controller.zoom.scale * 100) }}%
                            </button>

                            <button
                                type="button"
                                class="cursor-pointer stroke-black hover:stroke-red-700"
                                @click="roomCanvas.eventsHandler.zoom.apply(-0.25)"
                            >
                                <Minus :size="18" :stroke-width="1.2" class="stroke-inherit" />
                            </button>
                        </div>
                    </template>
                </aside>

                <div class="flex flex-1 flex-col">
                    <div
                        class="flex h-12 items-center justify-start gap-2 border-r border-b-2 border-slate-200 bg-slate-100 px-3"
                    >
                        <header class="flex flex-row gap-4">
                            <button
                                type="button"
                                class="action-btn flex cursor-pointer items-center gap-1 rounded border px-2 py-1 font-semibold transition-all"
                                :class="{
                                    'border-black/20 bg-gray-300 text-gray-900':
                                        controller.grid.isVisible,
                                    'border-transparent': !controller.grid.isVisible,
                                }"
                                @click="toggleGrid()"
                            >
                                <Grid2X2 :size="18" :stroke-width="1.2" /> <span>Grade</span>
                            </button>

                            <button
                                type="button"
                                class="action-btn flex cursor-pointer items-center gap-1 rounded border px-2 py-1 font-semibold transition-all"
                                :class="{
                                    'border-black/20 bg-red-200 text-red-900': controller.snap.isOn,
                                    'border-transparent': !controller.snap.isOn,
                                }"
                                @click="toggleSnap()"
                            >
                                <Magnet :size="18" :stroke-width="1.2" /> <span>Encaixe</span>
                            </button>

                            <button
                                type="button"
                                class="action-btn flex cursor-pointer items-center gap-1 rounded border px-2 py-1 font-semibold transition-all"
                                :class="{
                                    'border-black/20 bg-blue-200 text-blue-900':
                                        controller.measures.isVisible,
                                    'border-transparent': !controller.measures.isVisible,
                                }"
                                @click="toggleMeasures()"
                            >
                                <RulerDimensionLine :size="18" :stroke-width="1.2" />
                                <span>Medidas</span>
                            </button>

                            <button
                                type="button"
                                class="action-btn roundedpx-2 flex cursor-pointer items-center gap-1 py-1 font-semibold transition-all"
                                @click="
                                    setModalAlert({
                                        type: 'info',
                                        title: 'Deseja continuar?',
                                        message: 'Tem certeza que deseja apagar o desenho',
                                        okLabel: 'Confirmar',
                                        hasCancelButton: true,
                                        cancelLabel: 'Cancel',
                                        okFunction: () => {
                                            path = []
                                            roomCanvas?.clear()
                                        },
                                    })
                                "
                            >
                                <Eraser :size="18" :stroke-width="1.2" /> <span>Limpar</span>
                            </button>
                        </header>
                    </div>

                    <div class="relative flex-1">
                        <div
                            ref="container"
                            class="size-full"
                            :class="{
                                'cursor-crosshair': ['curve', 'line'].includes(
                                    controller.tool || '',
                                ),
                            }"
                        ></div>

                        <div
                            class="absolute top-0 right-0 bottom-0 left-0 inset-shadow-sm inset-shadow-black/30"
                            style="pointer-events: none"
                        ></div>
                    </div>
                </div>

                <aside
                    class="relative flex w-full max-w-56 flex-1 flex-col overflow-hidden border-l border-black/10 bg-slate-100"
                >
                    <div class="flex h-12 flex-row border-b border-slate-200">
                        <div class="flex flex-1 items-center justify-center">
                            <h2 class="px-4 text-lg">Propriedades</h2>
                        </div>

                        <button
                            type="button"
                            @click="isHidden = true"
                            class="ml-auto block cursor-pointer border-l border-black/10 stroke-gray-400 p-1 hover:stroke-black"
                        >
                            <X
                                :size="36"
                                :strokeWidth="2"
                                aria-label="Fechar"
                                class="stroke-inherit"
                            />
                        </button>
                    </div>

                    <SaveForm
                        ref="saveForm"
                        class="flex-1"
                        :room="props.room"
                        :path="path"
                        :isUpdate="props.isUpdate"
                        @saved="handleSaved()"
                        @changeColor="
                            (v) => {
                                roomCanvas?.setColor(v)
                            }
                        "
                    />
                </aside>
            </div>
        </section>
    </Teleport>
</template>

<script lang="ts" setup>
import {
    ref,
    shallowRef,
    reactive,
    useTemplateRef,
    onMounted,
    onBeforeUnmount,
    PropType,
} from 'vue'
import {
    SquareMousePointer,
    DraftingCompass,
    Ruler,
    Plus,
    Minus,
    Grid2X2,
    Magnet,
    Eraser,
    RulerDimensionLine,
    X,
} from '@lucide/vue'
import gsap from 'gsap'
import ModalAlert, { type ModalType } from '@/components/alerts/ModalAlert.vue'
import SaveForm from '@/components/map/modules/room/SaveForm.vue'
import { RoomCanvas } from './modules/room/index.js'
import type { Point, PathCommand, Room } from './modules/types.js'
import type { ToolOptions } from './modules/room/core/index.js'
import { PathSerializer } from './modules/serializers.js'

interface RoomOptions {
    tool: ToolOptions
    zoom: {
        scale: number
    }
    mouse: {
        point: Point
        isDragging: boolean
    }
    grid: {
        isVisible: boolean
    }
    measures: { isVisible: boolean }
    snap: { isOn: boolean }
}

const emit = defineEmits<{
    saved: []
}>()

interface ModalSettings {
    type: ModalType
    title: string
    message: string
    okLabel: string
    hasCancelButton: boolean
    cancelLabel: string
    okFunction: () => void
}

const props = defineProps({
    room: {
        type: Object as PropType<Room>,
        required: false,
    },
    isUpdate: {
        type: Boolean,
        required: true,
    },
})

const modalAlert = ref<ModalSettings & { key: number }>({
    type: 'success',
    title: '',
    message: '',
    key: 0,
    okLabel: '',
    hasCancelButton: false,
    cancelLabel: '',
    okFunction: () => {},
})

const isHidden = ref<boolean>(false)
const container = useTemplateRef('container')
const roomCanvas = shallowRef<null | RoomCanvas>(null)

const controller = reactive<RoomOptions>({
    tool: null,
    zoom: { scale: 1 },
    mouse: { point: { x: 0, y: 0 }, isDragging: false },
    grid: { isVisible: true },
    snap: { isOn: true },
    measures: { isVisible: true },
})

const path = ref<Array<PathCommand>>([])
const saveForm = useTemplateRef('saveForm')
const editor = useTemplateRef('editor')

onMounted(() => {
    animateIn()
    window.addEventListener('keydown', onKeyDown)
    const elmt = container.value as HTMLDivElement
    const rc = new RoomCanvas(elmt)

    rc.svgPath.onPathChange = (path) => {
        saveForm.value?.setSvgPath(path)
    }

    if (props.room) {
        path.value = PathSerializer.fromString(props.room.svgPath)
        rc.setPath(path.value)
    } else {
        rc.clear()
    }

    rc.eventsHandler.mouseTracker.onTrackChange = (point) => {
        controller.mouse = {
            point: point,
            isDragging: false,
        }
    }

    rc.eventsHandler.mouseTracker.onDragChange = (point) => {
        controller.mouse = {
            point: point,
            isDragging: true,
        }
    }

    rc.eventsHandler.zoom.onZoomChange = (value) => {
        controller.zoom.scale = value
    }

    rc.setColor(saveForm.value!.form.color)
    rc.setup()

    roomCanvas.value = rc
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
    roomCanvas.value?.setTool(null)

    roomCanvas.value?.destroy()
    roomCanvas.value = null
})

function animateIn() {
    gsap.from(editor.value, {
        opacity: 0,
        y: '20%',
        duration: 0.5,
        ease: 'power1.in',
    })
}

function setModalAlert(settings: ModalSettings) {
    modalAlert.value = {
        key: modalAlert.value.key + 1,
        type: settings.type,
        title: settings.title,
        message: settings.message,
        okLabel: settings.okLabel,
        hasCancelButton: settings.hasCancelButton,
        cancelLabel: settings.cancelLabel,
        okFunction: settings.okFunction,
    }
}

function toggleGrid() {
    controller.grid.isVisible = !controller.grid.isVisible
    roomCanvas.value!.gridVisibility(controller.grid.isVisible)
}

function toggleMeasures() {
    controller.measures.isVisible = !controller.measures.isVisible
    roomCanvas.value!.isInfoVisible(controller.measures.isVisible)
}

function toggleSnap() {
    controller.snap.isOn = !controller.snap.isOn
    roomCanvas.value!.settings.snap.isOn = controller.snap.isOn
}

function changeTool(tool: ToolOptions) {
    if (!roomCanvas.value) return

    if (controller.tool === tool) {
        tool = null
    }

    roomCanvas.value.setTool(tool)
    controller.tool = tool
}

function onKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase()

    const target = event.target as HTMLElement
    if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
    ) {
        return
    }

    if (key === 's') changeTool('select')
    if (key === 'd') changeTool('line')
    if (key === 'a') changeTool('curve')
    if (key === 'escape') changeTool(null)
}

function handleSaved() {
    emit('saved')
    isHidden.value = true
}
</script>
