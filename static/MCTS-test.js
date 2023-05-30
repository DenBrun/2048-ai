class MCTSNode {
    constructor(moves, parent) {
        this.parent = parent
        this.visits = 0
        this.wins = 0
        this.numUnexpandedMoves = moves.length
        this.children = new Array(this.numUnexpandedMoves).fill(null) //temporary store move for debugging purposes
    }
}


class MCTS {
    constructor(game, player, iterations, exploration) {
        this.game = game
        this.player = player
        this.iterations = iterations
        this.exploration = exploration

        if (this.iterations == undefined) {
            this.iterations = 500
        }
        if (this.exploration == undefined) {
            this.exploration = 1.41
        }
    }

    selectMove() {
        const originalState = this.game.getState()
        const possibleMoves = this.game.moves()
        const root = new MCTSNode(possibleMoves, null)

        for (let i = 0; i < this.iterations; i++) {
            this.game.setState(originalState)
            const clonedState = this.game.cloneState()
            this.game.setState(clonedState)

            let selectedNode = this.selectNode(root)
            //if selected node is terminal and we lost, make sure we never choose that move
            if (this.game.gameOver()) {
                if (this.game.winner() != this.player && this.game.winner() != -1) {
                    selectedNode.parent.wins = Number.MIN_SAFE_INTEGER
                }
            }
            let expandedNode = this.expandNode(selectedNode)
            this.playout(expandedNode)

            let reward;
            if (this.game.winner() == -1) { reward = 0 }
            else if (this.game.winner() == this.player) { reward = 1 }
            else { reward = -1 }
            this.backprop(expandedNode, reward)
        }

        //choose move with most wins
        let maxWins = -Infinity
        let maxIndex = -1
        for (let i in root.children) {
            const child = root.children[i]
            if (child == null) { continue }
            if (child.wins > maxWins) {
                maxWins = child.wins
                maxIndex = i
            }
        }

        this.game.setState(originalState)
        return possibleMoves[maxIndex]
    }
    selectNode(root) {

        const c = this.exploration

        while (root.numUnexpandedMoves == 0) {
            let maxUBC = -Infinity
            let maxIndex = -1
            let Ni = root.visits
            for (let i in root.children) {
                const child = root.children[i]
                const ni = child.visits
                const wi = child.wins
                const ubc = this.computeUCB(wi, ni, c, Ni)
                if (ubc > maxUBC) {
                    maxUBC = ubc
                    maxIndex = i
                }
            }
            const moves = this.game.moves()
            this.game.playMove(moves[maxIndex])

            root = root.children[maxIndex]
            if (this.game.gameOver()) {
                return root
            }
        }
        return root
    }

    expandNode(node) {
        if (this.game.gameOver()) {
            return node
        }
        let moves = this.game.moves()
        const childIndex = this.selectRandomUnexpandedChild(node)
        this.game.playMove(moves[childIndex])

        moves = this.game.moves()
        const newNode = new MCTSNode(moves, node)
        node.children[childIndex] = newNode
        node.numUnexpandedMoves -= 1

        return newNode
    }

    playout(node) {
        while (!this.game.gameOver()) {
            const moves = this.game.moves()
            const randomChoice = Math.floor(Math.random() * moves.length)
            this.game.playMove(moves[randomChoice])
        }
        return this.game.winner()
    }
    backprop(node, reward) {
        while (node != null) {
            node.visits += 1
            node.wins += reward
            node = node.parent
        }
    }

    // returns index of a random unexpanded child of node
    selectRandomUnexpandedChild(node) {
        const choice = Math.floor(Math.random() * node.numUnexpandedMoves) //expand random nth unexpanded node
        let count = -1
        for (let i in node.children) {
            const child = node.children[i]
            if (child == null) {
                count += 1
            }
            if (count == choice) {
                return i
            }
        }
    }

    computeUCB(wi, ni, c, Ni) {
        return (wi / ni) + c * Math.sqrt(Math.log(Ni) / ni)
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
        return this.score
    }

    moveIsExplored(move) {
        return this.exploredMoves.has(move)
    }

    setMoveExplored(move, value = true) {
        this.exploredMoves.set(move, value)
    }

    getBestMove() {
        const possibleMoves = this.getPossibleMoves();

        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of possibleMoves) {
            if (this.moveIsExplored(move)) {
                const clonedState = this.clone();
                clonedState.move(move);
                const score = clonedState.getScore();

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
        }

        return bestMove;
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


const explorationConstant = 1.41;
const iterations = 1000;

let initialGameState = new GameState([
    [2, 4, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]],
    1
);


// while (!initialGameState.isGameOver()) {
//     const mcts = new MCTS(explorationConstant, iterations);
//     const bestMove = mcts.search(initialGameState);
//     console.log("Best move:", bestMove);

//     initialGameState.move(bestMove);
//     // initialGameState.generateRandomTile();
//     initialGameState = initialGameState.clone()
// }
// console.log(initialGameState.gameMatrix);
while (!initialGameState.isGameOver()) {
    let mcts = new MCTS(initialGameState);

    let bestMove = mcts.selectAction(1000);
    console.log("Best move:", bestMove);

    initialGameState.move(bestMove);
    console.log(initialGameState.gameMatrix);
    // initialGameState.generateRandomTile();
    initialGameState = initialGameState.clone()
}
console.log(initialGameState.gameMatrix);


