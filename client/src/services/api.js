import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL;
const apiBase = rawBase
  ? (rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/+$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL: apiBase,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg = error.response?.data?.error || error.message || 'API request failed';
    console.error(`[API Error] ${error.config?.url}:`, errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
);

export const apiService = {
  // Health
  getHealth: () => api.get('/health'),

  // Prediction
  predict: (data) => api.post('/predict', data),
  getSampleSequence: (engineId = 1) => api.get(`/predict/sample?engine_id=${engineId}`),
  predictCsv: (data) => api.post('/predict/csv', data),

  // Fleet
  getFleet: (params = {}) => api.get('/fleet', { params }),
  getFleetSamples: () => api.get('/fleet/samples'),
  getEngine: (engineId) => api.get(`/fleet/${engineId}`),
  getEngineSensors: (engineId, sensors) => {
    const query = sensors ? `?sensors=${sensors.join(',')}` : '';
    return api.get(`/fleet/${engineId}/sensors${query}`);
  },
  getEngineWindow: (engineId) => api.get(`/fleet/${engineId}/window`),

  // Analytics
  getAnalyticsSummary: () => api.get('/analytics/summary'),
  getEvaluations: () => api.get('/analytics/evaluations'),

  // Maintenance
  getMaintenanceOverview: (params = {}) => api.get('/maintenance/overview', { params }),
  saveMaintenanceReview: (engineId, data) => api.post(`/maintenance/review/${engineId}`, data),

  // Model Information
  getModelInfo: () => api.get('/model/info')
};

export default apiService;
