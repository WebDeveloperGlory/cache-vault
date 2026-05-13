/**
 * src/shared/utils/logger.util.ts
 */

import winston from 'winston';

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) msg += ` ${JSON.stringify(meta)}`;
        return msg;
    }),
);

export const logger = winston.createLogger({
    // Read level at call-time so test env can silence it via setup-env.ts
    level: process.env.LOG_LEVEL ?? 'info',
    format: logFormat,
    transports: [
        new winston.transports.Console({ format: consoleFormat }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

if (process.env.NODE_ENV === 'test') {
    logger.clear();
    logger.add(new winston.transports.Console({ format: consoleFormat, silent: true }));
}
