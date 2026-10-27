import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const WORKSPACE_ROOT = path.resolve(__dirname, '../../..');

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  modelServiceUrl: process.env.MODEL_SERVICE_URL || 'http://127.0.0.1:5001',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  workspaceRoot: WORKSPACE_ROOT,
  cmapssDataDir: path.resolve(WORKSPACE_ROOT, 'CMAPSSData'),
  artifactsDir: path.resolve(WORKSPACE_ROOT, 'machineguard_artifacts')
};
