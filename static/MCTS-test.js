class Node {
    constructor(state, parent = null, move = null) {
        this.state = state;
        this.parent = parent;
        this.children = [];
        this.visits = 0;
        this.score = 0;
        this.move = move
    }

    expand() {
        const possibleMoves = this.state.getPossibleMoves();
        for (const move of possibleMoves) {
            const newBoard = this.state.clone();
            newBoard.move(move);
            const childNode = new Node(newBoard, this, move);
            this.children.push(childNode);
        }
    }

    select(explorationConstant) {
        let bestChild = null;
        let bestScore = Number.NEGATIVE_INFINITY;
        for (const child of this.children) {
            const score =
                child.score / child.visits +
                explorationConstant * Math.sqrt((Math.log10(this.visits)) / child.visits);
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
        this.visits++;
        this.score += score;

        if (this.parent !== null) {
            this.parent.update(score);
        }
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
            const node = this.treePolicy(root, i);
            const score = node.simulate();
            node.update(score);
        }
        const bestChild = this.bestChild(root);
        // console.log(root);
        // console.log(root.state.getPossibleMoves());
        // CHECK THIS!!
        return [bestChild.move, root];
    }

    treePolicy(node, i) {
        while (!node.state.isGameOver()) {
            if (!node.isFullyExpanded()) {
                const child = this.expand(node, i);
                return child;
            } else {
                node = node.select(this.explorationConstant);
            }
        }
        return node;

    }

    expand(node, i) {
        const unexpandedMoves = node.state.getPossibleMoves().filter((move) => !node.state.moveIsExplored(move));

        // console.log(unexpandedMoves);
        const randomMove = unexpandedMoves[Math.floor(Math.random() * unexpandedMoves.length)];
        node.state.setMoveExplored(randomMove);
        const newBoard = node.state.clone();
        if (!randomMove) {
            console.log(i);
        }
        newBoard.move(randomMove);
        const childNode = new Node(newBoard, node, randomMove);
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

class GameState {
    numRows = 4;
    numCols = 4;
    constructor(gameMatrix, score) {
        this.gameMatrix = gameMatrix.map(row => [...row]);
        this.score = score;
        this.exploredMoves = new Map();
    }

    clone() {
        const clonedState = new GameState(this.gameMatrix, this.score);
        return clonedState;
    }

    generateRandomTile() {
        const emptyCells = [];

        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                if (this.gameMatrix[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.gameMatrix[randomCell.row][randomCell.col] = Math.random() < 0.5 ? 2 : 4;
        }
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

        this.moveTiles(rowStep, colStep);
        this.generateRandomTile();
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
        const possibleMoves = [];
        if (this.canMove(-1, 0)) {
            possibleMoves.push('up');
        }
        if (this.canMove(1, 0)) {
            possibleMoves.push('down');
        }
        if (this.canMove(0, -1)) {
            possibleMoves.push('left');
        }
        if (this.canMove(0, 1)) {
            possibleMoves.push('right');
        }
        return possibleMoves;
    }

    canMove(rowStep, colStep) {
        return this.gameMatrix.some((row, rowIndex) =>
            row.some((tile, colIndex) => {
                if (tile === 0) return false;
                if (this.isValidPosition(rowIndex + rowStep, colIndex + colStep) &&
                    (this.gameMatrix[rowIndex + rowStep][colIndex + colStep] === 0 || this.gameMatrix[rowIndex + rowStep][colIndex + colStep] === tile)) {
                    return true;
                }

            })
        );
    }

    isGameOver() {
        return (
            !this.canMove(-1, 0) &&
            !this.canMove(1, 0) &&
            !this.canMove(0, -1) &&
            !this.canMove(0, 1)
        )
    }

    getScore() {
        return this.score;
    }

    moveIsExplored(move) {
        return this.exploredMoves.has(move)
    }

    setMoveExplored(move, value = true) {
        this.exploredMoves.set(move, value)
    }
}
// const explorationConstant = 1.41;
// const iterations = 100;

// const mcts = new MCTS(explorationConstant, iterations);
// const initialGameState = new GameState([
//     [2, 4, 32, 0],
//     [512, 32, 8, 0],
//     [64, 16, 4, 0],
//     [16, 4, 2, 0]],
//     4296
// )

// const bestMove = mcts.search(initialGameState);
// console.log("Best move:", bestMove);

const explorationConstant = 1000;
const iterations = 1000;
const mcts = new MCTS(explorationConstant, iterations);

let initialGameState = new GameState([
    [2, 2, 4, 4],
    [0, 0, 0, 8],
    [0, 0, 0, 0],
    [0, 0, 0, 0]],
    2
);

// const [bestMove, root] = mcts.search(initialGameState);
// console.log("Best move:", bestMove);
// console.log(root.children.map(node => `${node.move} - ${node.visits}`));


let roots = [];
while (!initialGameState.isGameOver()) {
    const mcts = new MCTS(explorationConstant, iterations);
    const [bestMove, root] = mcts.search(initialGameState);
    roots.push(root.children.map(node => `${node.move} - ${node.visits}`))
    // console.log("Best move:", bestMove);

    initialGameState.move(bestMove);
    initialGameState.exploredMoves = new Map()
}
console.log(initialGameState.gameMatrix);
console.log(initialGameState.score);
console.log(roots.slice(0, 10));


