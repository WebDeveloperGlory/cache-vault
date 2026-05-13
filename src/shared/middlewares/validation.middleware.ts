import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod/v4';

export const validateRequest = (schema: ZodType) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            next(error);
        }
    };
};

export const validateQuery = (schema: ZodType) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.query);
            next();
        } catch (error) {
            next(error);
        }
    };
};

export const validateParams = (schema: ZodType) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.params);
            next();
        } catch (error) {
            next(error);
        }
    };
};