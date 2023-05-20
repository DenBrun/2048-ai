import Cell from "./Cell.js"
import Tile from "./Tile.js"

export default class GameBoard {
    #grid_element
    #cells
    #score = 0
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

    addTile(value, x, y) {
        this.#cells.find(cell => cell.x == x & cell.y == y).tile = new Tile(this.#grid_element, value)
    }

    addRandomTile() {
        return this.randomEmptyCell().tile = new Tile(this.#grid_element)
    }

    get cells() {
        return this.#cells
    }

    get cellsByColumn() {
        const byColumn = [[], [], [], []]
        for (const cell of this.#cells) {
            byColumn[cell.x][cell.y] = cell
        }
        return byColumn
    }

    get cellsByRow() {
        const byRow = [[], [], [], []]
        for (const cell of this.#cells) {
            byRow[cell.y][cell.x] = cell
        }
        return byRow
    }

    mergeTiles() {
        const score_incr = this.#cells.reduce((sum, cell) => sum += cell.mergeTiles(), 0)
        if (score_incr) {
            this.#score += score_incr
            this.#updateScore()
        }
    }

    #updateScore() {
        document.getElementById('score').innerHTML = this.#score
    }
}