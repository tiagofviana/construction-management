import type { Room } from '../../types'

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
}

export const rooms = new Rooms()
