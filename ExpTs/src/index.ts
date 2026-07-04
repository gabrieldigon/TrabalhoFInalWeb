import express from 'express';
import session from 'express-session';
import path from 'path';
import { engine } from 'express-handlebars';
import env from './utils/validateEnv';
import logger from './middlewares/logger';
import router from './router/router';

const app = express();
const PORT = env.PORT;

// Handlebars setup with helpers
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  helpers: {
    techList: (technologies: { name: string; type: string; poweredByNodejs: boolean }[]) => {
      const filtered = technologies.filter(t => t.poweredByNodejs);
      let html = '<ul class="list-group">';
      filtered.forEach(t => {
        html += `<li class="list-group-item">${t.name} - ${t.type}</li>`;
      });
      html += '</ul>';
      return html;
    },
    add: (a: number, b: number) => a + b,
    multiply: (a: number, b: number) => a * b,
    divide: (a: number, b: number) => a / b,
  }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('complete'));

// Session
app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Routes
app.use(router);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

export default app;