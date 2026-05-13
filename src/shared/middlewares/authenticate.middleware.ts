import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '@shared/config/env.config';
import { UnauthorizedError, ForbiddenError } from '@shared/errors/app.error';
import { UserRole } from '@modules/user/domain/entities/user.entity';

export interface JwtAccessPayload {
    sub: string;
    role: UserRole;
    iat: number;
    exp: number;
}

// ── Human (JWT) ────────────────────────────────────────────────────────────────
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.slice(7);
        const payload = jwt.verify(token, config.jwt.secret) as JwtAccessPayload;

        req.user = {
            id: payload.sub,
            role: payload.role,
            authType: 'human',
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) next(new UnauthorizedError('Invalid token'));
        else if (error instanceof jwt.TokenExpiredError) next(new UnauthorizedError('Token expired'));
        else next(error);
    }
};

// ── Guards ─────────────────────────────────────────────────────────────────────
export const requireRole = (...roles: UserRole[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ForbiddenError('Insufficient permissions'));
        }
        next();
    };
};