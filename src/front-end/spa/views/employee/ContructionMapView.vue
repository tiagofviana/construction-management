<template>
    <div class="flex bg-gray-300">
        <MapViwer :employee-id="employeeId" />
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import MapViwer from '@/components/map/MapViewer.vue'

const route = useRoute()

const employeeId = Number(route.params.employeeId)
</script>
