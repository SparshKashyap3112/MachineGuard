import app from './app.js';
import { config } from './config/index.js';
import { fleetService } from './services/fleet.service.js';
import { modelService } from './services/model.service.js';

const startServer = async () => {
  try {
    // Initialize fleet data
    fleetService.init();

    // Check inference service connectivity
    const health = await modelService.checkHealth();
    if (health.reachable) {
      console.log(`[MachineGuard Gateway] Connected to Python Inference Service at ${config.modelServiceUrl} (Healthy)`);
    } else {
      console.warn(`[MachineGuard Gateway] Warning: Python Inference Service at ${config.modelServiceUrl} is not yet reachable. Will retry on request.`);
    }

    const server = app.listen(config.port, config.host, () => {
      console.log(`=======================================================`);
      console.log(`   MachineGuard AI - Node.js API Gateway`);
      console.log(`   Running on http://${config.host}:${config.port}`);
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   Inference Target: ${config.modelServiceUrl}`);
      console.log(`=======================================================`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('\n[MachineGuard Gateway] Gracefully shutting down...');
      server.close(() => {
        console.log('[MachineGuard Gateway] Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('[MachineGuard Gateway] Fatal error during startup:', error);
    process.exit(1);
  }
};

startServer();
