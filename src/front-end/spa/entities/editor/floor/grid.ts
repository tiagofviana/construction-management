import Konva from 'konva'
import type { Stage } from 'konva/lib/Stage'
import type { Config } from './types'

export class Grid {
    private layer = new Konva.Layer({ listening: false })
    private stage: Stage
    private config: Config

    constructor(stage: Stage, config: Config) {
        this.stage = stage
        this.config = config
        this.stage.add(this.layer)
        this.layer.moveToBottom()
    }

    public destroy() {
        this.layer.destroy()
    }

    public clear() {
        this.layer.destroyChildren()
    }

    public draw() {
        const { width, height, gridSize } = this.config

        for (let x = 0; x <= width; x += gridSize) {
            const major = x % (gridSize * 5) === 0
            this.layer.add(
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
            this.layer.add(
                new Konva.Line({
                    points: [0, y, width, y],
                    stroke: major ? '#21262d' : '#161b22',
                    strokeWidth: major ? 0.6 : 0.3,
                    listening: false,
                    opacity: 0.8,
                }),
            )
        }

        this.layer.batchDraw()
    }
}
