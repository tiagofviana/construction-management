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

        <div
            class="relative m-8 flex flex-1 flex-row overflow-hidden rounded-lg border border-black/20 bg-white shadow shadow-black/20"
        >
            <SimpleLoader
                v-if="isLoadingInventory"
                :size="44"
                class="absolute top-1/2 left-1/2 z-1 -translate-1/2 stroke-gray-700"
            />

            <!-- Tools -->
            <aside
                class="flex w-full max-w-44 flex-1 flex-col overflow-y-auto border-r border-black/10"
            >
                <template v-if="editorCanvas">
                    <div class="flex h-12 items-center justify-center border-b border-slate-300">
                        <h2 class="px-4 text-center text-lg">Ferramentas</h2>
                    </div>

                    <ul>
                        <li
                            class="flex cursor-pointer items-center justify-center gap-2 border-t border-b border-transparent p-2 hover:border-black/10 hover:bg-slate-200"
                            :class="{ 'text-orange-700': controller.tool === 'select' }"
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
                                'font-base text-lg text-red-600': !isInsideRoom.x,
                            }"
                        >
                            x: {{ controller.mouse.point.x }}
                        </span>

                        <span
                            class="transition-all"
                            :class="{
                                'font-base text-lg text-blue-600': controller.mouse.isDragging,
                                'font-base text-lg text-red-600': !isInsideRoom.y,
                            }"
                        >
                            y: {{ controller.mouse.point.y }}
                        </span>
                    </p>

                    <div
                        class="flex flex-row items-center justify-center border-t border-black/10 px-4 py-3"
                    >
                        <button
                            type="button"
                            title="Aumentar o zoom"
                            class="cursor-pointer stroke-black hover:stroke-green-700"
                            @click="editorCanvas.eventsHandler.zoom.apply(0.25)"
                        >
                            <Plus :size="18" :stroke-width="1.2" class="stroke-inherit" />
                        </button>

                        <button
                            type="button"
                            title="Centralizar o cômodo"
                            class="mx-3 w-12 cursor-pointer text-center font-mono text-sm text-yellow-700"
                            @click="editorCanvas.centralizeZoom()"
                        >
                            {{ Math.round(controller.zoom * 100) }}%
                        </button>

                        <button
                            type="button"
                            title="Diminuir o zoom"
                            class="cursor-pointer stroke-black hover:stroke-red-700"
                            @click="editorCanvas.eventsHandler.zoom.apply(-0.25)"
                        >
                            <Minus :size="18" :stroke-width="1.2" class="stroke-inherit" />
                        </button>
                    </div>
                </template>
            </aside>

            <!-- Map -->
            <header class="flex min-w-0 flex-1 flex-col">
                <div class="flex h-12 items-center justify-start gap-2 px-3">
                    <button
                        type="button"
                        class="action-btn flex cursor-pointer items-center gap-1 rounded border px-2 py-1 font-semibold transition-all"
                        :class="{
                            'border-black/20 bg-gray-300 text-gray-900': controller.grid,
                            'border-transparent': !controller.grid,
                        }"
                        @click="toggleGrid()"
                    >
                        <Grid2X2 :size="18" :stroke-width="1.2" /> <span>Grade</span>
                    </button>

                    <button
                        type="button"
                        class="action-btn flex cursor-pointer items-center gap-1 rounded border px-2 py-1 font-semibold transition-all"
                        :class="{
                            'border-black/20 bg-red-200 text-red-900': controller.snap,
                            'border-transparent': !controller.snap,
                        }"
                        @click="toggleSnap()"
                    >
                        <Magnet :size="18" :stroke-width="1.2" /> <span>Encaixe</span>
                    </button>

                    <h1 class="ml-auto truncate px-2 text-lg font-bold">
                        {{ room?.name ?? 'Cômodo' }}
                    </h1>
                </div>

                <div class="relative flex-1 bg-gray-100">
                    <div ref="container" class="size-full"></div>

                    <div
                        class="pointer-events-none absolute inset-0 inset-shadow-sm inset-shadow-black/30"
                    ></div>
                </div>
            </header>

            <!-- Items -->
            <aside
                class="relative flex h-full w-full max-w-56 shrink-0 flex-col overflow-y-auto border-l border-black/10"
            >
                <template v-if="editorCanvas">
                    <div
                        class="flex h-12 shrink-0 items-center justify-center border-b border-slate-200"
                    >
                        <h2 class="px-4 text-lg">Itens</h2>
                    </div>

                    <div class="flex flex-1 flex-col">
                        <ItemList
                            v-if="!isLoadingInventory"
                            ref="item-list"
                            :items="items"
                            :visible-ids="visibleIds"
                            :category-names="categoryNames"
                            @change="(itemId) => editorCanvas?.highlightItem(itemId)"
                            @show="(itemId) => (hiddenItemIds = withoutId(hiddenItemIds, itemId))"
                            @hide="(itemId) => (hiddenItemIds = new Set(hiddenItemIds).add(itemId))"
                        />

                        <div
                            v-if="
                                items.length > 0 &&
                                permissions.hasPermission(props.employeeId, 'can_edit_roomItem')
                            "
                            class="mt-auto flex shrink-0 flex-col gap-2 border-t border-black/10 p-4"
                        >
                            <button
                                type="button"
                                class="btn btn-blue flex items-center"
                                @click="saveItems()"
                            >
                                <template v-if="!isSavingItems">
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

<script lang="ts" setup>
import {
    ref,
    reactive,
    computed,
    watch,
    shallowRef,
    useTemplateRef,
    defineAsyncComponent,
    onBeforeMount,
    onMounted,
    onBeforeUnmount,
} from 'vue'
import axios from 'axios'
import { SquareMousePointer, Plus, Minus, Save, Grid2X2, Magnet } from '@lucide/vue'
import { permissionsStore } from '@/stores/employee/permissions'
import type { ModalType } from '@/components/alerts/ModalAlert.vue'
import SimpleLoader from '@/components/loading/SimpleLoader.vue'
import ItemList from '@/components/inventory/modules/viewer/ItemList.vue'
import type {
    IInventoryRoom,
    IInventoryItem,
    IPoint,
} from '@/components/inventory/modules/viewer/types'
import { InventoryEditorCanvas, type ToolOptions } from '@/components/inventory/modules/editor'

interface ICategory {
    id: number
    name: string
}

interface IEditorOptions {
    tool: ToolOptions
    zoom: number
    mouse: {
        point: IPoint
        isDragging: boolean
    }
    grid: boolean
    snap: boolean
}

const AsyncModalAlert = defineAsyncComponent(() => import('@/components/alerts/ModalAlert.vue'))

const props = defineProps<{
    employeeId: number
    roomId: string
}>()

const permissions = permissionsStore()

const container = useTemplateRef('container')
const itemList = useTemplateRef('item-list')
const editorCanvas = shallowRef<InventoryEditorCanvas | null>(null)

const controller = reactive<IEditorOptions>({
    tool: null,
    zoom: 1,
    mouse: { point: { x: 0, y: 0 }, isDragging: false },
    grid: true,
    snap: true,
})

const room = ref<IInventoryRoom | null>(null)
const items = ref<Array<IInventoryItem>>([])
const categoryNames = ref<Map<number, string>>(new Map())
const hiddenItemIds = ref<Set<string>>(new Set())
const isLoadingInventory = ref(true)
const isSavingItems = ref(false)
const modalAlert = ref<{ message: string; key: number; title: string; type: ModalType }>({
    message: '',
    key: 0,
    title: '',
    type: 'error',
})

const visibleIds = computed(() => {
    return new Set(
        items.value.filter((item) => !hiddenItemIds.value.has(item.id)).map((item) => item.id),
    )
})

// Tells whether the pointer is inside the room, the coordinates are relative to it
const isInsideRoom = computed(() => {
    const [, , width, height] = (room.value?.svgViewBox ?? '0 0 0 0').split(' ').map(Number)
    const { x, y } = controller.mouse.point

    return {
        x: x >= 0 && x <= width,
        y: y >= 0 && y <= height,
    }
})

watch(visibleIds, (value) => editorCanvas.value?.setVisibleIds(value))

onBeforeMount(() => {
    permissions.fetchPermissions(props.employeeId)
})

onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
    const ec = new InventoryEditorCanvas(container.value as HTMLDivElement)
    ec.setItemClick((itemId) => itemList.value?.goTo(itemId))

    ec.onItemsChange = () => {}

    ec.eventsHandler.onZoomChange = (scale) => {
        controller.zoom = scale
    }

    ec.eventsHandler.mouseTracker.onTrackChange = (point) => {
        controller.mouse = { point, isDragging: false }
    }

    ec.eventsHandler.mouseTracker.onDragChange = (point) => {
        controller.mouse = { point, isDragging: true }
    }

    editorCanvas.value = ec

    fetchCategories()
    fetchInventory()
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
    editorCanvas.value?.destroy()
    editorCanvas.value = null
})

function setModalAlert(msg: string, title: string, type: ModalType) {
    modalAlert.value = {
        message: msg,
        key: modalAlert.value.key + 1,
        title: title,
        type: type,
    }
}

function withoutId(ids: Set<string>, itemId: string): Set<string> {
    const copy = new Set(ids)
    copy.delete(itemId)
    return copy
}

function changeTool(tool: ToolOptions) {
    if (!editorCanvas.value) return

    if (controller.tool === tool) {
        tool = null
    }

    editorCanvas.value.setTool(tool)
    controller.tool = tool
}

function onKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement
    if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
    ) {
        return
    }

    const key = event.key.toLowerCase()
    if (key === 's') changeTool('select')
    if (key === 'escape') changeTool(null)
}

function toggleGrid() {
    controller.grid = !controller.grid
    editorCanvas.value?.gridVisibility(controller.grid)
}

function toggleSnap() {
    controller.snap = !controller.snap
    editorCanvas.value?.setSnap(controller.snap)
}

function handleRequestError(error: { code?: string; status?: number }) {
    if (error.code === 'ERR_NETWORK') {
        setModalAlert(
            'Não foi possível conectar com servidor, por favor, tente novamente mais tarde.',
            'Conexão instável',
            'error',
        )
        return
    }

    if (error.status === 403) {
        setModalAlert(
            'Você não possui permissão para editar o inventário deste cômodo.',
            'Acesso negado',
            'error',
        )
        return
    }

    console.error(error)
    setModalAlert(
        'O servidor não conseguiu processar a solicitação, por favor, contacte a nossa equipe.',
        'Erro inesperado',
        'error',
    )
}

function fetchCategories() {
    axios
        .get(`/api/employee/${props.employeeId}/inventory/categories`)
        .then((response) => {
            const data = response.data as Array<ICategory>
            categoryNames.value = new Map(data.map(({ id, name }) => [id, name]))
        })
        .catch(handleRequestError)
}

function fetchInventory() {
    isLoadingInventory.value = true

    axios
        .get(`/api/employee/${props.employeeId}/room/${props.roomId}/inventory-data`)
        .then((response) => {
            const data = response.data as { room: IInventoryRoom; items: Array<IInventoryItem> }

            room.value = data.room
            items.value = data.items
            hiddenItemIds.value = new Set()

            editorCanvas.value?.setRoom(data.room)
            editorCanvas.value?.setItems(data.items)
        })
        .catch(handleRequestError)
        .finally(() => {
            isLoadingInventory.value = false
        })
}

function saveItems() {
    if (isSavingItems.value || !editorCanvas.value) return
    isSavingItems.value = true

    // The API receives the fields in snake_case
    const itemsList = editorCanvas.value.getItems().map((item) => ({
        id: item.id,
        position_x: item.positionX,
        position_y: item.positionY,
        rotation: item.rotation,
    }))

    axios
        .post(`/api/employee/${props.employeeId}/room/${props.roomId}/inventory/update/form`, {
            items: JSON.stringify(itemsList),
        })
        .then(() => {
            setModalAlert('O inventário do cômodo foi salvo com sucesso.', 'Sucesso', 'info')
        })
        .catch((error) => {
            if (error.status === 400) {
                const responseErros = error.response.data.errors
                let msg = ''

                if (responseErros.items) msg = responseErros.items[0]
                if (responseErros.__all__) msg = responseErros.__all__[0]

                if (msg === '') {
                    msg = 'Erro inesperado, contacte a equipe.'
                    console.error(responseErros)
                }

                setModalAlert(msg, 'Dados inválidos', 'error')
                return
            }

            handleRequestError(error)
        })
        .finally(() => {
            isSavingItems.value = false
        })
}
</script>
