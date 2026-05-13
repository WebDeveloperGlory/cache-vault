import { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

type CorsCallback = (err: Error | null, origin?: string | boolean | RegExp | (string | boolean | RegExp)[]) => void;

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().transform(Number).default('5000'),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    MONGODB_TEST_URI: z.string().optional(),
    ALLOWED_ORIGINS: z.string().transform(v => v.split(',').map(o => o.trim())),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.string().transform(Number),
    REDIS_PASSWORD: z.string(),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    EMAIL_VERIFICATION_SECRET: z.string().min(32),
    // PASSWORD_RESET_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().transform(Number).default(String(7 * 24 * 60 * 60)),

});

function validateEnv() {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        console.error('❌ Invalid environment variables:', error);
        process.exit(1);
    }
}

const env = validateEnv();

export const config = {
    env: env.NODE_ENV,
    port: env.PORT,
    database: {
        uri: env.MONGODB_URI,
        testUri: env.MONGODB_TEST_URI || env.MONGODB_URI,
    },
    jwt: {
        secret: env.JWT_SECRET,
        expiresIn: env.JWT_EXPIRES_IN,
        emailSecret: env.EMAIL_VERIFICATION_SECRET,
    },
    corsOptions: {
        origin: (origin: string, callback: CorsCallback) => {
            if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    } as CorsOptions,
    redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
        url: `redis://WebDeveloperGlory:${env.REDIS_PASSWORD}@${env.REDIS_HOST}:${env.REDIS_PORT}`,
    }
} as const;
