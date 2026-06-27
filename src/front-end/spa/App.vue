<template>
    <component v-if="route.meta.renderMenu !== false" :is="menuComponent" />

    <main
        class="bg-gray-100"
        style="padding: -1px 0"
        :class="[route.meta.renderMenu !== false && menuComponent ? 'min-h-content' : 'h-dvh']"
    >
        <RouterView v-slot="{ Component, route }">
            <Transition name="content" mode="out-in">
                <component :is="Component" :key="route.path" />
            </Transition>
        </RouterView>
    </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const menuComponent = computed(() => {
    return null
})
</script>

<style lang="css">
.content-enter-active,
.content-leave-active {
    transition: opacity 0.6s;
}

.content-enter-from,
.content-leave-to {
    opacity: 0;
}
</style>
