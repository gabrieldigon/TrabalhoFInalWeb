const Game = {
    _currentWord: null,
    _currentHint: null,
    _currentGuess: [],
    _isPlaying: false,
    _isPaused: false,
    _isChecking: false,
    _usedHints: 0,
    _hintPositions: [],

    start(difficulty) {
        const wordData = getRandomWord(difficulty, 1);
        this._currentWord = wordData.word.toUpperCase();
        this._currentHint = wordData.hint;
        this._currentGuess = [];
        this._isPlaying = true;
        this._isPaused = false;
        this._isChecking = false;
        this._usedHints = 0;
        this._hintPositions = [];

        Player.init(difficulty, this._currentWord.length);

        UI.createGrid(this._currentWord.length, Player.maxAttempts);
        Keyboard.reset();
        Keyboard.setDisabled(false);
        UI.hideHint();
        UI.showScreen('game');
        UI.updateScore();
        UI.updateLives();
        UI.updatePhase();
        UI.updatePowerUps();

        UI.elements.powerUpsDisplay.addEventListener('click', (e) => {
            const btn = e.target.closest('.powerup-btn');
            if (btn && !btn.disabled) {
                const action = btn.dataset.action;
                this._usePowerUp(action);
            }
        });
    },

    _renderRow() {
        const rowIndex = Player.currentAttempt;
        const cells = document.querySelectorAll(`.grid-row[data-row="${rowIndex}"] .grid-cell`);
        const wordLen = this._currentWord.length;

        const typed = [...this._currentGuess];
        for (const pos of this._hintPositions) {
            cells[pos].textContent = this._currentWord[pos];
            cells[pos].className = 'grid-cell correct hint-revealed';
        }

        let typedPos = 0;
        for (let i = 0; i < wordLen; i++) {
            if (this._hintPositions.includes(i)) continue;
            if (typedPos < typed.length) {
                cells[i].textContent = typed[typedPos];
                cells[i].className = 'grid-cell filled';
                typedPos++;
            } else {
                cells[i].textContent = '';
                cells[i].className = 'grid-cell';
            }
        }
    },

    onKeyPress(letter) {
        if (!this._isPlaying || this._isPaused || this._isChecking) return;
        if (this._currentGuess.length + this._hintPositions.length < this._currentWord.length) {
            this._currentGuess.push(letter);
            this._renderRow();
        }
    },

    onBackspace() {
        if (!this._isPlaying || this._isPaused || this._isChecking) return;
        if (this._currentGuess.length > 0) {
            this._currentGuess.pop();
            this._renderRow();
        }
    },

    _buildGuessString() {
        const parts = [];
        let typedIdx = 0;
        for (let i = 0; i < this._currentWord.length; i++) {
            if (this._hintPositions.includes(i)) {
                parts.push(this._currentWord[i]);
            } else if (typedIdx < this._currentGuess.length) {
                parts.push(this._currentGuess[typedIdx]);
                typedIdx++;
            }
        }
        return parts.join('');
    },

    onEnter() {
        if (!this._isPlaying || this._isPaused || this._isChecking) return;

        const guess = this._buildGuessString();
        const wordLen = this._currentWord.length;

        if (this._currentGuess.length + this._hintPositions.length !== wordLen) {
            UI.showMessage(`A palavra tem ${wordLen} letras!`, 'error');
            return;
        }

        this._isChecking = true;
        Keyboard.setDisabled(true);

        const results = this._evaluateGuess(guess);
        const currentRow = Player.currentAttempt;

        UI.fillRow(currentRow, guess, results);

        guess.split('').forEach((letter, i) => {
            Keyboard.setKeyState(letter, results[i]);
        });

        Player.addGuess(guess);

        setTimeout(() => {
            this._isChecking = false;
            Keyboard.setDisabled(false);

            const allCorrect = results.every(r => r === 'correct');

            if (allCorrect) {
                this._onWin();
            } else if (!Player.canAttempt()) {
                this._onLose();
            } else {
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

                this._currentGuess = [];
                this._hintPositions = [];
                UI.updateScore();
                UI.updatePowerUps();
            }
        }, guess.length * 200 + 600);
    },

    _evaluateGuess(guess) {
        const target = this._currentWord;
        const targetArr = target.split('');
        const guessArr = guess.split('');
        const result = new Array(guess.length).fill('wrong');

        const letterCount = {};
        targetArr.forEach(letter => {
            letterCount[letter] = (letterCount[letter] || 0) + 1;
        });

        guessArr.forEach((letter, i) => {
            if (letter === targetArr[i]) {
                result[i] = 'correct';
                letterCount[letter]--;
            }
        });

        guessArr.forEach((letter, i) => {
            if (result[i] !== 'correct' && letterCount[letter] > 0) {
                result[i] = 'misplaced';
                letterCount[letter]--;
            }
        });

        return result;
    },

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
        }
        UI.updatePowerUps();
    },

    _revealHint() {
        const target = this._currentWord;
        const guesses = Player.guesses;

        const alreadyRevealed = new Set();
        guesses.forEach(g => {
            for (let i = 0; i < g.length; i++) {
                if (g[i] === target[i]) {
                    alreadyRevealed.add(i);
                }
            }
        });
        this._hintPositions.forEach(p => alreadyRevealed.add(p));

        const available = [];
        for (let i = 0; i < target.length; i++) {
            if (!alreadyRevealed.has(i)) {
                available.push(i);
            }
        }

        if (available.length === 0) {
            UI.showMessage('Todas as letras já estão reveladas!');
            return;
        }

        const randomIndex = available[Math.floor(Math.random() * available.length)];
        const letter = target[randomIndex];

        this._usedHints++;
        this._hintPositions.push(randomIndex);
        this._hintPositions.sort((a, b) => a - b);

        this._renderRow();
        Keyboard.setKeyState(letter, 'correct');

        UI.showMessage(`💡 Dica: "${letter}" na posição ${randomIndex + 1}!`, 'success', 2000);
    },

    togglePause() {
        this._isPaused = !this._isPaused;
        UI.showPause(this._isPaused);
        Keyboard.setDisabled(this._isPaused);
    },

    quit() {
        this._isPlaying = false;
        this._isPaused = false;
        UI.showPause(false);
        UI.showScreen('menu');
    },

    _saveScoreToServer(won) {
        const score = Player.score;
        const difficulty = Player.difficulty;
        const word = this._currentWord;
        const attempts = Player.currentAttempt;

        fetch('/game/save-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                score: score,
                difficulty: difficulty,
                won: won,
                word: word,
                attempts: attempts
            })
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error('Erro ao salvar pontuação:', data.message);
            }
        })
        .catch(error => {
            console.error('Erro ao salvar pontuação:', error);
        });
    },

    _onWin() {
        this._isPlaying = false;
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

        // Save score to server via Ajax
        this._saveScoreToServer(true);

        const powerUpTypes = ['hint', 'extraLife'];
        const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        Player.addPowerUpReward(randomPowerUp);
        UI.showMessage(`🎁 Power-up "${randomPowerUp}" ganho!`, 'success', 3000);

        setTimeout(() => {
            if (Player.phase >= 3) {
                UI.showGameOver(true, this._currentWord, Player.score);
            } else {
                this._nextRound();
            }
        }, 2000);
    },

    _onLose() {
        this._isPlaying = false;
        Keyboard.setDisabled(true);
        Sound.defeat();

        Storage.addHistoryEntry({
            word: this._currentWord,
            attempts: Player.currentAttempt,
            guessed: false,
            score: Player.score,
            difficulty: Player.difficulty
        });

        // Save score to server via Ajax
        this._saveScoreToServer(false);

        setTimeout(() => {
            UI.showGameOver(false, this._currentWord, Player.score);
        }, 1500);
    },

    _nextRound() {
        const difficulty = Player.difficulty;

        this._isPlaying = true;
        this._isChecking = false;

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
        this._currentGuess = [];
        this._usedHints = 0;
        this._hintPositions = [];

        Player.nextPhase(newLength);
        UI.createGrid(this._currentWord.length, Player.maxAttempts);
        Keyboard.reset();
        Keyboard.setDisabled(false);
        UI.hideHint();
        UI.updateScore();
        UI.updateLives();
        UI.updatePhase();
        UI.updatePowerUps();

        UI.showMessage(`✨ Fase ${Player.phase}!`, 'success', 2000);
    },

    get state() {
        return {
            word: this._currentWord,
            hint: this._currentHint,
            guess: this._currentGuess.join(''),
            isPlaying: this._isPlaying,
            isPaused: this._isPaused,
        };
    }
};