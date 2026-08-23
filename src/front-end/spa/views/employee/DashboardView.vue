<template>
    <div class="mx-auto w-11/12 max-w-6xl">
        <RouterLink
            :to="{
                name: 'employee.contruction-map',
                params: { employeeId: employeeId },
            }"
            class="btn btn-green m-4"
        >
            Acessar Mapa
        </RouterLink>
    </div>
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
