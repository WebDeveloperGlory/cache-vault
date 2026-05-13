import { createAppAndServer } from './app';
import { config } from '@shared/config/env.config';
import { database } from '@shared/config/mongoose.config';
import { logger } from '@shared/utils/logger.util';
import { handleUnhandledRejection, handleUncaughtException } from '@shared/middlewares/error-handler.middleware';
import { createRouter } from './routes';
import { redisClient } from '@shared/config/redis';

handleUncaughtException();
handleUnhandledRejection();

async function bootstrap() {
    try {
        await database.connect();
        await redisClient.connect();
        const router = createRouter();
        const { server } = createAppAndServer(router);

        server.listen(config.port, () => {
            logger.info(`
  ✅ Server running
  🚀 Environment : ${config.env}
  🌍 Port        : ${config.port}
  📝 URL         : http://localhost:${config.port}
  🗄️  Database    : Connected
  📦  Cache       : Connected
      `);
        });

        const gracefulShutdown = async (signal: string) => {
            logger.info(`${signal} received — shutting down`);
            server.close(async () => {
                await database.disconnect();
                await redisClient.disconnect();
                process.exit(0);
            });
            setTimeout(() => process.exit(1), 10_000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

bootstrap();
