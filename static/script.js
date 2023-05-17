import GameBoard from "./GameBoard.js"
import Tile from "./Tile.js"

const gameBoardElem = document.getElementById("game-board")

const gameBoard = new GameBoard(gameBoardElem)

const newTile = new Tile(gameBoardElem)
