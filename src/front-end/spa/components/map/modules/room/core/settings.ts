class Settings {
    map = {
        width: 2000,
        height: 2000,
        padding: 400,
    }

    zoom = {
        speed: 0.1,
        min: 0.25,
        max: 4,
    }

    grid = {
        isVisible: true,
        size: 10,
    }

    snap = {
        isOn: true,
        length: 10,
    }

    measures = { isOn: true }
}

export const settings = new Settings()
