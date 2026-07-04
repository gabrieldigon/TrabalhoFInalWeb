import { Router } from 'express';
import { mainController } from '../controllers/mainController';

const router = Router();

// Public routes
router.get('/about', mainController.getAbout);
router.get('/lorem/:count', mainController.getLorem);

// Handlebars demo routes
router.get('/hb1', mainController.getHb1);
router.get('/hb2', mainController.getHb2);
router.get('/hb3', mainController.getHb3);
router.get('/hb4', mainController.getHb4);

// Auth routes
router.get('/login', mainController.getLogin);
router.post('/login', mainController.postLogin);
router.get('/register', mainController.getRegister);
router.post('/register', mainController.postRegister);
router.get('/logout', mainController.getLogout);

// Major CRUD routes
router.get('/majors', mainController.getMajors);
router.post('/majors', mainController.postMajor);
router.post('/majors/delete/:id', mainController.deleteMajor);

// Game routes (authenticated)
router.get('/', mainController.getHome);
router.post('/game/save-score', mainController.saveScore);

// Ranking route
router.get('/ranking', mainController.getRanking);

export default router;