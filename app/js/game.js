// Módulo principal do jogo - lógica central

const Game = {
    _currentWord: null,
    _currentHint: null,
    _currentGuess: '',
    _isPlaying: false,
    _isPaused: false,
    _isChecking: false,
    _usedHints: 0,

    /**
     * Inicia uma nova partida
     * @param {string} difficulty
     */
    start(difficulty) {
        const wordData = getRandomWord(difficulty, 1);
        this._currentWord = wordData.word.toUpperCase();
        this._currentHint = wordData.hint;
        this._currentGuess = '';
        this._isPlaying = true;
        this._isPaused = false;
        this._isChecking = false;
        this._usedHints = 0;

        Player.init(difficulty, this._currentWord.length);

        // Configura a interface
        UI.createGrid(this._currentWord.length, Player.maxAttempts);
        Keyboard.reset();
        Keyboard.setDisabled(false);
        UI.hideHint();
        UI.showScreen('game');
        UI.updateScore();
        UI.updateLives();
        UI.updatePhase();
        UI.updatePowerUps();
        UI.updateTimer(Player.timeRemaining);

        // Inicia timer no modo difícil
        if (Player.timerActive) {
            Player.startTimer(() => this._onTimeUp());
        }

        // Adiciona listeners de power-ups
        UI.elements.powerUpsDisplay.addEventListener('click', (e) => {
            const btn = e.target.closest('.powerup-btn');
            if (btn && !btn.disabled) {
                const action = btn.dataset.action;
                this._usePowerUp(action);
            }
        });
    },

    /**
     * Manipula uma letra pressionada
     * @param {string} letter
     */
    onKeyPress(letter) {
        if (!this._isPlaying || this._isPaused || this._isChecking) return;

        const wordLen = this._currentWord.length;
        if (this._currentGuess.length < wordLen) {
            this._currentGuess += letter;
            UI.updateCurrentRow(Player.currentAttempt, this._currentGuess, wordLen);
        }
    },

    /**
     * Manipula o backspace
     */
    onBackspace() {
        if (!this._isPlaying || this._isPaused || this._isChecking) return;

        if (this._currentGuess.length > 0) {
            this._currentGuess = this._currentGuess.slice(0, -1);
            UI.updateCurrentRow(Player.currentAttempt, this._currentGuess, this._currentWord.length);
        }
    },

    /**
     * Manipula o Enter (envia a tentativa)
     */
    onEnter() {
        if (!this._isPlaying || this._isPaused || this._isChecking) return;

        const guess = this._currentGuess;
        const wordLen = this._currentWord.length;

        // Validações
        if (guess.length !== wordLen) {
            UI.showMessage(`A palavra tem ${wordLen} letras!`, 'error');
            UI.shakeRow(Player.currentAttempt);
            return;
        }

        if (!/^[A-ZÁÉÍÓÚÃÕÂÊ]+$/.test(guess)) {
            UI.showMessage('Use apenas letras!', 'error');
            UI.shakeRow(Player.currentAttempt);
            return;
        }

        this._isChecking = true;
        Keyboard.setDisabled(true);

        // Processa a tentativa
        const results = this._evaluateGuess(guess);
        const currentRow = Player.currentAttempt;

        UI.fillRow(currentRow, guess, results);

        // Atualiza teclado
        guess.split('').forEach((letter, i) => {
            Keyboard.setKeyState(letter, results[i]);
        });

        Player.addGuess(guess);

        // Verifica resultado após animação
        setTimeout(() => {
            this._isChecking = false;
            Keyboard.setDisabled(false);

            const allCorrect = results.every(r => r === 'correct');

            if (allCorrect) {
                this._onWin();
            } else if (!Player.canAttempt()) {
                this._onLose();
            } else {
                // Perde vida se errou completamente
                const allWrong = results.every(r => r === 'wrong');
                if (allWrong) {
                    Player.loseLife();
                    UI.updateLives();
                    UI.showMessage('Nenhuma letra correta! -1 ❤️', 'error');
                    if (Player.lives <= 0) {
                        this._onLose();
                        return;
                    }
                }

                this._currentGuess = '';
                UI.updateScore();
                UI.updatePowerUps();
            }
        }, guess.length * 200 + 600);
    },

    /**
     * Avalia a tentativa contra a palavra correta
     * @param {string} guess
     * @returns {Array} Array de estados
     */
    _evaluateGuess(guess) {
        const target = this._currentWord;
        const targetArr = target.split('');
        const guessArr = guess.split('');
        const result = new Array(guess.length).fill('wrong');

        // Conta letras disponíveis
        const letterCount = {};
        targetArr.forEach(letter => {
            letterCount[letter] = (letterCount[letter] || 0) + 1;
        });

        // Primeira passada: letras exatas
        guessArr.forEach((letter, i) => {
            if (letter === targetArr[i]) {
                result[i] = 'correct';
                letterCount[letter]--;
            }
        });

        // Segunda passada: letras deslocadas
        guessArr.forEach((letter, i) => {
            if (result[i] !== 'correct' && letterCount[letter] > 0) {
                result[i] = 'misplaced';
                letterCount[letter]--;
            }
        });

        return result;
    },

    /**
     * Usa um power-up
     * @param {string} action
     */
    _usePowerUp(action) {
        switch (action) {
            case 'hint':
                if (Player.useHint()) {
                    Sound.hint();
                    this._revealHint();
                }
                break;
            case 'extraLife':
                if (Player.useExtraLife()) {
                    Sound.powerUp();
                    UI.updateLives();
                    UI.showMessage('❤️ Vida extra!', 'success');
                }
                break;
            case 'freeze':
                if (Player.useFreeze()) {
                    Sound.powerUp();
                    UI.updateTimer(Player.timeRemaining);
                    UI.showMessage('❄️ +30 segundos!', 'success');
                }
                break;
        }
        UI.updatePowerUps();
    },

    /**
     * Revela uma letra como dica
     */
    _revealHint() {
        const target = this._currentWord;
        const guesses = Player.guesses;
        const guessedLetters = guesses.join('').split('');

        // Encontra letras não descobertas
        const unrevealed = target.split('').filter(l => !guessedLetters.includes(l));

        if (unrevealed.length === 0) {
            UI.showMessage('Todas as letras já reveladas!');
            return;
        }

        // Escolhe uma letra aleatória não descoberta
        const randomLetter = unrevealed[Math.floor(Math.random() * unrevealed.length)];

        // Encontra a primeira posição não acertada da letra
        let hintIndex = -1;
        for (let i = 0; i < target.length; i++) {
            if (target[i] === randomLetter) {
                // Verifica se essa posição já está correta em tentativas anteriores
                const isAlreadyCorrect = guesses.some(g => g[i] === randomLetter);
                if (!isAlreadyCorrect) {
                    hintIndex = i;
                    break;
                }
            }
        }

        if (hintIndex !== -1) {
            this._usedHints++;
            const currentRow = Player.currentAttempt;
            const cells = UI.elements.gridContainer.querySelectorAll(
                `.grid-row[data-row="${currentRow}"] .grid-cell[data-col="${hintIndex}"]`
            );
            if (cells.length > 0) {
                cells[0].textContent = randomLetter;
                cells[0].classList.add('hint-revealed');
                cells[0].classList.add('correct');
                Keyboard.setKeyState(randomLetter, 'correct');
            }

            // Atualiza o palpite atual
            // Preenche a letra revelada no guess atual
            this._currentGuess = this._currentGuess.padEnd(hintIndex + 1, ' ');
            const guessArr = this._currentGuess.split('');
            guessArr[hintIndex] = randomLetter;
            this._currentGuess = guessArr.join('').trim();
            UI.updateCurrentRow(currentRow, this._currentGuess, target.length);

            UI.showMessage(`💡 Dica: letra "${randomLetter}" revelada!`, 'success', 2000);
        }
    },

    /**
     * Alterna pausa
     */
    togglePause() {
        this._isPaused = !this._isPaused;
        UI.showPause(this._isPaused);
        Keyboard.setDisabled(this._isPaused);
    },

    /**
     * Cancela uma partida (volta ao menu)
     */
    quit() {
        this._isPlaying = false;
        this._isPaused = false;
        Player.stopTimer();
        UI.showPause(false);
        UI.showScreen('menu');
    },

    /**
     * Quando o tempo acaba (modo difícil)
     */
    _onTimeUp() {
        if (!this._isPlaying) return;
        UI.showMessage('⏱ Tempo esgotado!', 'error');
        this._onLose();
    },

    /**
     * Quando o jogador vence
     */
    _onWin() {
        this._isPlaying = false;
        Player.stopTimer();
        Keyboard.setDisabled(true);

        const points = Player.addScore();
        UI.updateScore();
        Sound.victory();
        Storage.addHistoryEntry({
            word: this._currentWord,
            attempts: Player.currentAttempt,
            guessed: true,
            score: Player.score,
            difficulty: Player.difficulty
        });

        // Recompensa com power-up aleatório
        const powerUpTypes = ['hint', 'extraLife', 'freeze'];
        const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        Player.addPowerUpReward(randomPowerUp);
        UI.showMessage(`🎁 Power-up "${randomPowerUp}" ganho!`, 'success', 3000);

        // Avança de fase ou termina
        setTimeout(() => {
            if (Player.phase >= 3) {
                UI.showGameOver(true, this._currentWord, Player.score);
            } else {
                this._nextRound();
            }
        }, 2000);
    },

    /**
     * Quando o jogador perde
     */
    _onLose() {
        this._isPlaying = false;
        Player.stopTimer();
        Keyboard.setDisabled(true);
        Sound.defeat();

        Storage.addHistoryEntry({
            word: this._currentWord,
            attempts: Player.currentAttempt,
            guessed: false,
            score: Player.score,
            difficulty: Player.difficulty
        });

        setTimeout(() => {
            UI.showGameOver(false, this._currentWord, Player.score);
        }, 1500);
    },

    /**
     * Próxima rodada (avança fase)
     */
    _nextRound() {
        const difficulty = Player.difficulty;

        // Aumenta tamanho da palavra conforme dificuldade
        let newLength;
        if (difficulty === 'easy') {
            newLength = 5 + Player.phase;
        } else if (difficulty === 'medium') {
            newLength = 5 + Player.phase;
        } else {
            newLength = 6 + Player.phase;
        }
        newLength = Math.min(newLength, 9);

        const wordData = getRandomWord(difficulty, Player.phase + 1);
        this._currentWord = wordData.word.toUpperCase();
        this._currentHint = wordData.hint;
        this._currentGuess = '';
        this._usedHints = 0;

        Player.nextPhase(newLength);
        UI.createGrid(this._currentWord.length, Player.maxAttempts);
        Keyboard.reset();
        Keyboard.setDisabled(false);
        UI.hideHint();
        UI.updateScore();
        UI.updateLives();
        UI.updatePhase();
        UI.updatePowerUps();
        UI.updateTimer(Player.timeRemaining);

        if (Player.timerActive) {
            Player.startTimer(() => this._onTimeUp());
        }

        UI.showMessage(`✨ Fase ${Player.phase}!`, 'success', 2000);
    },

    /**
     * Retorna o estado atual do jogo
     */
    get state() {
        return {
            word: this._currentWord,
            hint: this._currentHint,
            guess: this._currentGuess,
            isPlaying: this._isPlaying,
            isPaused: this._isPaused,
        };
    }
};