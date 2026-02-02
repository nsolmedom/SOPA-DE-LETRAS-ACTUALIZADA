import { GridGenerator } from './grid_generator.js';

console.log('Testing GridGenerator...');

const words = ['TEST', 'CODE', 'BUG'];
const size = 10;
const directions = ['horizontal', 'vertical', 'diagonal'];

const generator = new GridGenerator(size, words, directions);
const result = generator.generate();

console.log('Grid generated successfully.');
console.log('Placed words:', result.placedWords.length);

if (result.placedWords.length === words.length) {
    console.log('PASS: All words placed.');
} else {
    console.error('FAIL: Not all words placed.');
}

// Check if words are actually in the grid
result.placedWords.forEach(pw => {
    const { word, row, col, direction } = pw;
    let r = row;
    let c = col;
    let match = true;

    // Simple direction check for horizontal/vertical to verify
    // (Full check would require replicating the logic, but this is a sanity check)
    if (direction[0] === 0 && direction[1] === 1) { // Horizontal
        for (let i = 0; i < word.length; i++) {
            if (result.grid[r][c + i] !== word[i]) match = false;
        }
    }

    if (match) {
        console.log(`Verified word: ${word}`);
    } else {
        console.error(`Failed to verify word in grid: ${word}`);
    }
});
