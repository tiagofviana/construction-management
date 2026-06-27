<template>
    <p ref="paragraph" class="table pl-1 text-sm text-red-600 italic">
        {{ message }}
    </p>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'
import gsap from 'gsap'

defineProps<{ message: string }>()

const paragraph = useTemplateRef<HTMLElement>('paragraph')

onMounted(() => {
    gsap.fromTo(
        paragraph.value,
        {
            opacity: 0,
        },
        {
            opacity: 1,
            duration: 0.5,
        },
    )
})
</script>
