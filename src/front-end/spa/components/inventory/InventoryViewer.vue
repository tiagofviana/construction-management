<template>
    <section class="w-full overflow-hidden rounded-lg border border-black/20 bg-white">
        <AsyncModalAlert
            v-if="modalAlert.message"
            type="error"
            :title="modalAlert.title"
            :message="modalAlert.message"
            ok-label="Confirmar"
            :has-cancel-button="false"
            :key="modalAlert.key"
        />

        <!-- Room -->
        <div class="px-4 py-3 sm:px-6">
            <h2 class="truncate text-xl font-bold sm:text-2xl">{{ room?.name ?? 'Cômodo' }}</h2>

            <p v-if="room?.description" class="mt-1 text-sm text-pretty text-gray-600">
                {{ room.description }}
            </p>
        </div>

        <!-- Categories -->
        <div
            class="border-y border-black/10 transition-all duration-400"
            :class="{ 'border-x bg-mauve-200': isCategoriesOpen }"
        >
            <button
                type="button"
                class="flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left hover:bg-black/10"
                @click="isCategoriesOpen = !isCategoriesOpen"
            >
                <span class="text-sm font-bold text-black/70"> Categorias dos itens exibidos </span>

                <span v-if="!isLoadingCategories" class="text-xs text-gray-500">
                    {{ selectedCategories.length }} de {{ categories.length }} selecionadas
                </span>

                <ChevronDown
                    :size="18"
                    class="ml-auto text-gray-500 transition-transform"
                    :class="{ 'rotate-180': isCategoriesOpen }"
                />
            </button>

            <div
                class="grid transition-all duration-400 ease-in-out"
                :class="isCategoriesOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
                :inert="!isCategoriesOpen"
            >
                <div class="min-h-0 overflow-hidden">
                    <div class="p-4">
                        <SimpleLoader v-if="isLoadingCategories" class="mx-auto" />

                        <SelectMultiple
                            v-else
                            :initial="categories"
                            :options="categories"
                            @change="(v) => (selectedCategories = v)"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div class="flex h-[80vh] min-h-80 flex-row">
            <!-- Map -->
            <div class="relative flex-1">
                <div ref="container" class="size-full"></div>

                <div
                    class="pointer-events-none absolute inset-0 inset-shadow-sm inset-shadow-black/20"
                ></div>

                <SimpleLoader
                    v-if="isLoadingInventory"
                    :size="44"
                    class="absolute top-1/2 left-1/2 z-1 -translate-1/2 stroke-gray-700"
                />
            </div>

            <!-- Items -->
            <aside
                class="flex h-full w-full max-w-56 shrink-0 flex-col overflow-y-auto border-r border-black/10 bg-white"
            >
                <div
                    class="flex h-12 shrink-0 items-center justify-center border-b border-slate-200"
                >
                    <h2 class="px-4 text-lg">Itens</h2>
                </div>

                <ItemList
                    v-if="!isLoadingInventory"
                    ref="item-list"
                    :items="items"
                    :visible-ids="visibleIds"
                    :category-names="categoryNames"
                    @change="selectItem"
                    @show="showItem"
                    @hide="hideItem"
                />
            </aside>
        </div>
    </section>
</template>

<script lang="ts" setup>
import {
    ref,
    computed,
    watch,
    shallowRef,
    useTemplateRef,
    defineAsyncComponent,
    onMounted,
    onBeforeUnmount,
} from 'vue'
import axios from 'axios'
import { ChevronDown } from '@lucide/vue'
import SelectMultiple, { type KeyValue } from '@/components/form/SelectMultiple.vue'
import SimpleLoader from '@/components/loading/SimpleLoader.vue'
import ItemList from '@/components/inventory/modules/viewer/ItemList.vue'
import {
    InventoryCanvas,
    type InventoryRoom,
    type InventoryItem,
} from '@/components/inventory/modules/viewer'

const AsyncModalAlert = defineAsyncComponent(() => import('@/components/alerts/ModalAlert.vue'))

interface Category {
    id: number
    name: string
}

const props = defineProps<{
    employeeId: number
    roomId: string
}>()

const container = useTemplateRef('container')
const itemList = useTemplateRef('item-list')
const inventoryCanvas = shallowRef<InventoryCanvas | null>(null)

const categories = ref<Array<KeyValue>>([])
const selectedCategories = ref<Array<KeyValue>>([])
const isLoadingCategories = ref(true)
const isCategoriesOpen = ref(false)

const room = ref<InventoryRoom | null>(null)
const items = ref<Array<InventoryItem>>([])
const isLoadingInventory = ref(true)
const selectedItemId = ref<string | null>(null)
// Items shown or hidden one by one, they ignore whether their category is selected
const shownItemIds = ref<Set<string>>(new Set())
const hiddenItemIds = ref<Set<string>>(new Set())

const modalAlert = ref<{ message: string; key: number; title: string }>({
    message: '',
    key: 0,
    title: '',
})

const categoryNames = computed(() => {
    return new Map(categories.value.map(({ key, value }) => [Number(key), value]))
})

const visibleItems = computed(() => {
    const keys = new Set(selectedCategories.value.map(({ key }) => Number(key)))
    return items.value.filter((item) => {
        if (shownItemIds.value.has(item.id)) return true
        if (hiddenItemIds.value.has(item.id)) return false
        return keys.has(item.categoryId)
    })
})

const visibleIds = computed(() => new Set(visibleItems.value.map((item) => item.id)))

onMounted(() => {
    const vc = new InventoryCanvas(container.value as HTMLDivElement)
    vc.setItemClick((itemId) => itemList.value?.goTo(itemId))
    inventoryCanvas.value = vc

    fetchCategories()
    fetchInventory()
})

onBeforeUnmount(() => {
    inventoryCanvas.value?.destroy()
    inventoryCanvas.value = null
})

// Changing the categories discards the items shown or hidden one by one
watch(selectedCategories, () => {
    shownItemIds.value = new Set()
    hiddenItemIds.value = new Set()
})

watch(visibleItems, (value) => {
    inventoryCanvas.value?.setItems(value)
    inventoryCanvas.value?.highlightItem(selectedItemId.value)
})

function selectItem(itemId: string | null) {
    selectedItemId.value = itemId
    inventoryCanvas.value?.highlightItem(itemId)
}

// Undoes a previous hide or, when there is none, forces the item to be shown
function showItem(itemId: string) {
    if (hiddenItemIds.value.has(itemId)) {
        hiddenItemIds.value = withoutId(hiddenItemIds.value, itemId)
        return
    }
    shownItemIds.value = new Set(shownItemIds.value).add(itemId)
}

// Undoes a previous show or, when there is none, forces the item to be hidden
function hideItem(itemId: string) {
    if (shownItemIds.value.has(itemId)) {
        shownItemIds.value = withoutId(shownItemIds.value, itemId)
        return
    }
    hiddenItemIds.value = new Set(hiddenItemIds.value).add(itemId)
}

function withoutId(ids: Set<string>, itemId: string): Set<string> {
    const copy = new Set(ids)
    copy.delete(itemId)
    return copy
}

function setModalAlert(msg: string, title: string) {
    modalAlert.value = {
        message: msg,
        key: modalAlert.value.key + 1,
        title: title,
    }
}

function handleRequestError(error: { code?: string; status?: number }) {
    if (error.code === 'ERR_NETWORK') {
        setModalAlert(
            'Não foi possível conectar com servidor, por favor, tente novamente mais tarde.',
            'Conexão instável',
        )
        return
    }

    if (error.status === 403) {
        setModalAlert(
            'Você não possui permissão para visualizar o inventário deste cômodo.',
            'Acesso negado',
        )
        return
    }

    console.error(error)
    setModalAlert(
        'O servidor não conseguiu processar a solicitação, por favor, contacte a nossa equipe.',
        'Erro inesperado',
    )
}

function fetchCategories() {
    isLoadingCategories.value = true

    axios
        .get(`/api/employee/${props.employeeId}/inventory/categories`)
        .then((response) => {
            const data = response.data as Array<Category>
            categories.value = data.map(({ id, name }) => ({ key: id, value: name }))
        })
        .catch(handleRequestError)
        .finally(() => {
            isLoadingCategories.value = false
        })
}

function fetchInventory() {
    isLoadingInventory.value = true

    axios
        .get(`/api/employee/${props.employeeId}/room/${props.roomId}/inventory-data`)
        .then((response) => {
            const data = response.data as { room: InventoryRoom; items: Array<InventoryItem> }

            room.value = data.room
            items.value = data.items
            inventoryCanvas.value?.setRoom(data.room)
        })
        .catch(handleRequestError)
        .finally(() => {
            isLoadingInventory.value = false
        })
}
</script>
