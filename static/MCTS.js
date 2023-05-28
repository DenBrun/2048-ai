class Node {
    constructor(state, parent = null) {
        this.state = state;
        this.parent = parent;
        this.children = [];
        this.visits = 0;
        this.score = 0;
    }

    expand() {
        const possibleMoves = this.state.getPossibleMoves();
        for (const move of possibleMoves) {
            const newBoard = this.state.clone();
            newBoard.move(move);
            const childNode = new Node(newBoard, this);
            this.children.push(childNode);
        }
    }

    select(explorationConstant) {
        let bestChild = null;
        let bestScore = Number.NEGATIVE_INFINITY;
        for (const child of this.children) {
            const score =
                child.score / child.visits +
                explorationConstant * Math.sqrt((2 * Math.log(this.visits)) / child.visits);
            if (score > bestScore) {
                bestScore = score;
                bestChild = child;
            }
        }
        return bestChild;
    }

    simulate() {
        let tempState = this.state.clone();
        while (!tempState.isGameOver()) {
            const possibleMoves = tempState.getPossibleMoves();
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            tempState.move(randomMove);
        }
        return tempState.getScore();
    }

    update(score) {
        this.visits += 1;
        this.score += score;
    }

    isFullyExpanded() {
        return this.children.length === this.state.getPossibleMoves().length;
    }
}

class MCTS {
    constructor(explorationConstant, iterations) {
        this.explorationConstant = explorationConstant;
        this.iterations = iterations;
    }

    search(initialState) {
        const root = new Node(initialState);
        for (let i = 0; i < this.iterations; i++) {
            const node = this.treePolicy(root);
            const score = node.simulate();
            node.update(score);
        }
        const bestChild = this.bestChild(root);
        return bestChild.state.getBestMove();
    }

    treePolicy(node) {
        while (!node.state.isGameOver()) {
            if (!node.isFullyExpanded()) {
                const child = this.expand(node);
                return child;
            } else {
                node = node.select(this.explorationConstant);
            }
        }
        return node;
    }

    expand(node) {
        const unexpandedMoves = node.state
            .getPossibleMoves()
            .filter((move) => !node.state.moveIsExplored(move));
        const randomMove = unexpandedMoves[Math.floor(Math.random() * unexpandedMoves.length)];
        node.state.setMoveExplored(randomMove);
        const newBoard = node.state.clone();
        newBoard.move(randomMove);
        const childNode = new Node(newBoard, node);
        node.children.push(childNode);
        return childNode;
    }

    bestChild(node) {
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

// Example usage
class GameState {
    numRows = 4;
    numCols = 4;
    constructor(gameMatrix, score) {
        this.gameMatrix = gameMatrix
        this.score = score
    }

    clone() {
        const clonedState = new GameState();
        clonedState.gameMatrix = this.gameMatrix.map(row => [...row]);
        clonedState.score = this.score;
        return clonedState;
    }

    move(direction) {
        let rowStep = 0;
        let colStep = 0;

        switch (direction) {
            case 'up':
                rowStep = -1;
                break;
            case 'down':
                rowStep = 1;
                break;
            case 'left':
                colStep = -1;
                break;
            case 'right':
                colStep = 1;
                break;
            default:
                throw new Error('Invalid move direction');
        }

        return this.moveTiles(rowStep, colStep);
    }

    moveTiles(rowStep, colStep) {
        let hasMoved = false;

        const startRow = rowStep > 0 ? this.numRows - 1 : 0;
        const startCol = colStep > 0 ? this.numCols - 1 : 0;
        const rowIncrement = rowStep > 0 ? - 1 : 1;
        const colIncrement = colStep > 0 ? - 1 : 1;

        const merged = new Map();


        for (let row = startRow; row >= 0 && row < this.numRows; row += rowIncrement) {
            for (let col = startCol; col >= 0 && col < this.numCols; col += colIncrement) {
                const tileValue = this.gameMatrix[row][col];
                if (tileValue === 0) continue;

                let targetRow = row;
                let targetCol = col;

                while (this.isValidPosition(targetRow + rowStep, targetCol + colStep)) {
                    targetRow += rowStep;
                    targetCol += colStep;
                    const targetTileValue = this.gameMatrix[targetRow][targetCol];

                    if (targetTileValue === 0) {
                        // Move tile to empty cell
                        this.gameMatrix[targetRow][targetCol] = tileValue;
                        this.gameMatrix[row][col] = 0;
                        row = targetRow;
                        col = targetCol;
                        hasMoved = true;
                    }
                    else if (targetTileValue === tileValue && !merged.get([targetRow, targetCol].toString())) {
                        // Merge tiles
                        merged.set([targetRow, targetCol].toString(), true);

                        this.gameMatrix[targetRow][targetCol] *= 2;
                        this.score += this.gameMatrix[targetRow][targetCol];
                        this.gameMatrix[row][col] = 0;
                        hasMoved = true;
                        break;
                    }
                    else {
                        // Stop moving tiles
                        break;
                    }
                }

            }
        }

        return hasMoved;
    }


    isValidPosition(row, col) {
        return row >= 0 && row < this.numRows && col >= 0 && col < this.numCols;
    }




    getPossibleMoves() {
        // Return a list of possible moves
    }

    isGameOver() {
        // Check if the game is over
    }

    getScore() {
        // Return the current score
    }

    moveIsExplored(move) {
        // Check if a move has been explored
    }

    setMoveExplored(move) {
        // Mark a move as explored
    }

    getBestMove() {
        // Return the best move found by the MCTS algorithm
    }
}

// const explorationConstant = 1.41; // Modify the value as needed
// const iterations = 1000; // Modify the number of iterations as needed

// const mcts = new MCTS(explorationConstant, iterations);
// const initialGameState = new GameState(); // Create an initial game state
// const bestMove = mcts.search(initialGameState);
// console.log("Best move:", bestMove);


// const state = new GameState([
//     [2, 0, 64, 4],
//     [0, 0, 4, 2],
//     [0, 4, 8, 16],
//     [4, 2, 4, 4]],
//     320
// )


const state = new GameState([
    [2, 2, 32, 8],
    [8, 8, 2, 2],
    [2, 0, 2, 4],
    [0, 0, 0, 0]],
    320
)

state.move('left')
console.log(state.gameMatrix);