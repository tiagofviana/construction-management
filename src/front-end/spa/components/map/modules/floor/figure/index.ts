import Konva from 'konva'
import type { Stage } from 'konva/lib/Stage'
import { Grid } from './grid'
import { Background } from './background'
import { Floor } from './shapes'
import { RotationHandler } from './shapes'

export class DrawManager {
    public grid: Grid
    public floor: Floor
    public rotationHandler: RotationHandler
    private background: Background

    constructor(stage: Stage) {
        const layer = new Konva.Layer({ listening: true })
        stage.add(layer)

        this.background = new Background(layer)
        this.grid = new Grid(layer)
        this.rotationHandler = new RotationHandler(layer)
        this.floor = new Floor(layer, this.rotationHandler)

        this.rotationHandler.moveToTop()
    }

    public init() {
        this.background.draw()
        this.grid.draw()
    }

    public clear() {
        this.background.clear()
        this.grid.clear()
    }
}
