let promise: Promise<void> | null = null

export default {
    async install() {
        ensureChartJsReady()
    },
}

export function ensureChartJsReady() {
    if (!promise) {
        promise = import('chart.js').then(
            ({ Chart, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale }) => {
                console.info(
                    '%cCharts ready',
                    'background: #2f53b5; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
                )
                Chart.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
            },
        )
    }
    return promise
}
