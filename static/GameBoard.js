import Cell from "./Cell.js"
import Tile from "./Tile.js"

export default class GameBoard {
    #grid_element
    #cells
    constructor(grid_element) {
        this.#grid_element = grid_element
        this.#cells = this.#create_cells()
    }

    #create_cells() {
        let cells = []
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement("div")
            cell.classList.add("grid-cell")
            cells.push(cell)
            this.#grid_element.append(cell)
        }
        return cells.map((elem, i) => new Cell(elem, i % 4, Math.floor(i / 4)))
    }

    randomEmptyCell() {
        const emptyCells = this.#cells.filter(cell => !cell.tile)
        const randomIndex = Math.floor(Math.random() * emptyCells.length)
        return emptyCells[randomIndex]
    }

    addRandomTile() {
        this.randomEmptyCell().tile = new Tile(this.#grid_element)
    }
}