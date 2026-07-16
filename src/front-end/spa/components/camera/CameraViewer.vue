<template>
    <div class="bg-white">
        <InlineAlert v-if="alert.message" type="error" :message="alert.message" :key="alert.key" />

        <TextLoading
            v-if="isLoadingPermissions"
            :isLoading="isLoadingPermissions"
            class="mx-auto mt-10 table stroke-blue-600"
        />

        <template v-if="selectOptions.length > 0">
            <SelectField
                @value="startStream"
                label="Câmera"
                inputName="video-device"
                placeholder="Selecione o dispositivo"
                :options="selectOptions"
                class="text-white"
            />

            <div
                class="inset-shadow relative mt-3 w-full overflow-hidden rounded-t-lg border border-black/10 bg-gray-200 inset-shadow-sm inset-shadow-black/10"
            >
                <VideoOff
                    :size="80"
                    class="absolute top-1/2 left-1/2 z-0 -translate-1/2 stroke-gray-400"
                />

                <video
                    ref="video"
                    autoplay
                    class="relative z-10 w-full object-cover object-center"
                    :srcObject="stream"
                    muted
                ></video>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef, onMounted, onBeforeUnmount } from 'vue'
import { Video, VideoOff } from '@lucide/vue'
import SelectField, { Option } from '@/components/form/SelectField.vue'
import InlineAlert from '@/components/alerts/InlineAlert.vue'
import TextLoading from '@/components/loading/TextLoading.vue'

const video = useTemplateRef('video')
const alert = ref({ message: '', key: 0 })
const isLoadingPermissions = ref<boolean>(true)
const selectOptions = ref<Array<Option>>([])
const stream = ref<MediaStream | null>(null)
const emit = defineEmits<{
    (e: 'getStream', stream: MediaStream): void
}>()

defineExpose({ video })

onMounted(async () => {
    getCameraPermission()
        .then(() => {
            setCameraOptions()
        })
        .finally(() => {
            isLoadingPermissions.value = false
        })
})

onBeforeUnmount(async () => {
    closeStream()
})

function setInlineAlertMessage(msg: string) {
    alert.value = {
        message: msg,
        key: alert.value.key + 1,
    }
}

async function getCameraPermission(): Promise<void> {
    return navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
            // Stop the stream immediately – we just needed permission
            stream.getTracks().forEach((track) => track.stop())
        })
        .catch((err) => {
            console.error(err)

            if (err.name === 'NotAllowedError') {
                setInlineAlertMessage(
                    'O acesso à câmera foi negado, por favor, habilite o acesso e recarregue a página.',
                )

                return
            }

            if (err.name === 'NotReadableError') {
                setInlineAlertMessage('Não há câmeras conectadas ao dispositvo.')
                return
            }

            setInlineAlertMessage(`Erro inesperado, por favor, contact a equipe. Erro: ${err}`)
            return
        })
}

async function setCameraOptions() {
    navigator.mediaDevices.enumerateDevices().then((items) => {
        selectOptions.value = []
        const cameras = items.filter((item) => item.kind === 'videoinput')

        if (cameras.length === 0) {
            setInlineAlertMessage(`Nenhuma câmera foi detectada nesse dispositivo.`)
        }

        cameras.forEach((item) => {
            selectOptions.value.push({
                icon: { component: Video },
                name: item.label,
                value: item.deviceId,
            })
        })
    })
}

async function startStream(deviceID: string) {
    closeStream()
    await navigator.mediaDevices
        .getUserMedia({
            audio: false,
            video: {
                deviceId: { exact: deviceID },
            },
        })
        .then(async (data) => {
            stream.value = data
        })
        .catch((err) => {
            stream.value = null
            console.error(err)

            if (err.name === 'NotReadableError') {
                setInlineAlertMessage(
                    'Não foi possível inicializar o dispositivo de captura de vídeo.',
                )
                return
            }

            setInlineAlertMessage(`Erro inesperado, contacte a equipe. Erro: ${err}`)
        })

    emit('getStream', stream.value as MediaStream)
}

function closeStream() {
    stream.value?.getTracks().forEach((track) => track.stop())
    stream.value = null
}
</script>
