import Node from "./Node.js";

export default class MCTS {
    #explorationConstant;
    #iterations;
    constructor(explorationConstant, iterations) {
        this.#explorationConstant = explorationConstant;
        this.#iterations = iterations;
    }

    search(initialState) {
        const root = new Node(initialState);
        for (let i = 0; i < this.#iterations; i++) {
            const node = this.#treePolicy(root);
            const score = node.simulate();
            node.update(score);
        }
        const bestChild = this.#bestChild(root);
        return bestChild.move;
    }

    #treePolicy(node) {
        while (!node.state.isGameOver()) {
            if (!node.isFullyExpanded()) {
                const child = this.#expand(node);
                return child;
            } else {
                node = node.select(this.#explorationConstant);
            }
        }
        return node;

    }

    #expand(node) {
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