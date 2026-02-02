// Imports removed for local compatibility

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    mode: document.getElementById('mode-screen'),
    menu: document.getElementById('menu-screen'),
    levelSelect: document.getElementById('level-screen'),
    aiSetup: document.getElementById('ai-setup-screen'),
    ranking: document.getElementById('ranking-screen'),
    globalRanking: document.getElementById('global-ranking-screen'),
    game: document.getElementById('game-screen')
};

const ui = {
    grid: document.getElementById('word-grid'),
    wordList: document.getElementById('word-list'),
    timeDisplay: document.getElementById('time-display'),
    foundCount: document.getElementById('found-count'),
    totalCount: document.getElementById('total-count'),
    modal: document.getElementById('game-over-modal'),
    finalTime: document.getElementById('final-time'),
    aiCareer: document.getElementById('ai-career'),
    aiTopicGroup: document.getElementById('ai-topic-group'),
    aiTopic: document.getElementById('ai-topic'),
    aiDifficulty: document.getElementById('ai-difficulty'),
    aiLevels: document.getElementById('ai-levels'),
    aiLoading: document.getElementById('ai-loading'),
    levelTitle: document.getElementById('level-title'),
    levelGrid: document.getElementById('level-grid'),
    difficultyGrid: document.getElementById('difficulty-grid'),
    rankingBody: document.getElementById('ranking-body'),
    globalRankingBody: document.getElementById('global-ranking-body'),
    settingsModal: document.getElementById('settings-modal'),
    btnSettings: document.getElementById('btn-settings'),
    btnCloseSettings: document.getElementById('btn-close-settings'),
    toggleTimer: document.getElementById('toggle-timer'),
    toggleMusic: document.getElementById('toggle-music'),
    bgMusic: document.getElementById('bg-music'),
    timerContainer: document.getElementById('timer-container'),
    finalTimeContainer: document.getElementById('final-time-container'),
    modalLevelText: document.getElementById('modal-level-text'),
    btnModalHome: document.getElementById('btn-modal-home'),
    btnModalRestart: document.getElementById('btn-modal-restart'),
    btnModalNext: document.getElementById('btn-modal-next'),
    levelNumberDisplay: document.getElementById('level-number'),
    levelNumberContainer: document.getElementById('level-number-display'),
    factModal: document.getElementById('fact-modal'),
    factWord: document.getElementById('fact-word'),
    factText: document.getElementById('fact-text'),
    btnCloseFact: document.getElementById('btn-close-fact'),
    volumeBg: document.getElementById('volume-bg'),
    volumeSfx: document.getElementById('volume-sfx'),
    toggleFacts: document.getElementById('toggle-facts'),
    topGlobalBody: document.getElementById('top-global-body'),
    topGlobalContainer: document.querySelector('.top-global-container'),
    pauseModal: document.getElementById('pause-modal'),
    btnPause: document.getElementById('btn-pause'),
    btnResume: document.getElementById('btn-resume'),
    btnRestartGame: document.getElementById('btn-restart-game'),
    btnPauseSettings: document.getElementById('btn-pause-settings'),
    btnQuit: document.getElementById('btn-quit')
};

let customSession = {
    active: false,
    career: '',
    topic: '',
    difficulty: '',
    totalLevels: 1,
    currentLevel: 1
};

let currentGame = null;
let currentMode = 'educational'; // 'educational', 'adventure', or 'ranking'
let currentAcademicLevel = 'primaria';
let currentDifficulty = null;
let currentLevelNumber = null;
let currentGamePlayerName = localStorage.getItem('agroletras_user_name') || 'ANON'; // Nombre del jugador actual

// Función global para actualizar la UI de ajustes
function updateSettingsUI() {
    const btnChangeName = document.getElementById('btn-change-name');
    if (btnChangeName) {
        // SIEMPRE ocultar el botón de cambiar nombre según nuevas reglas
        btnChangeName.classList.add('hidden');
    }
}

// Inicializar visibilidad del botón al cargar
window.addEventListener('load', updateSettingsUI);

// Sound Manager
const SoundManager = {
    sounds: {},
    enabled: true,
    volume: 0.5,

    init() {
        const soundFiles = ['click', 'select', 'correct', 'wrong', 'level_complete', 'tic', 'go'];
        soundFiles.forEach(name => {
            this.sounds[name] = new Audio(`assets/sounds/${name}.mp3`);
            this.sounds[name].volume = this.volume;
        });
    },

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });
    },

    play(name) {
        if (!this.enabled || !this.sounds[name]) return;
        // Clone node to allow overlapping sounds (e.g. rapid typing)
        const sound = this.sounds[name].cloneNode();
        sound.volume = this.volume;
        sound.play().catch(e => console.log(`Sound ${name} failed:`, e));
    }
};

SoundManager.init();

let aiProgressInterval = null;
let currentAICache = null;

function showAILoading(isVisible) {
    const modal = document.getElementById('ai-loading-modal');
    const progressBar = document.getElementById('ai-progress-bar');
    if (!modal || !progressBar) return;

    if (isVisible) {
        modal.classList.remove('hidden');
        progressBar.style.width = '0%';

        let progress = 0;
        if (aiProgressInterval) clearInterval(aiProgressInterval);

        // Smooth animation from 0 to 80% over ~2 seconds
        const duration = 2000;
        const interval = 50;
        const step = (80 / (duration / interval));

        aiProgressInterval = setInterval(() => {
            if (progress < 80) {
                progress += step + (Math.random() * 0.5);
                if (progress > 80) progress = 80;
                progressBar.style.width = `${progress}%`;
            }
        }, interval);
    } else {
        if (aiProgressInterval) clearInterval(aiProgressInterval);
        modal.classList.add('hidden');
    }
}

// Responsive Scaling Logic
// Responsive Scaling Logic
function adjustScale() {
    const app = document.getElementById('app');
    if (!app) return;

    const baseWidth = 1300;
    const baseHeight = 800;
    const padding = 20;

    // Use visualViewport if available for better mobile support
    let availableWidth = window.innerWidth;
    let availableHeight = window.innerHeight;

    if (window.visualViewport) {
        availableWidth = window.visualViewport.width;
        availableHeight = window.visualViewport.height;
    }

    const width = availableWidth - padding;
    const height = availableHeight - padding;

    const scaleX = width / baseWidth;
    const scaleY = height / baseHeight;

    // Use the smaller scale to fit entirely
    let scale = Math.min(scaleX, scaleY);

    // Limit max scale to avoid pixelation if desired, or remove to fill large screens
    // scale = Math.min(scale, 1.2); 

    // Apply scale and ensure centering
    app.style.transform = `translate(-50%, -50%) scale(${scale})`;

    // Explicitly set top/left if using visualViewport to handle potential shifts (though fixed css handles most)
    if (window.visualViewport) {
        // On some devices, viewport offset might be needed if not using position: fixed properly
        // But with position: fixed and top: 50% left: 50%, it should stay centered relative to the layout viewport
        // We force a redraw/recalc just in case
        app.style.top = '50%';
        app.style.left = '50%';
    }
}

// Global Event Listeners
window.addEventListener('resize', adjustScale);
window.addEventListener('load', adjustScale);
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', adjustScale);
    window.visualViewport.addEventListener('scroll', adjustScale); // Handle scroll too just in case
}

// Global Click Sound
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        SoundManager.play('click');
    }
});

// Navigation
function showScreen(screenName) {
    Object.values(screens).forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    screens[screenName].classList.remove('hidden');
    screens[screenName].classList.add('active');

    // Hide settings button during gameplay
    if (screenName === 'game') {
        ui.btnSettings.classList.add('hidden');
    } else {
        ui.btnSettings.classList.remove('hidden');
    }
}

// Start Screen
document.getElementById('btn-play').addEventListener('click', () => {
    // Start background music when user clicks Play
    if (settings.musicEnabled && ui.bgMusic.paused) {
        ui.bgMusic.play().catch(e => console.log("Audio play failed:", e));
    }
    showScreen('mode');
});

// Mode Selection
document.querySelectorAll('.btn-mode').forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        // Reset custom session when switching modes
        if (mode !== 'custom') {
            customSession.active = false;
            currentLevelNumber = null;
        }

        if (mode === 'custom') {
            currentMode = 'custom';
            showScreen('aiSetup');
        } else if (mode === 'ranking') {
            currentMode = 'ranking';
            renderRanking();
            showScreen('ranking');
        } else {
            currentMode = mode;
            renderDifficultyMenu();
            showScreen('menu');
        }
    });
});

function renderRanking() {
    updateAllRankingDisplays();
}

function renderGlobalRanking() {
    updateAllRankingDisplays();
}

// Event Listeners for Ranking Actions
document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-full-table') {
        renderGlobalRanking();
        showScreen('globalRanking');
    }

    if (e.target.id === 'btn-challenge') {
        startChallenge();
    }
});

async function runCountdown() {
    const overlay = document.getElementById('countdown-overlay');
    const readyText = document.getElementById('countdown-ready');
    const numberText = document.getElementById('countdown-number');

    if (!overlay || !numberText) return;

    overlay.classList.remove('hidden');
    readyText.classList.remove('hidden');

    const sequence = ['3', '2', '1', '¡Ya!'];

    for (const item of sequence) {
        numberText.textContent = item;

        // Play sound
        if (item === '¡Ya!') {
            SoundManager.play('go');
        } else {
            SoundManager.play('tic');
        }

        // Trigger animation
        numberText.style.animation = 'none';
        numberText.offsetHeight; // trigger reflow
        numberText.style.animation = 'countdownPop 1s ease-out';

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Hide overlay
    overlay.classList.add('hidden');
}

async function startChallenge() {
    // Flujo: Registro -> Cuenta atrás -> Juego
    const recordModal = new RecordModal(async (result) => {
        if (result.action === 'confirm' && result.playerName) {
            currentGamePlayerName = result.playerName;
            localStorage.setItem('agroletras_user_name', currentGamePlayerName);
            // updateSettingsUI(); // Botón oculto permanentemente

            // 1. Iniciar Cuenta Regresiva
            const countdownPromise = runCountdown();

            // 2. Preparar nivel (mientras corre el tiempo)
            const config = getRankedLevelData();

            // 3. Esperar tiempo
            await countdownPromise;

            // 4. Arrancar
            startGame(config, false);
        }
    });

    // Abrir modal de registro
    recordModal.open(null, 'registration', { playerName: '' });
}

function renderTopGlobal() {
    updateAllRankingDisplays();
}

function renderDifficultyMenu() {
    ui.difficultyGrid.innerHTML = '';
    const title = document.querySelector('#menu-screen h2');

    if (currentMode === 'educational') {
        title.textContent = 'Selecciona Nivel Académico';
        const levels = [
            { id: 'primaria', label: 'Primaria' },
            { id: 'secundaria', label: 'Secundaria' },
            { id: 'preparatoria', label: 'Preparatoria' },
            { id: 'universidad', label: 'Universidad' }
        ];

        levels.forEach(lvl => {
            const btn = document.createElement('button');
            btn.className = 'btn-level';
            btn.textContent = lvl.label;
            btn.addEventListener('click', () => {
                currentAcademicLevel = lvl.id;
                renderSubDifficultyMenu();
            });
            ui.difficultyGrid.appendChild(btn);
        });
    } else {
        title.textContent = 'Selecciona Dificultad';
        const difficulties = [
            { id: 'facil', label: 'Fácil' },
            { id: 'medio', label: 'Medio' },
            { id: 'dificil', label: 'Difícil' },
            { id: 'experto', label: 'Experto ' }
        ];

        difficulties.forEach(diff => {
            const btn = document.createElement('button');
            btn.className = 'btn-level';
            btn.textContent = diff.label;
            btn.dataset.level = diff.id;
            btn.addEventListener('click', () => {
                showLevelSelection(diff.id);
            });
            ui.difficultyGrid.appendChild(btn);
        });
    }
}

function renderSubDifficultyMenu() {
    ui.difficultyGrid.innerHTML = '';
    const title = document.querySelector('#menu-screen h2');
    title.textContent = `Dificultad (${currentAcademicLevel})`;

    const difficulties = [
        { id: 'facil', label: 'Fácil (Simples)' },
        { id: 'medio', label: 'Medio (Técnicas)' },
        { id: 'dificil', label: 'Difícil (Avanzadas)' },
        { id: 'experto', label: 'Experto (Científicas)' }
    ];

    difficulties.forEach(diff => {
        const btn = document.createElement('button');
        btn.className = 'btn-level';
        btn.textContent = diff.label;
        btn.addEventListener('click', () => {
            showLevelSelection(diff.id);
        });
        ui.difficultyGrid.appendChild(btn);
    });

    // Add a back button to return to academic levels
    const backBtn = document.createElement('button');
    backBtn.className = 'btn-level btn-back-sub';
    backBtn.textContent = '← Cambiar Nivel Académico';
    backBtn.style.gridColumn = '1 / -1';
    backBtn.addEventListener('click', () => {
        renderDifficultyMenu();
    });
    ui.difficultyGrid.appendChild(backBtn);
}

// Back Buttons
document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => {
        if (screens.mode.classList.contains('active')) {
            showScreen('start');
        } else if (screens.menu.classList.contains('active')) {
            // Reset when going back to mode selection
            customSession.active = false;
            currentLevelNumber = null;
            showScreen('mode');
        } else if (screens.levelSelect.classList.contains('active')) {
            if (customSession.active) {
                showScreen('aiSetup');
            } else {
                showScreen('menu');
            }
        } else if (screens.aiSetup.classList.contains('active')) {
            customSession.active = false;
            showScreen('mode');
        } else if (screens.ranking.classList.contains('active')) {
            showScreen('mode');
        } else if (screens.globalRanking.classList.contains('active')) {
            showScreen('ranking');
        }
    });
});

// Removed old btn-custom-ai listener as it's now in mode selection

// Pause Game Logic
let isPaused = false;
let openedFromPause = false; // Track if settings was opened from pause

ui.btnPause.addEventListener('click', () => {
    if (currentGame) {
        isPaused = true;
        currentGame.pauseTimer();
        ui.pauseModal.classList.remove('hidden');
    }
});

ui.btnResume.addEventListener('click', () => {
    isPaused = false;
    ui.pauseModal.classList.add('hidden');
    if (currentGame) {
        currentGame.resumeTimer();
    }
});

ui.btnRestartGame.addEventListener('click', async () => {
    ui.pauseModal.classList.add('hidden');
    isPaused = false;
    if (currentGame) currentGame.stopTimer();

    const showCountdown = currentMode === 'ranking';

    if (currentMode === 'ranking') {
        // Protocolo de Reinicio Dinámico (Solo Clasificación)
        // 1. Iniciar Cuenta Regresiva Visual
        const countdownPromise = runCountdown();

        // 2. Procesamiento en Paralelo: Generar nueva sopa híbrida
        const config = getRankedLevelData();

        // 3. Esperar a que termine la cuenta atrás ("¡YA!")
        await countdownPromise;

        // 4. Ejecución del Hot-Reset
        startGame(config, false); // false porque ya hicimos el countdown
        return;
    }

    if (currentMode === 'custom') {
        // Instant restart using cache
        if (currentAICache) {
            startGame(currentAICache, showCountdown);
        } else {
            showAILoading(true);
            await generateNextCustomLevel(showCountdown);
        }
    } else {
        const config = getLevelData(currentDifficulty, currentLevelNumber, currentMode, currentAcademicLevel);
        startGame(config, showCountdown);
    }
});

ui.btnPauseSettings.addEventListener('click', () => {
    openedFromPause = true;
    ui.pauseModal.classList.add('hidden');
    ui.settingsModal.classList.remove('hidden');
});

ui.btnQuit.addEventListener('click', () => {
    ui.pauseModal.classList.add('hidden');
    isPaused = false;
    if (currentGame) currentGame.stopTimer();

    // If in custom/AI mode, go back to mode selection and reset
    if (customSession.active) {
        customSession.active = false;
        currentLevelNumber = null;
        showScreen('mode');
    } else if (currentMode === 'ranking') {
        showScreen('ranking');
    } else if (currentDifficulty) {
        showScreen('levelSelect');
    } else {
        showScreen('menu');
    }
});


// AI Career Selection Logic

ui.aiCareer.addEventListener('change', () => {
    if (ui.aiCareer.value === 'Otro') {
        ui.aiTopicGroup.classList.remove('hidden');
    } else {
        ui.aiTopicGroup.classList.add('hidden');
    }
});

document.getElementById('btn-generate').addEventListener('click', async () => {
    const career = ui.aiCareer.value;
    const topic = ui.aiTopic.value.trim();
    const difficulty = ui.aiDifficulty.value;
    const levels = parseInt(ui.aiLevels.value) || 1;

    if (career === 'Otro' && !topic) {
        alert('Por favor escribe un tema.');
        return;
    }

    // Initialize custom session
    customSession = {
        active: true,
        career: career,
        topic: topic,
        difficulty: difficulty,
        totalLevels: Math.min(100, Math.max(1, levels)),
        currentLevel: 1
    };

    showAICustomLevelSelection();
});

function showAICustomLevelSelection() {
    ui.levelTitle.textContent = `Niveles IA: ${customSession.career === 'Otro' ? customSession.topic : customSession.career}`;
    ui.levelGrid.innerHTML = '';

    for (let i = 1; i <= customSession.totalLevels; i++) {
        const btn = document.createElement('button');
        btn.className = 'btn-level-select';
        btn.textContent = i;
        btn.addEventListener('click', async () => {
            customSession.currentLevel = i;
            showAILoading(true);
            await generateNextCustomLevel(currentMode === 'ranking');
        });
        ui.levelGrid.appendChild(btn);
    }

    showScreen('levelSelect');
}

async function generateNextCustomLevel(showCountdown = false) {
    const btnGenerate = document.getElementById('btn-generate');
    if (btnGenerate) btnGenerate.disabled = true;

    const topicContext = customSession.career === 'Otro'
        ? customSession.topic
        : `${customSession.career}: ${customSession.topic}`;

    try {
        // Wait for both the AI response and a minimum timer (2.5s)
        const minTimer = new Promise(resolve => setTimeout(resolve, 2500));
        const [config] = await Promise.all([
            AIService.generateLevel(topicContext, customSession.difficulty),
            minTimer
        ]);

        currentDifficulty = null;
        currentAICache = config; // Save to cache for restarts

        // Merge dynamic facts
        if (config.facts) {
            Object.assign(WORD_FACTS, config.facts);
        }

        // Add session info to config
        config.sessionInfo = {
            current: customSession.currentLevel,
            total: customSession.totalLevels
        };

        // Set progress to 100% quickly
        if (aiProgressInterval) clearInterval(aiProgressInterval);
        const progressBar = document.getElementById('ai-progress-bar');
        if (progressBar) {
            progressBar.style.width = '100%';
        }

        // Delay before starting game
        setTimeout(() => {
            showAILoading(false);
            startGame(config, showCountdown);
        }, 400);

    } catch (error) {
        console.error(error);
        showAILoading(false);
        alert('Error al generar el nivel. Intenta de nuevo.');
    } finally {
        if (btnGenerate) btnGenerate.disabled = false;
    }
}

function showLevelSelection(difficulty) {
    currentDifficulty = difficulty;
    const academicLabel = currentMode === 'educational' ? ` [${currentAcademicLevel}]` : '';
    ui.levelTitle.textContent = `Niveles: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}${academicLabel}`;
    ui.levelGrid.innerHTML = '';

    for (let i = 1; i <= 30; i++) {
        const btn = document.createElement('button');
        btn.className = 'btn-level-select';
        btn.textContent = i;
        btn.addEventListener('click', () => {
            currentLevelNumber = i;
            const config = getLevelData(currentDifficulty, i, currentMode, currentAcademicLevel);
            startGame(config, currentMode === 'ranking');
        });
        ui.levelGrid.appendChild(btn);
    }

    showScreen('levelSelect');
}

// Game Logic Integration
async function startGame(config, showCountdown = false) {
    showScreen('game');
    ui.modal.classList.add('hidden');
    ui.pauseModal.classList.add('hidden');
    isPaused = false;

    // Expert Mode Layout Adjustment
    const appElement = document.getElementById('app');
    if (config.gridSize >= 15) {
        appElement.classList.add('expert-mode');
    } else {
        appElement.classList.remove('expert-mode');
    }

    // Clear previous grid
    ui.grid.innerHTML = '';
    ui.grid.style.gridTemplateColumns = `repeat(${config.gridSize}, 1fr)`;
    // Ensure rows are also explicit to maintain structure
    ui.grid.style.gridTemplateRows = `repeat(${config.gridSize}, 1fr)`;

    // Apply size classes to grid and word-list (only for non-custom modes)
    if (!customSession.active) {
        const sizeClass = `size-${config.gridSize}`;
        let gridClasses = `grid ${sizeClass}`;
        let wordListClasses = `word-list-container ${sizeClass}`;

        // Add ranking-mode class if in ranking mode
        if (currentMode === 'ranking') {
            gridClasses += ' ranking-mode';
            wordListClasses += ' ranking-mode';
        }

        ui.grid.className = gridClasses;
        ui.wordListContainer = document.querySelector('.word-list-container');
        if (ui.wordListContainer) {
            ui.wordListContainer.className = wordListClasses;
        }
    } else {
        // For custom AI mode, don't apply size classes
        ui.grid.className = 'grid';
        ui.wordListContainer = document.querySelector('.word-list-container');
        if (ui.wordListContainer) {
            ui.wordListContainer.className = 'word-list-container';
        }
    }

    // Update level number display
    if (customSession.active) {
        ui.levelNumberDisplay.textContent = customSession.currentLevel;
    } else if (currentLevelNumber) {
        ui.levelNumberDisplay.textContent = currentLevelNumber;
    } else {
        ui.levelNumberDisplay.textContent = '1';
    }

    currentGame = new Game(config, updateUI, handleGameOver, (sound) => SoundManager.play(sound));

    if (showCountdown) {
        await runCountdown();
    }

    currentGame.start();

    // Only show top global table in ranking mode
    if (ui.topGlobalContainer) {
        if (currentMode === 'ranking') {
            ui.topGlobalContainer.style.display = 'flex';
            renderTopGlobal();
        } else {
            ui.topGlobalContainer.style.display = 'none';
        }
    }
}

function updateUI(state) {
    if (state.grid) {
        renderGrid(state.grid);
    }

    if (state.words) {
        renderWordList(state.words, state.foundWords);
        ui.totalCount.textContent = state.words.length;
    }

    if (state.foundWords) {
        ui.foundCount.textContent = state.foundWords.length;
        updateWordList(state.foundWords);
    }

    if (state.time) {
        ui.timeDisplay.textContent = state.time;
    }

    if (state.selection) {
        highlightSelection(state.selection);
    }

    if (state.newFoundCells) {
        markFoundCells(state.newFoundCells);
    }

    if (state.lastFoundWord) {
        showFact(state.lastFoundWord);
    }
}

function showFact(word) {
    if (!settings.showFacts) return;

    // 1. Buscar en el diccionario estático o en los cargados por la IA
    let fact = WORD_FACTS[word] || WORD_FACTS[word.toUpperCase()];

    // 2. Fallback de emergencia si no existe el dato
    if (!fact) {
        console.warn(`Falta dato curioso para: ${word}`);
        // Datos genéricos según el contexto agrícola si falta el específico
        const genericFacts = [
            "Es un elemento fundamental en el ecosistema agrícola.",
            "Juega un papel vital en la producción de alimentos.",
            "Su manejo adecuado es clave para la agricultura sostenible.",
            "Es un término esencial que todo agrónomo debe conocer."
        ];
        fact = genericFacts[Math.floor(Math.random() * genericFacts.length)];
    }

    // 3. Mostrar Modal
    ui.factWord.textContent = word.replace(/_/g, ' ');
    ui.factText.textContent = fact;
    ui.factModal.classList.remove('hidden');
}

function renderGrid(grid) {
    ui.grid.innerHTML = '';
    grid.forEach((row, rIndex) => {
        row.forEach((cell, cIndex) => {
            const div = document.createElement('div');
            div.className = 'cell';
            div.dataset.row = rIndex;
            div.dataset.col = cIndex;
            div.textContent = cell;

            // Mouse events
            div.addEventListener('mousedown', () => currentGame.handleInputStart(rIndex, cIndex));
            div.addEventListener('mouseenter', () => currentGame.handleInputMove(rIndex, cIndex));

            // Touch events
            div.addEventListener('touchstart', (e) => {
                e.preventDefault();
                currentGame.handleInputStart(rIndex, cIndex);
            }, { passive: false });

            ui.grid.appendChild(div);
        });
    });

    // Global touchmove to handle dragging across cells
    ui.grid.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element.classList.contains('cell')) {
            const r = parseInt(element.dataset.row);
            const c = parseInt(element.dataset.col);
            currentGame.handleInputMove(r, c);
        }
    }, { passive: false });

    // Global end listeners
    document.addEventListener('mouseup', () => currentGame.handleInputEnd());
    document.addEventListener('touchend', () => currentGame.handleInputEnd());
}

function renderWordList(words, foundWords) {
    ui.wordList.innerHTML = '';
    words.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        li.dataset.word = word;
        if (foundWords && foundWords.includes(word)) {
            li.classList.add('found');
        }
        ui.wordList.appendChild(li);
    });
}

function updateWordList(foundWords) {
    document.querySelectorAll('#word-list li').forEach(li => {
        if (foundWords.includes(li.dataset.word)) {
            li.classList.add('found');
        }
    });
}

function highlightSelection(selection) {
    document.querySelectorAll('.cell.selected').forEach(el => el.classList.remove('selected'));
    selection.forEach(pos => {
        const cell = document.querySelector(`.cell[data-row="${pos.row}"][data-col="${pos.col}"]`);
        if (cell) cell.classList.add('selected');
    });
}

function markFoundCells(cells) {
    cells.forEach(pos => {
        const cell = document.querySelector(`.cell[data-row="${pos.row}"][data-col="${pos.col}"]`);
        if (cell) cell.classList.add('found');
    });
}

// Settings Logic
let settings = {
    showTimer: true,
    musicEnabled: true,
    bgVolume: 0.5,
    sfxVolume: 0.5,
    sfxEnabled: true,
    showFacts: true
};

// Load settings
const savedSettings = localStorage.getItem('agroletras_settings');
if (savedSettings) {
    settings = JSON.parse(savedSettings);
    ui.toggleTimer.checked = settings.showTimer;
    ui.toggleMusic.checked = settings.musicEnabled;

    // New settings defaults if not present
    if (settings.bgVolume === undefined) settings.bgVolume = 0.5;
    if (settings.sfxVolume === undefined) settings.sfxVolume = 0.5;
    if (settings.sfxEnabled === undefined) settings.sfxEnabled = true;
    if (settings.showFacts === undefined) settings.showFacts = true;

    ui.volumeBg.value = settings.bgVolume;
    ui.volumeSfx.value = settings.sfxVolume;
    ui.toggleFacts.checked = settings.showFacts;

    const toggleSfxEl = document.getElementById('toggle-sfx');
    if (toggleSfxEl) toggleSfxEl.checked = settings.sfxEnabled;

    updateSliderBackground(ui.volumeBg);
    updateSliderBackground(ui.volumeSfx);

    // Show/hide volume sliders based on initial toggle states
    if (!settings.musicEnabled) {
        ui.volumeBg.classList.add('hidden');
    }
    if (!settings.sfxEnabled) {
        ui.volumeSfx.classList.add('hidden');
    }

    applySettings();
} else {
    applySettings();
}

function applySettings() {
    if (settings.showTimer) {
        ui.timerContainer.classList.remove('hidden');
        ui.finalTimeContainer.classList.remove('hidden');
    } else {
        ui.timerContainer.classList.add('hidden');
        ui.finalTimeContainer.classList.add('hidden');
    }

    ui.bgMusic.volume = settings.bgVolume;
    SoundManager.setVolume(settings.sfxVolume);
    SoundManager.enabled = settings.sfxEnabled;

    if (settings.musicEnabled) {
        ui.bgMusic.play().catch(e => console.log("Audio play failed (user interaction needed):", e));
    } else {
        ui.bgMusic.pause();
    }
}

ui.btnSettings.addEventListener('click', () => {
    ui.settingsModal.classList.remove('hidden');
});

ui.btnCloseSettings.addEventListener('click', () => {
    ui.settingsModal.classList.add('hidden');
    // If settings was opened from pause, reopen the pause modal
    if (openedFromPause) {
        openedFromPause = false;
        ui.pauseModal.classList.remove('hidden');
    }
});

// Lógica para el botón "Cambiar nombre"
const btnChangeName = document.getElementById('btn-change-name');
if (btnChangeName) {
    btnChangeName.addEventListener('click', () => {
        ui.settingsModal.classList.add('hidden'); // Cerrar ajustes

        const recordModal = new RecordModal((result) => {
            if (result.action === 'confirm' && result.playerName) {
                currentGamePlayerName = result.playerName;
                localStorage.setItem('agroletras_user_name', currentGamePlayerName);
                updateSettingsUI();
            }

            // Si veníamos de pausa, volver a pausa, si no, volver a ajustes
            if (openedFromPause) {
                ui.pauseModal.classList.remove('hidden');
            } else {
                ui.settingsModal.classList.remove('hidden');
            }
        });

        recordModal.open(null, 'registration', { playerName: currentGamePlayerName });
    });
}

ui.toggleTimer.addEventListener('change', () => {
    settings.showTimer = ui.toggleTimer.checked;
    saveSettings();
    applySettings();
});

ui.toggleMusic.addEventListener('change', () => {
    settings.musicEnabled = ui.toggleMusic.checked;
    // Show/hide volume slider based on toggle state
    if (settings.musicEnabled) {
        ui.volumeBg.classList.remove('hidden');
    } else {
        ui.volumeBg.classList.add('hidden');
    }
    saveSettings();
    applySettings();
});

// Get the toggle-sfx element
const toggleSfx = document.getElementById('toggle-sfx');
if (toggleSfx) {
    toggleSfx.addEventListener('change', () => {
        settings.sfxEnabled = toggleSfx.checked;
        // Show/hide volume slider based on toggle state
        if (settings.sfxEnabled) {
            ui.volumeSfx.classList.remove('hidden');
        } else {
            ui.volumeSfx.classList.add('hidden');
        }
        saveSettings();
        applySettings();
    });
}

ui.volumeBg.addEventListener('input', () => {
    settings.bgVolume = parseFloat(ui.volumeBg.value);
    updateSliderBackground(ui.volumeBg);
    saveSettings();
    applySettings();
});

ui.volumeSfx.addEventListener('input', () => {
    settings.sfxVolume = parseFloat(ui.volumeSfx.value);
    updateSliderBackground(ui.volumeSfx);
    saveSettings();
    applySettings();
});

function updateSliderBackground(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    // Color #56ab2f for the filled part (green)
    slider.style.background = `linear-gradient(to right, #56ab2f 0%, #56ab2f ${value}%, #5d3a1a ${value}%, #5d3a1a 100%)`;
}

ui.toggleFacts.addEventListener('change', () => {
    settings.showFacts = ui.toggleFacts.checked;
    saveSettings();
});

function saveSettings() {
    localStorage.setItem('agroletras_settings', JSON.stringify(settings));
}

// Music is now started when user clicks "JUGAR" button

window.addEventListener('click', (e) => {
    if (e.target === ui.settingsModal) {
    }
    if (e.target === ui.factModal) {
        ui.factModal.classList.add('hidden');
    }
});

ui.btnCloseFact.addEventListener('click', () => {
    ui.factModal.classList.add('hidden');
});

async function handleGameOver(finalTime) {
    // MODO CLASIFICACIÓN: Verificar récord ANTES de mostrar cualquier modal
    // MODO CLASIFICACIÓN: Verificar récord ANTES de mostrar cualquier modal
    // MODO CLASIFICACIÓN: Mostrar siempre el modal de resultados
    if (currentMode === 'ranking') {
        let serverRank = null;
        let replacedPlayer = null;

        const recordCheck = recordSystem.checkRecord(finalTime);

        if (recordCheck.isRecord) {
            replacedPlayer = recordCheck.replacedPlayer;
            serverRank = await recordSystem.addRecord(currentGamePlayerName, finalTime);
            updateAllRankingDisplays();
            SoundManager.play('level_complete');
        }

        const showRankingResults = (time, actualRank, replaced) => {
            const currentCheck = actualRank
                ? { isRecord: true, position: actualRank, replacedPlayer: replaced }
                : recordSystem.checkRecord(time);

            const recordModal = new RecordModal((result) => {
                if (result.action === 'replay') {
                    // Acción "Jugar de Nuevo" -> SIEMPRE abre Registro (Nueva Identidad)
                    const regModal = new RecordModal(async (regResult) => {
                        if (regResult.action === 'confirm' && regResult.playerName) {
                            // Actualizar nombre global (aunque sea una nueva entidad para este run)
                            currentGamePlayerName = regResult.playerName;
                            localStorage.setItem('agroletras_user_name', currentGamePlayerName);
                            // updateSettingsUI(); // Ya no mostramos el botón de cambiar nombre

                            // 1. Iniciar Cuenta Regresiva Visual
                            const countdownPromise = runCountdown();

                            // 2. Preparar el Nivel en "Segundo Plano" (mientras corre la cuenta atrás)
                            const nextConfig = getRankedLevelData();

                            // 3. Esperar a que termine la cuenta atrás
                            await countdownPromise;

                            // 4. Iniciar Juego ("¡YA!")
                            startGame(nextConfig, false); // false porque ya hicimos el countdown manual
                        } else {
                            // Si cancela, volver a mostrar resultados CON LOS PARÁMETROS ORIGINALES
                            showRankingResults(time, actualRank, replaced);
                        }
                    });
                    // Abrir siempre limpio para nuevo registro
                    regModal.open(null, 'registration', { playerName: '' });
                } else if (result.action === 'table') {
                    showScreen('globalRanking');
                } else if (result.action === 'exit') {
                    showScreen('ranking');
                }
            });

            recordModal.open(currentCheck, 'results_only', {
                playerName: currentGamePlayerName,
                finalTime: time
            });
        };

        showRankingResults(finalTime, serverRank, replacedPlayer);
        return; // No mostrar el modal normal
    }

    // RESTO DE MODOS: Modal normal
    if (ui.modal) {
        ui.modal.classList.remove('hidden');
        SoundManager.play('level_complete');
    } else {
        console.error("Modal element not found");
        alert("¡Nivel Completado! Tiempo: " + finalTime);
        return;
    }

    try {
        if (ui.finalTime) ui.finalTime.textContent = finalTime;
        applySettings();

        if (ui.modalLevelText) {
            if (customSession.active) {
                ui.modalLevelText.textContent = `NIVEL ${customSession.currentLevel}`;
            } else if (currentLevelNumber) {
                ui.modalLevelText.textContent = `NIVEL ${currentLevelNumber}`;
            } else {
                ui.modalLevelText.textContent = "COMPLETADO";
            }
        }

        if (ui.btnModalHome) {
            ui.btnModalHome.onclick = () => {
                ui.modal.classList.add('hidden');
                showScreen('mode');
            };
        }

        if (ui.btnModalRestart) {
            ui.btnModalRestart.onclick = async () => {
                ui.modal.classList.add('hidden');
                const showCountdown = currentMode === 'ranking';
                if (customSession.active && currentAICache) {
                    // Instant restart for custom levels
                    startGame(currentAICache, showCountdown);
                } else if (customSession.active) {
                    showAILoading(true);
                    await generateNextCustomLevel(showCountdown);
                } else {
                    const config = getLevelData(currentDifficulty, currentLevelNumber, currentMode, currentAcademicLevel);
                    startGame(config, showCountdown);
                }
            };
        }

        const hasNextLevel = customSession.active
            ? customSession.currentLevel < customSession.totalLevels
            : currentLevelNumber < 30;

        if (ui.btnModalNext) {
            if (hasNextLevel) {
                ui.btnModalNext.classList.remove('hidden');
                ui.btnModalNext.onclick = async () => {
                    ui.modal.classList.add('hidden');
                    const showCountdown = currentMode === 'ranking';
                    if (customSession.active) {
                        customSession.currentLevel++;
                        showAILoading(true); // Always show loading for "Next" in custom mode
                        await generateNextCustomLevel(showCountdown);
                    } else {
                        currentLevelNumber++;
                        const config = getLevelData(currentDifficulty, currentLevelNumber, currentMode, currentAcademicLevel);
                        startGame(config, showCountdown);
                    }
                };
            } else {
                ui.btnModalNext.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error("Error in handleGameOver:", error);
    }
}

let currentRankingPage = 1;

// Función para actualizar todas las visualizaciones de ranking
function updateAllRankingDisplays() {
    // Actualizar Top 3 en pantalla de ranking
    const top3 = recordSystem.getTop3();
    const top3Container = document.getElementById('top-3-container');
    if (top3Container) {
        top3Container.innerHTML = '';
        top3.forEach((player, index) => {
            const card = document.createElement('div');
            card.className = `top-3-card pos-${index + 1}`;
            const medal = index === 0 ? '🥇' : (index === 1 ? '🥈' : '🥉');
            card.innerHTML = `
                <div class="medal">${medal}</div>
                <div class="name">${player.name}</div>
                <div class="time">${player.time}</div>
            `;
            top3Container.appendChild(card);
        });
    }

    // Actualizar Top 5 en el juego
    const top5 = recordSystem.getTop5();
    if (ui.topGlobalBody) {
        ui.topGlobalBody.innerHTML = '';
        top5.forEach((player, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${player.name}</td>
                <td>${player.time}</td>
            `;
            ui.topGlobalBody.appendChild(tr);
        });
    }

    // Actualizar Top 20 completo (Redesign de Global Ranking Screen con Paginación Dinámica)
    const top20 = recordSystem.getTop20();
    const globalPodium = document.getElementById('global-podium');
    const globalRankingList = document.getElementById('global-ranking-list');
    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');

    if (globalPodium && globalRankingList) {
        globalPodium.innerHTML = '';
        globalRankingList.innerHTML = '';

        const itemsPerPage = 5;
        const totalPages = Math.ceil(top20.length / itemsPerPage);

        if (currentRankingPage === 1) {
            // Page 1: Top 5 (1-3 in Podium, 4-5 in List)
            globalPodium.classList.remove('hidden');
            globalRankingList.classList.remove('extended-view');

            top20.slice(0, 5).forEach((player, index) => {
                const rank = index + 1;
                if (rank <= 3) {
                    const step = document.createElement('div');
                    step.className = `podium-step rank-${rank}`;
                    const medal = rank === 1 ? '🥇' : (rank === 2 ? '🥈' : '🥉');
                    step.innerHTML = `
                        <div class="medal">${medal}</div>
                        <div class="name">${player.name}</div>
                        <div class="time">${player.time}</div>
                    `;
                    globalPodium.appendChild(step);
                } else {
                    const row = document.createElement('div');
                    row.className = 'ranking-row';
                    row.innerHTML = `
                        <div class="pos">${rank}</div>
                        <div class="player-name">${player.name}</div>
                        <div class="time">${player.time}</div>
                    `;
                    globalRankingList.appendChild(row);
                }
            });

            if (btnPrev) btnPrev.classList.add('hidden');
            if (btnNext) {
                if (totalPages > 1) {
                    btnNext.classList.remove('hidden');
                    btnNext.style.display = 'flex';
                } else {
                    btnNext.classList.add('hidden');
                    btnNext.style.display = 'none';
                }
            }

        } else {
            // Pages 2-4: Extended View (List Only)
            globalPodium.classList.add('hidden');
            globalRankingList.classList.add('extended-view');

            const startIdx = (currentRankingPage - 1) * itemsPerPage;
            const endIdx = startIdx + itemsPerPage;
            const pageItems = top20.slice(startIdx, endIdx);

            pageItems.forEach((player, index) => {
                const rank = startIdx + index + 1;
                const row = document.createElement('div');
                row.className = 'ranking-row';
                row.innerHTML = `
                    <div class="pos">${rank}</div>
                    <div class="player-name">${player.name}</div>
                    <div class="time">${player.time}</div>
                `;
                globalRankingList.appendChild(row);
            });

            if (btnPrev) {
                btnPrev.classList.remove('hidden');
                btnPrev.style.display = 'flex';
            }
            if (btnNext) {
                if (currentRankingPage < totalPages) {
                    btnNext.classList.remove('hidden');
                    btnNext.style.display = 'flex';
                } else {
                    btnNext.classList.add('hidden');
                    btnNext.style.display = 'none';
                }
            }
        }
    }
}

// Event Listeners para Navegación de Ranking
document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-next-page') {
        currentRankingPage++;
        updateAllRankingDisplays();
    }
    if (e.target.id === 'btn-prev-page') {
        currentRankingPage--;
        if (currentRankingPage < 1) currentRankingPage = 1;
        updateAllRankingDisplays();
    }
});

// Llamada inicial para asegurar visibilidad correcta al cargar
updateSettingsUI();

// Cargar récords globales al inicio
recordSystem.loadRecords().then(() => {
    updateAllRankingDisplays();
});

// TAREA 2: Dev Mode Tools
function initDevTools() {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal) return;

    console.log('Dev Mode Activado');

    const devPanel = document.createElement('div');
    devPanel.style.position = 'fixed';
    devPanel.style.bottom = '10px';
    devPanel.style.right = '10px';
    devPanel.style.zIndex = '9999';
    devPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    devPanel.style.padding = '10px';
    devPanel.style.borderRadius = '8px';
    devPanel.style.display = 'flex';
    devPanel.style.flexDirection = 'column';
    devPanel.style.gap = '5px';
    devPanel.style.color = 'white';
    devPanel.style.fontFamily = 'monospace';
    devPanel.style.fontSize = '12px';

    const title = document.createElement('div');
    title.textContent = '🛠️ Dev Tools';
    title.style.marginBottom = '5px';
    title.style.textAlign = 'center';
    title.style.fontWeight = 'bold';
    devPanel.appendChild(title);

    const createBtn = (text, onClick) => {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cursor = 'pointer';
        btn.style.padding = '5px';
        btn.style.backgroundColor = '#444';
        btn.style.border = '1px solid #666';
        btn.style.color = 'white';
        btn.style.borderRadius = '4px';
        btn.onclick = onClick;
        return btn;
    };

    // 1. Force Win
    devPanel.appendChild(createBtn('🏆 Force Win', () => {
        if (currentGame) {
            // Simular encontrar todas las palabras
            const remaining = currentGame.words.filter(w => !currentGame.foundWords.includes(w));
            remaining.forEach(w => currentGame.handleWordFound(w));
            // El juego debería detectar la victoria automáticamente al encontrar la última
        } else {
            alert('Inicia un juego primero');
        }
    }));

    // 2. Test Record (Beat Player)
    devPanel.appendChild(createBtn('🥇 Test: Beat Player', () => {
        const mockRecordModal = new RecordModal(() => { });
        mockRecordModal.open({
            isRecord: true,
            position: 1,
            replacedPlayer: { name: 'CPU_TEST' }
        }, 'results_only', { finalTime: '00:45', playerName: 'DEV_USER' });
    }));

    // 3. Test Record (New Slot)
    devPanel.appendChild(createBtn('✨ Test: New Slot', () => {
        const mockRecordModal = new RecordModal(() => { });
        mockRecordModal.open({
            isRecord: true,
            position: 2,
            replacedPlayer: null
        }, 'results_only', { finalTime: '01:20', playerName: 'DEV_USER' });
    }));

    // 4. Reset
    devPanel.appendChild(createBtn('🔄 Reset', () => {
        window.location.reload();
    }));

    document.body.appendChild(devPanel);
}

// Iniciar herramientas de desarrollo
initDevTools();
