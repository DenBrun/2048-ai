import GameBoard from "./GameBoard.js"
import Tile from "./Tile.js"

const gameBoardElem = document.getElementById("game-board")

const gameBoard = new GameBoard(gameBoardElem)

// console.log(gameBoard.emptyCells);
gameBoard.addRandomTile()
gameBoard.addRandomTile()

console.log(gameBoard.cellsByColumn);
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
            return;
    }
    gameBoard.addRandomTile()
}


function moveUp() {
    moveTiles(gameBoard.cellsByColumn)
}

function moveDown() {
    moveTiles(gameBoard.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft() {
    moveTiles(gameBoard.cellsByRow)
}

function moveRight() {
    moveTiles(gameBoard.cellsByRow.map(row => [...row].reverse()))
}


function moveTiles(cells) {
    cells.forEach(cellGroup => {
        for (let i = 1; i < cellGroup.length; i++) {
            const cell = cellGroup[i];
            if (!cell.tile) continue
            let destinationCell
            for (let j = i - 1; j >= 0; j--) {
                const cellAbove = cellGroup[j]
                if (!cellAbove.canAccept(cell.tile)) break
                destinationCell = cellAbove
            }
            if (destinationCell) {
                if (destinationCell.tile) {
                    destinationCell.mergeTile(cell.tile)
                } else {
                    destinationCell.tile = cell.tile
                }
                cell.tile = null
                console.log(cell);
            }

        }
    })
}


function canMove(cells) {

}