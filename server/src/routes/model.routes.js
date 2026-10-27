import express from 'express';
import { SENSOR_METADATA } from '../services/fleet.service.js';

const router = express.Router();

router.get('/info', (req, res) => {
  res.json({
    success: true,
    model: {
      name: 'MachineGuard LSTM Turbofan RUL Predictor',
      model_type: 'Long Short-Term Memory (LSTM)',
      framework: 'TensorFlow / Keras 3.x',
      architecture: [
        { layer: 'InputLayer', output_shape: [null, 30, 21], params: 0, description: '30 chronological time steps of 21 standardized sensor features' },
        { layer: 'LSTM Layer 1', output_shape: [null, 64], params: 22016, units: 64, activation: 'tanh', recurrent_activation: 'sigmoid' },
        { layer: 'Dropout', output_shape: [null, 64], params: 0, rate: 0.2, description: 'Regularization to prevent overfitting' },
        { layer: 'Dense (Hidden)', output_shape: [null, 32], params: 2080, activation: 'relu' },
        { layer: 'Dense (Output)', output_shape: [null, 1], params: 33, activation: 'linear', description: 'Single scalar output representing predicted RUL' }
      ],
      parameters: {
        total: 72389,
        trainable: 24129,
        non_trainable: 0,
        optimizer_params: 48260
      },
      hyperparameters: {
        sequence_window_size: 30,
        feature_count: 21,
        rul_cap: 125,
        loss_function: 'Mean Squared Error (MSE)',
        optimizer: 'Adam'
      },
      evaluation: {
        dataset: 'NASA C-MAPSS FD001 (Turbofan Engine Degradation Simulation)',
        test_mae: 9.60,
        test_rmse: 13.21,
        target_convention: 'Piece-wise linear degradation target capped at 125 cycles'
      },
      pipeline_steps: [
        { step: 1, title: 'Raw Telemetry Ingestion', desc: 'Ingests 30 consecutive operational cycles with 21 high-frequency sensor readings.' },
        { step: 2, title: 'StandardScaler Normalization', desc: 'Zero-mean and unit-variance standardization using saved training feature parameters.' },
        { step: 3, title: 'Temporal Windowing', desc: 'Reshapes chronological observations into 3D sequence tensor with shape (1, 30, 21).' },
        { step: 4, title: 'LSTM Deep Sequence Inference', desc: 'Propagates temporal degradation dynamics through recurrent LSTM memory cells.' },
        { step: 5, title: 'Target Clipping (0-125)', desc: 'Caps predicted remaining life to match the 125-cycle operational wear plateau.' },
        { step: 6, title: 'Operational Maintenance Action', desc: 'Categorizes machine into Critical, Warning, or Monitor priority for engineers.' }
      ],
      sensors: SENSOR_METADATA,
      disclaimer: 'Remaining Useful Life (RUL) outputs are statistical estimations intended to guide preventative maintenance decisions and do not constitute certified equipment safety approvals.'
    }
  });
});

export default router;
