// Módulo de efeitos sonoros usando Web Audio API

const Sound = {
    _context: null,
    _enabled: true,
    _volume: 0.3,

    /**
     * Inicializa o contexto de áudio (requer interação do usuário)
     */
    init() {
        try {
            this._context = new (window.AudioContext || window.webkitAudioContext)();
            this._enabled = Storage.getSettings().soundEnabled;
        } catch (e) {
            console.warn('Web Audio API não suportada');
            this._enabled = false;
        }
    },

    /**
     * Alterna som ligado/desligado
     * @returns {boolean} Novo estado
     */
    toggle() {
        this._enabled = !this._enabled;
        const settings = Storage.getSettings();
        settings.soundEnabled = this._enabled;
        Storage.saveSettings(settings);
        return this._enabled;
    },

    /**
     * Toca um tom simples
     * @param {number} frequency - Frequência em Hz
     * @param {number} duration - Duração em segundos
     * @param {string} type - Tipo de onda (sine, square, triangle, sawtooth)
     */
    _playTone(frequency, duration = 0.15, type = 'sine') {
        if (!this._enabled || !this._context) return;

        try {
            if (this._context.state === 'suspended') {
                this._context.resume();
            }

            const oscillator = this._context.createOscillator();
            const gainNode = this._context.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this._context.destination);

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this._context.currentTime);

            gainNode.gain.setValueAtTime(this._volume, this._context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this._context.currentTime + duration);

            oscillator.start(this._context.currentTime);
            oscillator.stop(this._context.currentTime + duration);
        } catch (e) {
            // Silencia erro de áudio
        }
    },

    /**
     * Som de tecla pressionada
     */
    keyPress() {
        this._playTone(500, 0.05, 'square');
    },

    /**
     * Som de letra correta (verde)
     */
    correctLetter() {
        this._playTone(800, 0.12, 'sine');
        setTimeout(() => this._playTone(1000, 0.12, 'sine'), 80);
    },

    /**
     * Som de letra no lugar errado (amarelo)
     */
    misplacedLetter() {
        this._playTone(600, 0.15, 'triangle');
    },

    /**
     * Som de letra ausente (cinza)
     */
    wrongLetter() {
        this._playTone(300, 0.15, 'sawtooth');
    },

    /**
     * Som de erro (linha completa errada)
     */
    error() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this._playTone(200 - i * 30, 0.1, 'sawtooth'), i * 100);
        }
    },

    /**
     * Som de vitória
     */
    victory() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this._playTone(freq, 0.2, 'sine'), i * 150);
        });
    },

    /**
     * Som de derrota
     */
    defeat() {
        const notes = [400, 350, 300, 200];
        notes.forEach((freq, i) => {
            setTimeout(() => this._playTone(freq, 0.25, 'triangle'), i * 200);
        });
    },

    /**
     * Som de power-up coletado
     */
    powerUp() {
        this._playTone(400, 0.1, 'sine');
        setTimeout(() => this._playTone(600, 0.1, 'sine'), 100);
        setTimeout(() => this._playTone(800, 0.15, 'sine'), 200);
    },

    /**
     * Som de clique no menu
     */
    menuClick() {
        this._playTone(440, 0.08, 'triangle');
    },

    /**
     * Som de dica revelada
     */
    hint() {
        this._playTone(600, 0.1, 'sine');
        setTimeout(() => this._playTone(900, 0.15, 'sine'), 120);
    }
};