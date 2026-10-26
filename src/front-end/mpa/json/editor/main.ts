import { createApp } from 'vue'
import App from './App.vue'

document.querySelectorAll('div[role=json-editor]').forEach((item) => {
    if (item.hasAttribute('initialized')) return
    item.setAttribute('initialized', '')

    const props = {
        name: item.getAttribute('widget-name'),
        isRequired: item.hasAttribute('is-required'),
        initialData: item.getAttribute('initial-data'),
    }

    createApp(App, props).mount(item)
})
