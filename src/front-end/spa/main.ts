import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import { createPinia } from 'pinia'
import axiosPlugin from '@/plugins/axiosDefault'
import gsapPlugin from '@/plugins/gsapDefault'
import colorisPlugin from '@/plugins/colorisInit'
import { resetPlugin } from '@/plugins/piniaReset'

const app = createApp(App)
const pinia = createPinia()
pinia.use(resetPlugin)

app.use(pinia)
app.use(router)

app.use(axiosPlugin)
app.use(gsapPlugin)
app.use(colorisPlugin)

app.mount('#app')
