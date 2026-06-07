const STORAGE_KEYS = {
    HIGH_SCORE: 'copa2026_highScore',
    HISTORY: 'copa2026_history',
    GAME_STATE: 'copa2026_gameState',
    SETTINGS: 'copa2026_settings',
    POWER_UPS: 'copa2026_powerUps'
};

const Storage = {
    saveHighScore(score) {
        const currentHigh = this.getHighScore();
        if (score > currentHigh) {
            try {
                localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    },

    getHighScore() {
        try {
            const val = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
            return val ? parseInt(val, 10) : 0;
        } catch (e) {
            return 0;
        }
    },

    addHistoryEntry(entry) {
        try {
            const history = this.getHistory();
            history.unshift({
                ...entry,
                date: new Date().toISOString()
            });
            const trimmed = history.slice(0, 20);
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
        } catch (e) {}
    },

    getHistory() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (e) {}
    },

    getSettings() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            return data ? JSON.parse(data) : { soundEnabled: true, theme: 'default' };
        } catch (e) {
            return { soundEnabled: true, theme: 'default' };
        }
    },

    savePowerUps(powerUps) {
        try {
            localStorage.setItem(STORAGE_KEYS.POWER_UPS, JSON.stringify(powerUps));
        } catch (e) {}
    },

    getPowerUps() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.POWER_UPS);
            return data ? JSON.parse(data) : { hints: 0, extraLives: 0, freeze: 0 };
        } catch (e) {
            return { hints: 0, extraLives: 0, freeze: 0 };
        }
    },

    clearGameData() {
        try {
            localStorage.removeItem(STORAGE_KEYS.HIGH_SCORE);
            localStorage.removeItem(STORAGE_KEYS.HISTORY);
            localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
        } catch (e) {}
    }
};