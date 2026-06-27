import type { PiniaPluginContext, Store } from 'pinia'

const stores: Store[] = []

export function resetAll() {
    stores.forEach((item) => {
        console.debug(`Reseting ${item.$id} store`)
        item.$reset()

        if (!('reset' in item)) return

        if (typeof item.reset === 'function') item.reset()
    })
}

export function resetPlugin(context: PiniaPluginContext) {
    stores.push(context.store)
}
