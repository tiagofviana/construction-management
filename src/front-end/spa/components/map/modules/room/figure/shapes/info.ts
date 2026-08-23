import Konva from 'konva'
import type { Label } from 'konva/lib/shapes/Label'
import type { Text } from 'konva/lib/shapes/Text'
import type { PathCommand, LineCmd, CurveCmd } from '../../../types'
import { Figure } from '../figure'
import { svgPath, settings } from '../../core'

export class Info extends Figure {
    public clear() {
        this.group.destroyChildren()
    }

    public draw() {
        this.group.destroyChildren()
        if (!settings.measures.isOn) return

        const path = svgPath.getPath()

        for (let i = 1; i < path.length; i++) {
            const previous = path[i - 1]
            const current = path[i]

            if (current.cmd === 'C') {
                this.createCurveLabels(previous, current)
            }

            if (current.cmd === 'L') {
                this.createLineLabels(previous, current)
            }
        }
    }

    private euclidianDistance(previus: PathCommand, current: PathCommand): number {
        const dx = current.x - previus.x
        const dy = current.y - previus.y
        return Math.round(Math.sqrt(dx * dx + dy * dy))
    }

    private createLineLabels(previus: PathCommand, current: LineCmd) {
        const distance = this.euclidianDistance(previus, current)

        if (distance < 1) return

        const midX = (previus.x + current.x) / 2
        const midY = (previus.y + current.y) / 2

        const text = `${distance / 100}m`

        const label = this.createLabel(text)
        const bounds = label.getClientRect()

        label.position({
            x: midX - bounds.width / 2,
            y: midY - bounds.height / 2,
        })

        this.group.add(label)
    }

    private createCurveLabels(previous: PathCommand, current: CurveCmd) {
        const area = this.calculateCurveArea(previous, current)
        if (Math.abs(area) >= 1) {
            const chordMid = {
                x: (previous.x + current.x) / 2,
                y: (previous.y + current.y) / 2,
            }

            const apex = this.getCurveApexOnPerpendicular(previous, current)

            const textPos = {
                x: (chordMid.x + apex.x) / 2,
                y: (chordMid.y + apex.y) / 2,
            }

            const areaText = this.createText(
                `${(Math.abs(area) / 10000).toFixed(2)}m²`,
                'rgba(0,0,0,.8)',
            )
            const areaBounds = areaText.getClientRect()

            areaText.position({
                x: textPos.x - areaBounds.width / 2,
                y: textPos.y - areaBounds.height / 2,
            })

            this.group.add(areaText)
        }

        const distance = this.euclidianDistance(previous, current)
        if (distance >= 1) {
            const draw = this.createDashedDraw(
                `M ${previous.x} ${previous.y} L ${current.x} ${current.y}`,
            )
            this.group.add(draw)

            const midX = (previous.x + current.x) / 2
            const midY = (previous.y + current.y) / 2

            const distanceLabel = this.createLabel(`${distance / 100}m`)
            const distBounds = distanceLabel.getClientRect()

            distanceLabel.position({
                x: midX - distBounds.width / 2,
                y: midY - distBounds.height / 2,
            })

            this.group.add(distanceLabel)
        }
    }

    private getCurveApexOnPerpendicular(
        start: PathCommand,
        curve: CurveCmd,
        segments = 64,
    ): { x: number; y: number } {
        const chordDx = curve.x - start.x
        const chordDy = curve.y - start.y
        const chordLength = Math.sqrt(chordDx * chordDx + chordDy * chordDy)

        if (chordLength < 1e-6) {
            return this.getCurvePoint(start, curve, 0.5)
        }

        const nx = -chordDy / chordLength
        const ny = chordDx / chordLength

        const midX = (start.x + curve.x) / 2
        const midY = (start.y + curve.y) / 2

        let maxSignedDist = 0

        for (let i = 1; i < segments; i++) {
            const t = i / segments
            const point = this.getCurvePoint(start, curve, t)

            const dist = (point.x - midX) * nx + (point.y - midY) * ny

            if (Math.abs(dist) > Math.abs(maxSignedDist)) {
                maxSignedDist = dist
            }
        }

        return {
            x: midX + maxSignedDist * nx,
            y: midY + maxSignedDist * ny,
        }
    }

    private createLabel(text: string): Label {
        const label = new Konva.Label({
            listening: false,
        })

        label.add(this.createTag())
        label.add(this.createText(text))

        return label
    }

    private createText(text: string, color: string = 'black'): Text {
        return new Konva.Text({
            text: text,
            fontSize: 16,
            fontFamily: 'monospace',
            fill: color,
            align: 'center',
            padding: 6,
        })
    }

    private createTag() {
        return new Konva.Tag({
            fill: '#ffffff',
            cornerRadius: 4,
            shadowColor: '#000',
            shadowBlur: 5,
            shadowOpacity: 0.6,
            opacity: 1,
        })
    }

    private createDashedDraw(data: string): Konva.Path {
        return new Konva.Path({
            data: data,
            stroke: 'rgba(0,0,0,.8)',
            strokeWidth: 1.5,
            dash: [12, 8],
            fill: 'transparent',
            listening: false,
        })
    }

    private calculateCurveArea(start: PathCommand, curve: CurveCmd, segments = 32): number {
        // Shoelace formula
        const points: Array<{ x: number; y: number }> = [{ x: start.x, y: start.y }]

        for (let i = 1; i <= segments; i++) {
            const t = i / segments
            points.push(this.getCurvePoint(start, curve, t))
        }

        let area = 0
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i]
            const p2 = points[(i + 1) % points.length]
            area += p1.x * p2.y - p2.x * p1.y
        }

        return area / 2
    }

    private getCurvePoint(start: PathCommand, curve: CurveCmd, t: number) {
        const mt = 1 - t

        const x =
            mt * mt * mt * start.x +
            3 * mt * mt * t * curve.x1 +
            3 * mt * t * t * curve.x2 +
            t * t * t * curve.x

        const y =
            mt * mt * mt * start.y +
            3 * mt * mt * t * curve.y1 +
            3 * mt * t * t * curve.y2 +
            t * t * t * curve.y

        return { x, y }
    }
}
