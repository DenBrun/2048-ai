import GameBoard from "./GameBoard.js"
import GameManager from "./GameManager.js"

main()


async function main() {
    const gameBoardElem = document.getElementById("game-board");
    const gameBoard = new GameBoard(gameBoardElem);

    const startAiButton = document.getElementById('startAIButton');

    window.onbeforeunload = () => save_user_data(gameBoard);

    let data = await get_user_data()
    let gameManager
    if (data) {
        gameManager = new GameManager(gameBoardElem, gameBoard, data['tiles'], data['score'], data['best_score'])
    }
    else {
        gameManager = new GameManager(gameBoardElem, gameBoard, [], 0, 0)
    }

    startAiButton.onclick = (ev) => handleAiButton(ev, gameManager);
    gameManager.resetListener()
    // gameManager.startAi();
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
        user_id = crypto.randomUUID()
        localStorage.setItem('id', user_id)
        return null
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
        console.error('Error fetching user data:', error);
    }
}

function save_user_data(gameBoard) {
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
