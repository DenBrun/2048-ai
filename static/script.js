import GameBoard from "./GameBoard.js"
import GameManager from "./GameManager.js"


const gameBoardElem = document.getElementById("game-board")
const gameBoard = new GameBoard(gameBoardElem)


main()


async function main() {
    window.onbeforeunload = save_user_data;
    let data = await get_user_data()
    let gameManager
    if (data) {
        gameManager = new GameManager(gameBoardElem, gameBoard, data['tiles'], data['score'], data['best_score'])
    }
    else {
        gameManager = new GameManager(gameBoardElem, gameBoard, [], 0, 0)
    }
    // gameBoard.addRandomTile()
    // gameBoard.addRandomTile()
    gameManager.resetListener()
}


async function get_user_data() {
    let user_id = localStorage.getItem('id')
    if (user_id == null) {
        user_id = crypto.randomUUID()
        localStorage.setItem('id', user_id)
        return
    }

    const params = new URLSearchParams({
        id: user_id
    });

    const url = new URL('/get-user', window.location.href);
    url.search = params;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Error fetching user data: ' + error);
    }
}

function save_user_data() {
    const user_id = localStorage.getItem('id')
    const tiles = gameBoard.getTiles().map((tile) => ({ x: tile.x, y: tile.y, value: tile.value }))
    let data = { 'best_score': gameBoard.best_score, 'tiles': tiles, 'score': gameBoard.score }
    const user = {
        id: user_id,
        data: data
    }

    fetch('/save-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })

}

// function resetListener() {
//     const directions = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" }
//     window.addEventListener("keydown", (e) => handleMove(directions[e.key]), { once: true })
//     gameBoardElem.addEventListener('swiped', (e) => handleMove(e.detail.dir), { once: true });
// }

// async function handleMove(direction) {
//     switch (direction) {
//         case "up":
//             if (!canMoveUp()) {
//                 resetListener()
//                 return
//             }
//             await moveUp()
//             break
//         case "down":
//             if (!canMoveDown()) {
//                 resetListener()
//                 return
//             }
//             await moveDown()
//             break
//         case "left":
//             if (!canMoveLeft()) {
//                 resetListener()
//                 return
//             }
//             await moveLeft()
//             break
//         case "right":
//             if (!canMoveRight()) {
//                 resetListener()
//                 return
//             }
//             await moveRight()
//             break
//         default:
//             resetListener()
//             return
//     }
//     gameBoard.mergeTiles()
//     const newTile = gameBoard.addRandomTile()
//     if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
//         newTile.waitForTransition(true).then(_ => alert("Game over"))
//         return
//     }
//     resetListener()
// }


// function moveUp() {
//     return moveTiles(gameBoard.cellsByColumn)
// }

// function moveDown() {
//     return moveTiles(gameBoard.cellsByColumn.map(column => [...column].reverse()))
// }

// function moveLeft() {
//     return moveTiles(gameBoard.cellsByRow)
// }

// function moveRight() {
//     return moveTiles(gameBoard.cellsByRow.map(row => [...row].reverse()))
// }


// function moveTiles(cells) {
//     return Promise.all(
//         cells.flatMap(cellGroup => {
//             const promises = []
//             for (let i = 1; i < cellGroup.length; i++) {
//                 const cell = cellGroup[i];
//                 if (!cell.tile) continue
//                 let destinationCell
//                 for (let j = i - 1; j >= 0; j--) {
//                     const cellAbove = cellGroup[j]
//                     if (!cellAbove.canAccept(cell.tile)) break
//                     destinationCell = cellAbove
//                 }
//                 if (destinationCell) {

//                     promises.push(cell.tile.waitForTransition())
//                     if (destinationCell.tile) {
//                         destinationCell.tileToMerge = cell.tile
//                     } else {
//                         destinationCell.tile = cell.tile
//                     }
//                     cell.tile = null
//                 }
//             }
//             return promises
//         })
//     )
// }

// function canMoveUp() {
//     return canMove(gameBoard.cellsByColumn)
// }

// function canMoveDown() {
//     return canMove(gameBoard.cellsByColumn.map(column => [...column].reverse()))
// }

// function canMoveLeft() {
//     return canMove(gameBoard.cellsByRow)
// }

// function canMoveRight() {
//     return canMove(gameBoard.cellsByRow.map(row => [...row].reverse()))
// }


// function canMove(cells) {
//     return cells.some(cellGroup => {
//         return cellGroup.some((cell, i) => {
//             if (i === 0) return false
//             if (!cell.tile) return false
//             const cellAbove = cellGroup[i - 1]
//             return cellAbove.canAccept(cell.tile)
//         })
//     })
// }