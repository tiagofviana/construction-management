import { reactive } from 'vue'
import { defineStore } from 'pinia'

interface BreadcrumbItem {
    label: string
    link: string
}

interface BreadcrumbsData {
    homeLabel: string
    crumbs: BreadcrumbItem[]
}
const DEFAULT_DATA: BreadcrumbsData = {
    homeLabel: '',
    crumbs: [],
}

const BREADCRUMBS_DATA = 'employeeBreadcrumbsData'

export const breadcrumbsStore = defineStore('breadcrumbs', () => {
    const storedData = localStorage.getItem(BREADCRUMBS_DATA)
    const data = reactive<BreadcrumbsData>(storedData ? JSON.parse(storedData) : DEFAULT_DATA)

    function persist() {
        localStorage.setItem(BREADCRUMBS_DATA, JSON.stringify(data))
    }

    function push(label: string, link: string = window.location.pathname) {
        const index = data.crumbs.findIndex((item) => item.link === link && item.label === label)

        if (index !== -1) {
            truncateTo(index)
            return
        }

        data.crumbs.push({ label, link })
        persist()
    }

    function setHomeLabel(label: string) {
        data.homeLabel = label
        persist()
    }

    function truncateTo(index: number) {
        data.crumbs.splice(index + 1)
        persist()
    }

    function reset() {
        localStorage.removeItem(BREADCRUMBS_DATA)

        data.crumbs = []
        data.homeLabel = ''
    }

    return {
        data,
        push,
        setHomeLabel,
        reset,
    }
})
