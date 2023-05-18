import GameBoard from "./GameBoard.js"
import Tile from "./Tile.js"

const gameBoardElem = document.getElementById("game-board")

const gameBoard = new GameBoard(gameBoardElem)

// console.log(gameBoard.emptyCells);
gameBoard.addRandomTile()
gameBoard.addRandomTile()

console.log(gameBoard.cells);
// const newTile = new Tile(gameBoardElem)

window.addEventListener("keydown", handleMove)

function handleMove(e) {
    switch (e.key) {
        case "ArrowUp":
            moveUp();
            break;
        case "ArrowDown":
            moveDown();
            break;
        case "ArrowLeft":
            moveLeft();
            break;
        case "ArrowRight":
            moveRight();
            break;
        default:
            break;
    }
}


function moveUp() {
    const byColumn = gameBoard.cellsByColumn;
    // [].forEach()
    byColumn.forEach(cellGrop => {
        for (const cell of cellGrop) {
            if (!cell.tile || cell.tile.y == 0) continue
            console.log(cell.tile.y);
            cell.tile.y = cell.tile.y - 1
        }

    })
}


function moveLeft() {
    console.log(gameBoard.cellsByRow);
}

function canMove(cells) {

}