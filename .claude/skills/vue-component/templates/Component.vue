<!--
    Esqueleto de componente do projeto. Copie, renomeie e substitua os nomes "Example*"
    e os campos de exemplo. Remova as partes que o componente não usar (alertas, formulário,
    store, emits...), mas mantenha a ordem das seções.
-->
<template>
    <section class="flex flex-col items-center justify-center py-6">
        <!-- Alertas: o "key" recria o componente a cada nova mensagem -->
        <AsyncModalAlert
            v-if="modalAlert.message"
            type="error"
            :title="modalAlert.title"
            :message="modalAlert.message"
            ok-label="Confirmar"
            :has-cancel-button="false"
            :key="modalAlert.key"
        />

        <form
            @submit.prevent="handleSubmit()"
            class="w-11/12 max-w-sm rounded-md border border-black/10 bg-white p-6"
        >
            <h1 class="py-4 text-center font-serif text-4xl font-bold">{{ props.title }}</h1>

            <InlineAlert
                v-if="inlineAlert.message"
                :message="inlineAlert.message"
                :type="inlineAlert.type"
                :key="inlineAlert.key"
            />

            <!-- Name: um bloco ".field" por campo, com os erros vindos da API -->
            <div class="field" :class="{ 'invalid-field': formErrors.name }">
                <label for="name">Nome:</label>

                <input
                    id="name"
                    type="text"
                    placeholder=""
                    autocomplete="off"
                    v-model="form.name"
                    @input="delete formErrors.name"
                    required
                />

                <FieldErrors v-if="formErrors.name" :messages="formErrors.name" />
            </div>

            <!-- Description -->
            <div class="field" :class="{ 'invalid-field': formErrors.description }">
                <label for="description">Descrição:</label>

                <textarea
                    id="description"
                    v-model="form.description"
                    @input="delete formErrors.description"
                    required
                ></textarea>

                <FieldErrors v-if="formErrors.description" :messages="formErrors.description" />
            </div>

            <button type="submit" class="btn btn-blue mx-auto mt-4">
                <TextLoading text="SALVAR" :isLoading="isFormLoading" class="stroke-white" />
            </button>
        </form>
    </section>
</template>

<script lang="ts" setup>
// 1. Imports: vue, bibliotecas, stores e componentes (sempre pelo alias "@/")
import { ref, defineAsyncComponent, onMounted } from 'vue'
import axios from 'axios'
import { accountStore } from '@/stores/account'
import InlineAlert, { type InlineType } from '@/components/alerts/InlineAlert.vue'
import FieldErrors from '@/components/form/FieldErrors.vue'
import TextLoading from '@/components/loading/TextLoading.vue'

// 2. Componentes pesados ou exibidos raramente são carregados sob demanda
const AsyncModalAlert = defineAsyncComponent(() => import('@/components/alerts/ModalAlert.vue'))

// 3. Tipos locais
interface ExampleForm {
    name: string
    description: string
}

// 4. Props e emits tipados
const props = defineProps<{
    title: string
    exampleId?: number
}>()

const emit = defineEmits<{
    saved: [value: ExampleForm]
}>()

// 5. Stores (estado compartilhado fica em src/front-end/spa/stores/)
const account = accountStore()

// 6. Estado local
const form = ref<ExampleForm>({
    name: '',
    description: '',
})
const isFormLoading = ref(false)
const formErrors = ref<{
    name?: string[]
    description?: string[]
}>({})

const modalAlert = ref<{ message: string; key: number; title: string }>({
    message: '',
    key: 0,
    title: '',
})

const inlineAlert = ref<{ message: string; key: number; type: InlineType }>({
    message: '',
    key: 0,
    type: 'error',
})

// 7. Ciclo de vida
onMounted(async () => {
    const info = await account.getInfo()
    if (info) form.value.name = `${info.firstName} ${info.lastName}`
})

// 8. Funções
function setModalAlert(msg: string, title: string) {
    modalAlert.value = {
        message: msg,
        key: modalAlert.value.key + 1,
        title: title,
    }
}

function setInlineAlert(msg: string, type: InlineType) {
    inlineAlert.value.message = msg
    inlineAlert.value.key++
    inlineAlert.value.type = type
}

function handleSubmit() {
    if (isFormLoading.value) return
    isFormLoading.value = true
    const formData = form.value

    // A API recebe os campos em snake_case
    axios
        .post('/api/example/form', {
            example_id: props.exampleId,
            name: formData.name,
            description: formData.description,
        })
        .then(() => {
            setInlineAlert('Salvo com sucesso.', 'success')
            emit('saved', { ...formData })
        })
        .catch((error) => {
            if (error.code === 'ERR_NETWORK') {
                setModalAlert(
                    'Não foi possível conectar com servidor, por favor, tente novamente mais tarde.',
                    'Conexão instável',
                )
                return
            }

            // Erros de validação: "__all__" é geral, os demais são por campo
            if (error.status === 400) {
                const responseErros = error.response.data.errors

                if (responseErros.__all__) {
                    setInlineAlert(responseErros.__all__[0], 'error')
                }

                formErrors.value = {
                    name: responseErros.name || undefined,
                    description: responseErros.description || undefined,
                }

                return
            }

            console.error(error)
            setModalAlert(
                'O servidor não conseguiu processar a solicitação, por favor, contacte a nossa equipe.',
                'Erro inesperado',
            )
        })
        .finally(() => {
            isFormLoading.value = false
        })
}
</script>
