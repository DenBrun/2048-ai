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
}