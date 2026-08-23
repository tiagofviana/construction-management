import Konva from 'konva'
import { Figure } from './figure'
import { settings } from '../core'

export class Grid extends Figure {
    public draw() {
        const width = settings.map.width
        const height = settings.map.height
        const gridSize = settings.grid.size

        for (let x = 0; x <= width; x += gridSize) {
            const major = x % (gridSize * 5) === 0
            this.group.add(
                new Konva.Line({
                    points: [x, 0, x, height],
                    stroke: major ? '#21262d' : '#161b22',
                    strokeWidth: major ? 0.6 : 0.3,
                    listening: false,
                    opacity: 0.7,
                }),
            )
        }

        for (let y = 0; y <= height; y += gridSize) {
            const major = y % (gridSize * 5) === 0
            this.group.add(
                new Konva.Line({
                    points: [0, y, width, y],
                    stroke: major ? '#21262d' : '#161b22',
                    strokeWidth: major ? 0.6 : 0.3,
                    listening: false,
                    opacity: 0.8,
                }),
            )
        }
    }
}
