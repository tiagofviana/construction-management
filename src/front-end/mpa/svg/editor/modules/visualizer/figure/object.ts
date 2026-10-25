import Konva from 'konva'
import { Figure } from './figure'
import type { SVGImage } from '../core/svg'

// Distance between the object and the measure line
const MEASURE_GAP = 10
// Length of the ticks at the ends of the measure line
const MEASURE_TICK = 8

export class SVGObject extends Figure {
    private svgImage: SVGImage | null = null

    public setImage(svgImage: SVGImage | null) {
        this.svgImage = svgImage
        this.redraw()
    }

    public draw() {
        if (!this.svgImage) return

        const { image, size } = this.svgImage
        const { width, height } = size
        const map = this.settings.map
        const x = (map.width - width) / 2
        const y = (map.height - height) / 2

        this.group.add(
            new Konva.Image({
                image,
                width: width,
                height: height,
                x: x,
                y: y,
                stroke: '#rgba(0,0,0,1)',
                strokeWidth: 1,
                listening: false,
            }),
        )

        this.drawWidthMeasure(x, y + height + MEASURE_GAP, width)
        this.drawHeightMeasure(x + width + MEASURE_GAP, y, height)
    }

    // Horizontal measure below the object, with the text under the line
    private drawWidthMeasure(x: number, y: number, width: number) {
        const half = MEASURE_TICK / 2

        this.group.add(this.createLine([x, y, x + width, y]))
        this.group.add(this.createLine([x, y - half, x, y + half]))
        this.group.add(this.createLine([x + width, y - half, x + width, y + half]))

        const text = this.createText(width)
        text.position({
            x: x + (width - text.width()) / 2,
            y: y + half + 2,
        })
        this.group.add(text)
    }

    // Vertical measure at the right of the object, with the text beside the line
    private drawHeightMeasure(x: number, y: number, height: number) {
        const half = MEASURE_TICK / 2

        this.group.add(this.createLine([x, y, x, y + height]))
        this.group.add(this.createLine([x - half, y, x + half, y]))
        this.group.add(this.createLine([x - half, y + height, x + half, y + height]))

        const text = this.createText(height)
        text.position({
            x: x + half + 2,
            y: y + (height - text.height()) / 2,
        })
        this.group.add(text)
    }

    private createLine(points: Array<number>): Konva.Line {
        return new Konva.Line({
            points,
            stroke: '#000000',
            strokeWidth: 1,
            listening: false,
        })
    }

    private createText(length: number): Konva.Text {
        return new Konva.Text({
            text: `${Math.round(length * 10) / 10}`,
            fontSize: 12,
            fontFamily: 'monospace',
            fill: '#000000',
            listening: false,
        })
    }
}
