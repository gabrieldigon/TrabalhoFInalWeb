// Banco de palavras - seleções da Copa do Mundo 2026
const WORDS = {
    // Fácil: 5 letras
    easy: [
        { word: 'BRASIL', hint: 'Maior vencedor da história (5 títulos)' },
        { word: 'FRANCA', hint: 'Campeã em 1998 e 2018' },
        { word: 'ITALIA', hint: '4 títulos mundiais' },
        { word: 'ESPANHA', hint: 'Campeã em 2010' },
        { word: 'CHILE', hint: 'País sede da Copa 1962' },
        { word: 'JAPAO', hint: 'País sede da Copa 2002' },
        { word: 'MEXICO', hint: 'País sede das Copas de 1970 e 1986' },
        { word: 'PERU', hint: 'Seleção sul-americana' },
        { word: 'EGITO', hint: 'Seleção africana' },
        { word: 'SUICA', hint: 'País sede de Copas (1954)' },
    ],
    // Médio: 6-7 letras
    medium: [
        { word: 'ALEMANHA', hint: '4 títulos mundiais' },
        { word: 'ARGENTINA', hint: 'Campeã em 2022' },
        { word: 'INGLATERRA', hint: 'Campeã em 1966' },
        { word: 'HOLANDA', hint: '3 vezes vice-campeã' },
        { word: 'PORTUGAL', hint: 'Campeã Europeia 2016' },
        { word: 'URUGUAI', hint: '2 títulos mundiais' },
        { word: 'SUECIA', hint: 'Vice-campeã em 1958' },
        { word: 'DINAMARCA', hint: 'Campeã Europeia 1992' },
        { word: 'COLOMBIA', hint: 'Seleção sul-americana' },
        { word: 'POLONIA', hint: 'Seleção europeia' },
    ],
    // Difícil: 8-9 letras
    hard: [
        { word: 'CROACIA', hint: 'Vice-campeã em 2018' },
        { word: 'BELGICA', hint: '3º lugar em 2018' },
        { word: 'SERVIA', hint: 'Seleção dos Bálcãs' },
        { word: 'ESCOCIA', hint: 'Seleção britânica' },
        { word: 'NORUEGA', hint: 'País nórdico' },
        { word: 'AUSTRIA', hint: 'País da Europa Central' },
        { word: 'GANES', hint: 'Seleção africana' },
        { word: 'CAMAROES', hint: 'Seleção africana' },
        { word: 'MARROCOS', hint: 'Semifinalista em 2022' },
        { word: 'ARGELIA', hint: 'Seleção norte-africana' },
    ]
};

// Palavras adicionais para fases avançadas com maior variedade
const EXTRA_WORDS = [
    { word: 'EQUADOR', hint: 'País da linha do equador na América do Sul' },
    { word: 'TUNISIA', hint: 'Seleção norte-africana' },
    { word: 'IRLANDA', hint: 'Ilha da Europa Ocidental' },
    { word: 'HUNGRIA', hint: 'País da Europa Central' },
    { word: 'ROMENIA', hint: 'País do Leste Europeu' },
    { word: 'BULGARIA', hint: 'País dos Bálcãs' },
    { word: 'TURQUIA', hint: 'País transcontinental' },
    { word: 'UCRANIA', hint: 'Maior país da Europa' },
    { word: 'COSTARICA', hint: 'País da América Central' },
    { word: 'PANAMA', hint: 'País da América Central' },
];

/**
 * Retorna uma palavra aleatória baseada na dificuldade e fase
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @param {number} phase - fase atual (incrementa dificuldade)
 * @returns {{ word: string, hint: string }}
 */
function getRandomWord(difficulty, phase = 1) {
    let pool;

    if (phase >= 3) {
        pool = [...WORDS[difficulty], ...EXTRA_WORDS];
    } else {
        pool = WORDS[difficulty];
    }

    // Em fases mais avançadas, podemos selecionar palavras maiores
    if (phase >= 2 && difficulty === 'easy') {
        pool = [...WORDS.easy, ...WORDS.medium];
    }

    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
}

/**
 * Retorna o número máximo de tentativas baseado na dificuldade
 * @param {string} difficulty
 * @returns {number}
 */
function getMaxAttempts(difficulty) {
    switch (difficulty) {
        case 'easy': return 8;
        case 'medium': return 6;
        case 'hard': return 5;
        default: return 6;
    }
}