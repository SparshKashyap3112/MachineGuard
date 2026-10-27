import express from 'express';
import rateLimit from 'express-rate-limit';
import { modelService } from '../services/model.service.js';
import { fleetService } from '../services/fleet.service.js';
import { validatePredictionRequest } from '../middleware/validateRequest.js';

const router = express.Router();

// Rate limiter for prediction endpoints: 100 requests per 15 minutes per IP
const predictionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    error: 'Too many prediction requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Standard prediction endpoint
router.post('/', predictionLimiter, validatePredictionRequest, async (req, res, next) => {
  try {
    const { engine_id, sequence } = req.body;
    const result = await modelService.predict({ engine_id, sequence });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get a sample ready-to-predict 30-cycle sequence from real test engines
router.get('/sample', (req, res, next) => {
  try {
    const engineId = req.query.engine_id ? parseInt(req.query.engine_id, 10) : 1;
    const window = fleetService.getEngineLatestWindow(engineId);

    if (!window) {
      return res.status(404).json({
        success: false,
        error: `Sample sequence for engine ${engineId} not found or has fewer than 30 cycles.`
      });
    }

    res.json({
      success: true,
      engine_id: window.engine_id,
      numeric_id: window.numeric_id,
      cycles: window.cycles,
      sequence: window.sequence,
      raw_rows: window.raw_rows
    });
  } catch (error) {
    next(error);
  }
});

// Parse and validate sensor CSV payload
router.post('/csv', predictionLimiter, async (req, res, next) => {
  try {
    const { csv_content, engine_id } = req.body;

    if (!csv_content || typeof csv_content !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "csv_content" string.'
      });
    }

    const lines = csv_content.trim().split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length < 30) {
      return res.status(400).json({
        success: false,
        error: `CSV contains only ${lines.length} rows. Exactly 30 chronological rows are required for the LSTM sliding window.`
      });
    }

    // Check if first line is a header
    let dataLines = lines;
    const firstLine = lines[0].toLowerCase();
    if (firstLine.includes('sensor') || firstLine.includes('cycle') || firstLine.includes('engine')) {
      dataLines = lines.slice(1);
    }

    if (dataLines.length < 30) {
      return res.status(400).json({
        success: false,
        error: `After removing header, only ${dataLines.length} rows remain. At least 30 rows required.`
      });
    }

    // Take the final 30 rows if more than 30 are provided
    const last30Lines = dataLines.slice(-30);
    const sequence = [];

    for (let r = 0; r < last30Lines.length; r++) {
      const line = last30Lines[r];
      // Supports comma, tab, or whitespace delimiter
      const tokens = line.includes(',')
        ? line.split(',').map(s => s.trim())
        : line.trim().split(/\s+/);

      // If tokens count is 26 (C-MAPSS format: engine, cycle, s1..s3, s1..s21), extract the last 21
      let sensorValues = [];
      if (tokens.length >= 26) {
        sensorValues = tokens.slice(5, 26).map(Number);
      } else if (tokens.length === 21) {
        sensorValues = tokens.map(Number);
      } else if (tokens.length >= 21) {
        sensorValues = tokens.slice(-21).map(Number);
      } else {
        return res.status(400).json({
          success: false,
          error: `Row ${r + 1} has ${tokens.length} columns. Expected 21 sensor features (or 26 C-MAPSS columns).`
        });
      }

      // Check numeric validity
      for (let c = 0; c < 21; c++) {
        const val = sensorValues[c];
        if (isNaN(val) || !Number.isFinite(val)) {
          return res.status(400).json({
            success: false,
            error: `Row ${r + 1}, column ${c + 1} contains non-numeric value: "${tokens[c]}"`
          });
        }
      }

      sequence.push(sensorValues);
    }

    // Perform prediction with validated sequence
    const eid = engine_id || 'CSV-UPLOAD-ENGINE';
    const result = await modelService.predict({ engine_id: eid, sequence });

    res.json({
      ...result,
      csv_parsed_rows: dataLines.length,
      evaluated_rows: 30
    });
  } catch (error) {
    next(error);
  }
});

export default router;
