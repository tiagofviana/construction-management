<template>
    <div class="flex bg-gray-300">
        <FloorEditor :floor-id="floorId" :employee-id="employeeId" />
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import FloorEditor from '@/components/map/FloorEditor.vue'

const route = useRoute()

const employeeId = Number(route.params.employeeId)
const floorId = Number(route.params.floorId)
</script>
