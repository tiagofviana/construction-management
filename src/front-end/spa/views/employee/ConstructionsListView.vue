<template>
    <section class="mx-auto w-11/12 max-w-5xl">
        <AsyncModalAlert
            v-if="alertModal.message"
            type="error"
            :title="alertModal.title"
            :message="alertModal.message"
            ok-label="Confirmar"
            :has-cancel-button="false"
            :key="alertModal.key"
        />

        <SimpleLoader
            v-if="isLoading"
            class="absolute top-1/2 left-1/2 -translate-1/2 stroke-orange-400"
        />

        <p
            v-if="!isLoading && constructions.length === 0"
            class="absolute top-1/2 left-1/2 w-11/12 -translate-1/2 text-center text-gray-500"
        >
            Nenhuma projeto encontrado, fale com a equipe de suporte.
        </p>

        <ul class="min-h-content flex flex-row flex-wrap items-center justify-center gap-4">
            <li v-for="construction in constructions" :key="construction.employeeId">
                <RouterLink
                    :to="{
                        name: 'employee.contruction-dashboard',
                        params: { employeeId: construction.employeeId },
                    }"
                    class="group table max-w-xs overflow-hidden rounded-md bg-white no-underline shadow shadow-black/20"
                >
                    <div
                        class="relative flex aspect-video w-full items-center justify-center overflow-hidden border-b border-black/10 bg-gray-50"
                    >
                        <img
                            v-if="construction.photoUrl"
                            :src="construction.photoUrl"
                            :alt="construction.name"
                            class="size-full object-cover object-center transition-all duration-200 group-hover:scale-105"
                        />
                        <ImageOff v-else :size="56" class="stroke-gray-300" />

                        <div
                            class="absolute top-2 right-2 rounded-md border border-white/20 bg-orange-500 p-1 opacity-0 transition-all duration-400 group-hover:opacity-100"
                        >
                            <ArrowUpRight
                                :stroke-width="1.8"
                                :size="20"
                                class="stroke-white drop-shadow drop-shadow-black/20"
                            />
                        </div>
                    </div>

                    <div class="p-5">
                        <h2 class="line-clamp-1 text-xl font-medium text-gray-900">
                            {{ construction.name }}
                        </h2>

                        <p
                            class="mt-1.5 line-clamp-3 h-15 text-justify text-sm text-balance text-gray-500"
                        >
                            {{ construction.address }}
                        </p>
                    </div>
                </RouterLink>
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, reactive, defineAsyncComponent } from 'vue'
import { ImageOff, ArrowUpRight } from '@lucide/vue'
import axios from 'axios'
import SimpleLoader from '@/components/loading/SimpleLoader.vue'

const AsyncModalAlert = defineAsyncComponent(() => import('@/components/alerts/ModalAlert.vue'))

interface Construction {
    employeeId: number
    name: string
    address: string
    photoUrl: string
}

const constructions = ref<Construction[]>([])
const isLoading = ref(true)
const alertModal = reactive<{ message: string; key: number; title: string }>({
    message: '',
    key: 0,
    title: '',
})

onBeforeMount(() => {
    axios
        .get(`/api/employee/constructions-list`)
        .then((respose) => {
            const data = respose.data as Array<Construction>
            constructions.value = data
        })
        .finally(() => {
            isLoading.value = false
        })
})
</script>
