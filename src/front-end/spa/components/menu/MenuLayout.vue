<template>
    <header
        aria-label="Menu principal"
        class="menu-height sticky top-0 right-0 z-60 w-full border-b border-black/5 bg-white shadow shadow-black/20 transition-all duration-600 ease-in-out hover:shadow-md"
    >
        <slot name="bar"></slot>

        <button
            @click="toggle"
            type="button"
            class="absolute top-0 right-0 z-60 table h-full cursor-pointer"
        >
            <svg
                viewBox="0 0 32 32"
                class="h-12 drop-shadow-sm drop-shadow-black/20 transition-transform duration-700"
                :style="{
                    transform: isOpen ? 'rotate(-45deg)' : 'rotate(0deg)',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                }"
            >
                <g
                    :stroke="isOpen ? 'white' : '#45556c'"
                    fill="none"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    style="transition: stroke 0.5s ease-in-out"
                >
                    <path
                        d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
                        :style="{
                            strokeDasharray: isOpen ? '20 300' : '12 63',
                            strokeDashoffset: isOpen ? '-32.42' : '0',
                            transition:
                                'stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                        }"
                    />

                    <path d="M7 16 27 16" />
                </g>
            </svg>
        </button>

        <div
            class="fixed top-0 right-0 flex h-dvh flex-row shadow-xl shadow-black/20 transition-all duration-0"
            :class="[isOpen ? 'sm:w-full' : 'delay-600 sm:w-0']"
        >
            <div
                ref="container"
                @click="handleContainer"
                class="hidden flex-1 flex-col items-center justify-center overflow-hidden bg-black/20 backdrop-blur-xs transition-all delay-200 duration-1000 sm:flex"
                :class="[isOpen ? 'opacity-100' : 'opacity-0']"
            ></div>

            <div
                class="ml-auto flex h-full flex-col overflow-x-hidden overflow-y-visible bg-slate-600 pt-12 shadow-md shadow-black/20 transition-[width] duration-600"
                :class="[isOpen ? 'w-dvw sm:w-64' : 'w-0']"
            >
                <nav class="flex-1 space-y-1">
                    <slot name="nav"></slot>
                </nav>
            </div>
        </div>
    </header>
</template>

<script lang="ts" setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { ref, useTemplateRef } from 'vue'

const route = useRoute()
const isOpen = ref<boolean>(false)
const container = useTemplateRef<HTMLElement>('container')

watch(
    () => route.path,
    () => (isOpen.value = false),
)

function toggle() {
    isOpen.value = !isOpen.value
}

function handleContainer() {
    if (isOpen.value) isOpen.value = false
}
</script>
