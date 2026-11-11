<template>
    <div class="flex bg-gray-300">
        <InventoryEditor :employee-id="employeeId" :room-id="roomId" />
    </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import InventoryEditor from '@/components/inventory/InventoryEditor.vue'

const route = useRoute()

const employeeId = Number(route.params.employeeId)
const roomId = String(route.params.roomId)
</script>
