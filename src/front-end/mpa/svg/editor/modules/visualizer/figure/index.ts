import type { Layer } from 'konva/lib/Layer'
import type { Settings } from '../core/settings'
import { Background } from './background'
import { Grid } from './grid'
import { Room } from './room'
import { SVGObject } from './object'

export class DrawManager {
    public room: Room
    public object: SVGObject
    private background: Background
    private grid: Grid

    constructor(layer: Layer, settings: Settings) {
        // Creation order defines the drawing order (bottom to top)
        this.background = new Background(layer, settings)
        this.grid = new Grid(layer, settings)
        this.room = new Room(layer, settings)
        this.object = new SVGObject(layer, settings)
    }

    public draw() {
        this.background.redraw()
        this.grid.redraw()
        this.room.redraw()
        this.object.redraw()
    }
}
