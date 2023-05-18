export default class Cell {
    #cellElement
    #x
    #y
    #tile

    constructor(cellElement, x, y) {
        this.#cellElement = cellElement
        this.#x = x
        this.#y = y
    }

    set tile(tileElement) {
        tileElement.x = this.#x
        tileElement.y = this.#y
        this.#tile = tileElement
    }

    get tile() {
        return this.#tile
    }

    get x() {
        return this.#x
    }

    get y() {
        return this.#y
    }

}