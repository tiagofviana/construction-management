import Konva from 'konva'
import type { Layer } from 'konva/lib/Layer'
import type { Point, ToolOptions } from './types'
import { calculateCurve } from './utils'

export class Preview {
    private group = new Konva.Group({ listening: false })

    constructor(layer: Layer) {
        layer.add(this.group)
    }

    public destroy() {
        this.group.destroy()
    }

    public clear() {
        this.group.destroyChildren()
    }

    public draw(from: Point, to: Point, tool: ToolOptions) {
        this.group.destroyChildren()
        let data = `M ${from.x} ${from.y} `

        if (tool === 'line') {
            data += `L ${to.x} ${to.y}`
        }

        if (tool === 'curve') {
            const controls = calculateCurve(from, to)
            data += `C ${controls.x1} ${controls.y1} ${controls.x2} ${controls.y2} ${to.x} ${to.y}`
        }

        const draw = this.createDashedDraw(data)
        this.group.add(draw)
    }

    private createDashedDraw(data: string): Konva.Path {
        return new Konva.Path({
            data: data,
            stroke: '#193cb8',
            strokeWidth: 1.5,
            dash: [12, 8],
            fill: 'transparent',
            listening: false,
        })
    }
}
