<template>
    <section class="max-h-content min-h-content relative flex size-full">
        <AsyncModalAlert
            v-if="modalAlert.message"
            :type="modalAlert.type"
            :title="modalAlert.title"
            :message="modalAlert.message"
            ok-label="Confirmar"
            :has-cancel-button="false"
            :key="modalAlert.key"
        />

        <AsyncRoomEditor
            v-if="roomEditorKey > 0"
            :key="roomEditorKey"
            :is-update="false"
            :room="undefined"
            @saved="loadRooms()"
        />

        <div
            class="relative m-8 flex flex-1 flex-row overflow-hidden rounded-lg border border-black/20 bg-white shadow shadow-black/20"
        >
            <SimpleLoader
                v-if="isLoadingRooms"
                :size="44"
                class="absolute top-1/2 left-1/2 z-1 -translate-1/2 stroke-gray-700"
            />

            <aside
                class="flex w-full max-w-44 flex-1 flex-col overflow-y-auto border-r border-black/10"
            >
                <template v-if="floorCanvas">
                    <div class="flex h-12 items-center justify-center border-b border-slate-300">
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
                    </ul>

                    <p
                        class="mt-auto flex flex-row items-center justify-center gap-2 border-t border-black/10 px-4 py-3 text-xs text-gray-500"
                    >
                        <span
                            class="transition-all"
                            :class="{
                                'font-base text-lg text-blue-600': controller.mouse.isDragging,
                                'font-base text-lg text-red-600':
                                    controller.mouse.point.x < 0 ||
                                    controller.mouse.point.x > floorCanvas.settings.map.width,
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
                                    controller.mouse.point.y > floorCanvas.settings.map.height,
                            }"
                        >
                            y: {{ controller.mouse.point.y }}
                        </span>
                    </p>

                    <CanvasFloorSize
                        :min="200"
                        :max="1000"
                        :step="10"
                        :initial-size="floorSettings.size"
                        @change="setMapSize"
                    />

                    <div
                        class="flex flex-row items-center justify-center border-t border-black/10 px-4 py-3"
                    >
                        <button
                            type="button"
                            class="cursor-pointer stroke-black hover:stroke-green-700"
                            @click="floorCanvas.eventsHandler.zoom.apply(0.25)"
                        >
                            <Plus :size="18" :stroke-width="1.2" class="stroke-inherit" />
                        </button>

                        <button
                            type="button"
                            class="mx-3 w-12 cursor-pointer text-center font-mono text-sm text-yellow-700"
                            @click="floorCanvas.centralize()"
                        >
                            {{ Math.round(controller.zoom.scale * 100) }}%
                        </button>

                        <button
                            type="button"
                            class="cursor-pointer stroke-black hover:stroke-red-700"
                            @click="floorCanvas.eventsHandler.zoom.apply(-0.25)"
                        >
                            <Minus :size="18" :stroke-width="1.2" class="stroke-inherit" />
                        </button>
                    </div>
                </template>
            </aside>

            <header class="flex flex-1 flex-col">
                <div class="flex h-12 items-center justify-start gap-2 px-3">
                    <button
                        type="button"
                        class="action-btn flex cursor-pointer items-center gap-1 rounded border px-2 py-1 font-semibold transition-all"
                        :class="{
                            'border-black/20 bg-gray-300 text-gray-900': controller.grid.isVisible,
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
                </div>

                <div class="relative flex-1 bg-gray-100">
                    <div ref="container" class="size-full"></div>

                    <div
                        class="absolute top-0 right-0 bottom-0 left-0 inset-shadow-sm inset-shadow-black/30"
                        style="pointer-events: none"
                    ></div>
                </div>
            </header>

            <aside
                class="relative flex h-full w-full max-w-56 flex-col overflow-hidden border-l border-black/10"
            >
                <template v-if="floorCanvas">
                    <div class="flex h-12 items-center justify-center border-b border-slate-200">
                        <h2 class="px-4 text-lg">Cômodos</h2>
                    </div>

                    <div class="flex flex-1 flex-col">
                        <RoomList
                            :rooms="rooms"
                            @editing-room="floorCanvas.setTool(null)"
                            @roomChanged="loadRooms()"
                        />

                        <div class="mt-auto flex shrink-0 flex-col gap-2 p-4">
                            <button
                                type="button"
                                class="btn btn-green flex items-center"
                                @click="createRoom()"
                            >
                                <Grid2x2Plus :size="18" />
                                Adicionar
                            </button>

                            <button
                                v-if="rooms.length > 0"
                                type="button"
                                class="btn btn-blue flex items-center"
                                @click="saveRooms()"
                            >
                                <template v-if="!isSavingRooms">
                                    <Save :size="16" />
                                    Salvar
                                </template>
                                <SimpleLoader v-else :size="26" />
                            </button>
                        </div>
                    </div>
                </template>
            </aside>
        </div>
    </section>
</template>

<script setup lang="ts">
import {
    onMounted,
    onBeforeMount,
    onBeforeUnmount,
    ref,
    reactive,
    defineAsyncComponent,
    useTemplateRef,
    shallowRef,
    provide,
} from 'vue'
import axios from 'axios'
import { SquareMousePointer, Plus, Minus, Grid2x2Plus, Save, Grid2X2, Magnet } from '@lucide/vue'
import RoomList from '@/components/map/floorEditor/RoomList.vue'
import CanvasFloorSize, { type Size } from '@/components/map/floorEditor/CanvasFloorSize.vue'
import type { ModalType } from '@/components/alerts/ModalAlert.vue'
import SimpleLoader from '@/components/loading/SimpleLoader.vue'
import type { Room, Point } from '@/components/map/modules/types'
import { FloorCanvas } from '@/components/map/modules/floor'
import type { ToolOptions } from '@/components/map/modules/floor/core'

interface FloorOptions {
    tool: ToolOptions
    zoom: {
        scale: number
    }
    mouse: {
        point: Point
        isDragging: boolean
    }
    grid: { isVisible: boolean }
    snap: { isOn: boolean }
}

const AsyncModalAlert = defineAsyncComponent(() => import('@/components/alerts/ModalAlert.vue'))
const AsyncRoomEditor = defineAsyncComponent(() => import('@/components/map/RoomEditor.vue'))

const props = defineProps({
    floorId: {
        type: Number,
        required: true,
    },
    employeeId: {
        type: Number,
        required: true,
    },
})
const rooms = ref<Array<Room>>([])
const floorSettings = reactive({
    size: {
        width: 200,
        height: 200,
    },
})
const container = useTemplateRef('container')
const floorCanvas = shallowRef<null | FloorCanvas>(null)
const controller = reactive<FloorOptions>({
    tool: null,
    zoom: { scale: 1 },
    mouse: { point: { x: 0, y: 0 }, isDragging: false },
    grid: { isVisible: true },
    snap: { isOn: true },
})
const isSavingRooms = ref<boolean>(false)
const isLoadingRooms = ref<boolean>(true)

const modalAlert = ref<{ message: string; key: number; title: string; type: ModalType }>({
    message: '',
    key: 0,
    title: '',
    type: 'success',
})

const roomEditorKey = ref<number>(0)

onBeforeMount(() => {
    provide('floorId', props.floorId)
    provide('employeeId', props.employeeId)
})

onMounted(async () => {
    window.addEventListener('keydown', onKeyDown)

    const elm = container.value as HTMLDivElement
    const fc = new FloorCanvas(elm)

    fc.onRoomsChange = (value) => {
        rooms.value = value
    }

    fc.eventsHandler.zoom.onZoomChange = (value) => {
        controller.zoom.scale = value
    }

    fc.eventsHandler.mouseTracker.onTrackChange = (point) => {
        controller.mouse = {
            point: point,
            isDragging: false,
        }
    }

    fc.eventsHandler.mouseTracker.onDragChange = (point) => {
        controller.mouse = {
            point: point,
            isDragging: true,
        }
    }

    fc.setup()
    fc.setRooms(rooms.value)

    floorCanvas.value = fc

    loadRooms()
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
    floorCanvas.value?.destroy()
    floorCanvas.value = null
})

function setModalAlert(msg: string, title: string, type: ModalType) {
    modalAlert.value = {
        message: msg,
        key: modalAlert.value.key + 1,
        title: title,
        type: type,
    }
}

function setMapSize(size: Size) {
    floorSettings.size = size
    floorCanvas.value!.setMapSize(size)
}

function changeTool(tool: ToolOptions) {
    if (!floorCanvas.value) return

    if (controller.tool === tool) {
        tool = null
    }

    floorCanvas.value.setTool(tool)
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
    if (key === 'escape') changeTool(null)
}

function toggleGrid() {
    controller.grid.isVisible = !controller.grid.isVisible
    floorCanvas.value!.gridVisibility(controller.grid.isVisible)
}

function toggleSnap() {
    controller.snap.isOn = !controller.snap.isOn
    floorCanvas.value!.settings.snap.isOn = controller.snap.isOn
}

function createRoom() {
    floorCanvas.value?.setTool(null)
    roomEditorKey.value += 1
}

function loadRooms() {
    isLoadingRooms.value = true
    rooms.value = []
    floorCanvas.value?.clear()
    axios
        .get(`/api/employee/${props.employeeId}/floor/${props.floorId}/data`)
        .then((response) => {
            const data = response.data

            floorSettings.size = data.floorSettings as Size
            floorCanvas.value?.setMapSize(data.floorSettings)

            rooms.value = data.rooms as Array<Room>
            floorCanvas.value?.setRooms(rooms.value)
        })
        .finally(() => {
            isLoadingRooms.value = false
        })
}

function saveRooms() {
    if (isSavingRooms.value === true) return
    isSavingRooms.value = true

    const rooms_list = rooms.value.map((item) => ({
        id: item.id,
        position_x: item.positionX,
        position_y: item.positionY,
        rotation: item.rotation,
    }))

    axios
        .post(`/api/employee/${props.employeeId}/floor/${props.floorId}/update/form`, {
            rooms: JSON.stringify(rooms_list),
            width: floorSettings.size.width,
            height: floorSettings.size.height,
        })
        .then(() => {
            setModalAlert('O andar foi salvo com sucesso.', 'Sucesso', 'info')
        })
        .catch((error) => {
            if (error.status === 400) {
                const responseErros = error.response.data.errors
                let msg: string = ''

                if (responseErros.rooms) {
                    msg = responseErros.rooms[0]
                }

                if (responseErros.__all__) {
                    msg = responseErros.__all__[0]
                }

                if (msg === '') {
                    msg = 'Erro inesperado, contacte a equipe.'
                    console.error(responseErros)
                }

                setModalAlert(msg, 'Dados inválidos', 'error')
                return
            }
        })
        .finally(() => {
            isSavingRooms.value = false
        })
}
</script>
