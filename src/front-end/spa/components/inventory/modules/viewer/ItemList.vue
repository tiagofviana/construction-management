<template>
    <div class="w-full p-3">
        <ul
            ref="items-list"
            class="flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden scroll-smooth"
            :class="{ 'border border-black/10': props.items.length > 0 }"
            style="scrollbar-width: none; -ms-overflow-style: none"
        >
            <li
                v-if="props.items.length === 0"
                class="flex w-full shrink-0 snap-center items-center justify-center"
            >
                <p class="px-2 py-3 text-center font-semibold text-pretty text-red-600">
                    Nenhum item cadastrado para esse cômodo.
                </p>
            </li>

            <li
                v-for="(item, index) in props.items"
                :key="item.id"
                class="w-full shrink-0 snap-center px-4 py-2"
            >
                <div class="flex items-center gap-2 text-xs">
                    <button
                        v-if="!props.visibleIds.has(item.id)"
                        type="button"
                        title="Item oculto no mapa, clique para exibir"
                        class="cursor-pointer text-gray-500 hover:text-gray-800"
                        @click="emit('show', item.id)"
                    >
                        <EyeOff :size="18" class="stroke-red-400" />
                    </button>

                    <button
                        v-else
                        type="button"
                        title="Item exibido no mapa, clique para ocultar"
                        class="cursor-pointer text-gray-500 hover:text-gray-800"
                        @click="emit('hide', item.id)"
                    >
                        <Eye :size="18" class="stroke-blue-400" />
                    </button>

                    <span class="ml-auto">{{ index + 1 }} de {{ props.items.length }}</span>
                </div>

                <p class="mt-2 text-center font-semibold text-pretty">{{ item.name }}</p>
                <p class="mb-2 text-center text-xs text-pretty text-gray-500">
                    {{ props.categoryNames.get(item.categoryId) }}
                </p>

                <div class="mx-1 mt-2 rounded-md border border-black/5 bg-gray-50">
                    <p
                        class="border-b border-black/5 px-3 py-1 text-[10px] font-semibold tracking-wider text-gray-400 uppercase"
                    >
                        Descrição
                    </p>

                    <div
                        data-scroll-y
                        class="h-32 overflow-y-auto overscroll-contain px-3 py-2"
                        style="scrollbar-width: thin; scrollbar-color: rgb(0 0 0 / 0.2) transparent"
                    >
                        <p
                            v-if="item.description?.trim()"
                            class="text-sm/relaxed wrap-break-word whitespace-pre-line text-gray-600"
                        >
                            {{ item.description.trim() }}
                        </p>
                        <p
                            v-else
                            class="flex h-full items-center justify-center text-sm text-gray-400 italic"
                        >
                            Sem descrição.
                        </p>
                    </div>
                </div>
            </li>
        </ul>

        <div v-if="props.items.length > 0" class="mt-2 flex items-center justify-center gap-px">
            <button
                type="button"
                title="Item anterior"
                class="btn btn-gray w-1/2 rounded-none py-1"
                @click="scrollItems('left')"
            >
                <MoveLeft class="mx-auto" />
            </button>

            <button
                type="button"
                title="Próximo item"
                class="btn btn-gray w-1/2 rounded-none py-1"
                @click="scrollItems('right')"
            >
                <MoveRight class="mx-auto" />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted, onBeforeUnmount } from 'vue'
import { MoveRight, MoveLeft, Eye, EyeOff } from '@lucide/vue'
import type { IInventoryItem } from './types'

type Direction = 'left' | 'right'

const props = defineProps<{
    items: Array<IInventoryItem>
    visibleIds: Set<string>
    categoryNames: Map<number, string>
}>()

const emit = defineEmits<{
    change: [itemId: string | null]
    show: [itemId: string]
    hide: [itemId: string]
}>()

const itemsList = useTemplateRef('items-list')
let currentIndex = -1

onMounted(() => {
    itemsList.value?.addEventListener('wheel', handleWheel, { passive: false })
    itemsList.value?.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
})

onBeforeUnmount(() => {
    itemsList.value?.removeEventListener('wheel', handleWheel)
    itemsList.value?.removeEventListener('scroll', handleScroll)
    emit('change', null)
})

function handleScroll() {
    const elmt = itemsList.value as HTMLUListElement
    const width = elmt.clientWidth
    const index = width > 0 ? Math.round(elmt.scrollLeft / width) : 0

    if (index === currentIndex) return
    currentIndex = index

    emit('change', props.items[index]?.id ?? null)
}

function closeOpenDetails() {
    const elmt = itemsList.value as HTMLUListElement
    const openDetails = elmt.querySelectorAll('details[open]') as NodeListOf<HTMLDetailsElement>
    openDetails.forEach((item) => {
        item.open = false
    })
}

function scrollItems(direction: Direction) {
    const elmt = itemsList.value as HTMLUListElement
    closeOpenDetails()

    const width = elmt.clientWidth
    const left = direction === 'left' ? -width : width

    elmt.scrollBy({
        left: left,
        behavior: 'smooth',
    })
}

function handleWheel(event: WheelEvent) {
    const elmt = itemsList.value as HTMLUListElement

    // Let scrollable areas (e.g. the item description) handle vertical scroll natively
    const scrollArea = (event.target as HTMLElement).closest('[data-scroll-y]')
    if (scrollArea && scrollArea.scrollHeight > scrollArea.clientHeight) return

    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault()
        elmt.scrollBy({ left: event.deltaY, behavior: 'auto' })
    }
}

function goTo(itemId: string) {
    const elmt = itemsList.value as HTMLUListElement

    const index = props.items.findIndex((item) => item.id === itemId)
    if (index === -1) return

    const items = elmt.querySelectorAll('li') as NodeListOf<HTMLLIElement>
    const targetItem = items[index]

    if (targetItem) {
        closeOpenDetails()

        targetItem.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest',
        })
    }
}
defineExpose({ goTo })
</script>
