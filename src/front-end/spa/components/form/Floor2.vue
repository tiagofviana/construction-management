<template>
    <section
        class="min-h-content flex h-full w-11/12 max-w-full overflow-hidden rounded border border-black/20 select-none"
        :class="isDarkTheme ? 'bg-slate-700 text-white' : 'bg-slate-100 text-black'"
    >
        <aside
            class="flex w-full max-w-44 flex-1 flex-col overflow-y-auto border-r border-black/10"
            :class="isDarkTheme ? 'border-slate-600 bg-slate-800' : 'border-black/10 bg-slate-100'"
        >
            <!-- Dark mode toggle -->
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
                        class="flex cursor-pointer items-center justify-center gap-2 border-t border-b p-2 hover:border-black/10"
                        :class="{
                            'hover:bg-slate-600': isDarkTheme,
                            'hover:bg-slate-200': !isDarkTheme,
                            'border-black/10': activeTool === 'select',
                            'border-transparent': activeTool !== 'select',
                            'bg-slate-600': activeTool === 'select' && isDarkTheme,
                            'bg-slate-200': activeTool === 'select' && !isDarkTheme,
                        }"
                        @click="changeActiveTool('select')"
                    >
                        <MousePointer :size="20" :stroke-width="1.6" />
                        <span class="text-xs font-semibold">Selecionar</span>
                    </li>

                    <li
                        class="flex cursor-pointer items-center justify-center gap-2 border-t border-b p-2 hover:border-black/10"
                        :class="{
                            'hover:bg-slate-600': isDarkTheme,
                            'hover:bg-slate-200': !isDarkTheme,
                            'border-black/10': activeTool === 'line',
                            'border-transparent': activeTool !== 'line',
                            'bg-slate-600': activeTool === 'line' && isDarkTheme,
                            'bg-slate-200': activeTool === 'line' && !isDarkTheme,
                        }"
                        @click="changeActiveTool('line')"
                    >
                        <Ruler :size="20" :stroke-width="1.6" />
                        <span class="text-xs font-semibold">Linha</span>
                    </li>

                    <li
                        class="flex cursor-pointer items-center justify-center gap-2 border-t border-b p-2 hover:border-black/10"
                        :class="{
                            'hover:bg-slate-600': isDarkTheme,
                            'hover:bg-slate-200': !isDarkTheme,
                            'border-black/10': activeTool === 'arc',
                            'border-transparent': activeTool !== 'arc',
                            'bg-slate-600': activeTool === 'arc' && isDarkTheme,
                            'bg-slate-200': activeTool === 'arc' && !isDarkTheme,
                        }"
                        @click="changeActiveTool('arc')"
                    >
                        <DraftingCompass :size="20" :stroke-width="1.6" />
                        <span class="text-xs font-semibold">Arco</span>
                    </li>
                </ul>
            </div>

            <hr
                class="mt-auto border border-t"
                :class="isDarkTheme ? 'border-slate-600' : 'border-slate-200'"
            />

            <div
                class="flex flex-row items-center justify-center gap-2 border-b border-black/10 px-4 py-3 text-xs text-gray-500"
            >
                <span>x: {{ containerMousePos.x }}</span>
                <span>y: {{ containerMousePos.y }}</span>
            </div>

            <div class="flex flex-row items-center justify-center px-4 py-3">
                <button
                    type="button"
                    class="cursor-pointer stroke-black hover:stroke-green-700"
                    @click="applyZoom(zoomScale + 0.25)"
                >
                    <Plus :size="18" :stroke-width="1.2" class="stroke-inherit" />
                </button>

                <button
                    type="button"
                    class="mx-3 w-12 cursor-pointer text-center font-mono text-sm text-yellow-700"
                    @click="resetZoom()"
                >
                    {{ Math.round(zoomScale * 100) }}%
                </button>

                <button
                    type="button"
                    class="cursor-pointer stroke-black hover:stroke-red-700"
                    @click="applyZoom(zoomScale - 0.25)"
                >
                    <Minus :size="18" :stroke-width="1.2" class="stroke-inherit" />
                </button>
            </div>
        </aside>

        <div class="flex flex-1 flex-col">
            <div
                class="flex h-12 items-center justify-start gap-2 border-r border-b-2 border-black/10 px-3"
                :class="
                    isDarkTheme ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-slate-100'
                "
            >
                <header
                    type="button"
                    class="action-btn flex cursor-pointer items-center gap-1 rounded border px-2 py-1 font-semibold transition-all"
                    :class="{
                        'border-black/20 bg-blue-200 text-blue-900': isGridVisible,
                        'border-transparent': !isGridVisible,
                    }"
                    @click="toggleGrid"
                >
                    <Grid2X2 :size="18" :stroke-width="1.2" /> <span>Grid </span>
                </header>
            </div>

            <div
                ref="container"
                class="flex-1 overflow-hidden inset-shadow-sm inset-shadow-black/30"
                :class="cursorClass"
                @pointerout="onPointerOut()"
            ></div>
        </div>

        <aside
            class="flex w-full max-w-44 flex-1 flex-col overflow-y-auto border-l border-black/10"
            :class="isDarkTheme ? 'border-slate-600 bg-slate-800' : 'border-black/10 bg-slate-100'"
        >
            <div
                class="flex h-12 items-center justify-center border-b-2"
                :class="isDarkTheme ? 'border-slate-600' : 'border-slate-200'"
            >
                <h2 class="px-4 text-center text-lg">Propriedades</h2>
            </div>

            <hr
                class="mt-auto border border-t"
                :class="isDarkTheme ? 'border-slate-600' : 'border-slate-200'"
            />

            <div v-if="resultPath.length > 0" class="py-3">
                <h2 class="px-2.5 text-center">Resultado</h2>

                <ul class="max-h-32 overflow-y-auto px-2.5">
                    <li v-for="(cmd, index) in resultPath" :key="index">
                        <p class="truncate p-1 font-mono text-gray-500">
                            <span class="pr-0.5 font-bold text-blue-700">
                                {{ cmd.cmd }}
                            </span>

                            <span v-if="cmd.cmd === 'A'" class="text-xs">
                                {{ `${cmd.x},${cmd.y} r${cmd.rx}×${cmd.ry}` }}
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
import { ref, useTemplateRef, computed, onMounted, onUnmounted } from 'vue'
import { Moon, Sun, MousePointer, DraftingCompass, Ruler, Plus, Minus, Grid2X2 } from '@lucide/vue'
import Konva from 'konva'
import type { Vector2d } from 'konva/lib/types'
import type { KonvaEventObject } from 'konva/lib/Node'
import { FloorCanvas } from '@/entities/editor/floor/canvas'

type ToolType = null | 'line' | 'select' | 'arc'

interface Point {
    x: number
    y: number
}

interface MoveCmd {
    cmd: 'M'
    x: number
    y: number
}
interface LineCmd {
    cmd: 'L'
    x: number
    y: number
}
interface ArcCmd {
    cmd: 'A'
    rx: number
    ry: number
    xAxisRotation: number
    largeArc: boolean
    sweep: boolean
    x: number
    y: number
}
type PathCmd = MoveCmd | LineCmd | ArcCmd

const isDarkTheme = ref(false)
const container = useTemplateRef('container')
const isGridVisible = ref(true)
const activeTool = ref<ToolType>(null)
const zoomScale = ref(1)
const containerMousePos = ref<Point>({ x: 0, y: 0 })
const resultPath = ref<Array<PathCmd>>([])

const cursorClass = computed(() => ({
    'cursor-grab active:cursor-grabbing': activeTool.value === null,
    'cursor-default': activeTool.value === 'select',
    'cursor-crosshair': activeTool.value === 'line' || activeTool.value === 'arc',
}))

const props = defineProps({
    worldHeight: {
        type: Number,
        required: true,
    },

    worldWidth: {
        type: Number,
        required: true,
    },

    worldPandding: {
        type: Number,
        default: 400,
    },
})

let floorCanvas: null | FloorCanvas = null
// A stage is used to contain multiple layers
let stage = null as null | Konva.Stage
let gridLayer = null as null | Konva.Layer
let mainLayer = null as null | Konva.Layer
interface PanType {
    panOrigin: Point
    stageOrigin: Point
}
let pan: null | PanType = null

onMounted(() => {
    const el = container.value as HTMLDivElement
    floorCanvas = new FloorCanvas(el, {
        width: props.worldWidth,
        height: props.worldHeight,
        padding: props.worldPandding,
    })

    // initKonva()
    // window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
})

onUnmounted(() => {
    floorCanvas?.destroy()
    floorCanvas = null
    // window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('resize', onResize)
    stage?.destroy()
    gridLayer?.destroy()
})

function changeActiveTool(tool: ToolType) {
    if (activeTool.value === tool) {
        activeTool.value = null
        return
    }

    activeTool.value = tool
}

// Konva init
function initKonva() {
    const el = container.value as HTMLDivElement
    stage = new Konva.Stage({
        container: el,
        width: el.clientWidth,
        height: el.clientHeight,
    })
    gridLayer = new Konva.Layer({ listening: false })
    mainLayer = new Konva.Layer()

    centralize()

    stage.add(gridLayer)
    stage.add(mainLayer)

    // transformer = new Konva.Transformer({
    //     rotateEnabled: false,
    //     keepRatio: false,
    //     borderStroke: '#3b82f6',
    //     borderStrokeWidth: 1.5,
    //     anchorStroke: '#3b82f6',
    //     anchorFill: '#1e3a8a',
    //     anchorSize: 8,
    //     anchorCornerRadius: 2,
    // })

    // mainLayer.add(transformer)
    redrawGrid()
    bindStageEvents()
}

function centralize() {
    if (!stage) return

    const scale = stage.scaleX()
    const scaledWorldW = props.worldWidth * scale
    const scaledWorldH = props.worldHeight * scale

    stage.position({
        x: (stage.width() - scaledWorldW) / 2,
        y: (stage.height() - scaledWorldH) / 2,
    })
}

// Grid
function redrawGrid() {
    if (!gridLayer || !stage) return

    // destroy all children nodes
    gridLayer.destroyChildren()

    if (!isGridVisible.value) {
        gridLayer.batchDraw()
        return
    }

    const GRID_SIZE = 5
    const sc = stage.scaleX()
    const ox = stage.x()
    const oy = stage.y()

    const visLeft = Math.max(0, Math.floor(-ox / sc / GRID_SIZE) * GRID_SIZE)
    const visTop = Math.max(0, Math.floor(-oy / sc / GRID_SIZE) * GRID_SIZE)
    const visRight = Math.min(props.worldWidth, visLeft + Math.ceil(stage.width() / sc) + GRID_SIZE)
    const visBottom = Math.min(
        props.worldHeight,
        visTop + Math.ceil(stage.height() / sc) + GRID_SIZE,
    )

    for (let x = visLeft; x <= visRight; x += GRID_SIZE) {
        const major = x % (GRID_SIZE * 5) === 0
        gridLayer.add(
            new Konva.Line({
                points: [x, visTop, x, visBottom],
                stroke: major ? '#21262d' : '#161b22',
                strokeWidth: major ? 0.5 : 0.25,
                listening: false,
                opacity: 0.8,
            }),
        )
    }

    for (let y = visTop; y <= visBottom; y += GRID_SIZE) {
        const major = y % (GRID_SIZE * 5) === 0
        gridLayer.add(
            new Konva.Line({
                points: [visLeft, y, visRight, y],
                stroke: major ? '#21262d' : '#161b22',
                strokeWidth: major ? 0.5 : 0.25,
                listening: false,
                opacity: 0.8,
            }),
        )
    }

    gridLayer.batchDraw()
}

function onPointerOut() {
    if (activeTool.value === null && pan) {
        pan = null
    }
}

function onStageMouseTrack(): void {
    if (!stage) return

    const ptr = stage.getPointerPosition() as Vector2d
    const scale = stage.scaleX()
    containerMousePos.value = {
        x: Math.round((ptr.x - stage.x()) / scale),
        y: Math.round((ptr.y - stage.y()) / scale),
    }
}

function onResize() {
    if (!stage || !container.value) return
    stage.width(container.value.clientWidth)
    stage.height(container.value.clientHeight)
    redrawGrid()
}

function bindStageEvents() {
    if (!stage) return
    stage.on('wheel', onWheel)
    stage.on('mousedown touchstart', onStageDown)
    stage.on('mouseup touchend', onStageUp)
    stage.on('mousemove touchmove', onStageMove)
    stage.on('mousemove', onStageMouseTrack)
}

function onWheel(e: KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault()
    if (!stage) return

    const ZOOM_SPEED = 0.05
    const MIN_ZOOM = 0.25
    const MAX_ZOOM = 6.0

    const ptr = stage.getPointerPosition() as Vector2d
    const oldScale = stage.scaleX()
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const factor = 1 + direction * ZOOM_SPEED
    const newScale = Math.min(Math.max(oldScale * factor, MIN_ZOOM), MAX_ZOOM)
    const scaleRatio = newScale / oldScale
    const targetPos = {
        x: ptr.x - (ptr.x - stage.x()) * scaleRatio,
        y: ptr.y - (ptr.y - stage.y()) * scaleRatio,
    }
    const boundedPos = clampPosition(targetPos.x, targetPos.y, newScale)

    stage.setAttrs({
        scaleX: newScale,
        scaleY: newScale,
        x: boundedPos.x,
        y: boundedPos.y,
    })

    zoomScale.value = newScale
    redrawGrid()
}

function applyZoom(newScale: number) {
    if (!stage) return

    newScale = Math.min(Math.max(newScale, 0.25), 6)
    const cx = stage.width() / 2,
        cy = stage.height() / 2
    const ratio = newScale / stage.scaleX()
    stage.scale({ x: newScale, y: newScale })
    stage.position({
        x: cx - (cx - stage.x()) * ratio,
        y: cy - (cy - stage.y()) * ratio,
    })
    zoomScale.value = newScale
    redrawGrid()
}

function resetZoom() {
    zoomScale.value = 1
    stage!.scale({ x: 1, y: 1 })
    stage!.position({ x: 0, y: 0 })
    centralize()
    redrawGrid()
}

function onStageDown(e: KonvaEventObject<MouseEvent | TouchEvent>) {
    if (!stage) return

    // Pan
    if (activeTool.value === null) {
        const position = stage.getPointerPosition() as Vector2d
        pan = {
            panOrigin: { x: position.x, y: position.y },
            stageOrigin: { x: stage.x(), y: stage.y() },
        }
        return
    }

    // First point
    if (resultPath.value.length === 0) {
        if (['line', 'arc'].includes(activeTool.value)) {
            const point = containerMousePos.value
            resultPath.value.push({ cmd: 'M', x: point.x, y: point.y })
            return
        }
    }
}

// Select: deselect when clicking empty stage
// if (activeTool.value === 'select') {
//     if (e.target === stage) clearSelection()
//     return
// }

// Room / line: start drawing
// if (['room', 'line'].includes(activeTool.value)) {
//     const p = pointerToCanvas()
//     drawOrigin = { x: snapVal(p.x), y: snapVal(p.y) }
//     isDrawing = true

//     if (activeTool.value === 'room') {
//         const el = selectedElem.value
//         liveShape = new Konva.Rect({
//             x: drawOrigin.x,
//             y: drawOrigin.y,
//             width: 1,
//             height: 1,
//             fill: el.fill,
//             stroke: el.stroke,
//             strokeWidth: 2,
//             opacity: 0.85,
//             cornerRadius: 2,
//             id: genId(),
//             listening: false,
//         })
//     } else {
//         liveShape = new Konva.Line({
//             points: [drawOrigin.x, drawOrigin.y, drawOrigin.x, drawOrigin.y],
//             stroke: '#b0b8c4',
//             strokeWidth: 8,
//             lineCap: 'square',
//             id: genId(),
//             listening: false,
//         })
//     }
//     mainLayer.add(liveShape)
// }

function onStageUp() {
    if (activeTool.value === null && pan) {
        pan = null
        return
    }
}

function onStageMove(e: KonvaEventObject<MouseEvent | TouchEvent>) {
    if (!stage) return

    if (activeTool.value === null && pan) {
        const now = stage.getPointerPosition() as Vector2d
        const rawX = pan.stageOrigin.x + (now.x - pan.panOrigin.x)
        const rawY = pan.stageOrigin.y + (now.y - pan.panOrigin.y)
        const boundedPos = clampPosition(rawX, rawY, stage.scaleX())
        stage.position(boundedPos)
        redrawGrid()
        return
    }

    // if (!isDrawing || !liveShape) return

    // const p = pointerToCanvas()
    // const nx = snapVal(p.x)
    // const ny = snapVal(p.y)

    // if (activeTool.value === 'room') {
    //     liveShape.setAttrs({
    //         x: Math.min(drawOrigin.x, nx),
    //         y: Math.min(drawOrigin.y, ny),
    //         width: Math.abs(nx - drawOrigin.x),
    //         height: Math.abs(ny - drawOrigin.y),
    //     })
    // } else {
    //     liveShape.points([drawOrigin.x, drawOrigin.y, nx, ny])
    // }
    // mainLayer.batchDraw()
}

function clampPosition(x: number, y: number, scale: number): { x: number; y: number } {
    const stageWidth = stage!.width()
    const stageHeight = stage!.height()

    const scaledWorldW = props.worldWidth * scale
    const scaledWorldH = props.worldHeight * scale

    // Limites: o mundo pode sair da tela até WORLD_PADDING px
    const minX = -(scaledWorldW - props.worldPandding)
    const maxX = stageWidth - props.worldPandding
    const minY = -(scaledWorldH - props.worldPandding)
    const maxY = stageHeight - props.worldPandding

    return {
        x: Math.min(Math.max(x, minX), maxX),
        y: Math.min(Math.max(y, minY), maxY),
    }
}

function toggleGrid() {
    isGridVisible.value = !isGridVisible.value
    redrawGrid()
}
</script>
