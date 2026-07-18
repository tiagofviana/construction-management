<template>
    <h1>Mapa {{ employeeId }}</h1>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const employeeId = route.params.employeeId

onBeforeMount(() => {
    console.log(employeeId)
})
</script>
