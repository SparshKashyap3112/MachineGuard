import express from 'express';
import { analyticsService } from '../services/analytics.service.js';

const router = express.Router();

router.get('/summary', (req, res, next) => {
  try {
    const summary = analyticsService.getSummary();
    res.json({
      success: true,
      ...summary
    });
  } catch (error) {
    next(error);
  }
});

router.get('/evaluations', (req, res, next) => {
  try {
    const evaluations = analyticsService.getActualVsPredicted();
    res.json({
      success: true,
      total: evaluations.length,
      evaluations
    });
  } catch (error) {
    next(error);
  }
});

export default router;
