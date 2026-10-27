import os
import sys
import logging
import json
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("MachineGuardInference")

app = Flask(__name__)
CORS(app)

# Artifact file paths (candidate paths for local dev and cloud deployment like Render)
candidate_paths = [
    os.getenv("ARTIFACTS_DIR"),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "machineguard_artifacts")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "machineguard_artifacts")),
    os.path.abspath(os.path.join(os.getcwd(), "machineguard_artifacts")),
    os.path.abspath(os.path.join(os.getcwd(), "..", "machineguard_artifacts"))
]
ARTIFACTS_DIR = next((p for p in candidate_paths if p and os.path.exists(p)), os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "machineguard_artifacts")))
logger.info("Using ARTIFACTS_DIR: %s", ARTIFACTS_DIR)

MODEL_PATH = os.path.join(ARTIFACTS_DIR, "machineguard_lstm.keras")
SCALER_PATH = os.path.join(ARTIFACTS_DIR, "sensor_scaler.pkl")
COLUMNS_PATH = os.path.join(ARTIFACTS_DIR, "sensor_columns.json")
CONFIG_PATH = os.path.join(ARTIFACTS_DIR, "model_config.json")

# Global variables to hold loaded artifacts
loaded_model = None
loaded_scaler = None
sensor_columns = []
model_config = {}

def load_artifacts():
    global loaded_model, loaded_scaler, sensor_columns, model_config
    logger.info("Initializing MachineGuard AI inference artifacts...")

    # Load configuration
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r") as f:
            model_config = json.load(f)
    elif os.path.exists(os.path.join(ARTIFACTS_DIR, "model_config.pkl")):
        model_config = joblib.load(os.path.join(ARTIFACTS_DIR, "model_config.pkl"))
    else:
        model_config = {
            "window_size": 30,
            "num_features": 21,
            "rul_cap": 125,
            "model_type": "LSTM",
            "dataset": "NASA C-MAPSS FD001"
        }
    logger.info("Loaded Model Config: %s", model_config)

    # Load sensor column names
    if os.path.exists(COLUMNS_PATH):
        with open(COLUMNS_PATH, "r") as f:
            sensor_columns = json.load(f)
    elif os.path.exists(os.path.join(ARTIFACTS_DIR, "sensor_columns.pkl")):
        sensor_columns = joblib.load(os.path.join(ARTIFACTS_DIR, "sensor_columns.pkl"))
    else:
        sensor_columns = [f"sensor_{i}" for i in range(1, 22)]
    logger.info("Loaded %d sensor columns: %s...", len(sensor_columns), sensor_columns[:5])

    # Load StandardScaler
    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(f"Sensor scaler not found at: {SCALER_PATH}")
    loaded_scaler = joblib.load(SCALER_PATH)
    logger.info("Loaded StandardScaler successfully.")

    # Load Keras LSTM model
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Trained Keras model not found at: {MODEL_PATH}")
    import tensorflow as tf
    loaded_model = tf.keras.models.load_model(MODEL_PATH)
    logger.info("Loaded Keras LSTM model successfully from: %s", MODEL_PATH)

# Load artifacts on import/startup
try:
    load_artifacts()
except Exception as e:
    logger.error("Failed to load artifacts on startup: %s", e, exc_info=True)


@app.route("/health", methods=["GET"])
def health():
    ready = loaded_model is not None and loaded_scaler is not None
    return jsonify({
        "status": "healthy" if ready else "degraded",
        "service": "MachineGuard AI Python Inference Service",
        "model_loaded": loaded_model is not None,
        "scaler_loaded": loaded_scaler is not None,
        "model_type": model_config.get("model_type", "LSTM"),
        "expected_window_size": model_config.get("window_size", 30),
        "expected_features": model_config.get("num_features", 21),
        "rul_cap": model_config.get("rul_cap", 125),
        "dataset": model_config.get("dataset", "NASA C-MAPSS FD001")
    }), (200 if ready else 503)


@app.route("/predict", methods=["POST"])
def predict():
    if loaded_model is None or loaded_scaler is None:
        return jsonify({
            "success": False,
            "error": "Inference service is not ready: model or scaler not loaded"
        }), 503

    data = request.get_json(silent=True)
    if not data:
        return jsonify({
            "success": False,
            "error": "Invalid JSON payload"
        }), 400

    engine_id = data.get("engine_id", "FD001-TEST")
    sequence_data = data.get("sequence")

    if sequence_data is None:
        return jsonify({
            "success": False,
            "error": "Missing 'sequence' field in request body. Expected 30 chronological rows of 21 sensor features."
        }), 400

    try:
        seq_array = np.array(sequence_data, dtype=np.float64)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to parse sequence into numeric matrix: {str(e)}"
        }), 400

    # Validate shape
    expected_window = int(model_config.get("window_size", 30))
    expected_features = int(model_config.get("num_features", 21))

    if seq_array.ndim != 2:
        return jsonify({
            "success": False,
            "error": f"Sequence matrix must be 2-dimensional (rows x features). Received ndim={seq_array.ndim}."
        }), 400

    if seq_array.shape[0] != expected_window:
        return jsonify({
            "success": False,
            "error": f"Sequence must have exactly {expected_window} chronological rows. Received {seq_array.shape[0]} rows."
        }), 400

    if seq_array.shape[1] != expected_features:
        return jsonify({
            "success": False,
            "error": f"Sequence must contain exactly {expected_features} sensor features per row. Received {seq_array.shape[1]} features."
        }), 400

    # Validate finite values (no NaN, no Inf)
    if not np.all(np.isfinite(seq_array)):
        return jsonify({
            "success": False,
            "error": "Sequence contains invalid non-finite numbers (NaN or Infinity)."
        }), 400

    try:
        # Preprocessing: Apply the fitted StandardScaler
        # In scikit-learn, transform with feature names warning can be avoided or handled cleanly
        scaled_seq = loaded_scaler.transform(seq_array)

        # Reshape to (1, 30, 21) for LSTM input
        model_input = np.expand_dims(scaled_seq, axis=0)

        # Inference
        raw_pred = loaded_model.predict(model_input, verbose=0)
        raw_rul = float(raw_pred[0][0])

        # Clip prediction to the configured [0, rul_cap] range
        rul_cap = float(model_config.get("rul_cap", 125))
        clipped_rul = float(np.clip(raw_rul, 0.0, rul_cap))

        # Determine health status category based on standard thresholds
        if clipped_rul <= 15.0:
            health_category = "Critical"
            priority = "Immediate Action Required"
        elif clipped_rul <= 40.0:
            health_category = "Warning"
            priority = "Maintenance Due Soon"
        else:
            health_category = "Monitor"
            priority = "Routine Monitoring"

        return jsonify({
            "success": True,
            "engine_id": engine_id,
            "predicted_rul_cycles": round(clipped_rul, 2),
            "raw_prediction": round(raw_rul, 2),
            "unit": "cycles",
            "health_category": health_category,
            "priority": priority,
            "model_type": model_config.get("model_type", "LSTM"),
            "input_window": expected_window,
            "feature_count": expected_features,
            "rul_cap": rul_cap,
            "source": "trained_model",
            "disclaimer": "Estimated remaining useful life; not a guaranteed failure date."
        }), 200

    except Exception as e:
        logger.error("Error during prediction inference: %s", e, exc_info=True)
        return jsonify({
            "success": False,
            "error": f"Inference execution failed: {str(e)}"
        }), 500


@app.route("/predict-batch", methods=["POST"])
def predict_batch():
    if loaded_model is None or loaded_scaler is None:
        return jsonify({"success": False, "error": "Model service not ready"}), 503

    data = request.get_json(silent=True)
    if not data or "sequences" not in data:
        return jsonify({"success": False, "error": "Missing 'sequences' in payload"}), 400

    sequences = data["sequences"] # list of { engine_id, sequence }
    results = []
    rul_cap = float(model_config.get("rul_cap", 125))

    for item in sequences:
        eid = item.get("engine_id", "unknown")
        seq = item.get("sequence")
        try:
            arr = np.array(seq, dtype=np.float64)
            if arr.shape != (30, 21) or not np.all(np.isfinite(arr)):
                results.append({"engine_id": eid, "success": False, "error": "Invalid shape or values"})
                continue
            scaled = loaded_scaler.transform(arr)
            inp = np.expand_dims(scaled, axis=0)
            pred = float(loaded_model.predict(inp, verbose=0)[0][0])
            clipped = float(np.clip(pred, 0.0, rul_cap))
            results.append({
                "engine_id": eid,
                "success": True,
                "predicted_rul_cycles": round(clipped, 2),
                "health_category": "Critical" if clipped <= 15 else ("Warning" if clipped <= 40 else "Monitor")
            })
        except Exception as e:
            results.append({"engine_id": eid, "success": False, "error": str(e)})

    return jsonify({"success": True, "results": results})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info("Starting MachineGuard Python Inference Service on %s:%d...", host, port)
    app.run(host=host, port=port, debug=False)
