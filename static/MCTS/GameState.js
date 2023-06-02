export default class GameState {
    #numRows = 4;
    #numCols = 4;
    #score;
    #gameMatrix;
    #exploredMoves;

    constructor(gameMatrix, score) {
        this.#gameMatrix = gameMatrix.map(row => [...row]);
        this.#score = score;
        this.#exploredMoves = new Map();
    }

    clone() {
        const clonedState = new GameState(this.#gameMatrix, this.#score);
        return clonedState;
    }

    generateRandomTile() {
        const emptyCells = [];

        for (let row = 0; row < this.#numRows; row++) {
            for (let col = 0; col < this.#numCols; col++) {
                if (this.#gameMatrix[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.#gameMatrix[randomCell.row][randomCell.col] = Math.random() < 0.5 ? 2 : 4;
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

        this.#moveTiles(rowStep, colStep);
        this.generateRandomTile();
    }

    #moveTiles(rowStep, colStep) {
        const startRow = rowStep > 0 ? this.#numRows - 1 : 0;
        const startCol = colStep > 0 ? this.#numCols - 1 : 0;
        const rowIncrement = rowStep > 0 ? - 1 : 1;
        const colIncrement = colStep > 0 ? - 1 : 1;

        const merged = new Map();


        for (let row = startRow; row >= 0 && row < this.#numRows; row += rowIncrement) {
            for (let col = startCol; col >= 0 && col < this.#numCols; col += colIncrement) {
                const tileValue = this.#gameMatrix[row][col];
                if (tileValue === 0) continue;

                let targetRow = row;
                let targetCol = col;

                while (this.#isValidPosition(targetRow + rowStep, targetCol + colStep)) {
                    targetRow += rowStep;
                    targetCol += colStep;
                    const targetTileValue = this.#gameMatrix[targetRow][targetCol];

                    if (targetTileValue === 0) {
                        // Move tile to empty cell
                        this.#gameMatrix[targetRow][targetCol] = tileValue;
                        this.#gameMatrix[row][col] = 0;
                        row = targetRow;
                        col = targetCol;
                    }
                    else if (targetTileValue === tileValue && !merged.get([targetRow, targetCol].toString())) {
                        // Merge tiles
                        merged.set([targetRow, targetCol].toString(), true);

                        this.#gameMatrix[targetRow][targetCol] *= 2;
                        this.#score += this.#gameMatrix[targetRow][targetCol];
                        this.#gameMatrix[row][col] = 0;
                        break;
                    }
                    else {
                        // Stop moving tiles
                        break;
                    }
                }

            }
        }
    }


    #isValidPosition(row, col) {
        return row >= 0 && row < this.#numRows && col >= 0 && col < this.#numCols;
    }

    getPossibleMoves() {
        const possibleMoves = [];
        if (this.#canMove(-1, 0)) {
            possibleMoves.push('up');
        }
        if (this.#canMove(1, 0)) {
            possibleMoves.push('down');
        }
        if (this.#canMove(0, -1)) {
            possibleMoves.push('left');
        }
        if (this.#canMove(0, 1)) {
            possibleMoves.push('right');
        }
        return possibleMoves;
    }

    #canMove(rowStep, colStep) {
        return this.#gameMatrix.some((row, rowIndex) =>
            row.some((tile, colIndex) => {
                if (tile === 0) return false;
                if (this.#isValidPosition(rowIndex + rowStep, colIndex + colStep) &&
                    (this.#gameMatrix[rowIndex + rowStep][colIndex + colStep] === 0 || this.#gameMatrix[rowIndex + rowStep][colIndex + colStep] === tile)) {
                    return true;
                }

            })
        );
    }

    isGameOver() {
        return (
            !this.#canMove(-1, 0) &&
            !this.#canMove(1, 0) &&
            !this.#canMove(0, -1) &&
            !this.#canMove(0, 1)
        )
    }

    getScore() {
        return this.#score
    }

    moveIsExplored(move) {
        return this.#exploredMoves.has(move)
    }

    setMoveExplored(move, value = true) {
        this.#exploredMoves.set(move, value)
    }
}