import { snapValue, calculateCurve } from '../utils'
import type { ToolOptions, PathCommand, Point, Config } from '../types'

export class DrawingToolManager {
    private activeTool: ToolOptions = null
    private mousePoint: Point = { x: 0, y: 0 }

    constructor(private config: Config) {}

    public setTool(tool: ToolOptions): void {
        this.activeTool = tool
    }

    public getTool(): ToolOptions {
        return this.activeTool
    }

    public setMousePoint(point: Point): void {
        this.mousePoint = point
    }

    public getMousePoint(): Point {
        return this.mousePoint
    }

    public isToolActive(tool: ToolOptions): boolean {
        return this.activeTool === tool
    }

    public shouldDrawPreview(): boolean {
        return ['line', 'curve'].includes(this.activeTool || '')
    }

    public createMoveCommand(point: Point): PathCommand {
        return {
            cmd: 'M',
            x: point.x,
            y: point.y,
        }
    }

    public createLineCommand(point: Point): PathCommand {
        return {
            cmd: 'L',
            x: point.x,
            y: point.y,
        }
    }

    public createCurveCommand(startPoint: PathCommand, endPoint: Point): PathCommand {
        const controls = calculateCurve({ x: startPoint.x, y: startPoint.y }, endPoint)

        return {
            cmd: 'C',
            x: endPoint.x,
            y: endPoint.y,
            x1: controls.x1,
            y1: controls.y1,
            x2: controls.x2,
            y2: controls.y2,
        }
    }

    public getPreviewPoints(lastPath: PathCommand | null): { from: Point; to: Point } | null {
        if (lastPath === null) return null

        const to = { ...this.mousePoint }

        if (this.config.isSnapOn) {
            to.x = snapValue(to.x, this.config.snapLength)
            to.y = snapValue(to.y, this.config.snapLength)
        }

        return {
            from: { x: lastPath.x, y: lastPath.y },
            to,
        }
    }
}
