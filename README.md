# MachineGuard AI — Industrial Predictive Maintenance & RUL Intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Framework: React 18](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg)](https://react.dev/)
[![Backend: Node.js](https://img.shields.io/badge/API%20Gateway-Node.js%20Express-green.svg)](https://nodejs.org/)
[![ML Model: TensorFlow/Keras](https://img.shields.io/badge/Model-LSTM%20Sequence%20Learning-FF6F00.svg)](https://tensorflow.org/)
[![Dataset: NASA C-MAPSS FD001](https://img.shields.io/badge/Dataset-NASA%20C--MAPSS%20FD001-blue.svg)](https://data.nasa.gov/)
[![Official Test MAE](https://img.shields.io/badge/Official%20Test%20MAE-9.60%20cycles-success.svg)](#benchmark-performance)
[![Official Test RMSE](https://img.shields.io/badge/Official%20Test%20RMSE-13.21%20cycles-success.svg)](#benchmark-performance)

**MachineGuard AI** is a full-stack, enterprise-grade predictive maintenance web platform designed to forecast the **Remaining Useful Life (RUL)** of industrial turbofan engines using an existing trained Long Short-Term Memory (**LSTM**) neural network.

The platform combines real-time multi-channel sensor telemetry tracking, glassmorphism design aesthetics, cinematic industrial background video transitions, and a 3-tier microservice architecture.

---

## Architecture Overview

MachineGuard AI uses an API Gateway pattern to safely bridge modern web interfaces with Python machine learning inference:

```
┌─────────────────────────────────┐
│     React 18 + Vite Client      │  (Port 5173)
│   • Dark Glassmorphism UI       │  • Recharts Telemetry Visualizations
│   • Cinematic Video Background  │  • Real-Time Sequence Testing
└────────────────┬────────────────┘
                 │ HTTP / REST (/api/*)
                 ▼
┌─────────────────────────────────┐
│   Node.js / Express Gateway     │  (Port 5000)
│   • Helmet Security & CORS      │  • Input Sequence Validation (30x21)
│   • Express Rate Limiting       │  • Fleet Telemetry & Analytics Services
└────────────────┬────────────────┘
                 │ Internal HTTP (/predict, /health)
                 ▼
┌─────────────────────────────────┐
│   Python Flask Model Service    │  (Port 5001)
│   • machineguard_lstm.keras     │  • Fitted sensor_scaler.pkl
│   • sensor_columns.json (21)    │  • Capped RUL (0–125 cycles)
└─────────────────────────────────┘
```

---

## Key Features

1. **Cinematic Industrial Background Video**:
   - Seamless crossfading between user uploaded video feeds (`machine-bg-1.mp4` and `machine-bg-2.mp4`).
   - Dark graphite translucent overlays (65%–85% opacity) ensuring readability of data cards and charts.
   - Restrained cyan illumination, subtle vignette, and non-blocking pointer events (`pointer-events: none`).
   - Floating camera switcher for manual feed toggling and pause/play controls.

2. **Classy Dark Glassmorphism Design System**:
   - Industrial color tokens: `#0B0F14` (primary dark), `#111820` (secondary), `#38D9F5` (cyan accent), `#5CE1B9` (mint green), `#F5A623` (amber warning), `#FF5C5C` (critical alert).
   - Real glass panels with `backdrop-filter: blur(18px)`, thin translucent borders (`rgba(255,255,255,0.12)`), and tabular numerals.

3. **Fleet Monitoring & Condition Tracking**:
   - Real-time monitoring of 100 NASA C-MAPSS FD001 turbofans.
   - Filtering by operational safety tier: **Critical** (&le;15 cycles), **Warning** (16–40 cycles), and **Monitor** (>40 cycles).
   - Fast table and grid view toggling with search by Machine ID.

4. **Turbofan Engine Detail & Degradation Telemetry**:
   - Radial SVG Remaining Useful Life gauge.
   - Interactive multi-channel sensor trend charts across cycles (T24, T30, T50, P30, Ps30, phi, BPR).
   - Latest 30-cycle raw telemetry table view.
   - One-click **"Run Live LSTM Inference"** triggering real model forward-pass.

5. **RUL Error & Benchmark Analytics**:
   - Actual vs Predicted RUL comparison curve across all 100 test engines.
   - Residual error distribution histogram.
   - Detailed documentation of the 125-cycle RUL plateau capping convention.

6. **Maintenance Prioritization Center**:
   - Triage queues sorted by urgency.
   - Configurable critical and warning cycle threshold sliders.
   - Engineering inspection notes modal with mark-as-reviewed tracking.

7. **Live Prediction Lab & Custom CSV Upload**:
   - Test any engine or upload custom sensor CSV files.
   - Automatic shape validation: verifies 30 chronological rows and 21 numeric sensor features.
   - Raw JSON debug response viewer displaying model output, health category, and gateway latency.

8. **Model Information & 21-Sensor Dictionary**:
   - 6-step visual pipeline representation.
   - Layer-by-layer parameter breakdown (72,389 total params, 24,129 trainable).
   - Complete engineering descriptions, symbols, and physical units for all 21 sensors.

---

## Benchmark Performance

The trained model was evaluated against the official NASA C-MAPSS FD001 test fleet using the standard piece-wise linear degradation target capped at 125 cycles:

| Metric | Official Score | Details |
|---|---|---|
| **Official Test MAE** | **9.60 cycles** | Mean Absolute Error across all 100 test engines |
| **Official Test RMSE** | **13.21 cycles** | Root Mean Squared Error across all 100 test engines |
| **Target Convention** | **Capped at 125** | Piece-wise linear wear thresholding |
| **Input Shape** | **(1, 30, 21)** | 30 time steps &times; 21 sensor features per sequence |
| **Normalization** | **StandardScaler** | Zero-mean, unit-variance standardized |

---

## Directory Structure

```text
MachineGuard Lstm/
├── client/                              # React 18 + Vite Frontend
│   ├── public/videos/
│   │   ├── machine-bg-1.mp4             # Industrial background video feed 1
│   │   └── machine-bg-2.mp4             # Industrial background video feed 2
│   ├── src/
│   │   ├── components/                  # VideoBackground, Navbar, Sidebar, Topbar, KpiCard, RulGauge, etc.
│   │   ├── pages/                       # Landing, Dashboard, Fleet, Details, Analytics, Maintenance, Lab, ModelInfo
│   │   ├── services/api.js              # Centralized Axios API client
│   │   ├── styles/index.css             # Glassmorphism Design System CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── server/                              # Node.js Express API Gateway
│   ├── src/
│   │   ├── app.js                       # Express app configuration, CORS & Helmet
│   │   ├── server.js                    # Server bootstrap & graceful shutdown
│   │   ├── config/index.js              # Environment settings
│   │   ├── middleware/                  # Error handling & 30x21 request validator
│   │   ├── routes/                      # Health, predict, fleet, analytics, maintenance, model
│   │   └── services/                    # Model proxy, fleet cache & analytics computation
│   ├── package.json
│   └── .env.example
├── model-service/                       # Python Flask Inference Service
│   ├── app.py                           # Keras model loader, scaler transform & prediction endpoint
│   └── requirements.txt
├── machineguard_artifacts/              # Trained ML Artifacts
│   ├── machineguard_lstm.keras          # Saved Keras LSTM model
│   ├── sensor_scaler.pkl                # Fitted scikit-learn StandardScaler
│   ├── sensor_columns.json              # 21 sensor column names
│   ├── model_config.json                # Model hyperparameters & cap limits
│   ├── fleet_cache.json                 # Pre-computed test fleet metrics
│   └── evaluation_metrics.json          # Benchmark MAE / RMSE distribution data
├── CMAPSSData/                          # NASA C-MAPSS FD001 Turbofan Dataset
├── MachineGuard.ipynb                   # Original Training & Evaluation Notebook
└── README.md
```

---

## Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: 3.10 - 3.14 with `tensorflow`, `scikit-learn`, `flask`, `flask-cors`, `joblib`, `numpy`, `pandas`

---

### Step 1: Start the Python Flask Inference Service (Port 5001)

```bash
# In the project root directory
python model-service/app.py
```
*The service will load `machineguard_artifacts/machineguard_lstm.keras` and bind to `http://127.0.0.1:5001`.*

Test health:
```bash
curl http://127.0.0.1:5001/health
```

---

### Step 2: Start the Node.js API Gateway (Port 5000)

```bash
cd server
npm install
npm start
```
*The gateway will initialize fleet telemetry and connect to the Flask model service.*

Test gateway health:
```bash
curl http://localhost:5000/api/health
```

---

### Step 3: Start the React Frontend (Port 5173)

```bash
cd client
npm install
npm run dev
```
Open **[http://127.0.0.1:5173/](http://127.0.0.1:5173/)** in your web browser.

---

## Deploying on Render (render.com)

MachineGuard AI is configured for deployment on [Render](https://render.com) using Infrastructure-as-Code via [`render.yaml`](./render.yaml).

### Method 1: Render Blueprints (Recommended — 1-Click Multi-Service)

1. Fork or push this repository to your GitHub account: `https://github.com/SparshKashyap3112/MachineGuard.git`
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** &rarr; **Blueprint**.
4. Connect your **MachineGuard** repository.
5. Render will detect `render.yaml` and provision both:
   - **`machineguard-model-service`**: Python Gunicorn inference service loading Keras LSTM.
   - **`machineguard-gateway`**: Full-stack Node.js server serving both the Express API and the compiled React production bundle.
6. Click **Apply**. Render will automatically build and deploy both services!

---

### Method 2: Manual Setup on Render

If you prefer setting up the web services manually on Render:

#### Service 1: Python Model Inference Service
- **Type**: Web Service
- **Name**: `machineguard-model-service`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r model-service/requirements.txt`
- **Start Command**: `gunicorn model-service.app:app -b 0.0.0.0:$PORT --timeout 180 --workers 1 --threads 4`
- **Health Check Path**: `/health`
- **Environment Variables**:
  - `PYTHON_VERSION`: `3.11.9`
  - `ARTIFACTS_DIR`: `./machineguard_artifacts`

#### Service 2: Full-Stack Node.js Web Service
- **Type**: Web Service
- **Name**: `machineguard-gateway`
- **Runtime**: `Node`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `MODEL_SERVICE_URL`: URL of Service 1 (e.g. `https://machineguard-model-service.onrender.com`)
  - `FRONTEND_URL`: `*`
  - `CMAPSS_DATA_DIR`: `./CMAPSSData`
  - `ARTIFACTS_DIR`: `./machineguard_artifacts`

---

## API Endpoints Reference

### 1. Health Status
- **`GET /api/health`**
  - Returns gateway status, uptime, and Python model service connectivity.

### 2. Predictions
- **`POST /api/predict`**
  - **Body:** `{ "engine_id": "FD001-001", "sequence": [[s1..s21], ... 30 rows] }`
  - **Response:**
    ```json
    {
      "success": true,
      "engine_id": "FD001-001",
      "predicted_rul_cycles": 116.84,
      "unit": "cycles",
      "health_category": "Monitor",
      "priority": "Routine Monitoring",
      "gateway_latency_ms": 38,
      "disclaimer": "Estimated remaining useful life; not a guaranteed failure date."
    }
    ```
- **`GET /api/predict/sample?engine_id=1`**
  - Returns a ready-to-test 30-cycle sequence from the test fleet.
- **`POST /api/predict/csv`**
  - Accepts CSV string containing 30 chronological rows of sensor telemetry.

### 3. Fleet & Telemetry
- **`GET /api/fleet`**
  - Query parameters: `search`, `healthCategory` (`critical`, `warning`, `monitor`), `sortBy`, `sortOrder`.
- **`GET /api/fleet/:engineId`**
  - Returns engine metadata, observed cycles, operating settings, and recommended maintenance actions.
- **`GET /api/fleet/:engineId/sensors`**
  - Returns cycle-by-cycle sensor readings for Recharts plotting.
- **`GET /api/fleet/:engineId/window`**
  - Returns the latest 30-cycle sensor window for model inference.

### 4. Analytics & Maintenance
- **`GET /api/analytics/summary`**
  - KPI summary, RUL distribution bins, error histogram, and MAE/RMSE benchmark metrics.
- **`GET /api/analytics/evaluations`**
  - Actual vs predicted RUL records for all 100 test engines.
- **`GET /api/maintenance/overview`**
  - Machines sorted into Critical, Warning, and Monitor triage queues with configurable cycle thresholds.
- **`POST /api/maintenance/review/:engineId`**
  - Updates review status and engineering inspection directives.

### 5. Model Information
- **`GET /api/model/info`**
  - Returns neural network architecture, layers, parameter counts, and 21-sensor dictionary.

---

## Industrial Safety Disclaimer

> **IMPORTANT:** MachineGuard AI Remaining Useful Life (RUL) predictions are statistical estimates generated by a deep sequence learning model. Predictions are intended to assist in maintenance triage and schedule optimization. They do not represent certified airworthiness diagnostics or guarantee exact machinery failure dates. Standard mechanical inspection and OEM safety protocols must always be maintained.

---

## License

This project is licensed under the MIT License — see the LICENSE file for details.
