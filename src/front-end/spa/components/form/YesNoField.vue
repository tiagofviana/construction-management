<template>
    <div>
        <button
            type="button"
            @click="changeChoice()"
            class="flex h-6 w-24 cursor-pointer flex-row overflow-hidden rounded"
            :class="[{ 'bg-green-700': choice }, { 'bg-red-600': !choice }]"
        >
            <div class="flex shrink-0 items-center justify-center bg-slate-800 px-1.5">
                <Check v-if="choice" :size="16" :stroke-width="5" class="stroke-green-400" />
                <X v-else :size="16" :stroke-width="5" class="stroke-red-400" />
            </div>

            <p class="flex flex-1 items-center justify-center font-medium text-white">
                <template v-if="choice"> Sim </template>
                <template v-else> Não </template>
            </p>
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Check, X } from '@lucide/vue'

const props = defineProps({
    initial: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits<{
    change: [value: boolean]
}>()

const choice = ref(props.initial)

onMounted(() => {
    emit('change', choice.value)
})

function changeChoice() {
    choice.value = !choice.value
    emit('change', choice.value)
}
</script>
