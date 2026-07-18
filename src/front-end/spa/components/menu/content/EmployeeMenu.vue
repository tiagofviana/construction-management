<template>
    <MenuLayout>
        <template #nav>
            <p
                class="line-clamp-1 px-4 pb-6 text-center font-sans text-xl font-medium text-yellow-300"
            >
                {{ info?.firstName }}1
            </p>

            <MenuItem
                label="Início"
                :location="{ name: 'employee.contructions-list' }"
                :icon="House"
                class="stroke-white"
            ></MenuItem>

            <MenuItem
                label="Sair"
                :location="{ name: 'public.logout' }"
                :icon="LogOut"
                class="stroke-red-300"
            ></MenuItem>
        </template>
    </MenuLayout>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { House, LogOut } from '@lucide/vue'
import MenuLayout from '@/components/menu/MenuLayout.vue'
import MenuItem from '@/components/menu/MenuItem.vue'
import { accountStore, type AccountInfo } from '@/stores/account'

const account = accountStore()
const info = ref<AccountInfo | null>()

onMounted(async () => {
    info.value = await account.getInfo()
})
</script>
