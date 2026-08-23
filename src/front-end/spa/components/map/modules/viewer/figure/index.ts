import Konva from 'konva'
import type { Stage } from 'konva/lib/Stage'
import { Background } from './background'
import { Floor } from './shapes'

export class DrawManager {
    public floor: Floor
    private background: Background

    constructor(stage: Stage) {
        const layer = new Konva.Layer({ listening: true })
        stage.add(layer)

        this.background = new Background(layer)
        this.floor = new Floor(layer)
    }

    public init() {
        this.background.draw()
    }

    public clear() {
        this.background.clear()
    }
}
