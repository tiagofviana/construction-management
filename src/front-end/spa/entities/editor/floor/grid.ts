import Konva from 'konva'
import type { Stage } from 'konva/lib/Stage'
import type { Config } from './types'

export class Grid {
    private layer = new Konva.Layer({ listening: false })
    private group = new Konva.Group({ listening: false })
    private stage: Stage
    private config: Config

    constructor(stage: Stage, config: Config) {
        this.stage = stage
        this.config = config

        this.stage.add(this.layer)

        const rect = new Konva.Rect({
            x: 0,
            y: 0,
            width: config.width,
            height: config.height,
            fill: 'white',
            shadowColor: 'black',
            shadowBlur: 4,
            shadowOffset: { x: 0, y: 0 },
            shadowOpacity: 0.3,
        })

        this.layer.add(rect)
        this.layer.add(this.group)

        this.layer.moveToBottom()
    }

    public destroy() {
        this.group.destroy()
        this.layer.destroy()
    }

    public clear() {
        this.group.destroyChildren()
    }

    public draw() {
        const { width, height, gridSize } = this.config

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

        this.layer.batchDraw()
    }
}
