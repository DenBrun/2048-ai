import GameBoard from "./GameBoard.js"

const gameBoardElem = document.getElementById("game-board")

const gameBoard = new GameBoard(gameBoardElem)

// gameBoard.addTile(2, 0, 0)
// gameBoard.addTile(2, 1, 0)
// gameBoard.addTile(2, 2, 0)
// gameBoard.addTile(2, 3, 0)
// gameBoard.addTile(2, 0, 1)
// gameBoard.addTile(4, 1, 1)
// gameBoard.addTile(2, 2, 1)
// gameBoard.addTile(2, 3, 1)
gameBoard.addRandomTile()
gameBoard.addRandomTile()
resetListener()


function resetListener() {
    const directions = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" }
    window.addEventListener("keydown", (e) => handleMove(directions[e.key]), { once: true })
    gameBoardElem.addEventListener('swiped', (e) => handleMove(e.detail.dir), { once: true });
}

async function handleMove(direction) {
    switch (direction) {
        case "up":
            if (!canMoveUp()) {
                resetListener()
                return
            }
            await moveUp()
            break
        case "down":
            if (!canMoveDown()) {
                resetListener()
                return
            }
            await moveDown()
            break
        case "left":
            if (!canMoveLeft()) {
                resetListener()
                return
            }
            await moveLeft()
            break
        case "right":
            if (!canMoveRight()) {
                resetListener()
                return
            }
            await moveRight()
            break
        default:
            resetListener()
            return
    }
    gameBoard.mergeTiles()
    const newTile = gameBoard.addRandomTile()
    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        newTile.waitForTransition(true).then(_ => alert("Game over"))
        return
    }
    resetListener()
}


function moveUp() {
    return moveTiles(gameBoard.cellsByColumn)
}

function moveDown() {
    return moveTiles(gameBoard.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft() {
    return moveTiles(gameBoard.cellsByRow)
}

function moveRight() {
    return moveTiles(gameBoard.cellsByRow.map(row => [...row].reverse()))
}


function moveTiles(cells) {
    return Promise.all(
        cells.flatMap(cellGroup => {
            const promises = []
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

                    promises.push(cell.tile.waitForTransition())
                    if (destinationCell.tile) {
                        destinationCell.tileToMerge = cell.tile
                    } else {
                        destinationCell.tile = cell.tile
                    }
                    cell.tile = null
                }
            }
            return promises
        })
    )
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