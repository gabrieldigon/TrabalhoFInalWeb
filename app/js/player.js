// Módulo do jogador - vidas, pontuação, progresso e power-ups

const Player = {
    _lives: 3,
    _score: 0,
    _phase: 1,
    _currentAttempt: 0,
    _maxAttempts: 6,
    _guesses: [],
    _powerUps: { hints: 2, extraLives: 1, freeze: 1 },
    _difficulty: 'medium',
    _wordLength: 5,
    _timerActive: false,
    _timeRemaining: 0,
    _timerInterval: null,
    _onTimerEnd: null,

    /**
     * Inicializa ou reinicia o jogador
     * @param {string} difficulty
     * @param {number} wordLength
     */
    init(difficulty = 'medium', wordLength = 5) {
        this._difficulty = difficulty;
        this._wordLength = wordLength;
        this._score = 0;
        this._phase = 1;
        this._currentAttempt = 0;
        this._maxAttempts = getMaxAttempts(difficulty);
        this._guesses = [];
        this._timerActive = false;
        this._timeRemaining = 0;

        // Power-ups iniciais baseados na dificuldade
        switch (difficulty) {
            case 'easy':
                this._powerUps = { hints: 3, extraLives: 2, freeze: 2 };
                this._lives = 5;
                break;
            case 'medium':
                this._powerUps = { hints: 2, extraLives: 1, freeze: 1 };
                this._lives = 3;
                break;
            case 'hard':
                this._powerUps = { hints: 1, extraLives: 0, freeze: 0 };
                this._lives = 2;
                break;
            default:
                this._powerUps = { hints: 2, extraLives: 1, freeze: 1 };
                this._lives = 3;
        }

        // Adiciona power-ups salvos anteriormente
        const savedPowerUps = Storage.getPowerUps();
        if (savedPowerUps) {
            this._powerUps.hints += savedPowerUps.hints;
            this._powerUps.extraLives += savedPowerUps.extraLives;
            this._powerUps.freeze += savedPowerUps.freeze;
        }

        // Configura timer para dificuldade difícil
        if (difficulty === 'hard') {
            this._timerActive = true;
            this._timeRemaining = 60; // 60 segundos
        }
    },

    /**
     * Avança para a próxima fase
     * @param {number} wordLength - Novo comprimento da palavra
     */
    nextPhase(wordLength) {
        this._phase++;
        this._currentAttempt = 0;
        this._guesses = [];
        this._wordLength = wordLength;

        // Diminui tentativas com o avanço das fases
        if (this._phase >= 3) {
            this._maxAttempts = Math.max(3, this._maxAttempts - 1);
        }

        // Aumenta dificuldade: reduz tempo em modo hard
        if (this._difficulty === 'hard') {
            this._timeRemaining = Math.max(30, 60 - (this._phase * 5));
        }
    },

    /**
     * Registra uma tentativa
     * @param {string} guess - Palavra tentada
     * @returns {number} - Número de tentativa atual
     */
    addGuess(guess) {
        this._guesses.push(guess);
        this._currentAttempt++;
        return this._currentAttempt;
    },

    /**
     * Verifica se o jogador ainda pode tentar
     * @returns {boolean}
     */
    canAttempt() {
        return this._currentAttempt < this._maxAttempts && this._lives > 0;
    },

    /**
     * Perde uma vida
     * @returns {number} - Vidas restantes
     */
    loseLife() {
        this._lives = Math.max(0, this._lives - 1);
        return this._lives;
    },

    /**
     * Ganha uma vida extra (power-up)
     * @returns {number} - Vidas atuais
     */
    gainLife() {
        this._lives++;
        this._powerUps.extraLives--;
        return this._lives;
    },

    /**
     * Adiciona pontos baseado na tentativa atual
     * @param {number} basePoints - Pontos base por acerto
     * @returns {number} - Pontos ganhos
     */
    addScore(basePoints = 100) {
        // Mais pontos por acertar rápido
        const attemptBonus = Math.max(10, 100 - (this._currentAttempt * 15));
        const phaseMultiplier = this._phase;
        const points = Math.floor((basePoints + attemptBonus) * phaseMultiplier);
        this._score += points;
        return points;
    },

    /**
     * Usa o power-up de dica
     * @returns {boolean} - Se conseguiu usar
     */
    useHint() {
        if (this._powerUps.hints > 0) {
            this._powerUps.hints--;
            this._savePowerUps();
            return true;
        }
        return false;
    },

    /**
     * Usa o power-up de vida extra
     * @returns {boolean} - Se conseguiu usar
     */
    useExtraLife() {
        if (this._powerUps.extraLives > 0) {
            this.gainLife();
            return true;
        }
        return false;
    },

    /**
     * Usa o power-up de freeze (adiciona tempo em modo difícil)
     * @returns {boolean} - Se conseguiu usar
     */
    useFreeze() {
        if (this._powerUps.freeze > 0) {
            this._powerUps.freeze--;
            this._timeRemaining += 30;
            this._savePowerUps();
            return true;
        }
        return false;
    },

    /**
     * Inicia o timer (apenas modo difícil)
     * @param {function} onEnd - Callback quando o tempo acabar
     */
    startTimer(onEnd) {
        if (!this._timerActive) return;
        this._onTimerEnd = onEnd;

        this._timerInterval = setInterval(() => {
            this._timeRemaining--;
            if (this._timeRemaining <= 0) {
                this.stopTimer();
                if (this._onTimerEnd) this._onTimerEnd();
            }
        }, 1000);
    },

    /**
     * Para o timer
     */
    stopTimer() {
        if (this._timerInterval) {
            clearInterval(this._timerInterval);
            this._timerInterval = null;
        }
    },

    /**
     * Salva power-ups no localStorage
     */
    _savePowerUps() {
        Storage.savePowerUps({
            hints: this._powerUps.hints,
            extraLives: this._powerUps.extraLives,
            freeze: this._powerUps.freeze
        });
    },

    /**
     * Mapeamento de tipo de power-up para chave no objeto
     */
    _powerUpKeyMap: {
        'hint': 'hints',
        'extraLife': 'extraLives',
        'freeze': 'freeze'
    },

    /**
     * Adiciona power-up como recompensa
     * @param {string} type - Tipo de power-up ('hint', 'extraLife', 'freeze')
     */
    addPowerUpReward(type) {
        const key = this._powerUpKeyMap[type];
        if (key && this._powerUps[key] !== undefined) {
            this._powerUps[key]++;
            this._savePowerUps();
        }
    },

    /**
     * Getters
     */
    get lives() { return this._lives; },
    get score() { return this._score; },
    get phase() { return this._phase; },
    get currentAttempt() { return this._currentAttempt; },
    get maxAttempts() { return this._maxAttempts; },
    get guesses() { return [...this._guesses]; },
    get powerUps() { return { ...this._powerUps }; },
    get difficulty() { return this._difficulty; },
    get wordLength() { return this._wordLength; },
    get timeRemaining() { return this._timeRemaining; },
    get timerActive() { return this._timerActive; }
};