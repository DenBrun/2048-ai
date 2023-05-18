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
        if (!tileElement) {
            this.#tile = null
            return
        }
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

    canAccept(tile) {
        if (!this.#tile) return true
        return this.#tile.value === tile.value
    }

    mergeTile(tileToMerge) {
        if (!this.#tile || !tileToMerge) return
        tileToMerge.x = this.#x
        tileToMerge.y = this.#y
        this.#tile.value *= 2
        tileToMerge.remove()
    }

}