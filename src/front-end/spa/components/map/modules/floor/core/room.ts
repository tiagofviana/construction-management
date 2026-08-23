import type { Room, Point } from '../../types'

class Rooms {
    private rooms: Map<string, Room>
    public onRoomsChange: (rooms: Array<Room>) => void

    constructor() {
        this.rooms = new Map()
        this.onRoomsChange = () => {}
    }

    public setRooms(rooms: Array<Room>): void {
        this.rooms.clear()
        rooms.forEach((room) => {
            this.rooms.set(room.id, room)
        })
    }

    public getRooms(): Array<Room> {
        return [...this.rooms.values()]
    }

    public getRoomById(id: string): Room | undefined {
        return this.rooms.get(id)
    }

    public updateRoomPosition(id: string, point: Point): void {
        const room = this.getRoomById(id)

        if (!room) {
            console.log(`Could not find the room ${id}`)
            return
        }

        room.positionX = point.x
        room.positionY = point.y

        this.rooms.set(id, room)
        this.onRoomsChange(this.getRooms())
    }

    public updateRoomRotation(id: string, rotation: number): void {
        const room = this.getRoomById(id)

        if (!room) {
            console.log(`Could not find the room ${id}`)
            return
        }

        room.rotation = rotation

        this.rooms.set(id, room)
        this.onRoomsChange(this.getRooms())
    }
}

export const rooms = new Rooms()
