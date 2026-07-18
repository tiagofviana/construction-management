<template>
    <Teleport to="body">
        <section
            v-if="!isHidden"
            class="fixed top-0 left-0 z-100 h-dvh w-dvw overflow-auto bg-black/40 py-12 backdrop-blur-sm"
        >
            <div class="mx-auto w-11/12 max-w-xl rounded bg-white pb-12">
                <button type="button" @click="isHidden = true" class="ml-auto block">
                    <X
                        :size="36"
                        :strokeWidth="2"
                        aria-label="Fechar"
                        class="boder-l ml-auto cursor-pointer stroke-gray-400 p-1 hover:stroke-black"
                    />
                </button>

                <hr class="h-px bg-gray-200" />

                <div class="mx-auto w-11/12 pt-2">
                    <InlineAlert
                        v-if="inlineAlert.message"
                        type="error"
                        :message="inlineAlert.message"
                        :key="inlineAlert.key"
                    />

                    <div class="relative">
                        <CameraViewer ref="cameraViewer" @getStream="setStream" />

                        <button
                            v-if="stream"
                            @click="takePicture"
                            type="button"
                            class="btn btn-blue absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
                        >
                            Tirar foto
                        </button>
                    </div>

                    <AsyncTrackConfiguration
                        v-if="stream"
                        :videoTrack="stream.getVideoTracks()[0]"
                    />
                </div>
            </div>
        </section>
    </Teleport>
</template>

<script lang="ts" setup>
import { ref, defineAsyncComponent } from 'vue'
import { X } from '@lucide/vue'
import InlineAlert from '@/components/alerts/InlineAlert.vue'
import CameraViewer from '@/components/camera/CameraViewer.vue'

const AsyncTrackConfiguration = defineAsyncComponent(
    () => import('@/components/camera/MediaTrackConfiguration.vue'),
)

const emit = defineEmits<{
    (e: 'picture', payload: string): void
}>()

const cameraViewer = ref<InstanceType<typeof CameraViewer> | null>(null)
const inlineAlert = ref({ message: '', key: 0 })
const isHidden = ref<boolean>(false)
const stream = ref<MediaStream | null>(null)

function setStream(data: MediaStream) {
    stream.value = data
}

function setInlineAlertMessage(msg: string) {
    inlineAlert.value = {
        message: msg,
        key: inlineAlert.value.key + 1,
    }
}

function takePicture() {
    if (stream.value === null) return

    const video = cameraViewer.value?.video as HTMLVideoElement
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    const width = stream.value.getVideoTracks()[0].getSettings().width || 640
    const height = stream.value.getVideoTracks()[0].getSettings().height || 480
    canvas.width = width
    canvas.height = height

    try {
        ctx.drawImage(video, 0, 0, width, height)
        const data = canvas.toDataURL('image/jpg')
        emit('picture', data)
        isHidden.value = true
    } catch (error) {
        console.error(error)
        setInlineAlertMessage(`Não foi possível realizar a captura da câmera. Erro: ${error}.`)
    }
}
</script>
