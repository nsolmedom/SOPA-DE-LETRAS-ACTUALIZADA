class GridGenerator {
    constructor(size, words, directions) {
        this.size = size;
        this.words = words.map(w => w.toUpperCase());
        this.directions = directions;
        this.grid = Array(size).fill(null).map(() => Array(size).fill(''));
        this.placedWords = [];
    }

    generate() {
        // Sort words by length descending to place longest words first (harder to fit)
        const sortedWords = [...this.words].sort((a, b) => b.length - a.length);

        for (const word of sortedWords) {
            if (word.length > this.size) {
                console.warn(`Word "${word}" skipped because it is longer than the grid size (${this.size}).`);
                continue;
            }
            this.placeWord(word);
        }

        this.fillEmptySpaces();
        return {
            grid: this.grid,
            placedWords: this.placedWords
        };
    }

    placeWord(word) {
        let placed = false;
        let attempts = 0;
        const maxAttempts = 100;

        while (!placed && attempts < maxAttempts) {
            const direction = this.getRandomDirection();
            const startPos = this.getRandomStartPosition(word.length, direction);

            if (this.canPlaceWord(word, startPos, direction)) {
                this.insertWord(word, startPos, direction);
                this.placedWords.push({ word, ...startPos, direction }); // Store metadata if needed
                placed = true;
            }
            attempts++;
        }

        if (!placed) {
            console.warn(`Could not place word: ${word}`);
        }
    }

    getRandomDirection() {
        const dir = this.directions[Math.floor(Math.random() * this.directions.length)];
        // Map friendly names to delta coordinates [row, col]
        const dirMap = {
            'horizontal': [0, 1],
            'vertical': [1, 0],
            'diagonal': [1, 1],
            'reverse': [0, -1], // Horizontal reverse
            'diagonal-reverse': [-1, -1] // Diagonal up-left
        };

        // Handle reverse vertical if needed, or simplify 'reverse' to mean any reverse
        // For simplicity, let's expand the map based on the input string
        if (dir === 'reverse') return [0, -1]; // strictly horizontal back

        // If 'reverse' is allowed, we might want vertical reverse too? 
        // For now, let's stick to the map.

        return dirMap[dir] || [0, 1];
    }

    getRandomStartPosition(length, [dRow, dCol]) {
        // Calculate valid range for start position
        const rows = this.size;
        const cols = this.size;

        // If dRow is 1 (down), max start row is size - length
        // If dRow is -1 (up), min start row is length - 1
        // If dRow is 0, any row is fine

        let minRow = 0, maxRow = rows - 1;
        let minCol = 0, maxCol = cols - 1;

        if (dRow === 1) maxRow = rows - length;
        if (dRow === -1) minRow = length - 1;

        if (dCol === 1) maxCol = cols - length;
        if (dCol === -1) minCol = length - 1;

        const row = Math.floor(Math.random() * (maxRow - minRow + 1)) + minRow;
        const col = Math.floor(Math.random() * (maxCol - minCol + 1)) + minCol;

        return { row, col };
    }

    canPlaceWord(word, { row, col }, [dRow, dCol]) {
        for (let i = 0; i < word.length; i++) {
            const r = row + (i * dRow);
            const c = col + (i * dCol);
            const cell = this.grid[r][c];

            // Check if empty or same letter (intersection)
            if (cell !== '' && cell !== word[i]) {
                return false;
            }
        }
        return true;
    }

    insertWord(word, { row, col }, [dRow, dCol]) {
        for (let i = 0; i < word.length; i++) {
            const r = row + (i * dRow);
            const c = col + (i * dCol);
            this.grid[r][c] = word[i];
        }
    }

    fillEmptySpaces() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === '') {
                    this.grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
    }
}
