# 🏆 Wordle Copa 2026

Jogo **Wordle** temático da **Copa do Mundo 2026**, desenvolvido com HTML, CSS e JavaScript puro (sem engines ou canvas).

## Descrição do Funcionamento

O jogador deve adivinhar o nome de seleções da Copa do Mundo 2026 letra por letra, em um estilo similar ao Wordle original.

### Mecânica do Jogo

1. **Menu Inicial**: Selecione a dificuldade (Fácil/Médio/Difícil) e clique em "Jogar".
2. **Jogando**: Digite letras no teclado virtual ou físico para formar o nome da seleção.
   - Letras **verdes**: estão na posição correta.
   - Letras **amarelas**: estão na palavra mas em posição errada.
   - Letras **cinzas**: não estão na palavra.
3. **Fases**: O jogo possui 3 fases com palavras de tamanho crescente.
4. **Fim de Jogo**: O resultado é exibido com pontuação e recorde salvo.

### Dificuldades

| Dificuldade | Tentativas | Vidas | Timer | Power-ups |
|-------------|-----------|-------|-------|-----------|
| Fácil       | 8         | 5     | Não   | 3 dicas, 2 vidas, 2 freeze |
| Médio       | 6         | 3     | Não   | 2 dicas, 1 vida, 1 freeze |
| Difícil     | 5         | 2     | 60s   | 1 dica, 0 vidas, 0 freeze |

### Power-ups
- 💡 **Dica**: Revela uma letra aleatória não descoberta
- ❤️ **Vida Extra**: Adiciona +1 vida
- ❄️ **Freeze**: Adiciona +30 segundos no modo difícil

## Funcionalidades Implementadas

### Requisitos Obrigatórios
- [x] Apenas HTML, CSS e JavaScript com manipulação do DOM
- [x] Diferentes estados (menu, jogando, pausa, fim de jogo)
- [x] Interação do usuário (teclado físico e virtual)
- [x] Movimentação de elementos na tela (animações)
- [x] Detecção de colisões (comparação letra a letra)
- [x] Sistema de vidas e pontuação
- [x] Criação e remoção dinâmica de elementos (grade, teclado)
- [x] Aumento de dificuldade ao longo das fases
- [x] Código organizado em múltiplos arquivos JS

### Funcionalidades Adicionais (6)
1. **Diferentes tipos de desafios**: Palavras de 5 a 9 letras com hint
2. **Power-ups**: Dica, Vida Extra e Freeze
3. **Efeitos sonoros**: Web Audio API com diferentes sons para cada ação
4. **localStorage**: Salva pontuação máxima, histórico e configurações
5. **Menu inicial com seleção de dificuldade**
6. **Aumento de dificuldade progressivo**: 3 fases com palavras maiores

## Instruções para Execução

1. Clone o repositório:
   ```
   git clone <url-do-repositorio>
   cd TrabalhoFInalWeb
   ```

2. Abra o arquivo `app/index.html` em qualquer navegador moderno (Chrome, Firefox, Edge, Safari).

   **Ou** usando um servidor local (recomendado):
   ```
   npx serve app/
   # ou
   python3 -m http.server 8080 --directory app/
   ```

3. O jogo carregará automaticamente na tela de menu.

### Controles
- **Clique**: Teclado virtual na tela
- **Teclado físico**: Digite as letras diretamente
- **Enter**: Envia a tentativa
- **Backspace/Delete**: Remove última letra
- **Esc/P**: Pausa/Continua o jogo

## Estrutura do Projeto

```
TrabalhoFInalWeb/
├── README.md
└── app/
    ├── index.html          # Estrutura HTML principal
    ├── style.css           # Estilos e animações
    └── js/
        ├── words.js        # Banco de palavras (seleções)
        ├── storage.js      # localStorage (recordes, histórico)
        ├── sound.js        # Web Audio API (efeitos sonoros)
        ├── player.js       # Vidas, pontuação, power-ups
        ├── keyboard.js     # Teclado virtual
        ├── ui.js           # Manipulação do DOM
        ├── game.js         # Lógica principal do jogo
        └── main.js         # Controle de estados e eventos
```

## Tecnologias Utilizadas

- **HTML5**: Estrutura semântica com múltiplas telas
- **CSS3**: Variáveis, animações `@keyframes`, design responsivo, flexbox
- **JavaScript (ES6+)**: Manipulação do DOM, Web Audio API, localStorage, modularização
- Nenhuma biblioteca externa, framework ou engine foi utilizado.

## Autor

Projeto desenvolvido para a disciplina de Desenvolvimento Web.