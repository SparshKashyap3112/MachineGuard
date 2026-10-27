import express from 'express';
import { fleetService } from '../services/fleet.service.js';

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const { search, healthCategory, sortBy, sortOrder } = req.query;
    const result = fleetService.getAllEngines({
      search,
      healthCategory,
      sortBy,
      sortOrder
    });
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

router.get('/samples', (req, res, next) => {
  try {
    const samples = fleetService.getSampleEngines();
    res.json({
      success: true,
      samples
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:engineId', (req, res, next) => {
  try {
    const rawId = req.params.engineId;
    // Handle either "1", "001", or "FD001-001"
    const numericId = rawId.includes('-') ? rawId.split('-')[1] : rawId;
    const engine = fleetService.getEngineById(numericId);

    if (!engine) {
      return res.status(404).json({
        success: false,
        error: `Engine with ID "${rawId}" not found in FD001 fleet dataset.`
      });
    }

    res.json({
      success: true,
      engine
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:engineId/sensors', (req, res, next) => {
  try {
    const rawId = req.params.engineId;
    const numericId = rawId.includes('-') ? rawId.split('-')[1] : rawId;
    const requestedSensors = req.query.sensors
      ? req.query.sensors.split(',')
      : ['sensor_2', 'sensor_3', 'sensor_4', 'sensor_7', 'sensor_11', 'sensor_12', 'sensor_15'];

    const history = fleetService.getEngineSensorHistory(numericId, requestedSensors);

    res.json({
      success: true,
      engine_id: `FD001-${String(numericId).padStart(3, '0')}`,
      total_cycles: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:engineId/window', (req, res, next) => {
  try {
    const rawId = req.params.engineId;
    const numericId = rawId.includes('-') ? rawId.split('-')[1] : rawId;
    const window = fleetService.getEngineLatestWindow(numericId);

    if (!window) {
      return res.status(404).json({
        success: false,
        error: `Window sequence for engine ${rawId} unavailable.`
      });
    }

    res.json({
      success: true,
      ...window
    });
  } catch (error) {
    next(error);
  }
});

export default router;
