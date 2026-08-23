<template>
    <section>
        <div
            class="border-t border-black/10 p-1 px-4 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
            <label class="text-xs">
                <span class="font-bold">Largura</span>
                <span class="font-semibold text-purple-600"> em metros </span>
            </label>

            <div class="mx-auto flex items-center justify-between">
                <button
                    type="button"
                    :disabled="floorSize.width <= props.min"
                    class="shrink-0 rounded-full p-2 transition-all"
                    :class="[
                        {
                            'cursor-pointer text-gray-600 hover:bg-gray-200 hover:text-gray-900 active:bg-gray-300':
                                floorSize.width > props.min,
                        },
                        {
                            'cursor-default text-gray-400': floorSize.width <= props.min,
                        },
                    ]"
                    @mousedown="startHold(adjustWidth, 'left')"
                    @mouseup="stopHold()"
                    @mouseleave="stopHold()"
                    @touchstart.prevent="startHold(adjustWidth, 'left')"
                    @touchend="stopHold()"
                >
                    <ChevronLeft class="size-4" />
                </button>

                <span class="text-center text-sm text-gray-900">{{ floorSize.width / 10 }}</span>

                <button
                    type="button"
                    :disabled="floorSize.width >= props.max"
                    class="shrink-0 rounded-full p-2 transition-all"
                    :class="[
                        {
                            'cursor-pointer text-gray-600 hover:bg-gray-200 hover:text-gray-900 active:bg-gray-300':
                                floorSize.width < props.max,
                        },
                        {
                            'cursor-default text-gray-400': floorSize.width >= props.max,
                        },
                    ]"
                    @mousedown="startHold(adjustWidth, 'right')"
                    @mouseup="stopHold()"
                    @mouseleave="stopHold()"
                    @touchstart.prevent="startHold(adjustWidth, 'right')"
                    @touchend="stopHold()"
                >
                    <ChevronRight class="size-4" />
                </button>
            </div>
        </div>

        <div
            class="border-t border-black/10 px-4 py-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
            <label class="text-xs">
                <span class="font-bold">Altura</span>
                <span class="font-semibold text-purple-600"> em metros </span>
            </label>

            <div class="flex items-center justify-between">
                <button
                    type="button"
                    :disabled="floorSize.height <= props.min"
                    class="shrink-0 rounded-full p-2 transition-all"
                    :class="[
                        {
                            'cursor-pointer text-gray-600 hover:bg-gray-200 hover:text-gray-900 active:bg-gray-300':
                                floorSize.height > props.min,
                        },
                        {
                            'cursor-default text-gray-400': floorSize.height <= props.min,
                        },
                    ]"
                    @mousedown="startHold(adjustHeight, 'left')"
                    @mouseup="stopHold()"
                    @mouseleave="stopHold()"
                    @touchstart.prevent="startHold(adjustHeight, 'left')"
                    @touchend="stopHold()"
                >
                    <ChevronLeft class="size-4" />
                </button>

                <span class="text-center text-sm text-gray-900">{{ floorSize.height / 10 }}</span>

                <button
                    type="button"
                    :disabled="floorSize.height >= props.max"
                    class="shrink-0 rounded-full p-2 transition-all"
                    :class="[
                        {
                            'cursor-pointer text-gray-600 hover:bg-gray-200 hover:text-gray-900 active:bg-gray-300':
                                floorSize.height < props.max,
                        },
                        {
                            'cursor-default text-gray-400': floorSize.height >= props.max,
                        },
                    ]"
                    @mousedown="startHold(adjustHeight, 'right')"
                    @mouseup="stopHold()"
                    @mouseleave="stopHold()"
                    @touchstart.prevent="startHold(adjustHeight, 'right')"
                    @touchend="stopHold()"
                >
                    <ChevronRight class="size-4" />
                </button>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch, PropType } from 'vue'
import { ChevronRight, ChevronLeft } from '@lucide/vue'

type Direction = 'left' | 'right'
export interface Size {
    width: number
    height: number
}

const props = defineProps({
    max: {
        type: Number,
        required: true,
    },
    min: {
        type: Number,
        required: true,
    },
    step: {
        type: Number,
        required: true,
    },
    initialSize: {
        type: Object as PropType<Size>,
        required: false,
    },
})
onUnmounted(() => {
    stopHold()
})

const emit = defineEmits<{
    change: [value: Size]
}>()

const floorSize = ref({ width: 0, height: 200 })

watch(
    () => props.initialSize,
    (size) => {
        floorSize.value = size ? { ...size } : { width: props.min, height: props.min }
    },
    { immediate: true },
)

const HOLD_DELAY = 400
const HOLD_INTERVAL = 40

let holdTimeoutId: ReturnType<typeof setTimeout> | null = null
let holdIntervalId: ReturnType<typeof setInterval> | null = null
let isHolding = false

function adjustWidth(direction: Direction) {
    const amount = direction === 'right' ? props.step : -props.step
    floorSize.value.width = Math.min(Math.max(floorSize.value.width + amount, props.min), props.max)
}

function adjustHeight(direction: Direction) {
    const amount = direction === 'right' ? props.step : -props.step
    floorSize.value.height = Math.min(
        Math.max(floorSize.value.height + amount, props.min),
        props.max,
    )
}

function startHold(adjust: (direction: Direction) => void, direction: Direction) {
    stopHold()
    isHolding = true
    adjust(direction)
    holdTimeoutId = setTimeout(() => {
        holdIntervalId = setInterval(() => adjust(direction), HOLD_INTERVAL)
    }, HOLD_DELAY)
}

function stopHold() {
    if (holdTimeoutId) {
        clearTimeout(holdTimeoutId)
        holdTimeoutId = null
    }
    if (holdIntervalId) {
        clearInterval(holdIntervalId)
        holdIntervalId = null
    }
    if (isHolding) {
        isHolding = false
        emit('change', { ...floorSize.value })
    }
}
</script>
