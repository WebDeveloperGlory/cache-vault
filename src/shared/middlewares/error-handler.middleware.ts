/**
 * src/shared/middlewares/error-handler.middleware.ts
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, AudioTooLargeError, AudioUploadError, ImageTooLargeError, ImageUploadError } from '@shared/errors/app.error';
import { logger } from '@shared/utils/logger.util';
import mongoose from 'mongoose';
import multer from 'multer';

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    _next: NextFunction,
): void => {
    logger.error('Error occurred:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
    });

    if (error instanceof ZodError) {
        res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message,
            })),
        });
        return;
    }

    if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message,
            })),
        });
        return;
    }

    if (error instanceof mongoose.Error.CastError) {
        res.status(400).json({ success: false, error: 'Invalid ID format' });
        return;
    }

    if ((error as any).code === 11000) {
        res.status(409).json({
            success: false,
            error: 'Duplicate key error',
            field: Object.keys((error as any).keyPattern)[0],
        });
        return;
    }

    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            error: error.message,
            code: error.code,
        });
        return;
    }

    res.status(500).json({ success: false, error: 'Internal Server Error' });
};

export const handleUnhandledRejection = () => {
    process.on('unhandledRejection', (reason: Error) => {
        logger.error('Unhandled Rejection:', reason);
        throw reason;
    });
};

export const handleUncaughtException = () => {
    process.on('uncaughtException', (error: Error) => {
        logger.error('Uncaught Exception:', error);
        process.exit(1);
    });
};

export const multerErrorHandler =
    (upload: any) =>
        (req: any, res: any, next: any) => {
            upload(req, res, (err: any) => {
                if (!err) return next();
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') return next(new ImageTooLargeError());
                    if (err.code === 'LIMIT_UNEXPECTED_FILE') return next(new ImageUploadError('Unexpected image field'));
                    return next(new ImageUploadError(err.message));
                }
                next(err);
            });
        };

export const multerAudioErrorHandler =
    (upload: any) =>
        (req: any, res: any, next: any) => {
            upload(req, res, (err: any) => {
                if (!err) return next();
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') return next(new AudioTooLargeError());
                    if (err.code === 'LIMIT_UNEXPECTED_FILE') return next(new AudioUploadError('Unexpected audio field'));
                    return next(new AudioUploadError(err.message));
                }
                next(err);
            });
        };
