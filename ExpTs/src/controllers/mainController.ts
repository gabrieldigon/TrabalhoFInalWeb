import { Request, Response } from 'express';
import { majorService } from '../services/majorService';
import { userService } from '../services/userService';
import { gameService } from '../services/gameService';
import { loremIpsum } from 'lorem-ipsum';

export const mainController = {
  // Home / Game page
  getHome(req: Request, res: Response) {
    const session = req.session as any;
    if (!session.userId) {
      return res.redirect('/login');
    }
    res.render('game', {
      title: 'Jogar - Wordle Copa 2026',
      userFullName: session.userFullName
    });
  },

  // About page
  getAbout(req: Request, res: Response) {
    res.render('about', { title: 'Sobre - Wordle Copa 2026' });
  },

  // Lorem Ipsum
  getLorem(req: Request, res: Response) {
    const count = parseInt(req.params.count as string) || 1;
    const clampedCount = Math.min(Math.max(count, 1), 100);
    const paragraphs = loremIpsum({ count: clampedCount, units: 'paragraphs' });
    const html = paragraphs
      .split('\n')
      .filter((p: string) => p.trim())
      .map((p: string) => `<p>${p}</p>`)
      .join('');
    res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Lorem Ipsum - ${clampedCount} parágrafos</title></head>
<body>${html}</body>
</html>`);
  },

  // Handlebars demo pages
  getHb1(req: Request, res: Response) {
    res.render('hb1', {
      title: 'HB1 - Handlebars Demo',
      message: 'Olá, esta é uma mensagem passada via variável do Handlebars!'
    });
  },

  getHb2(req: Request, res: Response) {
    res.render('hb2', {
      title: 'HB2 - Comando #if',
      showMessage: true,
      message: 'Esta mensagem é exibida porque showMessage é true!'
    });
  },

  getHb3(req: Request, res: Response) {
    const items = ['Express', 'TypeScript', 'Prisma', 'Handlebars', 'Node.js'];
    res.render('hb3', {
      title: 'HB3 - Comando #each',
      items
    });
  },

  getHb4(req: Request, res: Response) {
    const technologies = [
      { name: 'Express', type: 'Framework', poweredByNodejs: true },
      { name: 'Laravel', type: 'Framework', poweredByNodejs: false },
      { name: 'React', type: 'Library', poweredByNodejs: true },
      { name: 'Handlebars', type: 'Engine View', poweredByNodejs: true },
      { name: 'Django', type: 'Framework', poweredByNodejs: false },
      { name: 'Docker', type: 'Virtualization', poweredByNodejs: false },
      { name: 'Sequelize', type: 'ORM tool', poweredByNodejs: true },
    ];
    res.render('hb4', {
      title: 'HB4 - Helper de Tecnologias',
      technologies
    });
  },

  // Major CRUD
  async getMajors(req: Request, res: Response) {
    try {
      const session = req.session as any;
      const majors = await majorService.findAll();
      res.render('majors', {
        title: 'Cursos - Wordle Copa 2026',
        majors,
        userFullName: session.userFullName
      });
    } catch (error) {
      res.status(500).send('Erro ao carregar cursos');
    }
  },

  async postMajor(req: Request, res: Response) {
    try {
      await majorService.create({ name: req.body.name });
      res.redirect('/majors');
    } catch (error) {
      res.status(500).send('Erro ao criar curso');
    }
  },

  async deleteMajor(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      await majorService.delete(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao excluir curso' });
    }
  },

  // Auth routes
  getLogin(req: Request, res: Response) {
    const session = req.session as any;
    if (session.userId) {
      return res.redirect('/');
    }
    res.render('login', { title: 'Login - Wordle Copa 2026' });
  },

  async postLogin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await userService.findByEmail(email);

      if (!user) {
        return res.render('login', {
          title: 'Login - Wordle Copa 2026',
          error: 'Email ou senha inválidos'
        });
      }

      const valid = await userService.validatePassword(password, user.password);
      if (!valid) {
        return res.render('login', {
          title: 'Login - Wordle Copa 2026',
          error: 'Email ou senha inválidos'
        });
      }

      const session = req.session as any;
      session.userId = user.id;
      session.userFullName = user.fullName;
      session.userEmail = user.email;

      res.redirect('/');
    } catch (error) {
      res.status(500).render('login', {
        title: 'Login - Wordle Copa 2026',
        error: 'Erro interno do servidor'
      });
    }
  },

  async getRegister(req: Request, res: Response) {
    const session = req.session as any;
    if (session.userId) {
      return res.redirect('/');
    }
    res.render('register', { 
      title: 'Criar Conta - Wordle Copa 2026'
    });
  },

  async postRegister(req: Request, res: Response) {
    try {
      const { fullName, email, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return res.render('register', {
          title: 'Criar Conta - Wordle Copa 2026',
          error: 'As senhas não conferem'
        });
      }

      const existingUser = await userService.findByEmail(email);
      if (existingUser) {
        return res.render('register', {
          title: 'Criar Conta - Wordle Copa 2026',
          error: 'Este email já está cadastrado'
        });
      }

      await userService.create({
        fullName,
        email,
        password
      });

      res.redirect('/login');
    } catch (error) {
      res.status(500).render('register', {
        title: 'Criar Conta - Wordle Copa 2026',
        error: 'Erro interno do servidor'
      });
    }
  },

  getLogout(req: Request, res: Response) {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  },

  // Game session - save score via Ajax
  async saveScore(req: Request, res: Response) {
    try {
      const session = req.session as any;
      if (!session.userId) {
        return res.status(401).json({ success: false, message: 'Não autenticado' });
      }

      const { score, difficulty, won, word, attempts } = req.body;
      const gameSession = await gameService.saveScore({
        userId: session.userId,
        score: parseInt(score) || 0,
        difficulty: difficulty || 'medium',
        won: won || false,
        word: word || '',
        attempts: parseInt(attempts) || 0
      });

      res.json({ success: true, session: gameSession });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao salvar pontuação' });
    }
  },

  // Ranking page
  async getRanking(req: Request, res: Response) {
    try {
      const session = req.session as any;
      const ranking = await gameService.getRanking();
      res.render('ranking', {
        title: 'Ranking - Wordle Copa 2026',
        ranking,
        userFullName: session.userFullName
      });
    } catch (error) {
      res.status(500).send('Erro ao carregar ranking');
    }
  }
};