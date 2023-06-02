export default class Node {
    #state;
    #parent;
    #children;
    #visits;
    #score;
    #move;
    constructor(state, parent = null, move = null) {
        this.#state = state;
        this.#parent = parent;
        this.#children = [];
        this.#visits = 0;
        this.#score = 0;
        this.#move = move
    }

    get state() {
        return this.#state;
    }

    get visits() {
        return this.#visits;
    }

    get score() {
        return this.#score;
    }

    get move() {
        return this.#move;
    }

    get children() {
        return this.#children;
    }

    expand() {
        // Expand this node by generating child nodes for all possible moves
        const possibleMoves = this.#state.getPossibleMoves();
        for (const move of possibleMoves) {
            const newBoard = this.#state.clone();
            newBoard.move(move);
            const childNode = new Node(newBoard, this, move);
            this.#children.push(childNode);
        }
    }

    select(explorationConstant) {
        // Select the child node with the highest UCT score based on the exploration constant
        let bestChild = null;
        let bestScore = Number.NEGATIVE_INFINITY;
        for (const child of this.#children) {
            const score =
                child.score / child.visits +
                explorationConstant * Math.sqrt((Math.log10(this.#visits)) / child.visits);
            if (score > bestScore) {
                bestScore = score;
                bestChild = child;
            }
        }
        return bestChild;
    }

    simulate() {
        // Simulate a random game play from this node's state until a terminal state is reached
        let tempState = this.#state.clone();
        while (!tempState.isGameOver()) {
            const possibleMoves = tempState.getPossibleMoves();
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            tempState.move(randomMove);
        }
        return tempState.getScore();
    }

    update(score) {
        // Update the visits and score of this node and parent nodes
        this.#visits++;
        this.#visits++;
        this.#score += score;

        if (this.#parent !== null) {
            this.#parent.update(score);
        }
    }


    isFullyExpanded() {
        return this.#children.length === this.#state.getPossibleMoves().length;
    }
}