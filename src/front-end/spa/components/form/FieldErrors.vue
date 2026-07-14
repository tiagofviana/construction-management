<template>
    <ul ref="list">
        <li
            v-for="(item, index) in messages"
            :key="index"
            class="table pl-1 text-sm text-red-600 italic"
        >
            {{ item }}
        </li>
    </ul>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'
import gsap from 'gsap'

defineProps<{ messages: Array<string> }>()

const list = useTemplateRef<HTMLElement>('list')

onMounted(() => {
    gsap.fromTo(
        list.value,
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
