import Konva from 'konva'
import type { Layer } from 'konva/lib/Layer'
import type { Settings } from '../core/settings'

export abstract class Figure {
    protected group = new Konva.Group({ listening: false })
    protected settings: Settings

    constructor(layer: Layer, settings: Settings) {
        this.settings = settings
        layer.add(this.group)
    }

    public clear() {
        this.group.destroyChildren()
    }

    public redraw() {
        this.clear()
        this.draw()
    }

    public abstract draw(): void
}
