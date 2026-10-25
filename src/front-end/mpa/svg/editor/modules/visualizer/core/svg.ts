import type { Size } from '../types'

export class SVGParseError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'SVGParseError'
    }
}

export interface SVGImage {
    image: HTMLImageElement
    size: Size
}

export class SVGParser {
    private data: string

    constructor(data: string) {
        this.data = data
    }

    /**
     * Converts the SVG data into an image.
     * Rendering through <img> keeps the SVG sandboxed (no scripts, no access to the page).
     */
    public async loadImage(): Promise<SVGImage> {
        const svg = this.parse()
        const size = this.getIntrinsicSize(svg)

        // Explicit width/height are required by some browsers to draw the SVG on a canvas
        svg.setAttribute('width', String(size.width))
        svg.setAttribute('height', String(size.height))

        const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
            type: 'image/svg+xml',
        })
        const url = URL.createObjectURL(blob)

        try {
            const image = await this.loadImageFromURL(url)
            return { image, size }
        } finally {
            URL.revokeObjectURL(url)
        }
    }

    private parse(): SVGSVGElement {
        if (!this.data.trim()) {
            throw new SVGParseError('O SVG está vazio.')
        }

        const doc = new DOMParser().parseFromString(this.data, 'image/svg+xml')
        const error = doc.querySelector('parsererror')
        if (error) {
            throw new SVGParseError(error.textContent || 'SVG inválido.')
        }

        const root = doc.documentElement
        if (!(root instanceof SVGSVGElement)) {
            throw new SVGParseError('O elemento raiz precisa ser <svg>.')
        }

        return root
    }

    /**
     * Priority: width/height attributes, then the viewBox, then the default size.
     * When only one attribute exists, the other one keeps the viewBox (or default) proportion.
     */
    private getIntrinsicSize(svg: SVGSVGElement): Size {
        const width = this.getLengthAttribute(svg, 'width')
        const height = this.getLengthAttribute(svg, 'height')

        if (width !== null && height !== null) {
            return { width: width, height: height }
        }

        const reference = this.getViewBoxSize(svg) ?? { width: 100, height: 100 }

        if (width !== null) {
            return {
                width: width,
                height: Number((width * (reference.height / reference.width)).toFixed(2)),
            }
        }

        if (height !== null) {
            return {
                width: Number((height * (reference.width / reference.height)).toFixed(2)),
                height: height,
            }
        }

        return reference
    }

    // Only absolute lengths (no unit or px) are accepted, "100%" or "10cm" are ignored
    private getLengthAttribute(svg: SVGSVGElement, name: 'width' | 'height'): number | null {
        const value = (svg.getAttribute(name) || '').trim()
        if (!/^\d*\.?\d+(px)?$/.test(value)) return null

        const length = parseFloat(value)
        return length > 0 ? length : null
    }

    private getViewBoxSize(svg: SVGSVGElement): Size | null {
        const viewBox = (svg.getAttribute('viewBox') || '')
            .trim()
            .split(/[\s,]+/)
            .map(Number)

        if (viewBox.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) {
            return { width: viewBox[2], height: viewBox[3] }
        }

        return null
    }

    private loadImageFromURL(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.onerror = () => reject(new SVGParseError('Não foi possível renderizar o SVG.'))
            image.src = url
        })
    }
}
