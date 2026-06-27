import Konva from 'konva'
import type { Line } from 'konva/lib/shapes/Line'
import type { Stage } from 'konva/lib/Stage'
import type { Point, ToolOptions, Config } from './types'

export class Preview {
    private layer = new Konva.Layer({ listening: false })
    private config: Config

    constructor(stage: Stage, config: Config) {
        this.config = config
        stage.add(this.layer)
    }

    private createDashedLine(to: Point, from: Point): Line {
        return new Konva.Line({
            points: [from.x, from.y, to.x, to.y],
            stroke: '#193cb8',
            strokeWidth: 1.5,
            dash: [12, 8],
            listening: false,
        })
    }

    public destroy() {
        this.layer.destroy()
    }

    public clear() {
        this.layer.destroyChildren()
    }

    public draw(to: Point, from: Point, tool: ToolOptions) {
        this.layer.destroyChildren()

        if (tool === 'line') {
            const previewLine = this.createDashedLine(to, from)
            this.layer.add(previewLine)
        }

        // if (mode.value === 'arc') {
        //     // Draw preview arc as SVG path
        //     const a = arcParams.value
        //     const previewArc = new Konva.Path({
        //         data: `M ${from.x} ${from.y} A ${a.rx} ${a.ry} ${a.xAxisRotation} ${a.largeArc ? 1 : 0} ${a.sweep ? 1 : 0} ${to.x} ${to.y}`,
        //         stroke: COLORS.pathPreview,
        //         strokeWidth: 1.5,
        //         fill: 'transparent',
        //         dash: [4, 4],
        //         listening: false,
        //     })
        //     uiLayer.add(previewArc)

        //     // Radius handles visual
        //     const midX = (from.x + to.x) / 2
        //     const midY = (from.y + to.y) / 2
        //     uiLayer.add(
        //         new Konva.Line({
        //             points: [midX - a.rx, midY, midX + a.rx, midY],
        //             stroke: COLORS.anchor + '55',
        //             strokeWidth: 0.8,
        //             dash: [3, 3],
        //         }),
        //     )
        // }
        this.layer.batchDraw()
    }
}
