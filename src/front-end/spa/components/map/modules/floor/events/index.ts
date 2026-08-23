import type { Stage } from 'konva/lib/Stage'
import { Zoom } from './zoom'
import { Pan } from './pan'
import { MouseTracker } from './track'

export class EventsHandler {
    public zoom: Zoom
    public pan: Pan
    public mouseTracker: MouseTracker

    constructor(stage: Stage) {
        this.zoom = new Zoom(stage)
        this.pan = new Pan(stage)
        this.mouseTracker = new MouseTracker(stage)
    }
}
