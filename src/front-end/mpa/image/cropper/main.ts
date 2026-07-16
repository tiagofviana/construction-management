import { createApp } from 'vue'
import App from './App.vue'

document.querySelectorAll('div[role=image-crop]').forEach((item) => {
    if (item.hasAttribute('initialized')) return
    item.setAttribute('initialized', '')

    const props = {
        id: item.getAttribute('widget-id'),
        name: item.getAttribute('widget-name'),
        isRequired: item.hasAttribute('is-required'),
        accept: item.getAttribute('widget-accept') as string,
        width: Number(item.getAttribute('widget-width')),
        height: Number(item.getAttribute('widget-height')),
        initialSource: item.getAttribute('initial-src'),
        checkboxName: item.getAttribute('checkbox-name'),
    }

    createApp(App, props).mount(item)
})
