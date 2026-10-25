import Konva from 'konva'
import { Figure } from './figure'

export class Grid extends Figure {
    public draw() {
        const { width, height } = this.settings.map
        const gridSize = this.settings.grid.size

        for (let x = 0; x <= width; x += gridSize) {
            this.group.add(this.createLine([x, 0, x, height], x % (gridSize * 5) === 0))
        }

        for (let y = 0; y <= height; y += gridSize) {
            this.group.add(this.createLine([0, y, width, y], y % (gridSize * 5) === 0))
        }
    }

    private createLine(points: Array<number>, isMajor: boolean): Konva.Line {
        return new Konva.Line({
            points,
            stroke: isMajor ? '#21262d' : '#161b22',
            strokeWidth: isMajor ? 0.6 : 0.3,
            opacity: 0.7,
            listening: false,
        })
    }
}
