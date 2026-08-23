import Konva from 'konva'
import type { Stage } from 'konva/lib/Stage'
import { DrawManager } from './figure'
import { EventsHandler } from './events'
import { settings, svgPath, ToolOptions, tool } from './core'
import { PathCommand } from '../types'

export class RoomCanvas {
    private stage: Stage
    private drawManager: DrawManager
    public eventsHandler: EventsHandler

    public setPath(path: Array<PathCommand>) {
        svgPath.setPath(path)
        this.drawManager.info.draw()
    }

    constructor(elmt: HTMLDivElement) {
        this.stage = new Konva.Stage({
            container: elmt,
            width: elmt.clientWidth,
            height: elmt.clientHeight,
        })
        const layer = new Konva.Layer({ listening: true })
        this.stage.add(layer)

        this.drawManager = new DrawManager(layer)
        this.eventsHandler = new EventsHandler(this.stage, this.drawManager)
    }

    public setup() {
        this.eventsHandler.pan.centralize()
        this.eventsHandler.zoom.reset()

        this.drawManager.init()
    }

    public centralize() {
        this.eventsHandler.zoom.reset()
        const scale = this.stage.scaleX()
        const centerX = (this.stage.width() - settings.map.width * scale) / 2
        const centerY = (this.stage.height() - settings.map.height * scale) / 2

        this.stage.to({
            x: centerX,
            y: centerY,
        })
    }

    public get svgPath() {
        return svgPath
    }

    public get settings() {
        return settings
    }

    public setTool(option: ToolOptions) {
        tool.selected = option
        this.stage.container().style.removeProperty('cursor')
    }

    public setColor(color: string) {
        this.drawManager.room.setColor(color)
    }

    public clear() {
        svgPath.setPath([])
        this.drawManager.room.clear()
        this.drawManager.info.clear()
    }

    public redraw() {
        this.drawManager.room.draw()
        this.drawManager.info.draw()
    }

    public gridVisibility(isVisible: boolean) {
        if (isVisible) {
            this.drawManager.grid.draw()
        } else {
            this.drawManager.grid.clear()
        }
    }

    public isInfoVisible(isVisible: boolean) {
        this.settings.measures.isOn = isVisible

        if (isVisible) {
            this.drawManager.info.draw()
        } else {
            this.drawManager.info.clear()
        }
    }

    public isMovablePartsVisibible(isVisible: boolean) {
        this.settings.measures.isOn = isVisible

        if (isVisible) {
            this.drawManager.info.draw()
        } else {
            this.drawManager.info.clear()
        }
    }

    public destroy() {
        this.stage.destroy()
        this.svgPath.reset()
    }
}
