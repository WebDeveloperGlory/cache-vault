/**
 * src/shared/types/express.d.ts
 *
 * Augments Express Request with project-specific fields.
 */

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                [key: string]: any;
            };
            auditInfo?: {
                ipAddress: string;
                timestamp: string;
                route: string;
                method: string;
                userAgent: string;
            };
        }
    }
}

export {};
