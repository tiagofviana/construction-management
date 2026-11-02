<template>
    <section class="mx-auto my-12 w-11/12 max-w-6xl">
        <InventoryViewer :employee-id="employeeId" :room-id="roomId" />
    </section>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import InventoryViewer from '@/components/inventory/InventoryViewer.vue'

const route = useRoute()

const employeeId = Number(route.params.employeeId)
const roomId = String(route.params.roomId)
</script>
