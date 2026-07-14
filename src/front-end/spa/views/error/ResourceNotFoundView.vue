<template>
    <main class="flex min-h-screen items-center justify-center bg-slate-50 py-6">
        <div
            class="w-11/12 max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl"
        >
            <h1 class="mx-auto mt-6 text-4xl font-bold tracking-tight text-slate-900">
                Recurso não encontrado
            </h1>

            <p class="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600">
                A página que você tentou acessar tentou buscar um endereço que não existe ou foi
                removido.
            </p>

            <div
                v-if="query"
                class="mt-6 rounded-2xl border border-slate-200 bg-slate-100 p-4 text-left"
            >
                <span class="mb-2 block text-sm font-medium text-slate-500">
                    Endereço pesquisado
                </span>

                <code class="block font-mono text-sm break-all text-slate-800">
                    {{ query }}
                </code>
            </div>

            <div class="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                <RouterLink :to="{ name: 'public.redirect' }" class="btn btn-black">
                    Voltar para o início
                </RouterLink>

                <button
                    v-if="checkGoBackExists()"
                    type="button"
                    @click="goBack()"
                    class="btn btn-white"
                >
                    Voltar página anterior
                </button>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
defineProps<{
    query?: string
}>()

function checkGoBackExists(): boolean {
    return window.history.length > 2
}

function goBack() {
    window.history.go(-2)
}
</script>
