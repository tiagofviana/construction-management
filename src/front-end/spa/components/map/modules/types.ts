export interface Point {
    x: number
    y: number
}

export type PathCommand = MoveCmd | LineCmd | CurveCmd

export interface MoveCmd {
    cmd: 'M'
    x: number
    y: number
}
export interface LineCmd {
    cmd: 'L'
    x: number
    y: number
}
export interface CurveCmd {
    cmd: 'C'
    x: number
    y: number
    x1: number
    y1: number
    x2: number
    y2: number
}

export interface Room {
    id: string
    name: string
    description: string
    svgPath: string
    svgViewBox: string
    area: number
    color: string
    positionX: number
    positionY: number
    rotation: number
}
