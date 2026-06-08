const UI = {
    _elements: {},

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

    fillRow(rowIndex, word, results) {
        const cells = this._elements.gridContainer.querySelectorAll(`.grid-row[data-row="${rowIndex}"] .grid-cell`);

        cells.forEach((cell, col) => {
            const letter = word[col];
            const state = results[col];

            cell.textContent = letter;
            cell.classList.add('pop');

            setTimeout(() => {
                cell.classList.remove('pop');
                cell.classList.add('flip');
                cell.classList.add(state);

                if (state === 'correct') Sound.correctLetter();
                else if (state === 'misplaced') Sound.misplacedLetter();
                else Sound.wrongLetter();

                setTimeout(() => {
                    cell.classList.remove('flip');
                }, 500);
            }, col * 200);
        });
    },

    updateCurrentRow(rowIndex, currentGuess, wordLength) {
        const cells = this._elements.gridContainer.querySelectorAll(`.grid-row[data-row="${rowIndex}"] .grid-cell`);
        const hintCells = this._elements.gridContainer.querySelectorAll(`.grid-row[data-row="${rowIndex}"] .grid-cell.hint-revealed`);
        const hintPositions = new Set();
        hintCells.forEach(c => hintPositions.add(parseInt(c.dataset.col)));

        cells.forEach((cell, col) => {
            if (!hintPositions.has(col)) {
                cell.textContent = col < currentGuess.length ? currentGuess[col] : '';
                cell.className = 'grid-cell';
                if (col < currentGuess.length) {
                    cell.classList.add('filled');
                }
            }
        });
    },

    shakeRow(rowIndex) {
        const row = this._elements.gridContainer.querySelector(`.grid-row[data-row="${rowIndex}"]`);
        if (!row) return;
        row.classList.add('shake');
        Sound.error();
        setTimeout(() => row.classList.remove('shake'), 500);
    },

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

    updateScore() {
        this._elements.scoreDisplay.textContent = `Pontos: ${Player.score}`;
    },

    updateLives() {
        const lives = Player.lives;
        let hearts = '';
        for (let i = 0; i < lives; i++) {
            hearts += '❤️';
        }
        this._elements.livesDisplay.textContent = hearts || '💀';
    },

    updatePhase() {
        this._elements.phaseDisplay.textContent = `Fase ${Player.phase}`;
    },

    updateHint(hint) {
        this._elements.hintDisplay.textContent = `Dica: ${hint}`;
        this._elements.hintDisplay.classList.remove('hidden');
    },

    hideHint() {
        this._elements.hintDisplay.classList.add('hidden');
    },

    updatePowerUps() {
        const p = Player.powerUps;
        this._elements.powerUpsDisplay.innerHTML = `
            <button class="powerup-btn hint-btn" data-action="hint" ${p.hints === 0 ? 'disabled' : ''}>
                💡 ${p.hints}
            </button>
            <button class="powerup-btn life-btn" data-action="extraLife" ${p.extraLives === 0 ? 'disabled' : ''}>
                ❤️ ${p.extraLives}
            </button>
        `;
    },

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

    showPause(show) {
        this._elements.pauseOverlay.classList.toggle('hidden', !show);
    },

    updateSoundButton(enabled) {
        this._elements.soundBtn.textContent = enabled ? '🔊' : '🔇';
    },

    updateDifficultyLabel() {
        const select = this._elements.difficultySelect;
        if (select) {
            const labels = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' };
            select.textContent = `Dificuldade: ${labels[select.dataset.value] || 'Médio'}`;
        }
    },

    get elements() { return this._elements; }
};