import { PathSerializer } from './serializers'
import { Point, PathCommand } from './types'

export function snapValue(value: number, snapLength: number): number {
    return Math.round(value / snapLength) * snapLength
}

export function isHexColor(color: string) {
    const hexRegex = /^#([0-9A-Fa-f]{6})$/
    return hexRegex.test(color)
}

export function computeCentroid(svgPath: string): Point {
    const commands = PathSerializer.fromString(svgPath)
    const polygon = flattenToPolygon(commands)
    const centroid = getPolygonCentroid(polygon)

    return {
        x: centroid.x,
        y: centroid.y,
    }
}

function flattenToPolygon(commands: PathCommand[], curveSegments = 16): Point[] {
    const points: Point[] = []
    let current: Point = { x: 0, y: 0 }

    for (const command of commands) {
        if (command.cmd === 'M' || command.cmd === 'L') {
            current = { x: command.x, y: command.y }
            points.push(current)
        } else if (command.cmd === 'C') {
            const p0 = current
            const p1 = { x: command.x1, y: command.y1 }
            const p2 = { x: command.x2, y: command.y2 }
            const p3 = { x: command.x, y: command.y }

            for (let i = 1; i <= curveSegments; i++) {
                points.push(cubicBezierPoint(p0, p1, p2, p3, i / curveSegments))
            }

            current = p3
        }
    }

    return points
}

function cubicBezierPoint(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
    const mt = 1 - t
    return {
        x: mt ** 3 * p0.x + 3 * mt ** 2 * t * p1.x + 3 * mt * t ** 2 * p2.x + t ** 3 * p3.x,
        y: mt ** 3 * p0.y + 3 * mt ** 2 * t * p1.y + 3 * mt * t ** 2 * p2.y + t ** 3 * p3.y,
    }
}

function getPolygonCentroid(points: Point[]): Point {
    let area = 0
    let cx = 0
    let cy = 0

    for (let i = 0; i < points.length; i++) {
        const p0 = points[i]
        const p1 = points[(i + 1) % points.length]
        const cross = p0.x * p1.y - p1.x * p0.y

        area += cross
        cx += (p0.x + p1.x) * cross
        cy += (p0.y + p1.y) * cross
    }

    area *= 0.5

    if (Math.abs(area) < 1e-6) {
        const n = points.length
        return points.reduce((acc, p) => ({ x: acc.x + p.x / n, y: acc.y + p.y / n }), {
            x: 0,
            y: 0,
        })
    }

    return { x: cx / (6 * area), y: cy / (6 * area) }
}
