import '@melloware/coloris/dist/coloris.css'

let promise: Promise<void> | null = null

export default {
    async install() {
        const { default: Coloris } = await import('@melloware/coloris')

        Coloris.init()
    },
}

export function ensureColorisReady() {
    if (!promise) {
        promise = import('@melloware/coloris').then(({ default: Coloris }) => {
            console.info(
                '%c Coloris initialized',
                'background: #4d3280; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
            )
            Coloris.init()
        })
    }
    return promise
}
