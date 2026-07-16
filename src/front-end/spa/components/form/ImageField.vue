<template>
    <section
        class="rounded-sm border border-gray-300 p-1"
        :style="{
            width: '100%',
            maxWidth: props.width + 'px',
        }"
    >
        <ModalAlert
            v-if="modalAlert.message"
            :message="modalAlert.message"
            :key="modalAlert.key"
            type="error"
            :hasCancelButton="false"
        />

        <ImageCrop
            v-if="cropperInfo.data != null"
            :key="cropperInfo.key"
            :data="cropperInfo.data"
            :width="props.width"
            :height="props.height"
            @file="setFile"
        />

        <TakePicture
            v-if="takePictureKey > 0"
            :key="takePictureKey"
            @picture="(data) => setCropperData(data)"
        />

        <div
            class="relative bg-gray-200"
            :style="{
                width: '100%',
                aspectRatio: props.width / props.height,
            }"
        >
            <FileImage
                v-if="!imageSource"
                :strokeWidth="1.2"
                class="absolute top-1/2 left-1/2 size-4/12 -translate-1/2 stroke-gray-400"
            />

            <img v-if="imageSource" :src="imageSource" class="border border-black/20" />
        </div>

        <div class="flex flex-col">
            <button
                type="button"
                aria-label="Tirar uma foto"
                @click="takePictureKey++"
                class="btn btn-gray mt-1.5 flex w-full flex-row items-center"
            >
                <Camera :strokeWidth="2.3" :size="23" class="stroke-gray-500" />

                <span class="ml-1.5 flex-1">Tirar foto</span>
            </button>

            <button
                type="button"
                aria-label="Fazer upload de uma image,"
                @click="uploadFile()"
                class="btn btn-gray mt-2 flex flex-row items-center"
            >
                <ImageUp :strokeWidth="2.3" :size="23" class="stroke-gray-500" />

                <span class="ml-1.5 flex-1">Fazer upload</span>
            </button>

            <button
                v-if="!props.isRequired"
                v-show="props.initialSource !== null"
                type="button"
                aria-label="Remover imagem"
                @click="removeImage"
                class="btn btn-red mt-2 flex cursor-pointer flex-row items-center"
            >
                <Trash2 :strokeWidth="2.3" :size="23" class="stroke-red-800" />

                <span class="ml-1.5">Remover</span>
            </button>
        </div>
    </section>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Camera, Trash2, ImageUp, FileImage } from '@lucide/vue'
import ModalAlert from '@/components/alerts/ModalAlert.vue'
import TakePicture from '@/components/camera/TakePicture.vue'
import ImageCrop from '@/components/cropper/ImageCrop.vue'

const props = defineProps({
    isRequired: {
        type: Boolean,
        required: true,
    },
    width: {
        type: Number,
        required: true,
    },
    height: {
        type: Number,
        required: true,
    },
    initialSource: {
        type: String,
        required: false,
    },
})

const emit = defineEmits<{
    (e: 'clear', payload: boolean): void
    (e: 'file', payload: File | null): void
}>()

const modalAlert = ref({ message: '', key: 0 })
const imageSource = ref<string | undefined>(props.initialSource)
const takePictureKey = ref<number>(0)
const cropperInfo = ref<{
    data: string | null
    key: number
}>({ data: null, key: 0 })

function setModalAlertMessage(msg: string) {
    modalAlert.value = {
        message: msg,
        key: modalAlert.value.key + 1,
    }
}

function setCropperData(data: string) {
    cropperInfo.value = {
        data: data,
        key: cropperInfo.value.key + 1,
    }
}

function uploadFile() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (event: Event) => {
        const files = (event.target as HTMLInputElement).files
        if (!files) return
        const file = files[0]

        if (!file.type.startsWith('image/')) {
            setModalAlertMessage('O arquivo selecionado não é uma imagem')
            return
        }

        const reader = new FileReader()

        reader.onload = () => {
            setCropperData(reader.result as string)
        }

        reader.onerror = (err) => {
            console.error(err)
            setModalAlertMessage(`Erro ao processar a imagem. Erro: ${err}`)
        }

        reader.readAsDataURL(file)
    }
    input.click()
}

function removeImage() {
    imageSource.value = undefined
    emit('clear', true)
    emit('file', null)
}

function setFile(file: File) {
    const reader = new FileReader()

    reader.onload = () => {
        imageSource.value = reader.result as string
    }

    reader.readAsDataURL(file)
    emit('clear', false)
    emit('file', file)
}
</script>
