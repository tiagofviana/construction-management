import type { Stage } from 'konva/lib/Stage'
import { PathRenderer } from './figure/path'
import { VertexRenderer } from './figure/vertex'
import { CurveControlRenderer } from './figure/curve'
import type { Config, PathCommand } from './types'

export class Figure {
    private pathRenderer: PathRenderer
    private vertexRenderer: VertexRenderer
    private curveControlRenderer: CurveControlRenderer

    constructor(stage: Stage, config: Config) {
        this.pathRenderer = new PathRenderer(stage)
        this.vertexRenderer = new VertexRenderer(stage, config)
        this.curveControlRenderer = new CurveControlRenderer(stage, config)
    }

    public destroy(): void {
        this.pathRenderer.destroy()
        this.vertexRenderer.destroy()
        this.curveControlRenderer.destroy()
    }

    public clear(): void {
        this.pathRenderer.clear()
        this.vertexRenderer.clear()
        this.curveControlRenderer.clear()
    }

    public draw(
        path: Array<PathCommand>,
        isDraggable: boolean,
        onDrag: (value: Array<PathCommand>) => void = () => {},
    ): void {
        this.pathRenderer.redraw(path)
        this.vertexRenderer.draw(path, isDraggable, () => {
            this.pathRenderer.redraw(path)
            onDrag(path)
        })
        this.curveControlRenderer.draw(path, () => {
            this.pathRenderer.redraw(path)
            onDrag(path)
        })
    }

    public redrawPath(path: Array<PathCommand>): void {
        this.pathRenderer.redraw(path)
    }

    public redrawCurveControls(
        path: Array<PathCommand>,
        onDrag: (value: Array<PathCommand>) => void = () => {},
    ): void {
        this.curveControlRenderer.draw(path, () => {
            this.pathRenderer.redraw(path)
            onDrag(path)
        })
    }

    public isCurveControlDragging(): boolean {
        return this.curveControlRenderer?.isDragging ?? false
    }
}
