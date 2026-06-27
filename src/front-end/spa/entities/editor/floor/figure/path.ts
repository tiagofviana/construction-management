import Konva from 'konva'
import type { Layer } from 'konva/lib/Layer'
import { PathSerializer } from '../serializers'
import type { PathCommand } from '../types'

export class PathRenderer {
    private pathLayer: Layer
    private konvaPath: Konva.Path

    constructor(stage: Konva.Stage) {
        this.pathLayer = new Konva.Layer({ listening: false })
        this.konvaPath = new Konva.Path({
            stroke: '#193cb8',
            strokeWidth: 1.6,
            fill: '#e0e7ff',
            listening: false,
        })
        this.pathLayer.add(this.konvaPath)
        stage.add(this.pathLayer)
    }

    public redraw(path: Array<PathCommand>): void {
        this.konvaPath.data(PathSerializer.toString(path))
        this.pathLayer.batchDraw()
    }

    public clear(): void {
        this.konvaPath.data('')
    }

    public destroy(): void {
        this.pathLayer.destroy()
    }
}
