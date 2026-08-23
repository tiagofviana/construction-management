class Settings {
    map = {
        width: 2400,
        height: 2400,
        padding: 400,
    }

    zoom = {
        speed: 0.1,
        min: 0.25,
        max: 4,
    }

    grid = {
        size: 10,
    }

    snap = {
        isOn: true,
        length: 10,
    }

    measures = { isOn: true }
}

export const settings = new Settings()
