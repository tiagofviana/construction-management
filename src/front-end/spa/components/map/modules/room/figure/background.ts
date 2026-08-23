import Konva from 'konva'
import type { Layer } from 'konva/lib/Layer'
import { Figure } from './figure'
import { settings } from '../core'

export class Background extends Figure {
    constructor(layer: Layer) {
        super(layer)
        this.group.moveToBottom()
    }
    public draw() {
        const rect = new Konva.Rect({
            x: 0,
            y: 0,
            width: settings.map.width,
            height: settings.map.height,
            fill: 'white',
            shadowColor: 'black',
            shadowBlur: 4,
            shadowOffset: { x: 0, y: 0 },
            shadowOpacity: 0.3,
            stroke: 'rgba(0,0,0,.3)',
            strokeWidth: 1,
        })

        this.group.add(rect)
    }
}
