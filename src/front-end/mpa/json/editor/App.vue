<template>
    <div class="py-4">
        <textarea
            v-model="data"
            class="hidden w-full"
            :name="props.name"
            :is-required="props.isRequired"
        ></textarea>

        <JsonEditor :initial-data="props.initialData" @compressed-data="updateTextarea" />
    </div>
</template>

<script lang="ts" setup>
import { onBeforeMount } from 'vue'
import { ref } from 'vue'
import JsonEditor from './modules/JsonEditor.vue'

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
[role='json-editor'] {
    flex: 1;
    min-width: 0;
    max-width: 100%;
}
</style>
