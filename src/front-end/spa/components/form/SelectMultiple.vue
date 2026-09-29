<template>
    <div class="flex h-full flex-col gap-3 md:flex-row">
        <!-- Available box -->
        <div class="flex flex-1 flex-col rounded-md border border-black/10 bg-white">
            <div class="border-b border-black/10 p-3">
                <p class="pb-2 text-sm font-bold text-black/70">
                    Disponíveis
                    <span class="font-normal text-black/40">({{ filteredAvailable.length }})</span>
                </p>

                <input
                    v-model="searchAvailable"
                    type="text"
                    placeholder="Filtrar..."
                    class="w-full rounded-md border border-black/10 px-3 py-1.5 text-sm"
                />
            </div>

            <ul class="h-72 overflow-y-auto p-2">
                <li
                    v-if="filteredAvailable.length === 0"
                    class="p-3 text-center text-sm text-black/40"
                >
                    Nenhum item encontrado.
                </li>

                <li
                    v-for="item in filteredAvailable"
                    :key="item.key"
                    class="cursor-pointer rounded-md px-3 py-1.5 text-sm select-none"
                    :class="
                        highlightedAvailable.has(item.key)
                            ? 'bg-blue-100 text-blue-900'
                            : 'hover:bg-black/5'
                    "
                    @click="toggleHighlight(highlightedAvailable, item.key)"
                    @dblclick="moveToChosen(item)"
                >
                    {{ item.value }}
                </li>
            </ul>
        </div>

        <!-- Move buttons -->
        <div class="flex flex-row items-center justify-center gap-2 md:flex-col md:justify-center">
            <button
                type="button"
                title="Escolher todos"
                class="cursor-pointer rounded border border-transparent p-0.5 transition-all hover:border-black/10 hover:bg-gray-200"
                :disabled="filteredAvailable.length === 0"
                @click="chooseAll"
            >
                <ChevronsRight class="size-4 rotate-90 md:rotate-0" />
            </button>

            <button
                type="button"
                title="Escolher selecionados"
                class="cursor-pointer rounded border border-transparent p-0.5 transition-all hover:border-black/10 hover:bg-gray-200"
                :disabled="highlightedAvailable.size === 0"
                @click="chooseSelected"
            >
                <ChevronRight class="size-4 rotate-90 md:rotate-0" />
            </button>

            <button
                type="button"
                title="Remover selecionados"
                class="cursor-pointer rounded border border-transparent p-0.5 transition-all hover:border-black/10 hover:bg-gray-200"
                :disabled="highlightedChosen.size === 0"
                @click="removeSelected"
            >
                <ChevronLeft class="size-4 rotate-90 md:rotate-0" />
            </button>

            <button
                type="button"
                title="Remover todos"
                class="cursor-pointer rounded border border-transparent p-0.5 transition-all hover:border-black/10 hover:bg-gray-200"
                :disabled="filteredChosen.length === 0"
                @click="removeAll"
            >
                <ChevronsLeft class="size-4 rotate-90 md:rotate-0" />
            </button>
        </div>

        <!-- Chosen box -->
        <div class="flex flex-1 flex-col rounded-md border border-black/10 bg-white">
            <div class="border-b border-black/10 p-3">
                <p class="pb-2 text-sm font-bold text-black/70">
                    Escolhidos
                    <span class="font-normal text-black/40">({{ filteredChosen.length }})</span>
                </p>

                <input
                    v-model="searchChosen"
                    type="text"
                    placeholder="Filtrar..."
                    class="w-full rounded-md border border-black/10 px-3 py-1.5 text-sm"
                />
            </div>

            <ul class="h-72 overflow-y-auto p-2">
                <li
                    v-if="filteredChosen.length === 0"
                    class="p-3 text-center text-sm text-black/40"
                >
                    Nenhum item escolhido.
                </li>

                <li
                    v-for="item in filteredChosen"
                    :key="item.key"
                    class="cursor-pointer rounded-md px-3 py-1.5 text-sm select-none"
                    :class="
                        highlightedChosen.has(item.key)
                            ? 'bg-blue-100 text-blue-900'
                            : 'hover:bg-black/5'
                    "
                    @click="toggleHighlight(highlightedChosen, item.key)"
                    @dblclick="moveToAvailable(item)"
                >
                    {{ item.value }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from '@lucide/vue'

export interface KeyValue {
    key: string | number
    value: string
}

const props = defineProps<{
    options: KeyValue[]
    initial: KeyValue[]
}>()

const emit = defineEmits<{
    change: [value: KeyValue[]]
}>()

const chosen = ref<KeyValue[]>([...props.initial])
const searchAvailable = ref('')
const searchChosen = ref('')
const highlightedAvailable = ref<Set<string | number>>(new Set())
const highlightedChosen = ref<Set<string | number>>(new Set())

const available = computed<KeyValue[]>(() =>
    props.options.filter((option) => !chosen.value.some((item) => item.key === option.key)),
)

const filteredAvailable = computed<KeyValue[]>(() => {
    const term = searchAvailable.value.trim().toLowerCase()
    if (!term) return available.value
    return available.value.filter((item) => item.value.toLowerCase().includes(term))
})

const filteredChosen = computed<KeyValue[]>(() => {
    const term = searchChosen.value.trim().toLowerCase()
    if (!term) return chosen.value
    return chosen.value.filter((item) => item.value.toLowerCase().includes(term))
})

onMounted(() => {
    emit('change', chosen.value)
})

function toggleHighlight(set: Set<string | number>, key: string | number) {
    if (set.has(key)) {
        set.delete(key)
    } else {
        set.add(key)
    }
}

function moveToChosen(item: KeyValue) {
    chosen.value.push(item)
    highlightedAvailable.value.delete(item.key)
}

function moveToAvailable(item: KeyValue) {
    chosen.value = chosen.value.filter((chosenItem) => chosenItem.key !== item.key)
    highlightedChosen.value.delete(item.key)
}

function chooseSelected() {
    chosen.value.push(
        ...filteredAvailable.value.filter((item) => highlightedAvailable.value.has(item.key)),
    )
    highlightedAvailable.value = new Set()
}

function chooseAll() {
    chosen.value.push(...filteredAvailable.value)
    highlightedAvailable.value = new Set()
}

function removeSelected() {
    const keysToRemove = new Set(highlightedChosen.value)
    chosen.value = chosen.value.filter((item) => !keysToRemove.has(item.key))
    highlightedChosen.value = new Set()
}

function removeAll() {
    const keysToRemove = new Set(filteredChosen.value.map((item) => item.key))
    chosen.value = chosen.value.filter((item) => !keysToRemove.has(item.key))
    highlightedChosen.value = new Set()
}

watch(
    chosen,
    () => {
        emit('change', chosen.value)
    },
    { deep: true },
)
</script>
