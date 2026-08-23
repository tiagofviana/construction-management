import Konva from 'konva'
import type { Layer } from 'konva/lib/Layer'
import type { Stage } from 'konva/lib/Stage'
import type { Point } from '../../../types'
import { Figure } from '../figure'
import { tool, svgPath, snapPoint, calculateCurve } from '../../core'

export class Preview extends Figure {
    private stage: Stage

    constructor(layer: Layer) {
        super(layer)
        this.stage = layer.getStage()
    }
    public createListeners() {
        this.stage.on('mousemove', () => {
            this.draw()
        })

        this.stage.on('click', () => {
            this.clear()
        })
    }

    public clear() {
        this.group.destroyChildren()
    }

    public draw() {
        this.group.destroyChildren()

        const lastPath = svgPath.getPath().at(-1)
        if (lastPath === undefined) return

        if (tool.selected !== 'line' && tool.selected !== 'curve') {
            return
        }

        const startPoint = { x: lastPath.x, y: lastPath.y }
        const endPoint = snapPoint(this.getCurrentMousePoint())

        let data = `M ${startPoint.x} ${startPoint.y} `

        if (tool.selected === 'line') {
            data += `L ${endPoint.x} ${endPoint.y}`
        }

        if (tool.selected === 'curve') {
            const controls = calculateCurve(startPoint, endPoint)
            data += `C ${controls.x1} ${controls.y1} ${controls.x2} ${controls.y2} ${endPoint.x} ${endPoint.y}`
        }

        const draw = this.createDashedDraw(data)
        this.group.add(draw)
    }

    private createDashedDraw(data: string): Konva.Path {
        return new Konva.Path({
            data: data,
            stroke: '#193cb8',
            strokeWidth: 1.5,
            dash: [12, 8],
            fill: 'transparent',
            listening: false,
        })
    }

    private getCurrentMousePoint(): Point {
        const ptr = this.stage.getPointerPosition() as Point
        const scale = this.stage.scaleX()

        const point = {
            x: Math.round((ptr.x - this.stage.x()) / scale),
            y: Math.round((ptr.y - this.stage.y()) / scale),
        }

        return point
    }
}
