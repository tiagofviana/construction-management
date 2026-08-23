import Konva from 'konva'
import type { Layer } from 'konva/lib/Layer'
import { Figure } from '../figure'
import { svgPath } from '../../core'
import { PathSerializer } from '../../../serializers'
import { isHexColor } from '../../../utils'

export class Room extends Figure {
    private konvaPath: Konva.Path

    constructor(layer: Layer) {
        super(layer)
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

    public draw(): void {
        const path = svgPath.getPath()
        this.konvaPath.data(PathSerializer.toString(path))
    }

    public clear(): void {
        this.konvaPath.data('')
    }
}
