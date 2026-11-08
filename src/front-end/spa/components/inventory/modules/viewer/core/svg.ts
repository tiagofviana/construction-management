import type { ISize } from '../types'

export interface ISVGImage {
    image: HTMLImageElement
    size: ISize
}

export class SVGParser {
    private data: string

    constructor(data: string) {
        this.data = data
    }

    /**
     * Converts the SVG markup into an image.
     * Rendering through <img> keeps the SVG sandboxed (no scripts, no access to the page).
     */
    public loadImage(): Promise<ISVGImage> {
        return new Promise((resolve, reject) => {
            const svg = this.parse()
            const size = this.getIntrinsicSize(svg)

            // Explicit width/height are required by some browsers to draw the SVG on a canvas
            svg.setAttribute('width', String(size.width))
            svg.setAttribute('height', String(size.height))

            const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
                type: 'image/svg+xml',
            })
            const url = URL.createObjectURL(blob)
            const image = new Image()

            image.onload = () => {
                URL.revokeObjectURL(url)
                resolve({ image, size })
            }
            image.onerror = () => {
                URL.revokeObjectURL(url)
                reject(new Error('Could not render the SVG.'))
            }
            image.src = url
        })
    }

    private parse(): SVGSVGElement {
        const doc = new DOMParser().parseFromString(this.data, 'image/svg+xml')
        const svg = doc.documentElement

        if (doc.querySelector('parsererror') || !(svg instanceof SVGSVGElement)) {
            throw new Error('Invalid SVG.')
        }

        return svg
    }

    /**
     * Priority: width/height attributes, then the viewBox, then the default size.
     * When only one attribute exists, the other one keeps the viewBox (or default) proportion.
     */
    private getIntrinsicSize(svg: SVGSVGElement): ISize {
        const width = this.getLengthAttribute(svg, 'width')
        const height = this.getLengthAttribute(svg, 'height')

        if (width !== null && height !== null) {
            return { width, height }
        }

        const reference = this.getViewBoxSize(svg) ?? { width: 100, height: 100 }

        if (width !== null) {
            return {
                width,
                height: Number((width * (reference.height / reference.width)).toFixed(2)),
            }
        }

        if (height !== null) {
            return {
                width: Number((height * (reference.width / reference.height)).toFixed(2)),
                height,
            }
        }

        return reference
    }

    private getViewBoxSize(svg: SVGSVGElement): ISize | null {
        const viewBox = (svg.getAttribute('viewBox') || '')
            .trim()
            .split(/[\s,]+/)
            .map(Number)

        if (viewBox.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) {
            return { width: viewBox[2], height: viewBox[3] }
        }

        return null
    }

    // Only absolute lengths (no unit or px) are accepted, "100%" or "10cm" are ignored
    private getLengthAttribute(svg: SVGSVGElement, name: 'width' | 'height'): number | null {
        const value = (svg.getAttribute(name) || '').trim()
        if (!/^\d*\.?\d+(px)?$/.test(value)) return null

        const length = parseFloat(value)
        return length > 0 ? length : null
    }
}
