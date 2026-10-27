import axios from 'axios';
import { config } from '../config/index.js';

const client = axios.create({
  baseURL: config.modelServiceUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const modelService = {
  async checkHealth() {
    try {
      const response = await client.get('/health');
      return {
        reachable: true,
        data: response.data
      };
    } catch (error) {
      return {
        reachable: false,
        error: error.message || 'Python inference service is unreachable'
      };
    }
  },

  async predict({ engine_id, sequence }) {
    try {
      const startTime = Date.now();
      const response = await client.post('/predict', {
        engine_id: engine_id || 'ENGINE-UNKNOWN',
        sequence
      });
      const latencyMs = Date.now() - startTime;

      return {
        ...response.data,
        gateway_latency_ms: latencyMs,
        evaluated_at: new Date().toISOString()
      };
    } catch (error) {
      if (error.response && error.response.data) {
        const err = new Error(error.response.data.error || 'Model inference failed');
        err.statusCode = error.response.status;
        throw err;
      }
      const err = new Error(`Inference service unavailable: ${error.message}`);
      err.statusCode = 503;
      throw err;
    }
  },

  async predictBatch(sequences) {
    try {
      const response = await client.post('/predict-batch', { sequences });
      return response.data;
    } catch (error) {
      const err = new Error(`Batch inference service error: ${error.message}`);
      err.statusCode = error.response ? error.response.status : 503;
      throw err;
    }
  }
};
