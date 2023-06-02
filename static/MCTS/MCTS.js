import Node from "./Node.js";

export default class MCTS {
    #explorationConstant;
    #iterations;
    constructor(explorationConstant, iterations) {
        this.#explorationConstant = explorationConstant;
        this.#iterations = iterations;
    }

    search(initialState) {
        // Perform the MCTS search starting from the initial state
        const root = new Node(initialState);

        // Run fixed amount of iterations
        for (let i = 0; i < this.#iterations; i++) {
            const node = this.#treePolicy(root);
            const score = node.simulate();
            node.update(score);
        }

        // Choose the best child node to make a move
        const bestChild = this.#bestChild(root);
        return bestChild.move;
    }

    #treePolicy(node) {
        // Select a child node according to the tree policy until a terminal state is reached
        while (!node.state.isGameOver()) {
            if (!node.isFullyExpanded()) {
                // If the node is not fully expanded, expand a child node
                const child = this.#expand(node);
                return child;
            } else {
                // Select the child node using UCB formula
                node = node.select(this.#explorationConstant);
            }
        }
        return node;

    }

    #expand(node) {
        // Expand a random unexplored move as a new child node
        const unexpandedMoves = node.state
            .getPossibleMoves()
            .filter((move) => !node.state.moveIsExplored(move));
        const randomMove = unexpandedMoves[Math.floor(Math.random() * unexpandedMoves.length)];
        node.state.setMoveExplored(randomMove);
        const newBoard = node.state.clone();
        newBoard.move(randomMove);
        const childNode = new Node(newBoard, node, randomMove);
        node.children.push(childNode);
        return childNode;
    }

    #bestChild(node) {
        // Find the child node with the highest average score
        let bestChild = null;
        let bestScore = Number.NEGATIVE_INFINITY;
        for (const child of node.children) {
            const score = child.score / child.visits;
            if (score > bestScore) {
                bestScore = score;
                bestChild = child;
            }
        }
        return bestChild;
    }
}