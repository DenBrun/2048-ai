import GameBoard from "./GameBoard.js"
import GameManager from "./GameManager.js"
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

main()


async function main() {
    const gameBoardElem = document.getElementById("game-board");
    const gameBoard = new GameBoard(gameBoardElem);

    const startAiButton = document.getElementById('startAIButton');
    const resetButton = document.getElementById('resetGame');

    // Setting listener to save data after after leaving a page or reloading
    window.onbeforeunload = () => save_user_data(gameBoard);

    let data = await get_user_data()
    let gameManager
    if (data) {
        // Creating a game with previous state
        gameManager = new GameManager(gameBoardElem, gameBoard, data['tiles'], data['score'], data['best_score'])
    }
    else {
        // Creating a new game
        gameManager = new GameManager(gameBoardElem, gameBoard, [], 0, 0)
    }

    startAiButton.onclick = (ev) => handleAiButton(ev, gameManager);
    resetButton.onclick = () => gameManager.restartGame();

    gameManager.resetListener()
}

function handleAiButton(ev, gameManager) {
    if (ev.target.innerHTML === 'Run AI') {
        ev.target.innerHTML = 'Stop AI'
        gameManager.startAi();
    } else {
        ev.target.innerHTML = 'Run AI'
        gameManager.stopAi();
    }
}


async function get_user_data() {
    let user_id = localStorage.getItem('id')
    if (user_id == null) {
        user_id = uuidv4()                  // Generating a new UUIDv4 as the user ID
        localStorage.setItem('id', user_id) // Storing the user ID in localStorage
        return null
    }

    // Constructing the URL for retrieving user data
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
        console.error('Error fetching user data:', error);
    }
}

function save_user_data(gameBoard) {
    // Retrieving the user ID from localStorage
    const user_id = localStorage.getItem('id')
    // Formating for JSON
    const tiles = gameBoard.getTiles().map((tile) => ({ x: tile.x, y: tile.y, value: tile.value }))
    let data = { 'best_score': gameBoard.best_score, 'tiles': tiles, 'score': gameBoard.score }
    const user = {
        id: user_id,
        data: data
    }

    // Sending a POST request to save the user data
    fetch('/save-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })

}
