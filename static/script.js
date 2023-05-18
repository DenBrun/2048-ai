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
            break;
    }
}


function moveUp() {
    moveTiles(gameBoard.cellsByColumn)
}


function moveTiles(cells) {
    cells.forEach(cellGroup => {
        for (let i = 1; i < cellGroup.length; i++) {
            const cell = cellGroup[i];
            if (!cell.tile) continue
            let newCell
            for (let j = i - 1; j >= 0; j--) {
                const cellAbove = cellGroup[j]
                if (!cellAbove.canAccept(cell.tile)) break
                newCell = cellAbove
            }
            if (newCell) {
                if (newCell.tile) {
                    newCell.mergeTile(cell.tile)
                } else {
                    newCell.tile = cell.tile
                }
                cell.tile = null
                console.log(cell);
            }

        }
    })
}

function moveLeft() {
    console.log(gameBoard.cellsByRow);
}

function canMove(cells) {

}