import Konva from 'konva'
import type { Layer } from 'konva/lib/Layer'
import type { Group } from 'konva/lib/Group'
import { PathSerializer } from '../serializers'
import { isHexColor } from '../utils'
import type { PathCommand } from '../types'

export class PathRenderer {
    private group: Group
    private konvaPath: Konva.Path

    constructor(layer: Layer) {
        this.group = new Konva.Group({ listening: false })
        this.konvaPath = new Konva.Path({
            stroke: 'rgba(0,0,0,.3)',
            strokeWidth: 1.6,
            fill: '#ffffff',
            listening: false,
        })
        layer.add(this.konvaPath)
    }

    public setColor(color: string) {
        if (isHexColor(color)) {
            this.konvaPath.fill(color)
            this.konvaPath.getLayer()!.batchDraw()
        }
    }

    public redraw(path: Array<PathCommand>): void {
        this.konvaPath.data(PathSerializer.toString(path))
        this.konvaPath.getLayer()!.batchDraw()
    }

    public clear(): void {
        this.konvaPath.data('')
    }

    public destroy(): void {
        this.group.destroy()
    }
}
