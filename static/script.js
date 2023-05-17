let i = 0




// setInterval(fetchGameState, 1000);

function fetchGameState() {
    fetch('/gamestate')
        .then(response => response.json())
        .then(data => updateData(data));
}


let tiles = []


const updateData = (data) => {
    console.log(data);
    if (tiles.length) {
        data["tiles"].forEach((coords, index) => {
            tiles[index].style.setProperty("--x", coords[0])
            tiles[index].style.setProperty("--y", coords[1])
        })
    } else {
        data["tiles"].forEach(coords => {
            const tile_elem = document.createElement("div")
            tile_elem.classList.add("tile")
            tile_elem.innerHTML = 2
            tile_elem.style.setProperty("--x", coords[0])
            tile_elem.style.setProperty("--y", coords[1])
            document.getElementById("game-board").append(tile_elem)
            tiles.push(tile_elem)
        })
    }

}