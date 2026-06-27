import Konva from 'konva'
import type { Stage } from 'konva/lib/Stage'
import type { Point, ToolOptions, Config, PathCommand } from './types'
import { Preview } from './preview'
import { Grid } from './grid'
import { Figure } from './figure'
import { Info } from './info'
import { ZoomController } from './controllers/zoom'
import { PanController } from './controllers/pan'
import { PathManager } from './manager/path'
import { DrawingToolManager } from './manager/drawingTool'
import { InputHandler } from './inputHandler'

export class FloorCanvas {
    private elmt: HTMLDivElement
    private stage: Stage

    private _config: Config = {
        width: 2400,
        height: 2400,
        padding: 400,
        gridSize: 10,
        snapLength: 10,
        isSnapOn: false,
    }

    // Components
    private preview: Preview
    private grid: Grid
    private figure: Figure
    private info: Info

    // Controllers
    private zoomController: ZoomController
    private panController: PanController
    private pathManager: PathManager
    private drawingToolManager: DrawingToolManager
    private inputHandler: InputHandler

    // Callbacks
    public onZoomChange?: (value: number) => void
    public onMouseTrackChange?: (value: Point) => void
    public onPathChange?: (value: Array<PathCommand>) => void

    constructor(elmt: HTMLDivElement, path: Array<PathCommand> = []) {
        this.elmt = elmt
        this.pathManager = new PathManager(this._config, path)

        this.stage = new Konva.Stage({
            container: elmt,
            width: elmt.clientWidth,
            height: elmt.clientHeight,
        })

        // Initialize controllers
        this.zoomController = new ZoomController(this.stage, this._config)
        this.zoomController.centralize()

        this.panController = new PanController(this.stage, this.zoomController)
        this.drawingToolManager = new DrawingToolManager(this._config)

        // Initialize components
        this.grid = new Grid(this.stage, this._config)
        this.figure = new Figure(this.stage, this._config)
        this.preview = new Preview(this.stage, this._config)
        this.info = new Info(this.stage)

        // Initialize input handler
        this.inputHandler = new InputHandler(
            this.stage,
            this.zoomController,
            this.panController,
            this.drawingToolManager,
            (point) => this.handleMouseTrack(point),
            (tool) => this.handleToolAction(tool),
        )

        // Initial draw
        this.grid.draw()
        this.figure.draw(this.pathManager.getPath(), false)
        this.info.draw(this.pathManager.getPath())

        // Bind events
        this.inputHandler.bindStageEvents()
        this.elmt.addEventListener('pointerout', () => this.inputHandler.onPointerOut())
    }

    get config(): Config {
        return this._config
    }

    set activeTool(tool: ToolOptions) {
        this.drawingToolManager.setTool(tool)
        const isSelect = tool === 'select'

        this.figure.draw(this.pathManager.getPath(), isSelect, (newPath) => {
            this.onFigureChange(newPath)
        })
        this.info.draw(this.pathManager.getPath())
        this.updatePreview()
    }

    get activeTool(): ToolOptions {
        return this.drawingToolManager.getTool()
    }

    public destroy(): void {
        this.grid.destroy()
        this.preview.destroy()
        this.figure.destroy()
        this.stage.destroy()
    }

    public snapActivation(status: boolean): void {
        this._config.isSnapOn = status
        this.updatePreview()
    }

    public gridVisibility(isVisible: boolean): void {
        if (isVisible) {
            this.grid.draw()
            return
        }

        this.grid.clear()
    }

    public clearPath(): void {
        this.pathManager.clear()
        this.info.clear()
        this.preview.clear()
        this.figure.clear()
    }

    public resetZoom(): void {
        this.zoomController.resetZoom(this.onZoomChange)
    }

    public applyZoom(zoom: number): void {
        this.zoomController.applyZoom(zoom, this.onZoomChange)
    }

    private handleMouseTrack(point: Point): void {
        this.updatePreview()

        if (this.onMouseTrackChange) {
            this.onMouseTrackChange(point)
        }
    }

    private handleToolAction(tool: ToolOptions): void {
        if (tool === 'line') {
            this.addLinePath()
        } else if (tool === 'curve') {
            this.addCurvePath()
        }
    }

    private addMovePath(): void {
        const cmd = this.drawingToolManager.createMoveCommand(
            this.drawingToolManager.getMousePoint(),
        )
        if (this.pathManager.addCommand(cmd)) {
            this.updateFigureAndInfo()
        }
    }

    private addLinePath(): void {
        if (this.pathManager.isEmpty()) {
            this.addMovePath()
            return
        }

        const cmd = this.drawingToolManager.createLineCommand(
            this.drawingToolManager.getMousePoint(),
        )
        if (this.pathManager.addCommand(cmd)) {
            this.updateFigureAndInfo()
        }
    }

    private addCurvePath(): void {
        if (this.pathManager.isEmpty()) {
            this.addMovePath()
            return
        }

        const lastCmd = this.pathManager.getLastCommand()
        if (!lastCmd) return

        const cmd = this.drawingToolManager.createCurveCommand(
            lastCmd,
            this.drawingToolManager.getMousePoint(),
        )
        if (this.pathManager.addCommand(cmd)) {
            this.updateFigureAndInfo()
        }
    }

    private updateFigureAndInfo(): void {
        const path = this.pathManager.getPath()
        this.figure.draw(path, false, (newPath) => {
            this.onFigureChange(newPath)
        })
        this.info.draw(path)

        if (this.onPathChange) {
            this.onPathChange(structuredClone(path))
        }
    }

    private onFigureChange(newPath: Array<PathCommand>): void {
        this.pathManager.setPath(newPath)
        this.figure.redrawPath(newPath)

        if (!this.figure.isCurveControlDragging()) {
            this.figure.redrawCurveControls(newPath, (path) => this.onFigureChange(path))
        }

        this.info.draw(newPath)

        if (this.onPathChange) {
            this.onPathChange(structuredClone(newPath))
        }
    }

    private updatePreview(): void {
        if (!this.drawingToolManager.shouldDrawPreview()) {
            this.preview.clear()
            return
        }

        const lastPath = this.pathManager.getLastCommand()
        const points = this.drawingToolManager.getPreviewPoints(lastPath)

        if (!points) {
            this.preview.clear()
            return
        }

        this.preview.draw(points.to, points.from, this.activeTool)
    }
}
