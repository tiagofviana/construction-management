<template>
    <form @submit.prevent="handleSubmit()" class="mt-3 flex flex-1 flex-col overflow-auto">
        <ModalAlert
            v-if="modalAlert.key > 0"
            :key="modalAlert.key"
            :type="modalAlert.type"
            :title="modalAlert.title"
            :message="modalAlert.message"
            :ok-label="modalAlert.okLabel"
            :has-cancel-button="modalAlert.hasCancelButton"
            :cancel-label="modalAlert.cancelLabel"
            @ok="modalAlert.okFunction"
        />
        <div class="mb-4 flex flex-1 flex-col px-2 pt-2">
            <FieldErrors v-if="formErrors.svgPath" :messages="formErrors.svgPath" />

            <ul
                v-if="form.svgPath.length > 0"
                class="mt-1 max-h-32 overflow-auto border border-black/10 bg-gray-200 inset-shadow-sm inset-shadow-black/5"
            >
                <li v-for="(cmd, index) in form.svgPath" :key="index">
                    <p class="p-1 font-mono text-gray-500">
                        <span class="pr-0.5 font-bold text-blue-700">
                            {{ cmd.cmd }}
                        </span>

                        <span v-if="cmd.cmd === 'C'" class="text-xs">
                            {{ `${cmd.x1} ${cmd.y1}, ${cmd.x2} ${cmd.y2}, ${cmd.x} ${cmd.y}` }}
                        </span>

                        <span v-if="cmd.cmd === 'L'" class="text-xs">
                            {{ `${cmd.x}, ${cmd.y}` }}
                        </span>

                        <span v-if="cmd.cmd === 'M'" class="text-xs">
                            {{ `${cmd.x}, ${cmd.y}` }}
                        </span>
                    </p>
                </li>
            </ul>

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

            <div class="field" :class="{ 'invalid-field': formErrors.description }">
                <label for="description">Descrição:</label>

                <textarea
                    id="description"
                    name="description"
                    v-model="form.description"
                    @input="delete formErrors.description"
                    required
                ></textarea>

                <FieldErrors v-if="formErrors.description" :messages="formErrors.description" />
            </div>

            <div class="field" :class="{ 'invalid-field': formErrors.area }">
                <label for="area">Área total (m²):</label>

                <input
                    id="area"
                    name="area"
                    type="number"
                    inputmode="decimal"
                    min="0"
                    step="0.1"
                    placeholder=""
                    autocomplete="off"
                    v-model="form.area"
                    @input="delete formErrors.area"
                    required
                />

                <FieldErrors v-if="formErrors.area" :messages="formErrors.area" />
            </div>

            <div class="field" :class="{ 'invalid-field': formErrors.color }">
                <label for="identificationColor">Cor de identificação:</label>

                <input
                    ref="color-input"
                    id="identificationColor"
                    name="identificationColor"
                    type="text"
                    placeholder=""
                    autocomplete="off"
                    v-model="form.color"
                    @input="delete formErrors.color"
                    required
                />

                <FieldErrors v-if="formErrors.color" :messages="formErrors.color" />
            </div>
        </div>

        <hr class="mt-auto border-slate-200" />

        <div class="p-4">
            <button
                type="submit"
                class="btn mx-auto"
                :class="[{ 'btn-blue': props.isUpdate }, { 'btn-green': !props.isUpdate }]"
            >
                <template v-if="!isSavingRoom"> Salvar </template>
                <SimpleLoader v-else :size="26" />
            </button>
        </div>
    </form>
</template>

<script lang="ts" setup>
import { ref, PropType, onMounted, onBeforeMount, onUnmounted, useTemplateRef, inject } from 'vue'
import axios from 'axios'
import Coloris from '@melloware/coloris'
import ModalAlert, { type ModalType } from '@/components/alerts/ModalAlert.vue'
import FieldErrors from '@/components/form/FieldErrors.vue'
import SimpleLoader from '@/components/loading/SimpleLoader.vue'
import { PathSerializer } from '../modules/serializers'
import type { Room, PathCommand } from '../modules/types'

interface FormData {
    name: string
    description: string
    color: string
    area: number
    svgPath: Array<PathCommand>
}

interface ModalSettings {
    type: ModalType
    title: string
    message: string
    okLabel: string
    hasCancelButton: boolean
    cancelLabel: string
    okFunction: () => void
}

const emit = defineEmits<{
    saved: []
    changeColor: [value: string]
}>()

const props = defineProps({
    room: {
        type: Object as PropType<Room>,
        required: false,
    },
    isUpdate: {
        type: Boolean,
        required: true,
    },
})
const floorId = inject<number>('floorId') as number
const employeeId = inject<number>('employeeId') as number

onBeforeMount(() => {
    if (props.room) {
        form.value = {
            name: props.room.name,
            description: props.room.description,
            color: props.room.color || '#bcd9ff',
            area: props.room.area || 0,
            svgPath: PathSerializer.fromString(props.room.svgPath),
        }
    }
})

onMounted(() => {
    Coloris({
        el: colorInput.value as HTMLInputElement,
        theme: 'polaroid',
        themeMode: 'light',
        format: 'hex',
        formatToggle: false,
        alpha: false,
        wrap: false,
        defaultColor: form.value.color,
        swatches: [
            // Red
            '#fba7a7',

            // Orange
            '#f7de9b',

            // Yellow
            '#fef9c2',

            // Green
            '#78d99c',

            // Cyan
            '#9de9f0',

            // Blue
            '#b5d5ff',

            // Purple
            '#b49fce',

            // Stone
            '#b8b1b9',

            // Neutral
            '#d4d4d4',

            // Gray
            '#eaeaea',

            // White
            '#ffffff',
        ],
        onChange: (color) => {
            form.value.color = color
            emit('changeColor', color)
        },
    })
})

onUnmounted(() => {
    Coloris.close()
})
const colorInput = useTemplateRef('color-input')
const formErrors = ref<{
    name?: string[]
    description?: string[]
    color?: string[]
    area?: string[]
    svgPath?: string[]
}>({})
const form = defineModel<FormData>({
    default: () => ({
        name: '',
        description: '',
        svgPath: Array<PathCommand>(),
        color: '#bcd9ff',
        area: 0,
    }),
})
const modalAlert = ref<ModalSettings & { key: number }>({
    type: 'success',
    title: '',
    message: '',
    key: 0,
    okLabel: '',
    hasCancelButton: false,
    cancelLabel: '',
    okFunction: () => {},
})
const isSavingRoom = ref<boolean>(false)

function setModalAlert(settings: ModalSettings) {
    modalAlert.value = {
        key: modalAlert.value.key + 1,
        type: settings.type,
        title: settings.title,
        message: settings.message,
        okLabel: settings.okLabel,
        hasCancelButton: settings.hasCancelButton,
        cancelLabel: settings.cancelLabel,
        okFunction: settings.okFunction,
    }
}

function handleSubmit() {
    if (isSavingRoom.value === true) return
    isSavingRoom.value = true
    const { svgPath, ...rest } = form.value
    const formData = {
        floor: floorId,
        ...rest,
        svg_path: PathSerializer.toString(svgPath),
    }

    let url
    if (props.isUpdate) {
        url = `/api/employee/${employeeId}/room-update/${props.room!.id}/form`
    } else {
        url = `/api/employee/${employeeId}/room-create/form`
    }

    axios
        .post(url, formData)
        .then(() => {
            emit('saved')
            setModalAlert({
                type: 'info',
                title: 'Sucesso',
                message: 'O cômodo foi salvo com sucesso.',
                okLabel: 'Confirmar',
                hasCancelButton: false,
                cancelLabel: '',
                okFunction: () => {},
            })
        })
        .catch((error) => {
            if (error.status === 400) {
                const responseErros = error.response.data.errors
                console.log(responseErros)

                if (responseErros.__all__) {
                    setModalAlert({
                        type: 'error',
                        title: 'Dados inválidos',
                        message: responseErros.__all__[0],
                        okLabel: 'Confirmar',
                        hasCancelButton: false,
                        cancelLabel: '',
                        okFunction: () => {},
                    })
                }

                formErrors.value = {
                    name: responseErros.name || undefined,
                    description: responseErros.description || undefined,
                    color: responseErros.color || undefined,
                    area: responseErros.area || undefined,
                    svgPath: responseErros.svg_path || undefined,
                }
                return
            }

            console.error(error)
            setModalAlert({
                type: 'error',
                title: 'Erro inesperado',
                message:
                    'O servidor não conseguiu processar os dados, por favor,' +
                    ' contacte a equipe.',
                okLabel: 'Confirmar',
                hasCancelButton: false,
                cancelLabel: '',
                okFunction: () => {},
            })
        })
        .finally(() => {
            isSavingRoom.value = false
        })
}

function setSvgPath(value: Array<PathCommand>) {
    form.value = {
        ...form.value,
        svgPath: value.map((command) => ({ ...command })),
    }
}

defineExpose({ form, setSvgPath })
</script>
