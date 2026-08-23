import Konva from 'konva'
import type { Layer } from 'konva/lib/Layer'

export abstract class Figure {
    protected group = new Konva.Group({ listening: false })

    constructor(layer: Layer) {
        layer.add(this.group)
    }

    public clear() {
        this.group.destroyChildren()
    }

    public abstract draw(): void
}
