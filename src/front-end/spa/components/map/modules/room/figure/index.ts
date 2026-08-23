import type { Layer } from 'konva/lib/Layer'
import { Grid } from './grid'
import { Background } from './background'
import { Room, Vertices, CurveControllers, Info, Preview } from './shapes'
import { tool } from '../core'

export class DrawManager {
    public grid: Grid
    public info: Info
    public room: Room
    private preview: Preview
    private background: Background
    private vertices: Vertices
    private curveControllers: CurveControllers

    constructor(layer: Layer) {
        this.background = new Background(layer)
        this.grid = new Grid(layer)
        this.room = new Room(layer)
        this.preview = new Preview(layer)

        this.curveControllers = new CurveControllers(layer)
        this.curveControllers.onControllerChange = () => {
            this.room.draw()
            this.info.draw()
        }

        this.vertices = new Vertices(layer)
        this.vertices.onVerticeChange = () => {
            this.curveControllers.draw()
            this.room.draw()
            this.info.draw()
        }

        this.info = new Info(layer)
    }

    public init() {
        this.background.draw()
        this.grid.draw()
        this.room.draw()
        this.preview.createListeners()

        tool.onChange = (value) => {
            this.preview.draw()

            if (value === 'select') {
                this.curveControllers.draw()
                this.vertices.draw()
                return
            }

            this.curveControllers.clear()
            this.vertices.clear()
        }
    }
}
