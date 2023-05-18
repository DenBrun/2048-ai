import GameBoard from "./GameBoard.js"

const gameBoardElem = document.getElementById("game-board")

const gameBoard = new GameBoard(gameBoardElem)

gameBoard.addRandomTile()
gameBoard.addRandomTile()
resetListener()


function resetListener() {
    window.addEventListener("keydown", handleMove, { once: true })
}


function handleMove(e) {
    switch (e.key) {
        case "ArrowUp":
            if (!canMoveUp()) {
                resetListener()
                return
            }
            moveUp();
            break;
        case "ArrowDown":
            if (!canMoveDown()) {
                resetListener()
                return
            }
            moveDown();
            break;
        case "ArrowLeft":
            if (!canMoveLeft()) {
                resetListener()
                return
            }
            moveLeft();
            break;
        case "ArrowRight":
            if (!canMoveRight()) {
                resetListener()
                return
            }
            moveRight();
            break;
        default:
            resetListener()
            return;
    }
    gameBoard.addRandomTile()
    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        alert("Game over")
        return
    }
    resetListener()
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
            }

        }
    })
}

function canMoveUp() {
    return canMove(gameBoard.cellsByColumn)
}

function canMoveDown() {
    return canMove(gameBoard.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft() {
    return canMove(gameBoard.cellsByRow)
}

function canMoveRight() {
    return canMove(gameBoard.cellsByRow.map(row => [...row].reverse()))
}


function canMove(cells) {
    return cells.some(cellGroup => {
        return cellGroup.some((cell, i) => {
            if (i === 0) return false
            if (!cell.tile) return false
            const cellAbove = cellGroup[i - 1]
            return cellAbove.canAccept(cell.tile)
        })
    })
}