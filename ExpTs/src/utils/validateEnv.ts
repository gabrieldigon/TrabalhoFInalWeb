import { cleanEnv, str, num } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

const env = cleanEnv(process.env, {
  PORT: num({ default: 3000 }),
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  LOGS_PATH: str({ default: './logs' }),
  DATABASE_URL: str(),
  SESSION_SECRET: str(),
});

export default env;