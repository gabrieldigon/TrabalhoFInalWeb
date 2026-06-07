const Keyboard = {
    _container: null,
    _keys: {},
    _keyStates: {},
    _onKeyPress: null,
    _onEnter: null,
    _onBackspace: null,

    _layout: [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ],

    create(container, callbacks = {}) {
        this._container = container;
        this._onKeyPress = callbacks.onKeyPress || (() => {});
        this._onEnter = callbacks.onEnter || (() => {});
        this._onBackspace = callbacks.onBackspace || (() => {});
        this._keys = {};
        this._keyStates = {};

        container.innerHTML = '';
        container.className = 'keyboard';

        this._layout.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';

            if (row === this._layout[1]) {
                const backBtn = this._createKey('⌫', 'key-backspace');
                backBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    Sound.keyPress();
                    this._onBackspace();
                });
                rowDiv.appendChild(backBtn);
            }

            row.forEach(letter => {
                const key = this._createKey(letter, 'key-letter');
                key.addEventListener('click', (e) => {
                    e.preventDefault();
                    Sound.keyPress();
                    this._onKeyPress(letter);
                });
                rowDiv.appendChild(key);
                this._keys[letter] = key;
            });

            if (row === this._layout[2]) {
                const enterBtn = this._createKey('Enter', 'key-enter');
                enterBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    Sound.keyPress();
                    this._onEnter();
                });
                rowDiv.appendChild(enterBtn);
            }

            container.appendChild(rowDiv);
        });
    },

    _createKey(label, className) {
        const btn = document.createElement('button');
        btn.className = `key ${className}`;
        btn.textContent = label;
        btn.setAttribute('aria-label', label);
        return btn;
    },

    setKeyState(letter, state) {
        if (!this._keys[letter]) return;

        const currentState = this._keyStates[letter];
        const priority = { correct: 3, misplaced: 2, wrong: 1 };
        const currentPriority = priority[currentState] || 0;
        const newPriority = priority[state] || 0;

        if (newPriority <= currentPriority) return;

        this._keys[letter].className = 'key key-letter';
        this._keyStates[letter] = state;

        switch (state) {
            case 'correct':
                this._keys[letter].classList.add('correct');
                break;
            case 'misplaced':
                this._keys[letter].classList.add('misplaced');
                break;
            case 'wrong':
                this._keys[letter].classList.add('wrong');
                break;
        }
    },

    reset() {
        Object.keys(this._keys).forEach(letter => {
            this._keys[letter].className = 'key key-letter';
        });
        this._keyStates = {};
    },

    setDisabled(disabled) {
        const buttons = this._container.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.disabled = disabled;
        });
    }
};