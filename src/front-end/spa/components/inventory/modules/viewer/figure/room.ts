import Konva from 'konva'
import type { Settings } from '../core/settings'
import type { InventoryRoom, Size } from '../types'

export class Room {
    private group = new Konva.Group({ listening: false })
    private settings: Settings
    private room: InventoryRoom | null = null

    constructor(layer: Konva.Layer, settings: Settings) {
        this.settings = settings
        layer.add(this.group)
    }

    public clear() {
        this.group.destroyChildren()
    }

    // The map is the room view box plus the padding on each side
    public getMapSize(): Size {
        if (!this.room) return { width: 0, height: 0 }

        const [, , width, height] = this.room.svgViewBox.split(' ').map(Number)
        const padding = this.settings.map.padding * 2

        return {
            width: width + padding,
            height: height + padding,
        }
    }

    public draw(room: InventoryRoom) {
        this.clear()
        this.room = room

        const padding = this.settings.map.padding
        const [viewBoxX, viewBoxY] = room.svgViewBox.split(' ').map(Number)

        this.group.add(
            new Konva.Path({
                data: room.svgPath,
                x: padding - viewBoxX,
                y: padding - viewBoxY,
                fill: room.color,
                stroke: 'rgba(0,0,0,.6)',
                strokeWidth: 1.5,
            }),
        )
    }
}
