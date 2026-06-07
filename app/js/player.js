const Player = {
    _lives: 3,
    _score: 0,
    _phase: 1,
    _currentAttempt: 0,
    _maxAttempts: 6,
    _guesses: [],
    _powerUps: { hints: 2, extraLives: 1 },
    _difficulty: 'medium',
    _wordLength: 5,

    init(difficulty = 'medium', wordLength = 5) {
        this._difficulty = difficulty;
        this._wordLength = wordLength;
        this._score = 0;
        this._phase = 1;
        this._currentAttempt = 0;
        this._maxAttempts = getMaxAttempts(difficulty);
        this._guesses = [];

        switch (difficulty) {
            case 'easy':
                this._powerUps = { hints: 3, extraLives: 2 };
                this._lives = 5;
                break;
            case 'medium':
                this._powerUps = { hints: 2, extraLives: 1 };
                this._lives = 3;
                break;
            case 'hard':
                this._powerUps = { hints: 1, extraLives: 0 };
                this._lives = 2;
                break;
            default:
                this._powerUps = { hints: 2, extraLives: 1 };
                this._lives = 3;
        }

        const savedPowerUps = Storage.getPowerUps();
        if (savedPowerUps) {
            this._powerUps.hints += savedPowerUps.hints || 0;
            this._powerUps.extraLives += savedPowerUps.extraLives || 0;
        }
    },

    nextPhase(wordLength) {
        this._phase++;
        this._currentAttempt = 0;
        this._guesses = [];
        this._wordLength = wordLength;

        if (this._phase >= 3) {
            this._maxAttempts = Math.max(3, this._maxAttempts - 1);
        }
    },

    addGuess(guess) {
        this._guesses.push(guess);
        this._currentAttempt++;
        return this._currentAttempt;
    },

    canAttempt() {
        return this._currentAttempt < this._maxAttempts && this._lives > 0;
    },

    loseLife() {
        this._lives = Math.max(0, this._lives - 1);
        return this._lives;
    },

    gainLife() {
        this._lives++;
        this._powerUps.extraLives--;
        return this._lives;
    },

    addScore(basePoints = 100) {
        const attemptBonus = Math.max(10, 100 - (this._currentAttempt * 15));
        const phaseMultiplier = this._phase;
        const points = Math.floor((basePoints + attemptBonus) * phaseMultiplier);
        this._score += points;
        return points;
    },

    useHint() {
        if (this._powerUps.hints > 0) {
            this._powerUps.hints--;
            this._savePowerUps();
            return true;
        }
        return false;
    },

    useExtraLife() {
        if (this._powerUps.extraLives > 0) {
            this.gainLife();
            return true;
        }
        return false;
    },

    _savePowerUps() {
        Storage.savePowerUps({
            hints: this._powerUps.hints,
            extraLives: this._powerUps.extraLives
        });
    },

    _powerUpKeyMap: {
        'hint': 'hints',
        'extraLife': 'extraLives'
    },

    addPowerUpReward(type) {
        const key = this._powerUpKeyMap[type];
        if (key && this._powerUps[key] !== undefined) {
            this._powerUps[key]++;
            this._savePowerUps();
        }
    },

    get lives() { return this._lives; },
    get score() { return this._score; },
    get phase() { return this._phase; },
    get currentAttempt() { return this._currentAttempt; },
    get maxAttempts() { return this._maxAttempts; },
    get guesses() { return [...this._guesses]; },
    get powerUps() { return { ...this._powerUps }; },
    get difficulty() { return this._difficulty; },
    get wordLength() { return this._wordLength; }
};