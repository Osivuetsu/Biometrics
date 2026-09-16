import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`Biometric engine URL: ${env.BIOMETRIC_ENGINE_URL}`);
  });
};

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
