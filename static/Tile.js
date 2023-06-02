export default class Tile {
    #tileElement
    #x
    #y
    #value

    constructor(gameBoard, value = Math.random() > 0.5 ? 4 : 2) {
        this.#tileElement = document.createElement("div")

        // Animation for tile showing
        this.#tileElement.classList.add("tile", `tile-${value}`, "tile-show")
        this.#tileElement.addEventListener('animationend', () => {
            this.#tileElement.classList.remove('tile-show'),
            {
                once: true,
            }
        })

        this.#tileElement.innerHTML = value
        gameBoard.append(this.#tileElement)
        this.#value = value
    }

    set x(value) {
        this.#x = value
        this.#tileElement.style.setProperty("--x", value)
    }

    set y(value) {
        this.#y = value
        this.#tileElement.style.setProperty("--y", value)
    }

    get x() {
        return this.#x
    }

    get y() {
        return this.#y
    }

    get value() {
        return this.#value
    }

    set value(value) {
        // Updating the value of the tile
        this.#tileElement.classList.replace(`tile-${this.#value}`, `tile-${value}`)
        this.#value = value
        this.#tileElement.innerHTML = value
    }

    remove() {
        this.#tileElement.remove() // Removing the tile element from the DOM
    }


    animateMerge() {
        // Adding classes for css animations
        this.#tileElement.classList.add('tile-merge')
        this.#tileElement.addEventListener('animationend', () => {
            this.#tileElement.classList.remove('tile-merge'),
            {
                once: true,
            }
        })

    }

    waitForTransition(animation = false) {
        return new Promise(resolve => {
            this.#tileElement.addEventListener(
                animation ? "animationend" : "transitionend",
                resolve,
                {
                    once: true,
                }
            )
        })
    }
}