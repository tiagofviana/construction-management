import Konva from 'konva'
import type { Settings } from '../core/settings'
import type { ISize } from '../../viewer/types'

export class Grid {
    private group = new Konva.Group({ listening: false })
    private settings: Settings

    constructor(layer: Konva.Layer, settings: Settings) {
        this.settings = settings
        layer.add(this.group)
    }

    public clear() {
        this.group.destroyChildren()
    }

    // Draws the grid only over the room area, which starts after the map padding
    public draw(roomSize: ISize) {
        this.clear()
        if (!this.settings.grid.isVisible) return

        const padding = this.settings.map.padding
        const gridSize = this.settings.grid.size
        const { width, height } = roomSize

        for (let x = 0; x <= width; x += gridSize) {
            this.group.add(this.createLine([x, 0, x, height], x % (gridSize * 5) === 0, padding))
        }

        for (let y = 0; y <= height; y += gridSize) {
            this.group.add(this.createLine([0, y, width, y], y % (gridSize * 5) === 0, padding))
        }
    }

    private createLine(points: Array<number>, isMajor: boolean, padding: number): Konva.Line {
        return new Konva.Line({
            points,
            x: padding,
            y: padding,
            stroke: isMajor ? '#21262d' : '#161b22',
            strokeWidth: isMajor ? 0.6 : 0.3,
            opacity: 0.4,
            listening: false,
        })
    }
}
