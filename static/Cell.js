export default class Cell {
    #cellElement
    #x
    #y
    #tile
    #tileToMerge

    constructor(cellElement, x, y) {
        this.#cellElement = cellElement
        this.#x = x
        this.#y = y
    }

    set tile(tileElement) {
        this.#tile = tileElement
        if (tileElement == null) return
        this.#tile.x = this.#x
        this.#tile.y = this.#y
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

    set tileToMerge(value) {
        this.#tileToMerge = value
        if (!value) return
        this.#tileToMerge.x = this.#x
        this.#tileToMerge.y = this.#y
    }

    mergeTiles() {
        if (this.tile == null || !this.#tileToMerge) return
        this.tile.value *= 2
        this.tile.animateMerge()
        this.#tileToMerge.remove()
        this.#tileToMerge = null
    }

    canAccept(tile) {
        if (!this.#tile) return true
        return (this.#tileToMerge == null && this.#tile.value === tile.value)
    }

}