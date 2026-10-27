import express from 'express';
import { modelService } from '../services/model.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const modelHealth = await modelService.checkHealth();

  const isHealthy = modelHealth.reachable && modelHealth.data?.status === 'healthy';

  res.status(isHealthy ? 200 : 207).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'MachineGuard AI Node.js API Gateway',
    timestamp: new Date().toISOString(),
    uptime_seconds: process.uptime(),
    components: {
      api_gateway: {
        status: 'online',
        port: process.env.PORT || 5000,
        node_version: process.version
      },
      model_inference_service: modelHealth
    }
  });
});

export default router;
