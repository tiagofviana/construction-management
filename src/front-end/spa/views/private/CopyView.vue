<template>
    <div class="floor-editor flex h-full w-full overflow-hidden bg-gray-400 font-sans select-none">
        <!-- ── LEFT SIDEBAR ───────────────────────────────────────────────── -->
        <aside class="flex w-56 flex-shrink-0 flex-col overflow-y-auto border-r border-[#21262d]">
            <!-- Brand -->
            <div class="flex items-center gap-2 border-b border-[#21262d] px-4 py-3">
                <svg
                    class="h-4 w-4 flex-shrink-0 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 13l4.553 2.276A1 1 0 0021 21.382V10.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 7"
                    />
                </svg>
                <span
                    class="font-mono text-[10px] font-bold tracking-[0.15em] text-blue-400 uppercase"
                    >FloorPlan</span
                >
            </div>

            <!-- Tools -->
            <div class="border-b border-[#21262d] p-3">
                <p class="sidebar-label">Ferramentas</p>
                <div class="grid grid-cols-2 gap-1.5">
                    <button
                        v-for="t in tools"
                        :key="t.id"
                        class="tool-btn"
                        :class="{ active: activeTool === t.id }"
                        :title="t.hint"
                        @click="setTool(t.id)"
                    >
                        <span class="text-base leading-none" v-html="t.icon"></span>
                        <span class="text-[10px] leading-tight">{{ t.label }}</span>
                    </button>
                </div>
            </div>

            <!-- Element palette -->
            <div class="flex-1 border-b border-[#21262d] p-3">
                <p class="sidebar-label">Elementos</p>
                <div class="flex flex-col gap-1">
                    <button
                        v-for="el in ELEMENTS"
                        :key="el.id"
                        class="elem-card"
                        :class="{ active: selectedElem?.id === el.id }"
                        @click="pickElem(el)"
                    >
                        <span
                            class="elem-swatch flex-shrink-0"
                            :style="{ background: el.fill, borderColor: el.stroke }"
                        />
                        <span class="flex min-w-0 flex-col text-left">
                            <span class="truncate text-[11px] font-medium">{{ el.label }}</span>
                            <span class="truncate text-[9px] opacity-50">{{ el.category }}</span>
                        </span>
                    </button>
                </div>
            </div>

            <!-- Zoom -->
            <div class="p-3">
                <p class="sidebar-label">Zoom</p>
                <div class="mb-2 flex items-center gap-2">
                    <button class="icon-btn flex-1 justify-center" @click="zoomOut">
                        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-width="2.5" d="M20 12H4" />
                        </svg>
                    </button>
                    <span class="w-10 text-center font-mono text-[11px] text-slate-500"
                        >{{ Math.round(scale * 100) }}%</span
                    >
                    <button class="icon-btn flex-1 justify-center" @click="zoomIn">
                        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-width="2.5" d="M12 4v16M20 12H4" />
                        </svg>
                    </button>
                </div>
                <button class="action-btn w-full justify-center text-[11px]" @click="resetView">
                    Resetar vista
                </button>
            </div>
        </aside>

        <!-- ── MAIN CANVAS ────────────────────────────────────────────────── -->
        <main class="relative flex min-w-0 flex-1 flex-col">
            <!-- Topbar -->
            <header
                class="flex h-10 flex-shrink-0 items-center justify-between gap-2 border-b border-[#21262d] bg-[#161b22] px-3"
            >
                <div class="flex items-center gap-3">
                    <span class="font-mono text-[10px] tracking-widest text-slate-600 uppercase"
                        >Canvas</span
                    >
                    <span class="text-[10px] text-slate-700">{{ shapes.length }} elemento(s)</span>
                    <span
                        v-if="snapEnabled"
                        class="rounded border border-blue-900 bg-blue-950 px-2 py-0.5 font-mono text-[10px] text-blue-600"
                        >SNAP</span
                    >
                </div>
                <div class="flex items-center gap-1.5">
                    <button class="action-btn px-2.5 py-1 text-[11px]" @click="toggleGrid">
                        Grid {{ gridVisible ? 'On' : 'Off' }}
                    </button>
                    <button class="action-btn px-2.5 py-1 text-[11px]" @click="toggleSnap">
                        Snap {{ snapEnabled ? 'On' : 'Off' }}
                    </button>
                    <button class="action-btn danger px-2.5 py-1 text-[11px]" @click="clearAll">
                        Limpar
                    </button>
                    <button class="action-btn primary px-2.5 py-1 text-[11px]" @click="exportJSON">
                        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                        Exportar JSON
                    </button>
                    <label class="action-btn cursor-pointer px-2.5 py-1 text-[11px]">
                        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                        </svg>
                        Importar
                        <input type="file" accept=".json" class="hidden" @change="importJSON" />
                    </label>
                </div>
            </header>

            <div ref="canvasContainer" class="flex-1 overflow-hidden" :class="cursorClass" />

            <!-- Hint bar -->
            <div
                class="flex h-7 flex-shrink-0 items-center gap-6 border-t border-[#21262d] bg-[#0d1117] px-4"
            >
                <span
                    v-for="h in activeHints"
                    :key="h"
                    class="font-mono text-[10px] text-slate-700"
                    >{{ h }}</span
                >
            </div>
        </main>

        <!-- ── RIGHT SIDEBAR ──────────────────────────────────────────────── -->
        <aside
            class="flex w-52 flex-shrink-0 flex-col overflow-y-auto border-l border-[#21262d] bg-[#161b22]"
        >
            <div class="border-b border-[#21262d] px-4 py-3">
                <p class="font-mono text-[10px] tracking-widest text-slate-600 uppercase">
                    Propriedades
                </p>
            </div>

            <!-- No selection -->
            <div
                v-if="!selection"
                class="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center"
            >
                <svg
                    class="h-8 w-8 text-slate-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.2"
                        d="M15 15l5 5m-5-5a7 7 0 10-14 0 7 7 0 0014 0z"
                    />
                </svg>
                <p class="text-[11px] leading-relaxed text-slate-700">
                    Selecione um elemento para editar
                </p>
            </div>

            <!-- Properties panel -->
            <div v-else class="flex flex-col gap-4 p-3">
                <!-- Type + delete -->
                <div class="flex items-center justify-between">
                    <span
                        class="rounded border border-blue-900 bg-blue-950 px-2 py-1 font-mono text-[9px] tracking-widest text-blue-400 uppercase"
                    >
                        {{ selection.shapeType }}
                    </span>
                    <button
                        class="icon-btn text-slate-600 hover:text-red-500"
                        @click="deleteSelected"
                        title="Deletar (Del)"
                    >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.8"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7M4 7h16m-5-4H9"
                            />
                        </svg>
                    </button>
                </div>

                <!-- Label -->
                <div v-if="selection.shapeType !== 'wall'">
                    <p class="sidebar-label">Rótulo</p>
                    <input
                        class="prop-input"
                        type="text"
                        v-model="selection.label"
                        @input="syncToKonva"
                        placeholder="Nome do ambiente"
                    />
                </div>

                <!-- Room: position + size -->
                <div v-if="selection.shapeType === 'room'">
                    <p class="sidebar-label">Posição & Tamanho</p>
                    <div class="grid grid-cols-2 gap-2">
                        <div v-for="field in ['x', 'y', 'width', 'height']" :key="field">
                            <label class="mb-1 block text-[9px] text-slate-600 uppercase">{{
                                field
                            }}</label>
                            <input
                                class="prop-input"
                                type="number"
                                v-model.number="selection[field]"
                                @input="syncToKonva"
                            />
                        </div>
                    </div>
                </div>

                <!-- Wall: thickness -->
                <div v-if="selection.shapeType === 'wall'">
                    <p class="sidebar-label">Espessura</p>
                    <input
                        class="prop-input"
                        type="number"
                        min="1"
                        max="40"
                        v-model.number="selection.strokeWidth"
                        @input="syncToKonva"
                    />
                </div>

                <!-- Room: colors + opacity -->
                <div v-if="selection.shapeType === 'room'">
                    <p class="sidebar-label">Aparência</p>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-2">
                            <input
                                type="color"
                                v-model="selection.fill"
                                @input="syncToKonva"
                                class="color-picker"
                            />
                            <span class="text-[11px] text-slate-500">Preenchimento</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <input
                                type="color"
                                v-model="selection.stroke"
                                @input="syncToKonva"
                                class="color-picker"
                            />
                            <span class="text-[11px] text-slate-500">Borda</span>
                        </div>
                        <div class="mt-1 flex items-center gap-2">
                            <input
                                type="range"
                                min="0.05"
                                max="1"
                                step="0.05"
                                v-model.number="selection.opacity"
                                @input="syncToKonva"
                                class="h-1 flex-1 accent-blue-600"
                            />
                            <span class="w-8 text-right font-mono text-[10px] text-slate-600">
                                {{ Math.round(selection.opacity * 100) }}%
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Wall: color -->
                <div v-if="selection.shapeType === 'wall'">
                    <p class="sidebar-label">Cor da Parede</p>
                    <div class="flex items-center gap-2">
                        <input
                            type="color"
                            v-model="selection.stroke"
                            @input="syncToKonva"
                            class="color-picker"
                        />
                        <span class="text-[11px] text-slate-500">{{ selection.stroke }}</span>
                    </div>
                </div>

                <!-- Layer order -->
                <div>
                    <p class="sidebar-label">Camada</p>
                    <div class="flex gap-1.5">
                        <button
                            class="action-btn flex-1 justify-center py-1.5 text-[10px]"
                            @click="moveLayer('up')"
                        >
                            ▲ Subir
                        </button>
                        <button
                            class="action-btn flex-1 justify-center py-1.5 text-[10px]"
                            @click="moveLayer('down')"
                        >
                            ▼ Descer
                        </button>
                    </div>
                </div>
            </div>

            <!-- Layers list -->
            <div class="mt-auto border-t border-[#21262d] p-3">
                <p class="sidebar-label">Camadas ({{ shapes.length }})</p>
                <div class="flex max-h-48 flex-col gap-0.5 overflow-y-auto">
                    <button
                        v-for="s in [...shapes].reverse()"
                        :key="s.id"
                        class="layer-item"
                        :class="{ active: selection?.id === s.id }"
                        @click="selectById(s.id)"
                    >
                        <!-- icon -->
                        <svg
                            class="h-3 w-3 flex-shrink-0 opacity-60"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <rect
                                v-if="s.shapeType === 'room'"
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="1"
                                stroke-width="2"
                            />
                            <path
                                v-else-if="s.shapeType === 'wall'"
                                stroke-linecap="round"
                                stroke-width="2.5"
                                d="M4 12h16"
                            />
                            <path
                                v-else
                                stroke-linecap="round"
                                stroke-width="2"
                                d="M4 6h16M12 6v12M8 18h8"
                            />
                        </svg>
                        <span class="truncate text-[11px]">{{ s.label || s.shapeType }}</span>
                    </button>
                    <p v-if="!shapes.length" class="py-4 text-center text-[10px] text-slate-800">
                        Vazio
                    </p>
                </div>
            </div>
        </aside>

        <!-- Toast -->
        <Transition name="toast">
            <div v-if="toast.visible" class="toast-pill">{{ toast.message }}</div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import Konva from 'konva'

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const GRID_SIZE = 20

const ELEMENTS = [
    {
        id: 'piso-geral',
        label: 'Piso Geral',
        category: 'Pisos',
        fill: '#1e2a3a',
        stroke: '#2d4a6b',
    },
    { id: 'corredor', label: 'Corredor', category: 'Pisos', fill: '#1a2d1a', stroke: '#2a5a2a' },
    { id: 'uti', label: 'UTI', category: 'Pisos', fill: '#2d1a1a', stroke: '#7f1d1d' },
    {
        id: 'cirurgia',
        label: 'Centro Cirúrgico',
        category: 'Pisos',
        fill: '#1a1a2e',
        stroke: '#4a4ab8',
    },
    { id: 'recepcao', label: 'Recepção', category: 'Pisos', fill: '#1e2a1a', stroke: '#3a7a3a' },
    { id: 'farmacia', label: 'Farmácia', category: 'Pisos', fill: '#2a2a1a', stroke: '#7a7a1a' },
    { id: 'banheiro', label: 'Banheiro', category: 'Pisos', fill: '#1a2a2a', stroke: '#1a7a7a' },
    {
        id: 'escada',
        label: 'Escada / Elevador',
        category: 'Estrutura',
        fill: '#252525',
        stroke: '#555555',
    },
    {
        id: 'estacionamento',
        label: 'Estacionamento',
        category: 'Externo',
        fill: '#1e1e1e',
        stroke: '#444444',
    },
]

const TOOLS = [
    { id: 'select', label: 'Selecionar', hint: 'Selecionar (V)', icon: '↖' },
    { id: 'room', label: 'Cômodo', hint: 'Desenhar cômodo (R)', icon: '▭' },
    { id: 'wall', label: 'Parede', hint: 'Desenhar parede (W)', icon: '━' },
    { id: 'text', label: 'Texto', hint: 'Adicionar texto (T)', icon: 'T' },
    { id: 'pan', label: 'Mover', hint: 'Mover canvas (Space)', icon: '✥' },
]

const HINTS = {
    select: ['V — selecionar', 'Arraste para mover', 'Del — deletar'],
    room: ['Clique e arraste para desenhar', 'ESC — cancelar'],
    wall: ['Clique e arraste para desenhar parede', 'ESC — cancelar'],
    text: ['Clique no canvas para inserir texto'],
    pan: ['Arraste para navegar', 'Scroll — zoom'],
}

// ─────────────────────────────────────────────────────────────────────────────
// Reactive state
// ─────────────────────────────────────────────────────────────────────────────

const canvasContainer = ref(null)

const activeTool = ref('select')
const selectedElem = ref(ELEMENTS[0])
const shapes = ref([]) // plain data records
const selection = ref(null) // currently selected record
const scale = ref(1)
const gridVisible = ref(true)
const snapEnabled = ref(true)
const tools = ref(TOOLS)

const toast = ref({ visible: false, message: '' })
let toastTimer = null

// ─────────────────────────────────────────────────────────────────────────────
// Konva internals (not reactive — managed imperatively)
// ─────────────────────────────────────────────────────────────────────────────

let stage = null
let gridLayer = null
let mainLayer = null
let transformer = null

let isDrawing = false
let drawOrigin = { x: 0, y: 0 }
let liveShape = null // konva node being drawn

let isPanning = false
let panOrigin = null
let stageOrigin = null

// ─────────────────────────────────────────────────────────────────────────────
// Computed
// ─────────────────────────────────────────────────────────────────────────────

const activeHints = computed(() => HINTS[activeTool.value] || [])

const cursorClass = computed(() => ({
    'cursor-crosshair': ['room', 'wall', 'text'].includes(activeTool.value),
    'cursor-grab': activeTool.value === 'pan',
    'cursor-default': activeTool.value === 'select',
}))

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function snapVal(v) {
    return snapEnabled.value ? Math.round(v / GRID_SIZE) * GRID_SIZE : Math.round(v)
}

function genId() {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

function pointerToCanvas() {
    const ptr = stage.getPointerPosition()
    const sc = stage.scaleX()
    return {
        x: (ptr.x - stage.x()) / sc,
        y: (ptr.y - stage.y()) / sc,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────

function showToast(msg) {
    toast.value = { visible: true, message: msg }
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
        toast.value.visible = false
    }, 2200)
}

// ─────────────────────────────────────────────────────────────────────────────
// Grid
// ─────────────────────────────────────────────────────────────────────────────

function redrawGrid() {
    gridLayer.destroyChildren()
    if (!gridVisible.value) {
        gridLayer.batchDraw()
        return
    }

    const w = stage.width()
    const h = stage.height()
    const sc = stage.scaleX()
    const ox = stage.x()
    const oy = stage.y()

    const x0 = Math.floor(-ox / sc / GRID_SIZE) * GRID_SIZE
    const y0 = Math.floor(-oy / sc / GRID_SIZE) * GRID_SIZE
    const x1 = x0 + Math.ceil(w / sc) + GRID_SIZE * 2
    const y1 = y0 + Math.ceil(h / sc) + GRID_SIZE * 2

    for (let x = x0; x <= x1; x += GRID_SIZE) {
        const major = x % (GRID_SIZE * 5) === 0
        gridLayer.add(
            new Konva.Line({
                points: [x, y0, x, y1],
                stroke: major ? '#21262d' : '#161b22',
                strokeWidth: major ? 0.8 : 0.4,
                listening: false,
            }),
        )
    }
    for (let y = y0; y <= y1; y += GRID_SIZE) {
        const major = y % (GRID_SIZE * 5) === 0
        gridLayer.add(
            new Konva.Line({
                points: [x0, y, x1, y],
                stroke: major ? '#21262d' : '#161b22',
                strokeWidth: major ? 0.8 : 0.4,
                listening: false,
            }),
        )
    }
    gridLayer.batchDraw()
}

// ─────────────────────────────────────────────────────────────────────────────
// Konva init
// ─────────────────────────────────────────────────────────────────────────────

function initKonva() {
    const el = canvasContainer.value
    stage = new Konva.Stage({ container: el, width: el.clientWidth, height: el.clientHeight })

    gridLayer = new Konva.Layer({ listening: false })
    mainLayer = new Konva.Layer()
    stage.add(gridLayer)
    stage.add(mainLayer)

    transformer = new Konva.Transformer({
        rotateEnabled: false,
        keepRatio: false,
        borderStroke: '#3b82f6',
        borderStrokeWidth: 1.5,
        anchorStroke: '#3b82f6',
        anchorFill: '#1e3a8a',
        anchorSize: 8,
        anchorCornerRadius: 2,
    })
    mainLayer.add(transformer)
    redrawGrid()
    bindStageEvents()
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage events
// ─────────────────────────────────────────────────────────────────────────────

function bindStageEvents() {
    stage.on('mousedown touchstart', onStageDown)
    stage.on('mousemove touchmove', onStageMove)
    stage.on('mouseup touchend', onStageUp)
    stage.on('wheel', onWheel)
}

function onStageDown(e) {
    // Pan tool
    if (activeTool.value === 'pan') {
        isPanning = true
        panOrigin = stage.getPointerPosition()
        stageOrigin = { x: stage.x(), y: stage.y() }
        return
    }

    // Select: deselect when clicking empty stage
    if (activeTool.value === 'select') {
        if (e.target === stage) clearSelection()
        return
    }

    // Text: place on click
    if (activeTool.value === 'text') {
        const p = pointerToCanvas()
        placeText(snapVal(p.x), snapVal(p.y))
        return
    }

    // Room / Wall: start drawing
    if (['room', 'wall'].includes(activeTool.value)) {
        const p = pointerToCanvas()
        drawOrigin = { x: snapVal(p.x), y: snapVal(p.y) }
        isDrawing = true

        if (activeTool.value === 'room') {
            const el = selectedElem.value
            liveShape = new Konva.Rect({
                x: drawOrigin.x,
                y: drawOrigin.y,
                width: 1,
                height: 1,
                fill: el.fill,
                stroke: el.stroke,
                strokeWidth: 2,
                opacity: 0.85,
                cornerRadius: 2,
                id: genId(),
                listening: false,
            })
        } else {
            liveShape = new Konva.Line({
                points: [drawOrigin.x, drawOrigin.y, drawOrigin.x, drawOrigin.y],
                stroke: '#b0b8c4',
                strokeWidth: 8,
                lineCap: 'square',
                id: genId(),
                listening: false,
            })
        }
        mainLayer.add(liveShape)
    }
}

function onStageMove(e) {
    if (isPanning && panOrigin) {
        const now = stage.getPointerPosition()
        stage.position({
            x: stageOrigin.x + (now.x - panOrigin.x),
            y: stageOrigin.y + (now.y - panOrigin.y),
        })
        redrawGrid()
        return
    }

    if (!isDrawing || !liveShape) return

    const p = pointerToCanvas()
    const nx = snapVal(p.x)
    const ny = snapVal(p.y)

    if (activeTool.value === 'room') {
        liveShape.setAttrs({
            x: Math.min(drawOrigin.x, nx),
            y: Math.min(drawOrigin.y, ny),
            width: Math.abs(nx - drawOrigin.x),
            height: Math.abs(ny - drawOrigin.y),
        })
    } else {
        liveShape.points([drawOrigin.x, drawOrigin.y, nx, ny])
    }
    mainLayer.batchDraw()
}

function onStageUp() {
    if (isPanning) {
        isPanning = false
        panOrigin = null
        return
    }
    if (!isDrawing || !liveShape) return
    isDrawing = false

    // Discard too-small shapes
    const tooSmall =
        activeTool.value === 'room'
            ? liveShape.width() < 5 || liveShape.height() < 5
            : (() => {
                  const [x1, y1, x2, y2] = liveShape.points()
                  return Math.hypot(x2 - x1, y2 - y1) < 5
              })()

    if (tooSmall) {
        liveShape.destroy()
        mainLayer.batchDraw()
        liveShape = null
        return
    }

    commitShape(liveShape)
    liveShape = null
}

function onWheel(e) {
    e.evt.preventDefault()
    const oldSc = stage.scaleX()
    const factor = e.evt.deltaY > 0 ? 0.9 : 1.1
    const newSc = Math.min(Math.max(oldSc * factor, 0.15), 6)
    const ptr = stage.getPointerPosition()

    stage.scale({ x: newSc, y: newSc })
    stage.position({
        x: ptr.x - (ptr.x - stage.x()) * (newSc / oldSc),
        y: ptr.y - (ptr.y - stage.y()) * (newSc / oldSc),
    })
    scale.value = newSc
    redrawGrid()
}

// ─────────────────────────────────────────────────────────────────────────────
// Shape creation
// ─────────────────────────────────────────────────────────────────────────────

function commitShape(kNode) {
    const id = kNode.id()
    let record

    if (activeTool.value === 'room') {
        const el = selectedElem.value
        record = {
            id,
            shapeType: 'room',
            label: el.label,
            x: kNode.x(),
            y: kNode.y(),
            width: kNode.width(),
            height: kNode.height(),
            fill: el.fill,
            stroke: el.stroke,
            opacity: 0.85,
        }
    } else {
        const [x1, y1, x2, y2] = kNode.points()
        record = {
            id,
            shapeType: 'wall',
            label: 'Parede',
            x1,
            y1,
            x2,
            y2,
            stroke: '#b0b8c4',
            strokeWidth: 8,
        }
    }

    // Re-create as interactive node (listening enabled)
    kNode.destroy()
    const interactive = buildKonvaNode(record)
    mainLayer.add(interactive)
    transformer.moveToTop()
    mainLayer.batchDraw()

    shapes.value.push(record)
    bindNodeEvents(interactive, record)
}

function placeText(x, y) {
    const id = genId()
    const record = { id, shapeType: 'text', label: 'Texto', x, y }
    const kNode = buildKonvaNode(record)
    mainLayer.add(kNode)
    transformer.moveToTop()
    mainLayer.batchDraw()
    shapes.value.push(record)
    bindNodeEvents(kNode, record)
    setTool('select')
    selectRecord(record, kNode)
}

function buildKonvaNode(record) {
    if (record.shapeType === 'room') {
        return new Konva.Rect({
            id: record.id,
            x: record.x,
            y: record.y,
            width: record.width,
            height: record.height,
            fill: record.fill,
            stroke: record.stroke,
            strokeWidth: 2,
            opacity: record.opacity,
            cornerRadius: 2,
            draggable: true,
        })
    }
    if (record.shapeType === 'wall') {
        return new Konva.Line({
            id: record.id,
            points: [record.x1, record.y1, record.x2, record.y2],
            stroke: record.stroke,
            strokeWidth: record.strokeWidth,
            lineCap: 'square',
            draggable: true,
        })
    }
    // text
    return new Konva.Text({
        id: record.id,
        x: record.x,
        y: record.y,
        text: record.label,
        fontSize: 14,
        fill: '#c9d1d9',
        fontFamily: 'DM Sans, sans-serif',
        draggable: true,
    })
}

function bindNodeEvents(kNode, record) {
    kNode.on('click tap', (e) => {
        if (activeTool.value !== 'select') return
        e.cancelBubble = true
        selectRecord(record, kNode)
    })

    kNode.on('dblclick dbltap', () => {
        if (record.shapeType !== 'text') return
        const val = prompt('Editar texto:', record.label)
        if (val !== null) {
            record.label = val
            kNode.text(val)
            mainLayer.batchDraw()
        }
    })

    kNode.on('dragmove', () => {
        if (record.shapeType === 'room') {
            record.x = snapVal(kNode.x())
            record.y = snapVal(kNode.y())
            kNode.position({ x: record.x, y: record.y })
        }
        if (record.shapeType === 'text') {
            record.x = snapVal(kNode.x())
            record.y = snapVal(kNode.y())
            kNode.position({ x: record.x, y: record.y })
        }
    })

    kNode.on('dragend', () => {
        if (record.shapeType === 'wall') {
            // Absorb stage offset into points
            const dx = kNode.x(),
                dy = kNode.y()
            const [x1, y1, x2, y2] = kNode.points()
            record.x1 = x1 + dx
            record.y1 = y1 + dy
            record.x2 = x2 + dx
            record.y2 = y2 + dy
            kNode.points([record.x1, record.y1, record.x2, record.y2])
            kNode.position({ x: 0, y: 0 })
        }
    })

    kNode.on('transformend', () => {
        if (record.shapeType === 'room') {
            record.x = Math.round(kNode.x())
            record.y = Math.round(kNode.y())
            record.width = Math.round(kNode.width() * kNode.scaleX())
            record.height = Math.round(kNode.height() * kNode.scaleY())
            kNode.setAttrs({ width: record.width, height: record.height, scaleX: 1, scaleY: 1 })
        }
    })
}

// ─────────────────────────────────────────────────────────────────────────────
// Selection
// ─────────────────────────────────────────────────────────────────────────────

function selectRecord(record, kNode) {
    selection.value = record
    transformer.nodes(record.shapeType === 'room' ? [kNode] : [])
    mainLayer.batchDraw()
}

function clearSelection() {
    selection.value = null
    transformer.nodes([])
    mainLayer.batchDraw()
}

function selectById(id) {
    const record = shapes.value.find((s) => s.id === id)
    if (!record) return
    const kNode = mainLayer.findOne('#' + id)
    if (kNode) selectRecord(record, kNode)
}

// ─────────────────────────────────────────────────────────────────────────────
// Sync Vue → Konva (after props panel changes)
// ─────────────────────────────────────────────────────────────────────────────

function syncToKonva() {
    const rec = selection.value
    if (!rec) return
    const kNode = mainLayer.findOne('#' + rec.id)
    if (!kNode) return

    if (rec.shapeType === 'room') {
        kNode.setAttrs({
            x: rec.x,
            y: rec.y,
            width: rec.width,
            height: rec.height,
            fill: rec.fill,
            stroke: rec.stroke,
            opacity: rec.opacity,
        })
    } else if (rec.shapeType === 'wall') {
        kNode.setAttrs({ stroke: rec.stroke, strokeWidth: rec.strokeWidth })
    } else if (rec.shapeType === 'text') {
        kNode.text(rec.label)
    }
    mainLayer.batchDraw()
}

// ─────────────────────────────────────────────────────────────────────────────
// Tools
// ─────────────────────────────────────────────────────────────────────────────

function setTool(id) {
    activeTool.value = id
    if (id !== 'select') clearSelection()
}

function pickElem(el) {
    selectedElem.value = el
    setTool('room')
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete / Layer
// ─────────────────────────────────────────────────────────────────────────────

function deleteSelected() {
    const rec = selection.value
    if (!rec) return
    const kNode = mainLayer.findOne('#' + rec.id)
    if (kNode) {
        transformer.nodes([])
        kNode.destroy()
    }
    shapes.value = shapes.value.filter((s) => s.id !== rec.id)
    selection.value = null
    mainLayer.batchDraw()
    showToast('Elemento removido')
}

function moveLayer(dir) {
    const rec = selection.value
    if (!rec) return
    const kNode = mainLayer.findOne('#' + rec.id)
    if (!kNode) return
    dir === 'up' ? kNode.moveUp() : kNode.moveDown()
    transformer.moveToTop()
    mainLayer.batchDraw()
}

// ─────────────────────────────────────────────────────────────────────────────
// View controls
// ─────────────────────────────────────────────────────────────────────────────

function applyScale(newSc) {
    newSc = Math.min(Math.max(newSc, 0.15), 6)
    const cx = stage.width() / 2,
        cy = stage.height() / 2
    const ratio = newSc / stage.scaleX()
    stage.scale({ x: newSc, y: newSc })
    stage.position({
        x: cx - (cx - stage.x()) * ratio,
        y: cy - (cy - stage.y()) * ratio,
    })
    scale.value = newSc
    redrawGrid()
}

function zoomIn() {
    applyScale(scale.value * 1.2)
}
function zoomOut() {
    applyScale(scale.value * 0.8)
}
function resetView() {
    scale.value = 1
    stage.scale({ x: 1, y: 1 })
    stage.position({ x: 0, y: 0 })
    redrawGrid()
}

function toggleGrid() {
    gridVisible.value = !gridVisible.value
    redrawGrid()
}
function toggleSnap() {
    snapEnabled.value = !snapEnabled.value
    showToast(snapEnabled.value ? 'Snap ativado' : 'Snap desativado')
}

// ─────────────────────────────────────────────────────────────────────────────
// Clear
// ─────────────────────────────────────────────────────────────────────────────

function clearAll() {
    if (!confirm('Limpar todos os elementos?')) return
    mainLayer.destroyChildren()
    mainLayer.add(transformer)
    shapes.value = []
    selection.value = null
    mainLayer.batchDraw()
    showToast('Canvas limpo')
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON export / import
// ─────────────────────────────────────────────────────────────────────────────

function exportJSON() {
    const payload = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        canvas: { width: stage.width(), height: stage.height() },
        shapes: shapes.value,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), {
        href: url,
        download: `planta_${Date.now()}.json`,
    })
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Exportado — ${shapes.value.length} elemento(s)`)
}

function importJSON(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result)
            mainLayer.destroyChildren()
            mainLayer.add(transformer)
            shapes.value = []
            selection.value = null

            for (const rec of data.shapes || []) {
                shapes.value.push(rec)
                const kNode = buildKonvaNode(rec)
                mainLayer.add(kNode)
                bindNodeEvents(kNode, rec)
            }
            transformer.moveToTop()
            mainLayer.batchDraw()
            showToast(`Importado — ${shapes.value.length} elemento(s)`)
        } catch {
            showToast('Erro ao ler JSON')
        }
    }
    reader.readAsText(file)
    e.target.value = ''
}

// ─────────────────────────────────────────────────────────────────────────────
// Keyboard shortcuts
// ─────────────────────────────────────────────────────────────────────────────

function onKeyDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
    const k = e.key
    if (k === 'v' || k === 'V') setTool('select')
    if (k === 'r' || k === 'R') setTool('room')
    if (k === 'w' || k === 'W') setTool('wall')
    if (k === 't' || k === 'T') setTool('text')
    if (k === ' ') {
        e.preventDefault()
        setTool('pan')
    }
    if (k === 'Delete' || k === 'Backspace') deleteSelected()
    if (k === 'Escape') {
        setTool('select')
        if (isDrawing && liveShape) {
            liveShape.destroy()
            mainLayer.batchDraw()
            liveShape = null
            isDrawing = false
        }
    }
}

function onResize() {
    if (!stage || !canvasContainer.value) return
    stage.width(canvasContainer.value.clientWidth)
    stage.height(canvasContainer.value.clientHeight)
    redrawGrid()
}

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
// Expose (optional — for parent refs)
// ─────────────────────────────────────────────────────────────────────────────

defineExpose({ exportJSON, importJSON, clearAll, shapes })
</script>

<style scoped>
.floor-editor {
    font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
}

/* ── Sidebar labels ─────────────────────────────── */
.sidebar-label {
    @apply mb-2 border-b border-[#21262d] pb-1.5 font-mono text-[9px] tracking-[0.14em] text-slate-600 uppercase;
}

/* ── Tool buttons ───────────────────────────────── */
.tool-btn {
    @apply flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-transparent bg-transparent px-1 py-2 text-center text-slate-600 transition-all duration-100;
    font-family: inherit;
}
.tool-btn:hover {
    @apply border-[#30363d] bg-[#21262d] text-slate-300;
}
.tool-btn.active {
    @apply border-blue-900 bg-blue-950 text-blue-400;
}

/* ── Element cards ──────────────────────────────── */
.elem-card {
    @apply flex cursor-pointer items-center gap-2 rounded-lg border border-transparent bg-[#0d1117] px-2 py-1.5 text-slate-500 transition-all duration-100;
    font-family: inherit;
}
.elem-card:hover {
    @apply border-[#30363d] bg-[#21262d] text-slate-300;
}
.elem-card.active {
    @apply border-blue-900 bg-blue-950 text-blue-400;
}
.elem-swatch {
    @apply h-6 w-6 flex-shrink-0 rounded;
    border: 1px solid;
}

/* ── Action buttons ─────────────────────────────── */
.action-btn {
    @apply flex cursor-pointer items-center gap-1.5 rounded-lg border border-transparent bg-[#21262d] px-3 py-1.5 text-[11px] font-medium text-slate-500 transition-all duration-100;
    font-family: inherit;
}
.action-btn:hover {
    @apply bg-[#30363d] text-slate-300;
}
.action-btn.primary {
    @apply border-blue-900 bg-blue-950 text-blue-400;
}
.action-btn.primary:hover {
    @apply bg-blue-900 text-blue-300;
}
.action-btn.danger:hover {
    @apply border-red-900 bg-red-950 text-red-400;
}

/* ── Icon button ────────────────────────────────── */
.icon-btn {
    @apply flex cursor-pointer items-center justify-center rounded-md border border-[#30363d] bg-[#21262d] p-1.5 text-slate-600 transition-all duration-100;
    font-family: inherit;
}
.icon-btn:hover {
    @apply bg-[#30363d] text-slate-300;
}

/* ── Prop inputs ────────────────────────────────── */
.prop-input {
    @apply w-full rounded-md border border-[#30363d] bg-[#21262d] px-2.5 py-1.5 text-[12px] text-slate-300 transition-colors duration-100 outline-none;
    font-family: inherit;
}
.prop-input:focus {
    @apply border-blue-700;
}

/* ── Color picker ───────────────────────────────── */
.color-picker {
    @apply h-7 w-7 cursor-pointer rounded border-0 bg-transparent p-0;
}

/* ── Layer items ────────────────────────────────── */
.layer-item {
    @apply flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-slate-600 transition-colors duration-100;
    font-family: inherit;
}
.layer-item:hover {
    @apply bg-[#21262d] text-slate-400;
}
.layer-item.active {
    @apply bg-blue-950 text-blue-400;
}

/* ── Toast ──────────────────────────────────────── */
.toast-pill {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    @apply pointer-events-none z-50 rounded-full border border-blue-900 bg-blue-950 px-5 py-2 font-mono text-[11px] text-blue-300;
}
.toast-enter-active,
.toast-leave-active {
    transition:
        opacity 0.25s,
        transform 0.25s;
}
.toast-enter-from {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
}
.toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(8px);
}
</style>
