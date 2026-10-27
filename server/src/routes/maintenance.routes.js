import express from 'express';
import { analyticsService } from '../services/analytics.service.js';

const router = express.Router();

router.get('/overview', (req, res, next) => {
  try {
    const criticalThreshold = req.query.critical ? parseFloat(req.query.critical) : 15;
    const warningThreshold = req.query.warning ? parseFloat(req.query.warning) : 40;

    const overview = analyticsService.getMaintenanceOverview({
      critical: criticalThreshold,
      warning: warningThreshold
    });

    res.json({
      success: true,
      ...overview
    });
  } catch (error) {
    next(error);
  }
});

router.post('/review/:engineId', (req, res, next) => {
  try {
    const rawId = req.params.engineId;
    const engineId = rawId.startsWith('FD001-') ? rawId : `FD001-${rawId.padStart(3, '0')}`;
    const { notes, reviewer, reviewed } = req.body;

    const record = analyticsService.saveMaintenanceReview(engineId, {
      reviewed: reviewed !== undefined ? reviewed : true,
      notes: notes || 'Inspection scheduled.',
      reviewer: reviewer || 'Lead Maintenance Engineer'
    });

    res.json({
      success: true,
      message: `Engine ${engineId} maintenance status updated.`,
      review: record
    });
  } catch (error) {
    next(error);
  }
});

export default router;
