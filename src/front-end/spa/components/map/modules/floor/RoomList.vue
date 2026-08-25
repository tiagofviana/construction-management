<template>
    <div class="w-full max-w-56 p-3">
        <AsyncRoomEditor
            v-if="roomEditor.key > 0"
            :key="roomEditor.key"
            :room="roomEditor.room"
            :is-update="true"
            @saved="emit('roomChanged')"
        />

        <ul
            ref="rooms-list"
            class="flex flex-1 snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden scroll-smooth"
            :class="{ 'border border-black/10': props.rooms.length > 0 }"
            style="scrollbar-width: none; -ms-overflow-style: none"
        >
            <li
                v-if="props.rooms.length === 0"
                class="flex w-full shrink-0 snap-center items-center justify-center"
            >
                <p class="px-2 py-3 text-center font-semibold text-pretty text-red-600">
                    Ainda não foram criado cômodos para esse andar.
                </p>
            </li>

            <li
                v-for="(item, index) in rooms"
                :key="index"
                class="w-full shrink-0 snap-center px-4 py-2"
            >
                <div class="ml-auto text-xs">{{ index + 1 }} de {{ props.rooms.length }}</div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    :viewBox="item.svgViewBox"
                    class="aspect-square w-full"
                >
                    <path
                        stroke-width="2"
                        stroke="rgba(0,0,0,.4)"
                        :fill="item.color"
                        :d="item.svgPath"
                    />
                    <text
                        :x="roomsCentroid.get(item.id)!.x"
                        :y="roomsCentroid.get(item.id)!.y"
                        text-anchor="middle"
                        font-family="Inter, Arial, sans-serif"
                        font-weight="600"
                        font-size="15"
                        fill="rgba(0,0,0,.8)"
                        dominant-baseline="middle"
                        stroke="none"
                    >
                        <tspan :x="roomsCentroid.get(item.id)!.x" dy="-0.6em">
                            {{ item.name }}
                        </tspan>
                        <tspan :x="roomsCentroid.get(item.id)!.x" dy="1.2em">
                            {{ item.area }} m²
                        </tspan>
                    </text>
                </svg>

                <details>
                    <summary>
                        <span class="btn btn-white w-full"> Descrição</span>
                    </summary>

                    <p
                        class="mx-1 mt-2 border border-black/5 bg-gray-100 p-2 text-center text-sm text-pretty text-gray-600"
                    >
                        {{ item.description }}
                    </p>
                </details>

                <button type="button" class="btn btn-gray mt-2 w-full" @click="setRoomEditor(item)">
                    Editar
                </button>

                <p
                    class="mt-2 flex flex-row items-center justify-center gap-2 text-sm text-gray-500"
                >
                    <span class="whitespace-nowrap"> x: {{ item.positionX }} </span>
                    <span class="whitespace-nowrap"> y: {{ item.positionY }} </span>
                </p>

                <p class="text-center text-sm whitespace-nowrap text-gray-500">
                    Rotação: {{ item.rotation }}
                </p>
            </li>
        </ul>

        <div v-if="props.rooms.length > 0" class="mt-2 flex items-center justify-center gap-px">
            <button
                type="button"
                title="Cômodo anterior"
                class="btn btn-gray w-1/2 rounded-none py-1"
                @click="scrollRooms('left')"
            >
                <MoveLeft class="mx-auto" />
            </button>

            <button
                type="button"
                title="Próximo cômodo"
                class="btn btn-gray w-1/2 rounded-none py-1"
                @click="scrollRooms('right')"
            >
                <MoveRight class="mx-auto" />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    ref,
    defineAsyncComponent,
    computed,
    useTemplateRef,
    onMounted,
    onBeforeUnmount,
} from 'vue'
import { MoveRight, MoveLeft } from '@lucide/vue'
import { computeCentroid } from '../utils'
import { Room, Point } from '../types'

const AsyncRoomEditor = defineAsyncComponent(() => import('@/components/map/RoomEditor.vue'))

type Direction = 'left' | 'right'

const emit = defineEmits<{
    roomChanged: []
    editingRoom: []
}>()

const props = defineProps({
    rooms: {
        type: Array<Room>,
        required: true,
    },
})

const roomsCentroid = computed(() => {
    const centroids: Map<string, Point> = new Map()
    props.rooms.forEach((item) => {
        centroids.set(item.id, computeCentroid(item.svgPath))
    })
    return centroids
})

const roomsList = useTemplateRef('rooms-list')
const roomEditor = ref<{ key: number; room: Room | undefined }>({
    key: 0,
    room: undefined,
})

onMounted(() => {
    roomsList.value?.addEventListener('wheel', handleWheel, { passive: false })
})

onBeforeUnmount(() => {
    roomsList.value?.removeEventListener('wheel', handleWheel)
})

function setRoomEditor(room: Room) {
    roomEditor.value = {
        key: roomEditor.value.key + 1,
        room: room,
    }
    emit('editingRoom')
}

function scrollRooms(direction: Direction) {
    const elmt = roomsList.value as HTMLUListElement
    const openDetails = elmt.querySelectorAll('details[open]') as NodeListOf<HTMLDetailsElement>

    openDetails.forEach((item) => {
        item.open = false
    })

    const width = elmt.clientWidth
    const left = direction === 'left' ? -width : width

    elmt.scrollBy({
        left: left,
        behavior: 'smooth',
    })
}

function handleWheel(event: WheelEvent) {
    const elmt = roomsList.value as HTMLUListElement
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault()
        elmt.scrollBy({ left: event.deltaY, behavior: 'auto' })
    }
}
</script>
