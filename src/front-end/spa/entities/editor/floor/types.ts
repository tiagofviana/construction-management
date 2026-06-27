export type ToolOptions = null | 'line' | 'select' | 'curve'

export interface Point {
    x: number
    y: number
}

export interface Config {
    width: number
    height: number
    padding: number
    gridSize: number
    snapLength: number
    isSnapOn: boolean
}

export interface Point {
    x: number
    y: number
}

export interface MotionPoints {
    pointer: Point
    stage: Point
}

export type PathCommand = MoveCmd | LineCmd | CurveCmd

interface MoveCmd {
    cmd: 'M'
    x: number
    y: number
}
interface LineCmd {
    cmd: 'L'
    x: number
    y: number
}
interface CurveCmd {
    cmd: 'C'
    x: number
    y: number
    x1: number
    y1: number
    x2: number
    y2: number
}
