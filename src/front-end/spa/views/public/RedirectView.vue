<template>
    <div
        v-if="animate === '1'"
        class="flex h-dvh w-full flex-col items-center justify-center bg-blue-500"
    >
        <svg
            class="w-11/12"
            style="max-width: 200px"
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            ref="svg-house"
        >
            <path d="M64 96h896v928H64z" fill="#EAEAEA" />

            <path d="M224 704h192v320H224z" fill="#544d43" />

            <g>
                <path
                    d="M608 640h192v224h-192zM608 160h192v224h-192zM224 160h192v224H224z"
                    fill="#469FCC"
                />

                <path d="M608 640h192v32h-192zM608 160h192v32h-192zM224 160h192v32H224z" />
            </g>

            <g fill="rgba(0,0,0,0.623)">
                <path
                    d="M1024 64a32 32 0 0 1-32 32H32a32 32 0 0 1-32-32V32a32 32 0 0 1 32-32h960a32 32 0 0 1 32 32v32zM1024 544a32 32 0 0 1-32 32H32a32 32 0 0 1-32-32v-32a32 32 0 0 1 32-32h960a32 32 0 0 1 32 32v32z"
                    fill="#EF4D4D"
                />

                <path class="house-shadow" d="M64 96h896v32H64z" />
                <path class="house-shadow" d="M64 576h896v32H64z" />
            </g>
        </svg>

        <div :class="{ invisible: !isLoading }" class="loader mt-4"></div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, useTemplateRef, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { gsap } from 'gsap'
import { accountStore } from '@/stores/account'

const router = useRouter()
const svgHouse = useTemplateRef<SVGElement>('svg-house')
const animate = useRoute().params.animate
const account = accountStore()
const isLoading = ref(false)
const info = account.getInfo()

onMounted(async () => {
    if (animate !== '1') {
        redirectPage()
        return
    }

    const tl = gsap.timeline({
        delay: 0.5,
        onComplete: () => {
            isLoading.value = true

            setTimeout(() => {
                redirectPage()
            }, 1000)
        },
    })

    const housePaths = svgHouse.value?.querySelectorAll('path:not(.house-shadow)') as NodeList
    const shadowPaths = svgHouse.value?.querySelectorAll('path.house-shadow') as NodeList

    gsap.set(housePaths, {
        stroke: '#1e293b',
        strokeWidth: 4,
        fillOpacity: 0,
        strokeDasharray: (index, target: SVGPathElement) => target.getTotalLength(),
        strokeDashoffset: (index, target: SVGPathElement) => target.getTotalLength(),
    })

    tl.to(housePaths, {
        strokeDashoffset: 0,
        duration: 1.4,
        stagger: 0.2,
        ease: 'none',
    })

    tl.to(housePaths, {
        fillOpacity: 1,
        strokeWidth: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power4.inOut',
    })

    tl.from(
        shadowPaths,
        {
            opacity: 0,
            duration: 0.6,
            ease: 'power4.inOut',
        },
        '<',
    )
})

async function redirectPage() {
    info.then((data) => {
        if (data === null) {
            router.replace({ name: 'public.home' })
            return
        }
        if (data.isStaff === true) {
            window.location.href = '/z/'
            return
        }
        // router.replace({ name: 'employee.establishments' })
    })
}
</script>

<style scoped>
/* HTML: <div class="loader"></div> */
.loader {
    width: 60px;
    aspect-ratio: 4;
    background: radial-gradient(circle closest-side, #fff 90%, #0000) 0 / calc(100% / 3) 100% space;
    clip-path: inset(0 100% 0 0);
    animation: l1 1s steps(4) infinite;
}
@keyframes l1 {
    to {
        clip-path: inset(0 -34% 0 0);
    }
}
</style>
