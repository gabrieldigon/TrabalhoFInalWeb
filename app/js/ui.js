// Módulo de interface - manipulação do DOM

const UI = {
    _elements: {},

    /**
     * Inicializa referências aos elementos DOM
     */
    init() {
        this._elements = {
            menuScreen: document.getElementById('menu-screen'),
            gameScreen: document.getElementById('game-screen'),
            gameOverScreen: document.getElementById('gameover-screen'),
            pauseOverlay: document.getElementById('pause-overlay'),
            gridContainer: document.getElementById('grid-container'),
            keyboardContainer: document.getElementById('keyboard-container'),
            scoreDisplay: document.getElementById('score-display'),
            livesDisplay: document.getElementById('lives-display'),
            phaseDisplay: document.getElementById('phase-display'),
            hintDisplay: document.getElementById('hint-display'),
            timerDisplay: document.getElementById('timer-display'),
            difficultySelect: document.getElementById('difficulty-select'),
            highScoreDisplay: document.getElementById('high-score-display'),
            finalScoreDisplay: document.getElementById('final-score-display'),
            lastWordDisplay: document.getElementById('last-word-display'),
            resultTitle: document.getElementById('gameover-title'),
            messageDisplay: document.getElementById('message-display'),
            powerUpsDisplay: document.getElementById('powerups-display'),
            pauseBtn: document.getElementById('pause-btn'),
            soundBtn: document.getElementById('sound-btn'),
        };
    },

    /**
     * Mostra uma tela específica, esconde as outras
     * @param {string} screen - 'menu', 'game', 'gameover'
     */
    showScreen(screen) {
        const { menuScreen, gameScreen, gameOverScreen } = this._elements;
        menuScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');

        switch (screen) {
            case 'menu':
                menuScreen.classList.remove('hidden');
                break;
            case 'game':
                gameScreen.classList.remove('hidden');
                break;
            case 'gameover':
                gameOverScreen.classList.remove('hidden');
                break;
        }
    },

    /**
     * Cria a grade de letras baseada no tamanho da palavra e tentativas
     * @param {number} wordLength
     * @param {number} maxAttempts
     */
    createGrid(wordLength, maxAttempts) {
        const container = this._elements.gridContainer;
        container.innerHTML = '';
        container.style.setProperty('--word-length', wordLength);

        for (let row = 0; row < maxAttempts; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'grid-row';
            rowDiv.dataset.row = row;

            for (let col = 0; col < wordLength; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                rowDiv.appendChild(cell);
            }

            container.appendChild(rowDiv);
        }
    },

    /**
     * Preenche uma linha da grade com letras
     * @param {number} rowIndex
     * @param {string} word
     * @param {Array} results - Array de estados: 'correct', 'misplaced', 'wrong'
     */
    fillRow(rowIndex, word, results) {
        const cells = this._elements.gridContainer.querySelectorAll(`.grid-row[data-row="${rowIndex}"] .grid-cell`);

        cells.forEach((cell, col) => {
            const letter = word[col];
            const state = results[col];

            cell.textContent = letter;
            cell.classList.add('pop');

            // Animação com delay
            setTimeout(() => {
                cell.classList.remove('pop');
                cell.classList.add('flip');
                cell.classList.add(state);

                // Sons por letra
                if (state === 'correct') Sound.correctLetter();
                else if (state === 'misplaced') Sound.misplacedLetter();
                else Sound.wrongLetter();

                setTimeout(() => {
                    cell.classList.remove('flip');
                }, 500);
            }, col * 200);
        });
    },

    /**
     * Preenche letras temporárias na linha atual (enquanto digita)
     * @param {number} rowIndex
     * @param {string} currentGuess
     * @param {number} wordLength
     */
    updateCurrentRow(rowIndex, currentGuess, wordLength) {
        const cells = this._elements.gridContainer.querySelectorAll(`.grid-row[data-row="${rowIndex}"] .grid-cell`);

        cells.forEach((cell, col) => {
            cell.textContent = col < currentGuess.length ? currentGuess[col] : '';
            if (col < currentGuess.length) {
                cell.classList.add('filled');
            } else {
                cell.classList.remove('filled');
            }
        });
    },

    /**
     * Mostra animação de erro (shake) em uma linha
     * @param {number} rowIndex
     */
    shakeRow(rowIndex) {
        const row = this._elements.gridContainer.querySelector(`.grid-row[data-row="${rowIndex}"]`);
        if (!row) return;
        row.classList.add('shake');
        Sound.error();
        setTimeout(() => row.classList.remove('shake'), 500);
    },

    /**
     * Mostra mensagem temporária
     * @param {string} message
     * @param {string} type - 'error', 'info', 'success'
     * @param {number} duration
     */
    showMessage(message, type = 'info', duration = 2000) {
        const msgEl = this._elements.messageDisplay;
        msgEl.textContent = message;
        msgEl.className = 'message ' + type;
        msgEl.classList.remove('hidden');

        clearTimeout(this._messageTimeout);
        this._messageTimeout = setTimeout(() => {
            msgEl.classList.add('hidden');
        }, duration);
    },

    /**
     * Atualiza a exibição do placar
     */
    updateScore() {
        this._elements.scoreDisplay.textContent = `Pontos: ${Player.score}`;
    },

    /**
     * Atualiza a exibição das vidas
     */
    updateLives() {
        const lives = Player.lives;
        let hearts = '';
        for (let i = 0; i < lives; i++) {
            hearts += '❤️';
        }
        this._elements.livesDisplay.textContent = hearts || '💀';
    },

    /**
     * Atualiza a exibição da fase
     */
    updatePhase() {
        this._elements.phaseDisplay.textContent = `Fase ${Player.phase}`;
    },

    /**
     * Atualiza a exibição da dica
     * @param {string} hint
     */
    updateHint(hint) {
        this._elements.hintDisplay.textContent = `Dica: ${hint}`;
        this._elements.hintDisplay.classList.remove('hidden');
    },

    /**
     * Esconde a dica
     */
    hideHint() {
        this._elements.hintDisplay.classList.add('hidden');
    },

    /**
     * Atualiza a exibição do timer
     * @param {number} seconds
     */
    updateTimer(seconds) {
        const timerEl = this._elements.timerDisplay;
        if (seconds > 0) {
            timerEl.textContent = `⏱ ${seconds}s`;
            timerEl.classList.remove('hidden');
            if (seconds <= 10) {
                timerEl.classList.add('warning');
            } else {
                timerEl.classList.remove('warning');
            }
        } else {
            timerEl.classList.add('hidden');
        }
    },

    /**
     * Atualiza a exibição dos power-ups
     */
    updatePowerUps() {
        const p = Player.powerUps;
        this._elements.powerUpsDisplay.innerHTML = `
            <button class="powerup-btn hint-btn" data-action="hint" ${p.hints === 0 ? 'disabled' : ''}>
                💡 ${p.hints}
            </button>
            <button class="powerup-btn life-btn" data-action="extraLife" ${p.extraLives === 0 ? 'disabled' : ''}>
                ❤️ ${p.extraLives}
            </button>
            <button class="powerup-btn freeze-btn" data-action="freeze" ${p.freeze === 0 ? 'disabled' : ''}>
                ❄️ ${p.freeze}
            </button>
        `;
    },

    /**
     * Atualiza a tela de fim de jogo
     * @param {boolean} won
     * @param {string} word
     * @param {number} score
     */
    showGameOver(won, word, score) {
        this.showScreen('gameover');
        this._elements.resultTitle.textContent = won ? '🎉 Parabéns!' : '😞 Fim de Jogo';
        this._elements.finalScoreDisplay.textContent = `Pontuação Final: ${score}`;
        this._elements.lastWordDisplay.textContent = `Palavra: ${word}`;

        const highScore = Storage.getHighScore();
        if (score >= highScore) {
            Storage.saveHighScore(score);
            this._elements.highScoreDisplay.textContent = `🏆 Novo Recorde! ${score}`;
        } else {
            this._elements.highScoreDisplay.textContent = `Recorde: ${highScore}`;
        }
    },

    /**
     * Mostra/esconde o overlay de pausa
     * @param {boolean} show
     */
    showPause(show) {
        this._elements.pauseOverlay.classList.toggle('hidden', !show);
    },

    /**
     * Alterna o ícone do botão de som
     * @param {boolean} enabled
     */
    updateSoundButton(enabled) {
        this._elements.soundBtn.textContent = enabled ? '🔊' : '🔇';
    },

    /**
     * Atualiza o botão de dificuldade no menu
     */
    updateDifficultyLabel() {
        const select = this._elements.difficultySelect;
        if (select) {
            const labels = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' };
            select.textContent = `Dificuldade: ${labels[select.dataset.value] || 'Médio'}`;
        }
    },

    /**
     * Obtém os elementos
     */
    get elements() { return this._elements; }
};