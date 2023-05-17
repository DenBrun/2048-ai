import GameBoard from "./GameBoard.js"
import Tile from "./Tile.js"

const gameBoardElem = document.getElementById("game-board")

const gameBoard = new GameBoard(gameBoardElem)

// console.log(gameBoard.emptyCells);
gameBoard.addRandomTile()
gameBoard.addRandomTile()

// const newTile = new Tile(gameBoardElem)
