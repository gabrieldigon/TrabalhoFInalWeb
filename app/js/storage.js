// Módulo de armazenamento local (localStorage)

const STORAGE_KEYS = {
    HIGH_SCORE: 'copa2026_highScore',
    HISTORY: 'copa2026_history',
    GAME_STATE: 'copa2026_gameState',
    SETTINGS: 'copa2026_settings',
    POWER_UPS: 'copa2026_powerUps'
};

const Storage = {
    /**
     * Salva a pontuação mais alta
     * @param {number} score
     */
    saveHighScore(score) {
        const currentHigh = this.getHighScore();
        if (score > currentHigh) {
            try {
                localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
                return true;
            } catch (e) {
                console.warn('localStorage não disponível');
                return false;
            }
        }
        return false;
    },

    /**
     * Recupera a pontuação mais alta
     * @returns {number}
     */
    getHighScore() {
        try {
            const val = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
            return val ? parseInt(val, 10) : 0;
        } catch (e) {
            return 0;
        }
    },

    /**
     * Adiciona uma tentativa ao histórico
     * @param {object} entry - { word, attempts, guessed, score, date }
     */
    addHistoryEntry(entry) {
        try {
            const history = this.getHistory();
            history.unshift({
                ...entry,
                date: new Date().toISOString()
            });
            // Mantém apenas os últimos 20 registros
            const trimmed = history.slice(0, 20);
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
        } catch (e) {
            console.warn('Não foi possível salvar histórico');
        }
    },

    /**
     * Recupera o histórico de jogos
     * @returns {Array}
     */
    getHistory() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    /**
     * Salva configurações do jogo
     * @param {object} settings
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (e) {
            console.warn('Não foi possível salvar configurações');
        }
    },

    /**
     * Recupera configurações salvas
     * @returns {object}
     */
    getSettings() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            return data ? JSON.parse(data) : { soundEnabled: true, theme: 'default' };
        } catch (e) {
            return { soundEnabled: true, theme: 'default' };
        }
    },

    /**
     * Salva power-ups disponíveis
     * @param {object} powerUps - { hints: number, extraLives: number, freeze: number }
     */
    savePowerUps(powerUps) {
        try {
            localStorage.setItem(STORAGE_KEYS.POWER_UPS, JSON.stringify(powerUps));
        } catch (e) {
            console.warn('Não foi possível salvar power-ups');
        }
    },

    /**
     * Recupera power-ups salvos
     * @returns {object}
     */
    getPowerUps() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.POWER_UPS);
            return data ? JSON.parse(data) : { hints: 0, extraLives: 0, freeze: 0 };
        } catch (e) {
            return { hints: 0, extraLives: 0, freeze: 0 };
        }
    },

    /**
     * Limpa todos os dados salvos (exceto configurações)
     */
    clearGameData() {
        try {
            localStorage.removeItem(STORAGE_KEYS.HIGH_SCORE);
            localStorage.removeItem(STORAGE_KEYS.HISTORY);
            localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
        } catch (e) {
            console.warn('Não foi possível limpar dados');
        }
    }
};