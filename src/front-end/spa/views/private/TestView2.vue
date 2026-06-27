<template>
    <div class="flex h-full w-full overflow-hidden bg-zinc-950 font-mono text-zinc-300 select-none">
        <!-- ── TOOLBAR ── -->
        <aside
            class="flex w-44 flex-shrink-0 flex-col gap-1 border-r border-zinc-800 bg-zinc-900 p-3"
        >
            <p class="mb-1 text-[9px] tracking-widest text-zinc-600 uppercase">Ferramentas</p>

            <button
                v-for="t in TOOLS"
                :key="t.id"
                type="button"
                class="tool-btn"
                :class="{ active: mode === t.id }"
                @click="setMode(t.id)"
            >
                <span class="text-base">{{ t.icon }}</span>
                <span>{{ t.label }}</span>
                <kbd class="ml-auto text-[9px] opacity-40">{{ t.key }}</kbd>
            </button>

            <hr class="my-2 border-zinc-800" />

            <!-- Arc params (shown only in arc mode) -->
            <template v-if="mode === 'arc'">
                <p class="mb-1 text-[9px] tracking-widest text-zinc-600 uppercase">
                    Parâmetros do Arco
                </p>

                <label class="param-label"
                    >rx
                    <input
                        v-model.number="arcParams.rx"
                        type="number"
                        min="1"
                        class="param-input"
                    />
                </label>
                <label class="param-label"
                    >ry
                    <input
                        v-model.number="arcParams.ry"
                        type="number"
                        min="1"
                        class="param-input"
                    />
                </label>
                <label class="param-label"
                    >rotação
                    <input
                        v-model.number="arcParams.xAxisRotation"
                        type="number"
                        min="0"
                        max="360"
                        class="param-input"
                    />
                </label>
                <label class="mt-1 flex items-center gap-2 text-[11px]">
                    <input v-model="arcParams.largeArc" type="checkbox" class="accent-sky-500" />
                    large-arc
                </label>
                <label class="mt-1 flex items-center gap-2 text-[11px]">
                    <input v-model="arcParams.sweep" type="checkbox" class="accent-sky-500" />
                    sweep
                </label>
                <hr class="my-2 border-zinc-800" />
            </template>

            <!-- Select mode actions -->
            <template v-if="mode === 'select' && selectedIdx !== null">
                <p class="mb-1 text-[9px] tracking-widest text-zinc-600 uppercase">
                    Segmento selecionado
                </p>

                <div
                    class="rounded bg-zinc-800 px-2 py-1.5 text-[10px] leading-relaxed break-all text-zinc-400"
                >
                    {{ selectedSegmentStr }}
                </div>

                <!-- Arc params edit inline -->
                <template v-if="commands[selectedIdx]?.cmd === 'A'">
                    <label class="param-label mt-2"
                        >rx
                        <input
                            :value="(commands[selectedIdx] as ArcCmd).rx"
                            @input="
                                patchArcParam(
                                    selectedIdx!,
                                    'rx',
                                    +($event.target as HTMLInputElement).value,
                                )
                            "
                            type="number"
                            min="1"
                            class="param-input"
                        />
                    </label>
                    <label class="param-label"
                        >ry
                        <input
                            :value="(commands[selectedIdx] as ArcCmd).ry"
                            @input="
                                patchArcParam(
                                    selectedIdx!,
                                    'ry',
                                    +($event.target as HTMLInputElement).value,
                                )
                            "
                            type="number"
                            min="1"
                            class="param-input"
                        />
                    </label>
                    <label class="param-label"
                        >rotação
                        <input
                            :value="(commands[selectedIdx] as ArcCmd).xAxisRotation"
                            @input="
                                patchArcParam(
                                    selectedIdx!,
                                    'xAxisRotation',
                                    +($event.target as HTMLInputElement).value,
                                )
                            "
                            type="number"
                            class="param-input"
                        />
                    </label>
                    <label class="mt-1 flex items-center gap-2 text-[11px]">
                        <input
                            type="checkbox"
                            :checked="(commands[selectedIdx] as ArcCmd).largeArc"
                            @change="
                                patchArcParam(
                                    selectedIdx!,
                                    'largeArc',
                                    ($event.target as HTMLInputElement).checked,
                                )
                            "
                            class="accent-sky-500"
                        />
                        large-arc
                    </label>
                    <label class="mt-1 flex items-center gap-2 text-[11px]">
                        <input
                            type="checkbox"
                            :checked="(commands[selectedIdx] as ArcCmd).sweep"
                            @change="
                                patchArcParam(
                                    selectedIdx!,
                                    'sweep',
                                    ($event.target as HTMLInputElement).checked,
                                )
                            "
                            class="accent-sky-500"
                        />
                        sweep
                    </label>
                </template>

                <button type="button" class="action-btn danger mt-2" @click="deleteSelected">
                    ✕ Remover segmento
                </button>
                <hr class="my-2 border-zinc-800" />
            </template>

            <button
                type="button"
                class="action-btn"
                @click="closePath"
                :disabled="commands.length < 2"
            >
                ⬡ Fechar path (Z)
            </button>
            <button type="button" class="action-btn danger mt-1" @click="clearAll">✕ Limpar</button>

            <hr class="my-2 border-zinc-800" />
            <p class="mb-1 text-[9px] tracking-widest text-zinc-600 uppercase">Zoom</p>
            <div class="flex gap-1">
                <button type="button" class="action-btn flex-1 justify-center" @click="zoom(-0.1)">
                    −
                </button>
                <span class="w-10 text-center text-[10px] leading-8 text-zinc-500"
                    >{{ Math.round(stageScale * 100) }}%</span
                >
                <button type="button" class="action-btn flex-1 justify-center" @click="zoom(+0.1)">
                    +
                </button>
            </div>
            <button type="button" class="action-btn mt-1" @click="resetView">⌂ Resetar</button>
        </aside>

        <!-- ── CANVAS ── -->
        <div class="flex min-w-0 flex-1 flex-col">
            <!-- Top bar with path string -->
            <div
                class="flex h-10 flex-shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-3"
            >
                <span class="flex-shrink-0 text-[9px] tracking-widest text-zinc-600 uppercase"
                    >SVG path</span
                >
                <input
                    class="flex-1 rounded border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] text-sky-300 transition-colors outline-none focus:border-sky-600"
                    :value="pathString"
                    @change="parsePathString(($event.target as HTMLInputElement).value)"
                    spellcheck="false"
                />
                <button type="button" class="action-btn px-3 text-[11px]" @click="copyPath">
                    {{ copied ? '✓ copiado' : '⎘ copiar' }}
                </button>
            </div>

            <!-- Konva container -->
            <div ref="container" class="flex-1 overflow-hidden" :class="cursorClass" />

            <!-- Status bar -->
            <div
                class="flex h-6 flex-shrink-0 items-center gap-6 border-t border-zinc-800 bg-zinc-900 px-4"
            >
                <span class="text-[10px] text-zinc-600">{{ modeHint }}</span>
                <span class="text-[10px] text-zinc-700">{{ commands.length }} segmento(s)</span>
                <span class="text-[10px] text-zinc-700"
                    >x: {{ mousePos.x }} y: {{ mousePos.y }}</span
                >
            </div>
        </div>

        <!-- ── SEGMENTS TABLE ── -->
        <aside
            class="flex w-52 flex-shrink-0 flex-col overflow-y-auto border-l border-zinc-800 bg-zinc-900"
        >
            <p
                class="border-b border-zinc-800 px-3 pt-3 pb-2 text-[9px] tracking-widest text-zinc-600 uppercase"
            >
                Comandos ({{ commands.length }})
            </p>
            <div
                v-for="(cmd, i) in commands"
                :key="i"
                class="segment-row"
                :class="{ active: selectedIdx === i }"
                @click="selectSegment(i)"
            >
                <span
                    class="cmd-badge"
                    :class="cmd.cmd === 'A' ? 'arc' : cmd.cmd === 'M' ? 'move' : 'line'"
                >
                    {{ cmd.cmd }}
                </span>
                <span class="truncate text-[10px] text-zinc-400">{{ segmentSummary(cmd) }}</span>
                <button
                    type="button"
                    class="ml-auto flex-shrink-0 text-xs leading-none text-zinc-700 transition-colors hover:text-red-500"
                    @click.stop="deleteAt(i)"
                >
                    ✕
                </button>
            </div>
            <div v-if="!commands.length" class="py-8 text-center text-[10px] text-zinc-700">
                Vazio — comece desenhando
            </div>
        </aside>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Konva from 'konva'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Mode = 'select' | 'line' | 'arc'

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

interface ArcParams {
    rx: number
    ry: number
    xAxisRotation: number
    largeArc: boolean
    sweep: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const TOOLS = [
    { id: 'select' as Mode, label: 'Selecionar', icon: '↖', key: 'V' },
    { id: 'line' as Mode, label: 'Linha', icon: '╱', key: 'L' },
    { id: 'arc' as Mode, label: 'Arco', icon: '⌒', key: 'A' },
] as const

const GRID = 10
const POINT_RADIUS = 5
const HIT_PADDING = 8
const COLORS = {
    path: '#38bdf8', // sky-400
    pathPreview: '#38bdf888',
    point: '#f59e0b', // amber-400
    pointHover: '#fbbf24',
    pointSelect: '#f97316', // orange-400
    anchor: '#a855f7', // purple-400
    grid: '#27272a',
    gridMajor: '#3f3f46',
    arcPreview: '#38bdf855',
}

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────

const container = ref<HTMLDivElement | null>(null)
const mode = ref<Mode>('line')
const commands = ref<PathCmd[]>([])
const selectedIdx = ref<number | null>(null)
const stageScale = ref(1)
const mousePos = ref<Point>({ x: 0, y: 0 })
const copied = ref(false)

const arcParams = ref<ArcParams>({
    rx: 60,
    ry: 60,
    xAxisRotation: 0,
    largeArc: false,
    sweep: false,
})

// Konva refs (imperative, not reactive)
let stage: Konva.Stage | null = null
let gridLayer: Konva.Layer | null = null
let pathLayer: Konva.Layer | null = null
let pointLayer: Konva.Layer | null = null
let uiLayer: Konva.Layer | null = null

let previewLine: Konva.Line | null = null // live preview while drawing
let konvaPath: Konva.Path | null = null // the rendered SVG path

let isPanning = false
let panOrigin: Point | null = null
let stageOrigin: Point | null = null

// ─────────────────────────────────────────────────────────────────────────────
// Computed
// ─────────────────────────────────────────────────────────────────────────────

const pathString = computed<string>(() => {
    if (!commands.value.length) return ''
    return commands.value.map(cmdToStr).join(' ')
})

const selectedSegmentStr = computed(() => {
    if (selectedIdx.value === null) return ''
    return cmdToStr(commands.value[selectedIdx.value])
})

const modeHint = computed(() => {
    const map: Record<Mode, string> = {
        select: 'Clique em um ponto para selecionar • Arraste para mover • Del para remover',
        line: 'Clique para adicionar ponto de linha • ESC para cancelar',
        arc: 'Clique para adicionar ponto de arco • Ajuste parâmetros no painel',
    }
    return map[mode.value]
})

const cursorClass = computed(() => ({
    'cursor-crosshair': mode.value === 'line' || mode.value === 'arc',
    'cursor-default': mode.value === 'select',
}))

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function snapVal(v: number): number {
    return Math.round(v / GRID) * GRID
}

function canvasPos(): Point {
    if (!stage) return { x: 0, y: 0 }
    const ptr = stage.getPointerPosition()!
    const sc = stage.scaleX()
    return {
        x: snapVal((ptr.x - stage.x()) / sc),
        y: snapVal((ptr.y - stage.y()) / sc),
    }
}

function lastPoint(): Point | null {
    const cmds = commands.value
    if (!cmds.length) return null
    const last = cmds[cmds.length - 1]
    return { x: last.x, y: last.y }
}

function cmdToStr(c: PathCmd): string {
    if (c.cmd === 'M') return `M ${c.x} ${c.y}`
    if (c.cmd === 'L') return `L ${c.x} ${c.y}`
    return `A ${c.rx} ${c.ry} ${c.xAxisRotation} ${c.largeArc ? 1 : 0} ${c.sweep ? 1 : 0} ${c.x} ${c.y}`
}

function segmentSummary(c: PathCmd): string {
    if (c.cmd === 'A') return `${c.x},${c.y} r${c.rx}×${c.ry}`
    return `${c.x}, ${c.y}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Path string → commands (simple parser)
// ─────────────────────────────────────────────────────────────────────────────

function parsePathString(raw: string): void {
    try {
        const cmds: PathCmd[] = []
        const tokens = raw.trim().match(/[MmLlAaZz]|[-+]?[0-9]*\.?[0-9]+/g) ?? []
        let i = 0
        let cmd = ''
        while (i < tokens.length) {
            const t = tokens[i]
            if (/[MmLlAaZz]/.test(t)) {
                cmd = t
                i++
                continue
            }
            const UC = cmd.toUpperCase()
            if (UC === 'M' || UC === 'L') {
                cmds.push({ cmd: UC as 'M' | 'L', x: +tokens[i], y: +tokens[i + 1] })
                i += 2
            } else if (UC === 'A') {
                cmds.push({
                    cmd: 'A',
                    rx: +tokens[i],
                    ry: +tokens[i + 1],
                    xAxisRotation: +tokens[i + 2],
                    largeArc: tokens[i + 3] === '1',
                    sweep: tokens[i + 4] === '1',
                    x: +tokens[i + 5],
                    y: +tokens[i + 6],
                })
                i += 7
            } else {
                i++
            }
        }
        if (cmds.length) {
            commands.value = cmds
            selectedIdx.value = null
        }
    } catch {
        /* ignore malformed */
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Konva init
// ─────────────────────────────────────────────────────────────────────────────

function initKonva(): void {
    const el = container.value!
    stage = new Konva.Stage({ container: el, width: el.clientWidth, height: el.clientHeight })

    gridLayer = new Konva.Layer({ listening: false })
    pathLayer = new Konva.Layer({ listening: false })
    pointLayer = new Konva.Layer()
    uiLayer = new Konva.Layer({ listening: false })

    stage.add(gridLayer)
    stage.add(pathLayer)
    stage.add(pointLayer)
    stage.add(uiLayer)

    redrawGrid()
    bindStageEvents()
}

// ─────────────────────────────────────────────────────────────────────────────
// Grid
// ─────────────────────────────────────────────────────────────────────────────

function redrawGrid(): void {
    if (!stage || !gridLayer) return
    gridLayer.destroyChildren()

    const w = stage.width(),
        h = stage.height()
    const sc = stage.scaleX()
    const ox = stage.x(),
        oy = stage.y()
    const x0 = Math.floor(-ox / sc / GRID) * GRID
    const y0 = Math.floor(-oy / sc / GRID) * GRID
    const x1 = x0 + Math.ceil(w / sc) + GRID * 2
    const y1 = y0 + Math.ceil(h / sc) + GRID * 2

    for (let x = x0; x <= x1; x += GRID) {
        gridLayer.add(
            new Konva.Line({
                points: [x, y0, x, y1],
                stroke: x % 50 === 0 ? COLORS.gridMajor : COLORS.grid,
                strokeWidth: x % 50 === 0 ? 0.7 : 0.4,
            }),
        )
    }
    for (let y = y0; y <= y1; y += GRID) {
        gridLayer.add(
            new Konva.Line({
                points: [x0, y, x1, y],
                stroke: y % 50 === 0 ? COLORS.gridMajor : COLORS.grid,
                strokeWidth: y % 50 === 0 ? 0.7 : 0.4,
            }),
        )
    }
    gridLayer.batchDraw()
}

// ─────────────────────────────────────────────────────────────────────────────
// Render path + points
// ─────────────────────────────────────────────────────────────────────────────

function redrawPath(): void {
    if (!pathLayer || !pointLayer) return

    pathLayer.destroyChildren()
    pointLayer.destroyChildren()

    const d = pathString.value
    if (!d) {
        pathLayer.batchDraw()
        pointLayer.batchDraw()
        return
    }

    // SVG path via Konva.Path
    konvaPath = new Konva.Path({
        data: d,
        stroke: COLORS.path,
        strokeWidth: 1.5,
        fill: 'transparent',
        listening: false,
    })
    pathLayer.add(konvaPath)

    // Point handles
    commands.value.forEach((cmd, i) => {
        const isSelected = selectedIdx.value === i
        const isFirst = i === 0

        const circle = new Konva.Circle({
            x: cmd.x,
            y: cmd.y,
            radius: isSelected ? POINT_RADIUS + 2 : POINT_RADIUS,
            fill: isSelected ? COLORS.pointSelect : isFirst ? COLORS.anchor : COLORS.point,
            stroke: '#1c1917',
            strokeWidth: 1.5,
            hitStrokeWidth: HIT_PADDING,
            draggable: mode.value === 'select',
        })

        circle.on('mouseenter', () => {
            if (mode.value !== 'select') return
            circle.fill(COLORS.pointHover)
            pointLayer!.batchDraw()
            stage!.container().style.cursor = 'grab'
        })
        circle.on('mouseleave', () => {
            circle.fill(isSelected ? COLORS.pointSelect : isFirst ? COLORS.anchor : COLORS.point)
            pointLayer!.batchDraw()
            stage!.container().style.cursor = ''
        })
        circle.on('click tap', (e) => {
            if (mode.value !== 'select') return
            e.cancelBubble = true
            selectSegment(i)
        })
        circle.on('dragmove', () => {
            if (!stage) return
            const snappedX = snapVal(circle.x())
            const snappedY = snapVal(circle.y())
            circle.position({ x: snappedX, y: snappedY })
            commands.value[i].x = snappedX
            commands.value[i].y = snappedY
            // Trigger re-render without full redraw — just update path data
            updatePathOnly()
        })
        circle.on('dragend', () => {
            redrawPath()
        })

        pointLayer.add(circle)
    })

    pathLayer.batchDraw()
    pointLayer.batchDraw()
}

/** Fast path update during drag — only updates the path node */
function updatePathOnly(): void {
    if (!konvaPath || !pathLayer) return
    konvaPath.data(pathString.value)
    pathLayer.batchDraw()
}

// ─────────────────────────────────────────────────────────────────────────────
// Preview line (while mouse moves before clicking)
// ─────────────────────────────────────────────────────────────────────────────

function updatePreview(to: Point): void {
    if (!uiLayer) return
    uiLayer.destroyChildren()

    const from = lastPoint()
    if (!from) return

    if (mode.value === 'line') {
        previewLine = new Konva.Line({
            points: [from.x, from.y, to.x, to.y],
            stroke: COLORS.pathPreview,
            strokeWidth: 1.5,
            dash: [4, 4],
            listening: false,
        })
        uiLayer.add(previewLine)
    } else if (mode.value === 'arc') {
        // Draw preview arc as SVG path
        const a = arcParams.value
        const previewArc = new Konva.Path({
            data: `M ${from.x} ${from.y} A ${a.rx} ${a.ry} ${a.xAxisRotation} ${a.largeArc ? 1 : 0} ${a.sweep ? 1 : 0} ${to.x} ${to.y}`,
            stroke: COLORS.pathPreview,
            strokeWidth: 1.5,
            fill: 'transparent',
            dash: [4, 4],
            listening: false,
        })
        uiLayer.add(previewArc)

        // Radius handles visual
        const midX = (from.x + to.x) / 2
        const midY = (from.y + to.y) / 2
        uiLayer.add(
            new Konva.Line({
                points: [midX - a.rx, midY, midX + a.rx, midY],
                stroke: COLORS.anchor + '55',
                strokeWidth: 0.8,
                dash: [3, 3],
            }),
        )
    }

    // Cursor dot at snap position
    uiLayer.add(
        new Konva.Circle({
            x: to.x,
            y: to.y,
            radius: 3,
            fill: COLORS.pathPreview,
            listening: false,
        }),
    )

    uiLayer.batchDraw()
}

function clearPreview(): void {
    uiLayer?.destroyChildren()
    uiLayer?.batchDraw()
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage events
// ─────────────────────────────────────────────────────────────────────────────

function bindStageEvents(): void {
    if (!stage) return

    stage.on('mousedown touchstart', onDown)
    stage.on('mousemove touchmove', onMove)
    stage.on('mouseup touchend', onUp)
    stage.on('wheel', onWheel)
    stage.on('mousemove', onMouseTrack)
}

function onDown(e: Konva.KonvaEventObject<MouseEvent>): void {
    // Middle-button or space-pan
    if (e.evt.button === 1 || (e.evt.button === 0 && e.evt.altKey)) {
        isPanning = true
        panOrigin = stage!.getPointerPosition()
        stageOrigin = { x: stage!.x(), y: stage!.y() }
        return
    }

    if (mode.value === 'select') {
        // Deselect if click on empty canvas
        if (e.target === stage) {
            selectedIdx.value = null
            redrawPath()
        }
        return
    }

    // Drawing modes
    const p = canvasPos()

    if (!commands.value.length) {
        // First point: always M
        commands.value.push({ cmd: 'M', x: p.x, y: p.y })
    } else {
        if (mode.value === 'line') {
            commands.value.push({ cmd: 'L', x: p.x, y: p.y })
        } else {
            const a = arcParams.value
            commands.value.push({
                cmd: 'A',
                rx: a.rx,
                ry: a.ry,
                xAxisRotation: a.xAxisRotation,
                largeArc: a.largeArc,
                sweep: a.sweep,
                x: p.x,
                y: p.y,
            })
        }
    }

    redrawPath()
}

function onMove(e: Konva.KonvaEventObject<MouseEvent>): void {
    if (isPanning && panOrigin) {
        const now = stage!.getPointerPosition()!
        stage!.position({
            x: stageOrigin!.x + now.x - panOrigin.x,
            y: stageOrigin!.y + now.y - panOrigin.y,
        })
        redrawGrid()
        return
    }

    if (mode.value === 'line' || mode.value === 'arc') {
        updatePreview(canvasPos())
    }
}

function onMouseTrack(): void {
    if (!stage) return
    const p = canvasPos()
    mousePos.value = { x: p.x, y: p.y }
}

function onUp(): void {
    if (isPanning) {
        isPanning = false
        panOrigin = null
    }
}

function onWheel(e: Konva.KonvaEventObject<WheelEvent>): void {
    e.evt.preventDefault()
    const oldSc = stage!.scaleX()
    const factor = e.evt.deltaY > 0 ? 0.9 : 1.1
    const newSc = Math.min(Math.max(oldSc * factor, 0.1), 10)
    const ptr = stage!.getPointerPosition()!
    stage!.scale({ x: newSc, y: newSc })
    stage!.position({
        x: ptr.x - (ptr.x - stage!.x()) * (newSc / oldSc),
        y: ptr.y - (ptr.y - stage!.y()) * (newSc / oldSc),
    })
    stageScale.value = newSc
    redrawGrid()
}

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────

function setMode(m: Mode): void {
    mode.value = m
    selectedIdx.value = null
    clearPreview()
    redrawPath()
}

function selectSegment(i: number): void {
    selectedIdx.value = i
    redrawPath()
}

function deleteSelected(): void {
    if (selectedIdx.value === null) return
    deleteAt(selectedIdx.value)
    selectedIdx.value = null
}

function deleteAt(i: number): void {
    commands.value.splice(i, 1)
    // If deleting the first point and there are more, promote next to M
    if (i === 0 && commands.value.length > 0) {
        commands.value[0] = { cmd: 'M', x: commands.value[0].x, y: commands.value[0].y }
    }
    if (selectedIdx.value === i) selectedIdx.value = null
    redrawPath()
}

function closePath(): void {
    if (commands.value.length < 2) return
    // Add Z by appending an L back to the first point (visual close)
    const first = commands.value[0]
    commands.value.push({ cmd: 'L', x: first.x, y: first.y })
    redrawPath()
}

function clearAll(): void {
    commands.value = []
    selectedIdx.value = null
    clearPreview()
    redrawPath()
}

function patchArcParam(i: number, key: keyof ArcCmd, value: number | boolean): void {
    const cmd = commands.value[i]
    if (cmd.cmd !== 'A') return
    ;(cmd as any)[key] = value
    redrawPath()
}

function zoom(delta: number): void {
    if (!stage) return
    const newSc = Math.min(Math.max(stageScale.value + delta, 0.1), 10)
    const cx = stage.width() / 2,
        cy = stage.height() / 2
    const ratio = newSc / stage.scaleX()
    stage.scale({ x: newSc, y: newSc })
    stage.position({
        x: cx - (cx - stage.x()) * ratio,
        y: cy - (cy - stage.y()) * ratio,
    })
    stageScale.value = newSc
    redrawGrid()
}

function resetView(): void {
    if (!stage) return
    stageScale.value = 1
    stage.scale({ x: 1, y: 1 })
    stage.position({ x: 0, y: 0 })
    redrawGrid()
}

async function copyPath(): Promise<void> {
    await navigator.clipboard.writeText(pathString.value)
    copied.value = true
    setTimeout(() => {
        copied.value = false
    }, 1800)
}

// ─────────────────────────────────────────────────────────────────────────────
// Keyboard
// ─────────────────────────────────────────────────────────────────────────────

function onKeyDown(e: KeyboardEvent): void {
    if ((e.target as HTMLElement).tagName === 'INPUT') return
    if (e.key === 'v' || e.key === 'V') setMode('select')
    if (e.key === 'l' || e.key === 'L') setMode('line')
    if (e.key === 'a' || e.key === 'A') setMode('arc')
    if (e.key === 'Escape') clearPreview()
    if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected()
    if (e.key === 'z' && e.ctrlKey) {
        e.preventDefault()
        commands.value.pop()
        redrawPath()
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Resize
// ─────────────────────────────────────────────────────────────────────────────

function onResize(): void {
    if (!stage || !container.value) return
    stage.width(container.value.clientWidth)
    stage.height(container.value.clientHeight)
    redrawGrid()
}

// ─────────────────────────────────────────────────────────────────────────────
// Watch
// ─────────────────────────────────────────────────────────────────────────────

// When arc params change while there's a preview active, re-render
watch(
    arcParams,
    () => {
        const p = mousePos.value
        if (mode.value === 'arc' && p) updatePreview(p)
    },
    { deep: true },
)

// ─────────────────────────────────────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────────────────────────────────────

onMounted(() => {
    nextTick(() => {
        initKonva()
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('resize', onResize)
    })
})

onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('resize', onResize)
    stage?.destroy()
})

// ─────────────────────────────────────────────────────────────────────────────
// Expose
// ─────────────────────────────────────────────────────────────────────────────

defineExpose({ pathString, commands, clearAll, parsePathString })
</script>

<style scoped>
/* ── Tool buttons ────────────────────────────────────── */
.tool-btn {
    @apply flex cursor-pointer items-center gap-2 rounded-md border border-transparent bg-transparent px-3 py-2 font-mono text-[12px] text-zinc-500 transition-all duration-100;
}
.tool-btn:hover {
    @apply border-zinc-700 bg-zinc-800 text-zinc-300;
}
.tool-btn.active {
    @apply border-sky-800 bg-sky-950 text-sky-400;
}

/* ── Action buttons ──────────────────────────────────── */
.action-btn {
    @apply flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 font-mono text-[11px] text-zinc-500 transition-all duration-100;
}
.action-btn:hover {
    @apply bg-zinc-700 text-zinc-300;
}
.action-btn.danger {
    @apply border-red-900 bg-red-950 text-red-500;
}
.action-btn.danger:hover {
    @apply bg-red-900 text-red-300;
}
.action-btn:disabled {
    @apply cursor-not-allowed opacity-30;
}

/* ── Param inputs ────────────────────────────────────── */
.param-label {
    @apply flex items-center justify-between gap-2 font-mono text-[11px] text-zinc-500;
}
.param-input {
    @apply w-20 rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-300 transition-colors outline-none focus:border-sky-700;
}

/* ── Segment list ────────────────────────────────────── */
.segment-row {
    @apply flex cursor-pointer items-center gap-2 border-b border-zinc-800 px-3 py-2 font-mono transition-colors duration-100;
}
.segment-row:hover {
    @apply bg-zinc-800;
}
.segment-row.active {
    @apply bg-sky-950;
}

/* ── Cmd badge ───────────────────────────────────────── */
.cmd-badge {
    @apply flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold;
}
.cmd-badge.move {
    @apply bg-purple-900 text-purple-300;
}
.cmd-badge.line {
    @apply bg-sky-900 text-sky-300;
}
.cmd-badge.arc {
    @apply bg-amber-900 text-amber-300;
}
</style>
