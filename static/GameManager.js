import MCTS from "./MCTS/MCTS.js";
import GameState from "./MCTS/GameState.js";

export default class GameManager {
    #gameBoardElem
    #gameBoard
    #runningAi

    constructor(gameBoardElem, gameBoard, currTiles, score, bestScore) {
        this.#gameBoardElem = gameBoardElem
        this.#gameBoard = gameBoard

        // Add tiles to the game board based on the provided array of tiles
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
        // Set up event listeners for keyboard and swipe input
        const directions = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" }
        window.addEventListener("keydown", (e) => this.#handleMove(directions[e.key]), { once: true })
        this.#gameBoardElem.addEventListener('swiped', (e) => this.#handleMove(e.detail.dir), { once: true });
    }

    startAi() {
        if (this.#runningAi) return;
        this.#runningAi = true;

        const explorationConstant = 2000;
        const iterations = 2000;
        const mcts = new MCTS(explorationConstant, iterations);


        const runIteration = async () => {
            // Check if the game is over
            if (!this.#canMoveUp() && !this.#canMoveDown() && !this.#canMoveLeft() && !this.#canMoveRight()) {
                this.stopAi();
                return;
            }

            // Create the initial game state and perform MCTS search
            const initialGameState = new GameState(this.#gameBoard.getMatrix(), this.#gameBoard.score);
            const bestMove = mcts.search(initialGameState);

            await this.#handleAiMove(bestMove);

            if (this.#runningAi) {
                setTimeout(runIteration, 150);
            }
        };

        runIteration();
    }

    stopAi() {
        this.#runningAi = false;
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
            // Game over
            newTile.waitForTransition(true).then(_ => {
                this.stopAi()
                document.getElementById('startAIButton').innerHTML = 'Run AI'
                alert("Game over")
                this.restartGame()
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
            // Game over
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
        if (this.#runningAi) {
            return;
        }
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
                    if (!cell.tile) continue // If the cell doesn't have a tile, skip
                    let destinationCell
                    for (let j = i - 1; j >= 0; j--) {
                        const cellAbove = cellGroup[j]
                        if (!cellAbove.canAccept(cell.tile)) break
                        destinationCell = cellAbove // Found a cell where the tile can be moved
                    }
                    if (destinationCell) {

                        promises.push(cell.tile.waitForTransition())
                        if (destinationCell.tile) {
                            destinationCell.tileToMerge = cell.tile // Set tile to be merged
                        } else {
                            destinationCell.tile = cell.tile // Just moved a tile to the empty position
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