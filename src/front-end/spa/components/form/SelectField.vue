<template>
    <div class="rounded-sm">
        <div ref="select" :aria-label="props.label" class="relative">
            <span
                v-if="props.label"
                class="px-1 text-xs leading-none tracking-tight text-balance"
                :class="[isDropdownHidden ? 'text-gray-600' : 'font-bold text-blue-400']"
            >
                {{ props.label }}
            </span>

            <button
                type="button"
                @click="changeDropdownHiddenState()"
                class="overflow flex w-full cursor-pointer flex-row items-center justify-between rounded-sm border bg-white px-2 py-1.5"
                :class="isDropdownHidden ? 'border-gray-400/60' : 'border-blue-400'"
            >
                <span v-if="selectedOption" class="line-clamp-1 text-black">
                    {{ selectedOption.name }}
                </span>
                <span v-else class="line-clamp-1 text-gray-500">
                    {{ props.placeholder }}
                </span>

                <ChevronUp
                    class="ml-2 min-w-6 stroke-gray-900 transition-transform duration-150"
                    :class="{ 'rotate-180': !isDropdownHidden }"
                />
            </button>

            <ul
                class="absolute top-full left-0 z-100 mt-1.5 w-full overflow-hidden rounded border border-black/20 bg-white shadow-lg shadow-black/20"
                :class="{ hidden: isDropdownHidden }"
            >
                <li
                    v-if="props.options.length === 0"
                    class="cursor-not-allowed p-2 text-center text-gray-400"
                >
                    -
                </li>

                <li v-for="(item, index) in props.options" :key="index">
                    <label
                        class="flex cursor-pointer flex-row items-start justify-start p-2 hover:bg-gray-200"
                        :class="[
                            { 'bg-gray-200': picked === item.value },
                            { 'border-t border-gray-200': index !== 0 },
                        ]"
                    >
                        <input
                            type="radio"
                            :name="props.inputName"
                            :value="item.value"
                            v-model="picked"
                            class="hidden"
                            required
                        />

                        <div class="flex flex-row items-center">
                            <component
                                v-if="item.icon"
                                :is="item.icon.component"
                                :class="item.icon.class"
                                class="w-6 stroke-gray-400"
                            />
                            <span class="mx-2 line-clamp-1 text-black">
                                {{ item.name }}
                            </span>
                        </div>

                        <Check v-if="picked === item.value" class="ml-auto stroke-green-800" />
                    </label>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { type LucideIcon, ChevronUp, Check } from '@lucide/vue'

export interface Option {
    icon?: { component: LucideIcon; class?: string }
    name: string
    value: string
}

const props = defineProps<{
    label?: string
    inputName: string
    placeholder?: string
    options: Array<Option>
}>()

const isDropdownHidden = ref(true)
const picked = defineModel<string>()
const select = useTemplateRef<HTMLElement>('select')
const selectedOption = computed(() => props.options.find((option) => option.value === picked.value))
const emit = defineEmits<{
    (e: 'value', value: string): void
}>()

onMounted(() => {
    document.addEventListener('mousedown', onDocumenteMouseDown)
})

onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onDocumenteMouseDown)
})

watch(picked, (value) => {
    if (value) {
        emit('value', value)
    }
    isDropdownHidden.value = true
})

function changeDropdownHiddenState() {
    isDropdownHidden.value = !isDropdownHidden.value
}

function onDocumenteMouseDown(event: MouseEvent) {
    if (isDropdownHidden.value) return

    const target = event.target as HTMLElement
    if (!select.value?.contains(target)) {
        isDropdownHidden.value = true
    }
}
</script>

<style scoped>
form .aligned ul {
    margin-left: 0 !important;
    padding-left: 0 !important;
}
</style>
