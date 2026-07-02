import type { Point } from './types'

export function snapValue(value: number, snapLength: number): number {
    return Math.round(value / snapLength) * snapLength
}

export function isHexColor(color: string) {
    const hexRegex = /^#([0-9A-Fa-f]{6})$/
    return hexRegex.test(color)
}

export function calculateCurve(
    start: Point,
    end: Point,
): { x1: number; y1: number; x2: number; y2: number } {
    const dx = end.x - start.x
    const dy = end.y - start.y

    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance === 0) {
        return {
            x1: start.x,
            y1: start.y,
            x2: end.x,
            y2: end.y,
        }
    }
    const ux = dx / distance
    const uy = dy / distance

    // Perpendicular vector
    const px = -uy
    const py = ux

    // Distance
    const controlDistance = distance * 0

    // Intensity
    const curveOffset = distance * 1

    return {
        x1: start.x + ux * controlDistance + px * curveOffset,
        y1: start.y + uy * controlDistance + py * curveOffset,

        x2: end.x - ux * controlDistance + px * curveOffset,
        y2: end.y - uy * controlDistance + py * curveOffset,
    }
}
