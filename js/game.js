class Game {
    constructor(levelConfig, onGameUpdate, onGameOver, onSound) {
        this.config = levelConfig;
        this.onGameUpdate = onGameUpdate;
        this.onGameOver = onGameOver;
        this.onSound = onSound || (() => { });

        this.grid = [];
        this.words = [];
        this.foundWords = new Set();
        this.startTime = null;
        this.pausedTime = 0; // Tiempo acumulado mientras está pausado
        this.timerInterval = null;
        this.isSelecting = false;
        this.selectionStart = null;
        this.currentSelection = []; // Array of {row, col}
        this.lastSelectionLength = 0;
    }

    start() {
        const generator = new GridGenerator(
            this.config.gridSize,
            this.config.words,
            this.config.directions
        );
        const { grid, placedWords } = generator.generate();

        this.grid = grid;
        this.words = placedWords.map(w => w.word); // Just the strings for checking
        this.foundWords.clear();

        this.startTime = Date.now();
        this.pausedTime = 0;
        this.startTimer();

        this.onGameUpdate({
            grid: this.grid,
            words: this.words,
            foundWords: Array.from(this.foundWords),
            time: '00:00'
        });
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime - this.pausedTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            this.onGameUpdate({
                time: timeString
            });
        }, 1000);
    }

    pauseTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.pauseStartTime = Date.now();
    }

    resumeTimer() {
        if (this.pauseStartTime) {
            this.pausedTime += Date.now() - this.pauseStartTime;
            this.pauseStartTime = null;
        }
        this.startTimer();
    }

    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    handleInputStart(row, col) {
        this.isSelecting = true;
        this.selectionStart = { row, col };
        this.lastSelectionLength = 0;
        this.updateSelection(row, col);
    }

    handleInputMove(row, col) {
        if (!this.isSelecting) return;
        this.updateSelection(row, col);
    }

    handleInputEnd() {
        if (!this.isSelecting) return;
        this.isSelecting = false;
        this.checkSelection();
        this.currentSelection = [];
        this.onGameUpdate({ selection: [] });
    }

    updateSelection(endRow, endCol) {
        const start = this.selectionStart;
        if (!start) return;

        // Calculate line between start and end
        // Only allow horizontal, vertical, or diagonal lines
        const dRow = endRow - start.row;
        const dCol = endCol - start.col;

        // Check if it's a valid line (slope is 0, Infinity, or 1/-1)
        const isHorizontal = dRow === 0;
        const isVertical = dCol === 0;
        const isDiagonal = Math.abs(dRow) === Math.abs(dCol);

        if (isHorizontal || isVertical || isDiagonal) {
            this.currentSelection = this.getCellsBetween(start, { row: endRow, col: endCol });

            if (this.currentSelection.length > this.lastSelectionLength) {
                this.onSound('select');
            }
            this.lastSelectionLength = this.currentSelection.length;

            this.onGameUpdate({ selection: this.currentSelection });
        }
    }

    getCellsBetween(start, end) {
        const cells = [];
        const dRow = Math.sign(end.row - start.row);
        const dCol = Math.sign(end.col - start.col);

        let r = start.row;
        let c = start.col;

        // Calculate number of steps
        const steps = Math.max(Math.abs(end.row - start.row), Math.abs(end.col - start.col));

        for (let i = 0; i <= steps; i++) {
            cells.push({ row: r, col: c });
            r += dRow;
            c += dCol;
        }
        return cells;
    }

    checkSelection() {
        const selectedWord = this.currentSelection.map(pos => this.grid[pos.row][pos.col]).join('');
        const reversedWord = selectedWord.split('').reverse().join('');

        // Check if word is in list and not already found
        let found = null;
        if (this.words.includes(selectedWord) && !this.foundWords.has(selectedWord)) {
            found = selectedWord;
        } else if (this.words.includes(reversedWord) && !this.foundWords.has(reversedWord)) {
            found = reversedWord;
        }

        if (found) {
            this.onSound('correct');
            this.foundWords.add(found);
            this.onGameUpdate({
                foundWords: Array.from(this.foundWords),
                newFoundCells: this.currentSelection, // Pass cells to highlight permanently
                lastFoundWord: found
            });

            if (this.foundWords.size === this.words.length) {
                this.endGame();
            }
        } else {
            this.onSound('wrong');
        }
    }

    endGame() {
        this.stopTimer();
        const elapsed = Date.now() - this.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.onGameOver(timeString);
    }
}
