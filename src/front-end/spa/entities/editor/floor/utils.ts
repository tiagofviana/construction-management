export function snapValue(value: number, snapLength: number): number {
    return Math.round(value / snapLength) * snapLength
}
