<template>
    <nav
        aria-label="Breadcrumb"
        class="flex h-full flex-row items-center overflow-x-auto"
        style="scrollbar-width: none; -ms-overflow-style: none"
    >
        <div
            v-if="breadcrumbs.data.homeLabel"
            class="relative mr-2 flex h-full items-center border-r border-black/10 bg-orange-200 px-2 py-1 font-sans font-bold text-orange-900 no-underline"
        >
            <span class="ml-1.5 line-clamp-1 whitespace-nowrap">
                {{ breadcrumbs.data.homeLabel }}
            </span>

            <span
                class="absolute top-1/2 -right-1.5 table size-3 shrink-0 -translate-y-1/2 rotate-45 border-t border-r border-black/10 bg-inherit"
            >
            </span>
        </div>

        <template v-for="(item, index) in breadcrumbs.data.crumbs" :key="index">
            <RouterLink
                v-if="router.resolve(item.link).matched.length > 1"
                :to="item.link"
                class="px-1 font-sans font-medium whitespace-nowrap text-gray-700 no-underline hover:text-blue-600"
            >
                {{ item.label }}
            </RouterLink>

            <ChevronRight
                v-if="index !== breadcrumbs.data.crumbs.length - 1"
                :size="20"
                :stroke-width="1.5"
                class="mt-px shrink-0 stroke-gray-500"
            />
        </template>
    </nav>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { ChevronRight } from '@lucide/vue'
import { breadcrumbsStore } from '@/stores/employee/breadcrumbs'

const router = useRouter()
const breadcrumbs = breadcrumbsStore()
</script>
