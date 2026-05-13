import express, { Application, Router } from 'express';
import http from 'http';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { config } from '@shared/config/env.config';
import { errorHandler } from '@shared/middlewares/error-handler.middleware';
import { apiLimiter } from '@shared/middlewares/rate-limiter.middleware';

export const createAppAndServer = (router: Router): { app: Application; server: http.Server } => {
    const app = express();
    const server = http.createServer(app);

    app.use(helmet());
    app.use(cors(config.corsOptions));
    app.use('/api', apiLimiter);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/uploads', express.static('uploads'));

    if (config.env !== 'test') {
        app.use(morgan('dev'));
    }

    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
    });

    app.use('/api/v1', router);

    app.use((req, res) => {
        res.status(404).json({ success: false, error: 'Route not found', path: req.path });
    });

    app.use(errorHandler);

    return { app, server };
};

export const createApp = (router: Router): Application => createAppAndServer(router).app;
