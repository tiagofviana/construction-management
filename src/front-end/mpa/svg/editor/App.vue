<template>
    <div class="py-4">
        <textarea
            v-model="data"
            class="hidden w-full"
            :name="props.name"
            :is-required="props.isRequired"
        ></textarea>

        <SVGVisualizer :svg="data" />

        <SVGEditor :initial-data="props.initialData" @compressed-data="updateTextarea" />
    </div>
</template>

<script lang="ts" setup>
import { onBeforeMount } from 'vue'
import { ref } from 'vue'
import SVGEditor from './modules/SVGEditor.vue'
import SVGVisualizer from './modules/SVGVisualizer.vue'

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    isRequired: {
        type: Boolean,
        required: true,
    },
    initialData: {
        type: String,
        required: true,
    },
})

const data = ref('')

onBeforeMount(() => {
    data.value = props.initialData
})

function updateTextarea(newValue: string) {
    data.value = newValue
}
</script>

<style>
[role='svg-editor'] {
    flex: 1;
    min-width: 0;
    max-width: 100%;
}
</style>
