export interface Point {
    x: number
    y: number
}

export interface Size {
    width: number
    height: number
}

export interface InventoryRoom {
    id: string
    name: string
    description: string
    area: number
    svgPath: string
    svgViewBox: string
    color: string
}

export interface InventoryItem {
    id: string
    name: string
    description: string
    svg: string
    categoryId: number
    positionX: number
    positionY: number
    rotation: number
}
