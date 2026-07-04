import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import env from '../utils/validateEnv';

type LogFormat = 'simple' | 'complete';

function logger(format: LogFormat = 'simple') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const logsPath = env.LOGS_PATH;
    
    if (!fs.existsSync(logsPath)) {
      fs.mkdirSync(logsPath, { recursive: true });
    }

    const logFile = path.join(logsPath, 'access.log');
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const method = req.method;
    const url = req.originalUrl || req.url;
    const httpVersion = req.httpVersion;
    const userAgent = req.get('User-Agent') || 'Unknown';

    let logMessage: string;

    if (format === 'simple') {
      logMessage = `[${timestamp}] ${method} ${url}\n`;
    } else {
      logMessage = `[${timestamp}] ${method} ${url} HTTP/${httpVersion} - ${userAgent}\n`;
    }

    fs.appendFile(logFile, logMessage, (err) => {
      if (err) {
        console.error('Error writing log file:', err);
      }
    });

    next();
  };
}

export default logger;