import app from './app';
import { config } from './config';
import { connectDB } from './config/database';
import { initPostgres } from './config/postgres';


const start = async () => {
  console.log('========================================');
  console.log('  Kisaan Suraksha — Backend Server');
  console.log('========================================');
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Demo Mode: ${config.demoMode}`);
  console.log(`AI Service: ${config.aiServiceUrl}`);

  // Connect to MongoDB
  await connectDB();

  // Initialize PostgreSQL connection
  await initPostgres();

  // Start server
  app.listen(config.port, () => {
    console.log(`[Server] Running on http://localhost:${config.port}`);
    console.log('========================================');
  });
};

start().catch((error) => {
  console.error('[Fatal] Failed to start server:', error);
  process.exit(1);
});
