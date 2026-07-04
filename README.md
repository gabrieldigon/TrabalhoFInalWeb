# 🏆 Wordle Copa 2026

Jogo **Wordle** temático da **Copa do Mundo 2026**, desenvolvido com TypeScript, Express, Prisma, Handlebars, HTML, CSS e JavaScript.

## 📋 Descrição do Projeto

O projeto possui duas partes:

1. **Back-end (Express + TypeScript + Prisma)** — servidor completo com sistema de autenticação (login/cadastro), ranking, CRUD de cursos, e o jogo Wordle integrado com Handlebars.
2. **Front-end estático** (`game/`) — versão standalone do jogo, sem login (apenas para testes rápidos).

A parte principal do trabalho é o **servidor**, que o professor irá rodar conforme as instruções abaixo.

## 🚀 Instruções para Execução (para o Professor)

### Pré-requisitos

- Node.js 16+ (com npm)
- PostgreSQL (banco de dados local rodando)

### Passo a passo

**1. Clone o repositório:**
```bash
git clone <url-do-repositorio>
```

**2. Entre na pasta do servidor:**
```bash
cd TrabalhoFInalWeb/ExpTs
```

**3. Instale as dependências:**
```bash
npm install
```

**4. Configure o arquivo `.env`:**

Copie o arquivo de exemplo:
```bash
cp .env.example .env
```

Edite o `.env` com suas configurações locais — especialmente a `DATABASE_URL` do seu PostgreSQL:
```env
PORT=3000
NODE_ENV=development
LOGS_PATH=./logs
DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/wordle_copa_2026"
SESSION_SECRET="uma-chave-secreta-qualquer"
```
> ⚠️ Crie o banco de dados no PostgreSQL antes de rodar as migrações:
> ```sql
> CREATE DATABASE wordle_copa_2026;
> ```

**5. Execute as migrações do Prisma (cria as tabelas no banco):**
```bash
npx prisma migrate dev
```

**6. Inicie o servidor:**
```bash
npm start
```

**7. Acesse no navegador:**
```
http://localhost:3000
```

Você será redirecionado para a tela de **login**. É possível:
- Criar uma nova conta em **"Criar Conta"**
- Fazer login com uma conta existente
- Jogar o Wordle Copa 2026 (o jogo fica em `/`)
- Visualizar o **ranking** em `/ranking`
- Gerenciar **cursos** em `/majors`

## 🎮 Funcionalidades do Servidor

| Rota              | Descrição                          | Requer Autenticação |
|-------------------|------------------------------------|:-------------------:|
| `/login`          | Página de login                    | ❌                  |
| `/register`       | Página de criação de conta         | ❌                  |
| `/`               | Jogo Wordle                        | ✅                  |
| `/ranking`        | Ranking de pontuações              | ✅                  |
| `/majors`         | CRUD de cursos                     | ✅                  |
| `/about`          | Sobre o projeto                    | ❌                  |
| `/logout`         | Encerrar sessão                    | ✅                  |

### Mecânica do Jogo

1. No menu, selecione a dificuldade (Fácil/Médio/Difícil) e clique em "Jogar".
2. Digite letras no teclado virtual ou físico para formar o nome da seleção.
   - Letras **verdes**: estão na posição correta.
   - Letras **amarelas**: estão na palavra mas em posição errada.
   - Letras **cinzas**: não estão na palavra.
3. O jogo possui 3 fases com palavras de tamanho crescente.
4. Ao final, a pontuação é salva no banco de dados e aparece no ranking.

### Dificuldades

| Dificuldade | Tentativas | Vidas | Power-ups                    |
|-------------|-----------|-------|------------------------------|
| Fácil       | 8         | 5     | 3 dicas, 2 vidas, 2 freeze   |
| Médio       | 6         | 3     | 2 dicas, 1 vida, 1 freeze    |
| Difícil     | 5         | 2     | 1 dica, 0 vidas, 0 freeze    |

### Power-ups
- 💡 **Dica**: Revela uma letra aleatória não descoberta
- ❤️ **Vida Extra**: Adiciona +1 vida
- 🧊 **Freeze**: Congela o temporizador (se houver)

### Controles
- **Teclado virtual**: Clique nas letras na tela
- **Teclado físico**: Digite as letras diretamente
- **Enter**: Envia a tentativa
- **Backspace/Delete**: Remove a última letra
- **Esc/P**: Pausa/Continua o jogo

### Funcionalidades Implementadas

1. ✅ Sistema de autenticação (cadastro, login, sessão)
2. ✅ Diferentes tipos de desafios: palavras de 5 a 9 letras com hint
3. ✅ Power-ups: Dica, Vida Extra e Freeze
4. ✅ Efeitos sonoros via Web Audio API
5. ✅ Ranking global de pontuações salvo no banco de dados
6. ✅ Menu inicial com seleção de dificuldade
7. ✅ Aumento de dificuldade progressivo (3 fases com palavras maiores)
8. ✅ localStorage para salvar configurações e histórico local
9. ✅ CRUD de cursos (funcionalidade extra com banco de dados)
10. ✅ Layout responsivo com Bootstrap + SCSS

## 📁 Estrutura do Projeto

```
TrabalhoFInalWeb/
├── README.md
├── package.json / package-lock.json
│
├── game/                              # Versão standalone do jogo (sem login)
│   ├── index.html
│   ├── style.css
│   └── js/
│       ├── words.js, storage.js, sound.js, player.js
│       ├── keyboard.js, ui.js, game.js, main.js
│
└── ExpTs/                             # 🔹 Servidor principal (Express + TypeScript)
    ├── package.json
    ├── tsconfig.json
    ├── nodemon.json
    ├── .env.example
    ├── .gitignore
    │
    ├── prisma/
    │   ├── schema.prisma              # Modelos: User, Major, GameSession
    │   └── migrations/
    │
    └── src/
        ├── index.ts                   # Entry point do servidor
        ├── router/
        │   └── router.ts              # Rotas da aplicação
        ├── controllers/
        │   └── mainController.ts      # Lógica das rotas
        ├── services/
        │   ├── majorService.ts        # CRUD de cursos
        │   ├── userService.ts         # Autenticação de usuários
        │   └── gameService.ts         # Ranking e sessões de jogo
        ├── middlewares/
        │   └── logger.ts              # Logs das requisições
        ├── utils/
        │   └── validateEnv.ts         # Validação de variáveis de ambiente
        ├── types/
        │   └── index.ts               # Tipos TypeScript
        ├── views/                     # Templates Handlebars (.hbs)
        │   ├── layouts/
        │   ├── partials/
        │   ├── login.hbs
        │   ├── register.hbs
        │   ├── game.hbs
        │   ├── ranking.hbs
        │   ├── majors.hbs
        │   ├── about.hbs
        │   └── hb1.hbs ~ hb4.hbs     # Demonstrações do Handlebars
        └── public/                    # Arquivos estáticos
            ├── css/
            │   ├── style.css
            │   └── style.scss
            ├── img/
            └── js/                    # Jogo (front-end)
                ├── words.js, storage.js, sound.js, player.js
                ├── keyboard.js, ui.js, game-logic.js, main.js