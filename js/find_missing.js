
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.js');
const factsPath = path.join(__dirname, 'word_facts.js');

const dataContent = fs.readFileSync(dataPath, 'utf8');
const factsContent = fs.readFileSync(factsPath, 'utf8');

// Extract words from data.js
const wordRegex = /'([A-Z_]+)'/g;
const allWords = new Set();
let match;
while ((match = wordRegex.exec(dataContent)) !== null) {
    if (match[1].length > 1) { // Avoid single letters if any
        allWords.add(match[1]);
    }
}

// Extract keys from word_facts.js
const factKeys = new Set();
// Simple regex to find keys in the object
const factRegex = /'([A-Z_]+)':/g;
while ((match = factRegex.exec(factsContent)) !== null) {
    factKeys.add(match[1]);
}

const missing = [];
for (const word of allWords) {
    if (!factKeys.has(word)) {
        missing.push(word);
    }
}

console.log('Missing words:', missing);
