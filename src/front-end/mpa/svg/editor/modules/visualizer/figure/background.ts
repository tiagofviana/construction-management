import Konva from 'konva'
import { Figure } from './figure'

export class Background extends Figure {
    public draw() {
        this.group.add(
            new Konva.Rect({
                x: 0,
                y: 0,
                width: this.settings.map.width,
                height: this.settings.map.height,
                fill: 'white',
                shadowColor: 'black',
                shadowBlur: 4,
                shadowOffset: { x: 0, y: 0 },
                shadowOpacity: 0.3,
                stroke: 'rgba(0,0,0,.2)',
                strokeWidth: 1,
            }),
        )
    }
}
