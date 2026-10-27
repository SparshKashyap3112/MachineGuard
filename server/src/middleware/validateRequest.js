export const validatePredictionRequest = (req, res, next) => {
  const { sequence, engine_id } = req.body;

  if (!sequence) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: "sequence". Expected 30 chronological rows of 21 sensor features.',
      code: 'VALIDATION_ERROR'
    });
  }

  if (!Array.isArray(sequence)) {
    return res.status(400).json({
      success: false,
      error: '"sequence" must be an array of rows.',
      code: 'VALIDATION_ERROR'
    });
  }

  if (sequence.length !== 30) {
    return res.status(400).json({
      success: false,
      error: `Invalid window length: expected exactly 30 chronological cycles, received ${sequence.length}.`,
      code: 'VALIDATION_ERROR'
    });
  }

  for (let r = 0; r < sequence.length; r++) {
    const row = sequence[r];
    if (!Array.isArray(row)) {
      return res.status(400).json({
        success: false,
        error: `Row ${r + 1} must be an array of sensor values.`,
        code: 'VALIDATION_ERROR'
      });
    }

    if (row.length !== 21) {
      return res.status(400).json({
        success: false,
        error: `Row ${r + 1} has ${row.length} features; expected exactly 21 sensor values.`,
        code: 'VALIDATION_ERROR'
      });
    }

    for (let c = 0; c < row.length; c++) {
      const val = row[c];
      if (typeof val !== 'number' || !Number.isFinite(val)) {
        return res.status(400).json({
          success: false,
          error: `Non-numeric or non-finite value at cycle index ${r}, sensor_${c + 1}: ${val}`,
          code: 'VALIDATION_ERROR'
        });
      }
    }
  }

  next();
};
