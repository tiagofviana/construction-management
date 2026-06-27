<template>
    <div class="relative">
        <LoaderCircle
            v-if="isLoading"
            class="absolute top-1/2 left-1/2 -translate-1/2 animate-spin stroke-inherit"
            :stroke-width="3"
            :size="26"
        />

        <span v-if="text" class="text-center text-inherit" :class="{ invisible: isLoading }">
            {{ text }}
        </span>
    </div>
</template>

<script lang="ts" setup>
import { LoaderCircle } from '@lucide/vue'

defineProps<{
    text?: string
    isLoading: boolean
}>()
</script>
