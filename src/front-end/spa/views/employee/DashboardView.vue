<template>
    <section class="mx-auto my-12 w-11/12">
        <div
            v-if="dashboardData"
            class="mx-auto flex max-w-2xl flex-col items-stretch overflow-hidden rounded-lg shadow shadow-black/20 sm:flex-row"
        >
            <div
                class="flex aspect-video h-40 w-full shrink-0 items-center justify-center overflow-hidden border-black/20 bg-gray-50 sm:h-auto sm:max-w-72 sm:border-r"
            >
                <img
                    v-if="dashboardData.construction.photoUrl"
                    :src="dashboardData.construction.photoUrl"
                    :alt="dashboardData.construction.name"
                    class="size-full object-cover object-center"
                />

                <ImageOff v-else :size="56" class="stroke-gray-300" />
            </div>

            <div class="flex flex-1 flex-col items-center justify-between bg-white p-4">
                <h1 class="line-clamp-1 px-4 py-1.5 text-center text-2xl font-bold text-pretty">
                    {{ dashboardData.construction.name }}
                </h1>

                <p class="line-clamp-3">{{ dashboardData.construction.address }}</p>

                <RouterLink
                    :to="{
                        name: 'employee.contructions-list',
                    }"
                    class="btn btn-red mt-3"
                >
                    Voltar
                </RouterLink>
            </div>
        </div>

        <ul class="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-4 sm:auto-rows-fr md:grid-cols-2">
            <li
                class="flex min-h-100 flex-col justify-between rounded-lg border border-black/10 bg-white px-6 py-4"
            >
                <h2 class="px-4 py-1.5 text-center text-2xl font-bold text-pretty">
                    Quantidade de Cômodos por Andar
                </h2>

                <div
                    v-if="!isChartJsReady || !(mapChartData.datasets[0].data.length > 0)"
                    class="mt-4 flex-1 animate-pulse rounded-lg bg-gray-200 duration-200"
                ></div>

                <Bar
                    v-if="isChartJsReady && mapChartData.datasets[0].data.length > 0"
                    :options="{
                        responsive: true,
                        scales: {
                            x: {
                                grid: {
                                    display: false,
                                },
                                ticks: {
                                    color: '#6B7280',
                                    font: {
                                        size: 12,
                                        weight: 500,
                                    },
                                },
                            },
                            y: {
                                beginAtZero: true,
                                border: {
                                    display: false,
                                },
                                grid: {
                                    color: 'rgba(0,0,0,.12)',
                                    drawTicks: false,
                                },
                                ticks: {
                                    color: '#9CA3AF',
                                    padding: 10,
                                    font: {
                                        size: 11,
                                    },
                                },
                            },
                        },
                        plugins: {
                            legend: {
                                display: false,
                            },
                            tooltip: {
                                backgroundColor: '#111827',
                                titleColor: '#F9FAFB',
                                bodyColor: '#E5E7EB',
                                borderColor: '#374151',
                                borderWidth: 1,
                                padding: 12,
                                cornerRadius: 10,
                                displayColors: false,
                                titleFont: {
                                    size: 12,
                                    weight: 600,
                                },
                                bodyFont: {
                                    size: 13,
                                    weight: 500,
                                },
                                callbacks: {
                                    label: (context) => {
                                        return `${context.parsed.y} cômodos`
                                    },
                                    title: (items) => {
                                        return items[0].label
                                    },
                                },
                            },
                        },
                    }"
                    :data="mapChartData"
                />

                <div class="flex flex-row items-center justify-center gap-2">
                    <RouterLink
                        :to="{
                            name: 'employee.contruction-map',
                            params: { employeeId: employeeId },
                        }"
                        class="btn btn-green mt-1"
                    >
                        Acessar Mapa
                    </RouterLink>
                </div>
            </li>

            <li
                class="flex min-h-100 flex-col justify-between rounded-lg border border-black/10 bg-white px-6 py-4"
            >
                <h2 class="px-4 py-1.5 text-center text-2xl font-bold text-pretty">
                    Em desenvolvimento...
                </h2>
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ImageOff } from '@lucide/vue'
import { Bar } from 'vue-chartjs'
import { ensureChartJsReady } from '@/plugins/chartjsSetup'
import { breadcrumbsStore } from '@/stores/employee/breadcrumbs'

interface DashboardData {
    construction: {
        name: string
        address: string
        photoUrl: string
    }
    atlas: Array<{
        name: string
        roomCount: number
    }>
}

const route = useRoute()
const breadcrumbs = breadcrumbsStore()
const employeeId = route.params.employeeId
const isLoadingData = ref<boolean>(true)
const isChartJsReady = ref<boolean>(false)
const dashboardData = ref<DashboardData>()

onMounted(async () => {
    ensureChartJsReady().then(() => {
        isChartJsReady.value = true
    })

    axios
        .get(`/api/employee/${employeeId}/dashboard/data`)
        .then((response) => {
            dashboardData.value = response.data
            breadcrumbs.setHomeLabel(dashboardData.value!.construction.name)
        })
        .finally(() => {
            isLoadingData.value = false
        })
})

const mapChartData = computed(() => {
    const chartData = {
        backgroundColor: '#f87979',
        labels: [] as Array<string>,
        datasets: [
            {
                data: [] as Array<number>,
                backgroundColor: ['#b9f8cf80', '#bedbff80', '#e9d4ff80', '#ffa2a280', '#fee68580'],
            },
        ],
    }

    if (!dashboardData.value) return chartData

    const mapData = dashboardData.value.atlas
    chartData.labels = mapData.map((item) => item.name)
    chartData.datasets[0].data = mapData.map((item) => item.roomCount)

    return chartData
})
</script>
