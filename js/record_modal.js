// Modal de Récord - Estilo Arcade
class RecordModal {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.currentSlot = 0;
        this.maxSlots = 6;
        this.letters = [];
        this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        this.recordInfo = null;
        this.modalElement = null;
        this.isOpen = false;
        this.mode = 'record'; // 'record', 'registration', 'celebration', 'results_only'
        this.finalTime = null;
        this.playerName = '';

        // Teclado
        document.addEventListener('keydown', this.handleKeyPress);
    }

    open(recordInfo, mode = 'record', extra = {}) {
        this.recordInfo = recordInfo;
        this.mode = mode;
        this.currentSlot = extra.playerName ? extra.playerName.length - 1 : 0;
        if (this.currentSlot < 0) this.currentSlot = 0;

        this.letters = extra.playerName ? extra.playerName.split('') : ['A'];
        this.playerName = extra.playerName || '';
        this.finalTime = extra.finalTime || null;
        this.isOpen = true;
        this.render();
        this.attachEventListeners();
    }

    close() {
        if (this.modalElement) {
            this.modalElement.remove();
            this.modalElement = null;
        }
        this.isOpen = false;
    }

    render() {
        // Crear modal
        const modal = document.createElement('div');
        modal.id = 'record-modal';
        modal.className = 'modal';
        modal.style.display = 'flex';

        const isRegistration = this.mode === 'registration';
        const isCelebration = this.mode === 'celebration';
        const isResultsOnly = this.mode === 'results_only';

        let title = '¡FELICIDADES!';
        let subtitle = 'Has batido un récord';
        let description = '';

        if (isRegistration) {
            title = 'REGISTRO';
            subtitle = 'Escriba un nombre de usuario';
            description = 'Este nombre aparecerá en la tabla de clasificación al batir récords';
        } else if (isCelebration) {
            title = '¡FELICIDADES!';
            subtitle = 'NUEVO RÉCORD';
        } else if (isResultsOnly) {
            const isRecord = this.recordInfo && this.recordInfo.isRecord;
            if (isRecord) {
                // TAREA 1: Mostrar posición explícita en el título
                title = `¡POSICIÓN #${this.recordInfo.position}!`;

                // TAREA 1: Mensaje diferenciado
                if (this.recordInfo.replacedPlayer) {
                    subtitle = `¡Has superado el récord de ${this.recordInfo.replacedPlayer.name} en la posición #${this.recordInfo.position}!`;
                } else {
                    subtitle = `¡Nuevo récord en la posición #${this.recordInfo.position}!`;
                }
            } else {
                title = 'FIN DE PARTIDA';
                subtitle = '¡Buen intento!';
            }
        }

        modal.innerHTML = `
            <div class="modal-content record-modal-content">
                <!-- Banner Superior -->
                <div class="record-banner">
                    <h2 class="record-title">${title}</h2>
                    <p class="record-subtitle">${subtitle}</p>
                    ${description ? `<p class="record-description" style="font-size: 0.9rem; margin-top: 5px; opacity: 0.8;">${description}</p>` : ''}
                </div>

                <!-- Selector de Letras o Información Estática -->
                ${(isCelebration || isResultsOnly) ? `
                    <div class="player-stats-highlight">
                        <p>Jugador: <span class="stat-value">${this.playerName}</span></p>
                        <p>Tiempo: <span class="stat-value">${this.finalTime}</span></p>
                        ${this.recordInfo && this.recordInfo.isRecord ? `
                            <p class="ranking-pos">🏆 ¡Posición #${this.recordInfo.position} en el Ranking!</p>
                        ` : ''}
                    </div>
                ` : `
                    <div class="letter-selector-container">
                        <div id="letter-slots" class="letter-slots">
                            ${this.renderLetterSlots()}
                        </div>
                        
                        <div class="arrow-controls-row">
                            <button id="arrow-left" class="arrow-btn arrow-left" title="Borrar letra">◀</button>
                            <button id="arrow-up" class="arrow-btn arrow-up" title="Letra siguiente">▲</button>
                            <button id="arrow-down" class="arrow-btn arrow-down" title="Letra anterior">▼</button>
                            <button id="arrow-right" class="arrow-btn arrow-right" title="Confirmar letra">▶</button>
                        </div>
                    </div>
                `}

                <!-- Información del Récord Batido -->
                ${(!isRegistration && this.recordInfo) ? `
                <div class="record-info">
                    <div class="replaced-info">
                        ${this.renderReplacedInfo()}
                    </div>
                </div>
                ` : ''}

                <!-- Botones de Acción -->
                <div class="record-actions">
                    ${isRegistration ? `
                        <div class="registration-buttons-container">
                            <button id="btn-record-confirm" class="btn-record-action confirm-btn">
                                <span>CONFIRMAR</span>
                            </button>
                            <button id="btn-record-cancel" class="btn-record-action cancel-btn">
                                <span>CANCELAR</span>
                            </button>
                        </div>
                    ` : `
                        <button id="btn-record-replay" class="btn-record-action">
                            <svg viewBox="0 0 24 24" class="btn-icon">
                                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm-6 8c0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v-3l4 4-4 4v-3c-3.31 0-6-2.69-6-6z"/>
                            </svg>
                            <span>Jugar de nuevo</span>
                        </button>
                        <button id="btn-record-table" class="btn-record-action">
                            <svg viewBox="0 0 24 24" class="btn-icon">
                                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                            </svg>
                            <span>Ver tabla</span>
                        </button>
                        <button id="btn-record-exit" class="btn-record-action">
                            <svg viewBox="0 0 24 24" class="btn-icon">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                            <span>Salir</span>
                        </button>
                    `}
                </div>
            </div>
        `;

        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.appendChild(modal);
        } else {
            document.body.appendChild(modal);
        }
        this.modalElement = modal;
    }

    renderLetterSlots() {
        let html = '';

        // Mostrar solo las ranuras hasta la posición actual + 1
        for (let i = 0; i <= this.currentSlot && i < this.maxSlots; i++) {
            const letter = this.letters[i] || 'A';
            const isActive = i === this.currentSlot;
            html += `
                <div class="letter-slot ${isActive ? 'active' : ''}" data-index="${i}">
                    <span class="letter-display">${letter}</span>
                </div>
            `;
        }

        return html;
    }

    renderReplacedInfo() {
        if (!this.recordInfo) return '';

        if (this.recordInfo.isRecord) {
            if (this.recordInfo.replacedPlayer) {
                const replaced = this.recordInfo.replacedPlayer;
                return `
                    <p class="replaced-text">¡Has superado el récord de:</p>
                    <p class="replaced-player">${replaced.name}</p>
                    <p class="replaced-position">en la posición #${this.recordInfo.position}!</p>
                `;
            } else {
                return `
                    <p class="new-record-text">🎉 ¡Nuevo récord en el puesto #${this.recordInfo.position}!</p>
                `;
            }
        } else {
            // No es récord - Mensaje motivador
            return `
                <p class="replaced-text">¡Sigue intentándolo!</p>
                <p class="replaced-position" style="font-size: 0.9rem; margin-top: 5px;">Te faltó poco para entrar al ranking</p>
            `;
        }
    }

    attachEventListeners() {
        // Flechas (solo si no es celebración o resultados estáticos)
        const isStatic = this.mode === 'celebration' || this.mode === 'results_only';
        if (!isStatic) {
            document.getElementById('arrow-up')?.addEventListener('click', () => this.nextLetter());
            document.getElementById('arrow-down')?.addEventListener('click', () => this.prevLetter());
            document.getElementById('arrow-right')?.addEventListener('click', () => this.confirmLetter());
            document.getElementById('arrow-left')?.addEventListener('click', () => this.deleteLetter());
        }

        // Botones de acción
        if (this.mode === 'registration') {
            document.getElementById('btn-record-confirm')?.addEventListener('click', () => this.handleAction('confirm'));
            document.getElementById('btn-record-cancel')?.addEventListener('click', () => this.handleAction('cancel'));
        } else {
            document.getElementById('btn-record-replay')?.addEventListener('click', () => this.handleAction('replay'));
            document.getElementById('btn-record-table')?.addEventListener('click', () => this.handleAction('table'));
            document.getElementById('btn-record-exit')?.addEventListener('click', () => this.handleAction('exit'));
        }
    }

    handleKeyPress = (e) => {
        if (!this.isOpen) return;

        // En modos estáticos, ignorar teclas de dirección
        const isStatic = this.mode === 'celebration' || this.mode === 'results_only';
        if (isStatic) return;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.nextLetter();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.prevLetter();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.confirmLetter();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.deleteLetter();
                break;
            case 'Enter':
                e.preventDefault();
                if (this.mode === 'registration') {
                    this.handleAction('confirm');
                } else {
                    this.confirmLetter();
                }
                break;
        }
    }

    nextLetter() {
        const currentLetter = this.letters[this.currentSlot];
        const currentIndex = this.alphabet.indexOf(currentLetter);
        const nextIndex = (currentIndex + 1) % this.alphabet.length;
        this.letters[this.currentSlot] = this.alphabet[nextIndex];
        this.updateDisplay();
        this.playSound('select');
    }

    prevLetter() {
        const currentLetter = this.letters[this.currentSlot];
        const currentIndex = this.alphabet.indexOf(currentLetter);
        const prevIndex = (currentIndex - 1 + this.alphabet.length) % this.alphabet.length;
        this.letters[this.currentSlot] = this.alphabet[prevIndex];
        this.updateDisplay();
        this.playSound('select');
    }

    confirmLetter() {
        // Si estamos en la última ranura permitida, no avanzar más
        if (this.currentSlot >= this.maxSlots - 1) {
            this.playSound('wrong');
            return;
        }

        // Avanzar a la siguiente ranura
        this.currentSlot++;
        if (!this.letters[this.currentSlot]) {
            this.letters[this.currentSlot] = 'A'; // Nueva ranura empieza en A si no existe
        }
        this.updateDisplay();
        this.playSound('correct');
    }

    deleteLetter() {
        if (this.currentSlot === 0) {
            // No se puede borrar la primera letra, solo cambiarla
            this.playSound('wrong');
            return;
        }

        // Eliminar la letra actual y retroceder
        this.letters.splice(this.currentSlot, 1);
        this.currentSlot--;
        this.updateDisplay();
        this.playSound('select');
    }

    updateDisplay() {
        const slotsContainer = document.getElementById('letter-slots');
        if (slotsContainer) {
            slotsContainer.innerHTML = this.renderLetterSlots();
        }
    }

    getName() {
        return this.letters.join('');
    }

    handleAction(action) {
        const playerName = this.getName();

        this.onComplete({
            action: action,
            playerName: playerName
        });

        this.close();
    }

    playSound(type) {
        // Integración con el sistema de sonido existente
        if (window.SoundManager) {
            window.SoundManager.play(type);
        }
    }
}
