<template>
    <div class="flex">
        <InventoryViewer :employee-id="employeeId" :room-id="roomId" />
    </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import InventoryViewer from '@/components/inventory/InventoryViewer.vue'

const route = useRoute()

const employeeId = Number(route.params.employeeId)
const roomId = String(route.params.roomId)
</script>
