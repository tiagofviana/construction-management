import { calculateCurve, snapPoint } from '.'
import type { PathCommand, Point } from '../../types'

export class SVGPath {
    // Singleton
    private static _instance: SVGPath
    private constructor() {}
    public static get instance(): SVGPath {
        if (!SVGPath._instance) {
            SVGPath._instance = new SVGPath()
        }

        return SVGPath._instance
    }

    private path: Array<PathCommand> = []
    public onPathChange: (path: Array<PathCommand>) => void = () => {}

    public getPath(): Array<PathCommand> {
        return [...this.path]
    }

    public setPath(path: Array<PathCommand>): void {
        this.path = path
        this.onPathChange(this.path)
    }

    public reset(): void {
        this.path = []
    }

    public addCurveCommand(endPoint: Point) {
        const startPoint = this.path.at(-1)

        if (!startPoint) {
            this.addMoveCommand(endPoint)
            return
        }

        endPoint = snapPoint(endPoint)

        const controls = calculateCurve({ x: startPoint.x, y: startPoint.y }, endPoint)
        this.path.push({
            cmd: 'C',
            x: endPoint.x,
            y: endPoint.y,
            x1: controls.x1,
            y1: controls.y1,
            x2: controls.x2,
            y2: controls.y2,
        })
        this.onPathChange(this.path)
    }

    private addMoveCommand(point: Point) {
        point = snapPoint(point)
        this.path.push({
            cmd: 'M',
            x: point.x,
            y: point.y,
        })

        this.onPathChange(this.path)
    }

    public addLineCommand(point: Point) {
        const startPoint = this.path.at(-1)

        if (!startPoint) {
            this.addMoveCommand(point)
            return
        }

        point = snapPoint(point)

        this.path.push({
            cmd: 'L',
            x: point.x,
            y: point.y,
        })
        this.onPathChange(this.path)
    }
}
