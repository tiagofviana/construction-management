<template>
    <LoaderCircle
        class="table animate-spin drop-shadow-sm drop-shadow-black/20"
        :stroke-width="props.strokeWidth"
        :size="props.size"
    />
</template>

<script lang="ts" setup>
import { LoaderCircle } from '@lucide/vue'

const props = defineProps({
    size: {
        type: Number,
        required: false,
        default: 26,
    },
    strokeWidth: {
        type: Number,
        required: false,
        default: 3,
    },
})
</script>
