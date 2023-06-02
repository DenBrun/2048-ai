export default class Cell {
    #cellElement
    #x
    #y
    #tile
    #tileToMerge // The tile object to be merged with the current tile

    constructor(cellElement, x, y) {
        this.#cellElement = cellElement
        this.#x = x
        this.#y = y
    }

    set tile(tileElement) {
        this.#tile = tileElement
        if (tileElement == null) return
        // Update position
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
        if (this.#tile == null || !this.#tileToMerge) return 0
        this.#tile.value *= 2      // update value
        this.#tile.animateMerge()  // start animation
        this.#tileToMerge.remove()
        this.#tileToMerge = null
        return this.#tile.value
    }

    canAccept(tile) {
        // If no tile present or the tiles could be merged
        if (!this.#tile) return true
        return (this.#tileToMerge == null && this.#tile.value === tile.value)
    }

}