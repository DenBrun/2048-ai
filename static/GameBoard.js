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
        console.log(cells);
        return cells
    }
}