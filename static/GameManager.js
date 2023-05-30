import { MCTS, GameState } from "./MCTS.js";
export default class GameManager {
    #gameBoardElem
    #gameBoard
    #runningAi

    constructor(gameBoardElem, gameBoard, currTiles, score, bestScore) {
        this.#gameBoardElem = gameBoardElem
        this.#gameBoard = gameBoard
        if (currTiles.length) {
            currTiles.forEach(tileDict => this.#gameBoard.addTile(tileDict['value'], tileDict['x'], tileDict['y']))
        } else {
            this.#gameBoard.addRandomTile()
            this.#gameBoard.addRandomTile()
        }
        this.#gameBoard.score = score
        this.#gameBoard.best_score = bestScore
    }

    resetListener() {
        const directions = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" }
        window.addEventListener("keydown", (e) => this.#handleMove(directions[e.key]), { once: true })
        this.#gameBoardElem.addEventListener('swiped', (e) => this.#handleMove(e.detail.dir), { once: true });
    }

    startAi() {
        if (this.#runningAi) return;
        this.#runningAi = setInterval(() => {
            const explorationConstant = 1.41;
            const iterations = 1500;

            const mcts = new MCTS(explorationConstant, iterations);
            const initialGameState = new GameState(this.#gameBoard.getMatrix(), this.#gameBoard.score)
            const bestMove = mcts.search(initialGameState);
            console.log("Best move:", bestMove);
            this.#handleAiMove(bestMove);
        }, 500)
    }

    stopAi() {
        clearInterval(this.#runningAi);
        this.#runningAi = null;
    }


    async #handleAiMove(direction) {

        switch (direction) {
            case "up":
                await this.#moveUp()
                break
            case "down":
                await this.#moveDown()
                break
            case "left":
                await this.#moveLeft()
                break
            case "right":
                await this.#moveRight()
                break
            default:
                return
        }
        this.#gameBoard.mergeTiles()
        const newTile = this.#gameBoard.addRandomTile()
        if (!this.#canMoveUp() && !this.#canMoveDown() && !this.#canMoveLeft() && !this.#canMoveRight()) {
            newTile.waitForTransition(true).then(_ => {
                alert("Game over")
                this.restartGame()
                this.resetListener()
            })
            return
        }
    }

    async #handleMove(direction) {
        if (this.#runningAi) {
            this.resetListener();
            return;
        }
        switch (direction) {
            case "up":
                if (!this.#canMoveUp()) {
                    this.resetListener()
                    return
                }
                await this.#moveUp()
                break
            case "down":
                if (!this.#canMoveDown()) {
                    this.resetListener()
                    return
                }
                await this.#moveDown()
                break
            case "left":
                if (!this.#canMoveLeft()) {
                    this.resetListener()
                    return
                }
                await this.#moveLeft()
                break
            case "right":
                if (!this.#canMoveRight()) {
                    this.resetListener()
                    return
                }
                await this.#moveRight()
                break
            default:
                this.resetListener()
                return
        }
        this.#gameBoard.mergeTiles()
        const newTile = this.#gameBoard.addRandomTile()
        if (!this.#canMoveUp() && !this.#canMoveDown() && !this.#canMoveLeft() && !this.#canMoveRight()) {
            newTile.waitForTransition(true).then(_ => {
                alert("Game over")
                this.restartGame()
                this.resetListener()
            })
            return
        }
        this.resetListener()
    }

    restartGame() {
        this.#gameBoard.score = 0
        this.#gameBoard.deleteTiles()
        this.#gameBoard.addRandomTile()
        this.#gameBoard.addRandomTile()
    }


    #moveUp() {
        return this.#moveTiles(this.#gameBoard.cellsByColumn)
    }

    #moveDown() {
        return this.#moveTiles(this.#gameBoard.cellsByColumn.map(column => [...column].reverse()))
    }

    #moveLeft() {
        return this.#moveTiles(this.#gameBoard.cellsByRow)
    }

    #moveRight() {
        return this.#moveTiles(this.#gameBoard.cellsByRow.map(row => [...row].reverse()))
    }


    #moveTiles(cells) {
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

    #canMoveUp() {
        return this.#canMove(this.#gameBoard.cellsByColumn)
    }

    #canMoveDown() {
        return this.#canMove(this.#gameBoard.cellsByColumn.map(column => [...column].reverse()))
    }

    #canMoveLeft() {
        return this.#canMove(this.#gameBoard.cellsByRow)
    }

    #canMoveRight() {
        return this.#canMove(this.#gameBoard.cellsByRow.map(row => [...row].reverse()))
    }


    #canMove(cells) {
        return cells.some(cellGroup => {
            return cellGroup.some((cell, i) => {
                if (i === 0) return false
                if (!cell.tile) return false
                const cellAbove = cellGroup[i - 1]
                return cellAbove.canAccept(cell.tile)
            })
        })
    }
}