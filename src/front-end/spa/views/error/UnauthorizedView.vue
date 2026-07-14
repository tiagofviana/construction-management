<template>
    <div
        class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden py-8"
        style="background: #0a0a0f"
    >
        <div
            class="absolute inset-0 z-0"
            style="
                opacity: 0.04;
                background-image:
                    linear-gradient(#fff 1px, transparent 1px),
                    linear-gradient(90deg, #fff 1px, transparent 1px);
                background-size: 60px 60px;
            "
        ></div>

        <div class="relative z-10 w-11/12 max-w-2xl">
            <h1
                class="text-center leading-none font-black tracking-tighter text-white select-none"
                style="font-family: 'Inter', sans-serif; font-size: clamp(120px, 20vw, 220px)"
            >
                4<span class="text-amber-500">0</span>1
            </h1>

            <div class="mx-auto table">
                <p
                    class="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5"
                    style="background: #171724"
                >
                    <span class="size-1.5 animate-pulse rounded-full bg-amber-400"></span>
                    <span class="text-xs font-medium tracking-widest text-white">
                        Acesso não autorizado
                    </span>
                </p>
            </div>

            <p
                class="mx-auto mb-10 max-w-xs text-center text-sm leading-relaxed text-white opacity-50"
                style="font-family: 'Inter', sans-serif"
            >
                Você não tem permissão para acessar um recurso dessa página. por razões de segunraça
                descontinuamos a sua sessão e, por isso, será necessário realizar o login novamente.
            </p>

            <RouterLink
                :to="{ name: 'public.login' }"
                class="btn mx-auto px-5 py-2.5 text-sm font-medium text-white no-underline"
                style="
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    box-shadow:
                        0 0 0 1px rgba(245, 158, 11, 0.4),
                        0 4px 24px rgba(245, 158, 11, 0.25);
                "
            >
                Ir para o login
            </RouterLink>
        </div>

        <div class="absolute right-0 bottom-8 left-0 flex items-center justify-center">
            <span class="text-center font-mono text-sm tracking-widest text-white opacity-20">
                ERROR_CODE: 0x401
                <span class="mx-auto table">UNAUTHORIZED</span>
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { resetAll } from '@/plugins/piniaReset'
onBeforeMount(() => {
    resetAll()
})
</script>
