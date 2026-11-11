import type { Stage } from 'konva/lib/Stage'
import type { Settings } from '../core/settings'
import type { ISize } from '../../viewer/types'
import { Zoom } from '../../viewer/events/zoom'
import { Pan } from '../../viewer/events/pan'
import { MouseTracker } from './track'

export class EventsHandler {
    public zoom: Zoom
    public pan: Pan
    public mouseTracker: MouseTracker
    public onZoomChange: (scale: number) => void = () => {}

    constructor(stage: Stage, settings: Settings, getMapSize: () => ISize) {
        this.zoom = new Zoom(stage, settings, getMapSize)
        this.pan = new Pan(stage, settings, getMapSize)
        this.mouseTracker = new MouseTracker(stage, settings)

        // Without it the map jumps to the limits on the next drag
        this.zoom.onZoom = () => {
            this.pan.clamp()
            this.onZoomChange(stage.scaleX())
        }
    }
}
