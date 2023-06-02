import Cell from "./Cell.js"
import Tile from "./Tile.js"

export default class GameBoard {
    #grid_element
    #cells
    #score = 0
    #bestscore = 0
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

    getTiles() {
        // Get the tiles currently present on the game board
        return this.#cells.reduce((arr, cell) => {
            if (cell.tile) {
                arr.push(cell.tile)
                return arr
            } else {
                return arr
            }
        }, [])
    }

    deleteTiles() {
        // Delete all tiles from the game board by removing a DOM element
        this.#cells.map((cell) => {
            if (cell.tile) {
                cell.tile.remove()
                cell.tile = null
            }
        })
    }

    get cellsByColumn() {
        // Get the cells arranged by column
        const byColumn = [[], [], [], []]
        for (const cell of this.#cells) {
            byColumn[cell.x][cell.y] = cell
        }
        return byColumn
    }

    get cellsByRow() {
        // Get the cells arranged by row
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
            this.#updateScore(score_incr)
        }
    }

    #updateScore(difference) {
        let diffElem = document.createElement("div");
        diffElem.classList.add("score-addition"); // used for score-adding animation
        diffElem.textContent = "+" + difference;

        document.getElementById('score').innerHTML = this.#score
        document.getElementById('score').appendChild(diffElem);

        if (this.#score > this.#bestscore) {
            this.#bestscore = this.#score
            document.getElementById('bestscore').innerHTML = this.#bestscore
        }
    }
    get best_score() {
        return this.#bestscore
    }

    get score() {
        return this.#score
    }

    set score(value) {
        this.#score = value
        document.getElementById('score').innerHTML = value
        if (value >= 20000) {
            document.querySelector('.title').style.fontSize = '70px';
        } else if (value == 0) {
            document.querySelector('.title').style.fontSize = '80px';
        }
    }

    set best_score(value) {
        this.#bestscore = value
        document.getElementById('bestscore').innerHTML = value
    }

    getMatrix() {
        // Get the matrix representation of the game board
        const matrix = [];
        for (const cellRow of this.cellsByRow) {
            matrix.push(cellRow.map(cell => cell.tile ? cell.tile.value : 0))
        }
        return matrix
    }
}