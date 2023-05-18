export default class Tile {
    #tileElement
    #x
    #y
    #value

    constructor(gameBoard, value = Math.random() > 0.5 ? 4 : 2) {
        this.#tileElement = document.createElement("div")
        this.#tileElement.classList.add("tile", `tile-${value}`)
        this.#tileElement.innerHTML = value
        gameBoard.append(this.#tileElement)
        this.#value = value
    }

    set x(value) {
        this.#x = value
        this.#tileElement.style.setProperty("--x", value)
    }

    set y(value) {
        this.#y = value
        this.#tileElement.style.setProperty("--y", value)
    }

    get x() {
        return this.#x
    }

    get y() {
        return this.#y
    }
}