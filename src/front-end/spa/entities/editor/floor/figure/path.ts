import Konva from 'konva'
import type { Layer } from 'konva/lib/Layer'
import type { Group } from 'konva/lib/Group'
import { PathSerializer } from '../serializers'
import type { PathCommand } from '../types'

export class PathRenderer {
    private group: Group
    private konvaPath: Konva.Path

    constructor(layer: Layer) {
        this.group = new Konva.Group({ listening: false })
        this.konvaPath = new Konva.Path({
            stroke: '#193cb8',
            strokeWidth: 1.6,
            fill: '#e0e7ff',
            listening: false,
        })
        layer.add(this.konvaPath)
    }

    public redraw(path: Array<PathCommand>): void {
        this.konvaPath.data(PathSerializer.toString(path))
    }

    public clear(): void {
        this.konvaPath.data('')
    }

    public destroy(): void {
        this.group.destroy()
    }
}
