class Settings {
    map = {
        width: 2000,
        height: 2000,
        padding: 400,
    }

    zoom = {
        speed: 0.1,
        min: 0.1,
        max: 10,
    }

    grid = {
        size: 10,
    }

    snap = {
        isOn: true,
        length: 10,
    }
}

export const settings = new Settings()
