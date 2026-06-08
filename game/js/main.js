(function () {
    'use strict';

    function init() {
        UI.init();
        Sound.init();

        const settings = Storage.getSettings();
        UI.updateSoundButton(settings.soundEnabled);
        UI.updateDifficultyLabel();

        setupMenuListeners();
        setupGameListeners();
        setupPhysicalKeyboard();
        setupPauseListeners();
        setupGameOverListeners();

        UI.showScreen('menu');
    }

    function setupMenuListeners() {
        const diffBtn = document.getElementById('difficulty-select');
        if (diffBtn) {
            diffBtn.addEventListener('click', () => {
                Sound.menuClick();
                const values = ['easy', 'medium', 'hard'];
                const labels = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' };
                const currentIndex = values.indexOf(diffBtn.dataset.value || 'medium');
                const nextIndex = (currentIndex + 1) % values.length;
                diffBtn.dataset.value = values[nextIndex];
                diffBtn.textContent = `Dificuldade: ${labels[values[nextIndex]]}`;
            });
            diffBtn.dataset.value = 'medium';
            diffBtn.textContent = 'Dificuldade: Médio';
        }

        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                Sound.menuClick();
                const difficulty = document.getElementById('difficulty-select').dataset.value || 'medium';
                Game.start(difficulty);
            });
        }

        const soundBtn = document.getElementById('sound-btn');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const enabled = Sound.toggle();
                UI.updateSoundButton(enabled);
            });
        }

        const historyBtn = document.getElementById('history-btn');
        if (historyBtn) {
            historyBtn.addEventListener('click', () => {
                Sound.menuClick();
                showHistory();
            });
        }
    }

    function setupGameListeners() {
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                Sound.menuClick();
                Game.togglePause();
            });
        }

        Keyboard.create(document.getElementById('keyboard-container'), {
            onKeyPress: (letter) => Game.onKeyPress(letter),
            onEnter: () => Game.onEnter(),
            onBackspace: () => Game.onBackspace()
        });

        const soundBtn = document.getElementById('game-sound-btn');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const enabled = Sound.toggle();
                UI.updateSoundButton(enabled);
                soundBtn.textContent = enabled ? '🔊' : '🔇';
            });
            soundBtn.textContent = Sound._enabled ? '🔊' : '🔇';
        }
    }

    function setupPhysicalKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const key = e.key.toUpperCase();

            if (e.key === ' ' || e.key === 'Space') {
                e.preventDefault();
            }

            const pauseOverlay = document.getElementById('pause-overlay');
            const isPaused = pauseOverlay && !pauseOverlay.classList.contains('hidden');

            if (isPaused) {
                if (key === 'ESCAPE' || key === 'P') {
                    Game.togglePause();
                }
                return;
            }

            switch (key) {
                case 'ENTER':
                    e.preventDefault();
                    Game.onEnter();
                    break;
                case 'BACKSPACE':
                case 'DELETE':
                    e.preventDefault();
                    Game.onBackspace();
                    break;
                case 'ESCAPE':
                case 'P':
                    Game.togglePause();
                    break;
                default:
                    if (key.length === 1 && /^[A-ZÁÉÍÓÚÃÕÂÊ]$/i.test(key)) {
                        e.preventDefault();
                        Game.onKeyPress(key);
                    }
                    break;
            }
        });
    }

    function setupPauseListeners() {
        const overlay = document.getElementById('pause-overlay');

        const resumeBtn = overlay ? overlay.querySelector('#resume-btn') : null;
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                Sound.menuClick();
                Game.togglePause();
            });
        }

        const quitBtn = overlay ? overlay.querySelector('#quit-btn') : null;
        if (quitBtn) {
            quitBtn.addEventListener('click', () => {
                Sound.menuClick();
                Game.quit();
            });
        }
    }

    function setupGameOverListeners() {
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                Sound.menuClick();
                const difficulty = document.getElementById('difficulty-select').dataset.value || 'medium';
                Game.start(difficulty);
            });
        }

        const menuBtn = document.getElementById('menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                Sound.menuClick();
                UI.showScreen('menu');
            });
        }
    }

    function showHistory() {
        const history = Storage.getHistory();
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay history-overlay';
        overlay.innerHTML = `
            <div class="history-modal">
                <h2>📊 Histórico de Jogos</h2>
                <div class="history-list">
                    ${history.length === 0
                        ? '<p class="empty-history">Nenhum jogo registrado ainda.</p>'
                        : history.slice(0, 10).map(entry => `
                            <div class="history-entry ${entry.guessed ? 'won' : 'lost'}">
                                <span class="history-word">${entry.word}</span>
                                <span class="history-detail">
                                    ${entry.guessed ? `✅ ${entry.attempts} tentativas` : '❌ Não acertou'}
                                </span>
                                <span class="history-score">${entry.score} pts</span>
                                <span class="history-date">${new Date(entry.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                        `).join('')
                    }
                </div>
                <button class="btn menu-btn" id="close-history-btn">Fechar</button>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target.id === 'close-history-btn') {
                overlay.remove();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();