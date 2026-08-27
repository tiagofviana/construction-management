import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import { createPinia } from 'pinia'
import { resetPlugin } from '@/plugins/piniaReset'
import axiosPlugin from '@/plugins/axiosSetup'
import gsapPlugin from '@/plugins/gsapSetup'
import colorisPlugin from '@/plugins/colorisSetup'
import chartjsPlugin from '@/plugins/chartjsSetup'

const app = createApp(App)
const pinia = createPinia()
pinia.use(resetPlugin)

app.use(pinia)
app.use(router)

app.use(axiosPlugin)
app.use(gsapPlugin)
app.use(chartjsPlugin)
app.use(colorisPlugin)

app.mount('#app')
