<template>
    <section class="flex h-full items-center justify-center py-6">
        <AlertModal
            v-if="alert.message"
            :type="alert.type"
            title="Deseja continuar?"
            :message="alert.message"
            ok-label="Confirmar"
            :has-cancel-button="true"
            cancel-label="Cancelar"
            :key="alert.key"
        />

        <form
            @submit.prevent="handleSubmit()"
            class="w-11/12 max-w-xs rounded-md border border-black/10 bg-white p-6"
        >
            <!-- Email -->
            <div class="field" :class="{ 'invalid-field': formErrors.email }">
                <label for="email">E-mail:</label>

                <input
                    id="email"
                    type="text"
                    placeholder=""
                    autocomplete="email"
                    v-model="form.email"
                    @input="delete formErrors.email"
                    required
                />

                <FieldError v-if="formErrors.email" :message="formErrors.email[0]" />
            </div>

            <!-- Password -->
            <div class="field" :class="{ 'invalid-field': formErrors.password }">
                <label for="password">Senha:</label>

                <input
                    id="password"
                    type="password"
                    placeholder=""
                    autocomplete="current-password"
                    v-model="form.password"
                    @input="delete formErrors.password"
                    required
                />

                <FieldError v-if="formErrors.password" :message="formErrors.password[0]" />
            </div>

            <!-- Stay connected -->
            <div class="checkbox mt-6">
                <label>
                    <input type="checkbox" v-model="form.stayConnected" />
                    Permanecer conectado
                </label>
            </div>

            <button type="submit" class="btn btn-blue mx-auto mt-4">
                <TextLoading text="ACESSAR" :isLoading="isFormLoading" class="stroke-white" />
            </button>
        </form>
    </section>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import AlertModal, { type ModalType } from '@/components/alerts/AlertModal.vue'
import FieldError from '@/components/form/FieldError.vue'
import TextLoading from '@/components/loading/TextLoading.vue'

interface LoginForm {
    email: string
    password: string
    stayConnected: boolean
}

const form = defineModel<LoginForm>({
    required: true,
    default: () => ({
        email: 'test@email.com',
        password: '1234asdf1',
        stayConnected: false,
    }),
})

const formErrors = ref<{
    email?: string[]
    password?: string[]
}>({})

const alert = reactive<{ message: string; key: number; type: ModalType }>({
    message: '',
    key: 0,
    type: 'error',
})

function setAlertMessage(msg: string, type: ModalType) {
    alert.message = msg
    alert.key++
    alert.type = type
}

const isFormLoading = ref(false)

function handleSubmit() {
    if (isFormLoading.value) return
    isFormLoading.value = true
    formErrors.value = {}
    setAlertMessage('O login ainda não foi implementado', 'error')
}
</script>
