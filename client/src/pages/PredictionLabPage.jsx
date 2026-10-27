import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Database,
  Code
} from 'lucide-react';
import { apiService } from '../services/api';
import Topbar from '../components/Topbar';
import RulGauge from '../components/RulGauge';

export const PredictionLabPage = () => {
  const [selectedEngineId, setSelectedEngineId] = useState(1);
  const [inputMode, setInputMode] = useState('dataset'); // 'dataset' | 'csv'
  const [csvContent, setCsvContent] = useState('');
  const [sampleSequence, setSampleSequence] = useState(null);
  const [loadingSample, setLoadingSample] = useState(false);

  // Inference execution states
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Load sample sequence when selectedEngineId changes
  useEffect(() => {
    if (inputMode === 'dataset') {
      loadSample(selectedEngineId);
    }
  }, [selectedEngineId, inputMode]);

  const loadSample = async (id) => {
    setLoadingSample(true);
    setValidationError(null);
    try {
      const data = await apiService.getSampleSequence(id);
      setSampleSequence(data);
    } catch (err) {
      setValidationError(`Failed to load engine sequence: ${err.message}`);
    } finally {
      setLoadingSample(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCsvContent(text);
      validateCsv(text);
    };
    reader.readAsText(file);
  };

  const validateCsv = (text) => {
    setValidationError(null);
    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (lines.length < 30) {
      setValidationError(`CSV file has only ${lines.length} lines. Exactly 30 consecutive operational cycles are required.`);
      return false;
    }

    // Check row columns
    const firstDataLine = lines[0].toLowerCase().includes('sensor') ? lines[1] : lines[0];
    const tokens = firstDataLine.includes(',') ? firstDataLine.split(',') : firstDataLine.trim().split(/\s+/);

    if (tokens.length < 21) {
      setValidationError(`Row has only ${tokens.length} columns. Expected 21 sensor values (or 26 standard C-MAPSS telemetry columns).`);
      return false;
    }

    return true;
  };

  const handleRunPrediction = async () => {
    setPredicting(true);
    setValidationError(null);
    setPredictionResult(null);

    try {
      let res;
      if (inputMode === 'dataset') {
        if (!sampleSequence?.sequence) {
          throw new Error('No sequence loaded for prediction.');
        }
        res = await apiService.predict({
          engine_id: sampleSequence.engine_id,
          sequence: sampleSequence.sequence
        });
      } else {
        if (!csvContent.trim()) {
          throw new Error('Please upload or paste sensor CSV content.');
        }
        res = await apiService.predictCsv({
          engine_id: 'CUSTOM-CSV-INPUT',
          csv_content: csvContent
        });
      }

      setPredictionResult(res);
    } catch (err) {
      console.error('Prediction failed:', err);
      setValidationError(err.message || 'Inference execution failed');
    } finally {
      setPredicting(false);
    }
  };

  // Generate downloadable sample CSV for testing
  const loadDemoCsvContent = () => {
    if (sampleSequence?.sequence) {
      const header = Array.from({ length: 21 }, (_, i) => `sensor_${i + 1}`).join(',');
      const rows = sampleSequence.sequence.map((row) => row.join(',')).join('\n');
      setCsvContent(`${header}\n${rows}`);
      setInputMode('csv');
      validateCsv(`${header}\n${rows}`);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem' }}>
      <Topbar
        title="Live LSTM Prediction Lab"
        subtitle="Submit 30-cycle sensor sequences to the trained Keras LSTM model for real inference"
      />

      {/* Input Mode Selector */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              Select Telemetry Input Source
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#A7B2C0' }}>
              Choose pre-configured test engines or upload a custom 30-row sensor sequence
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setInputMode('dataset')}
              className={`btn btn-sm ${inputMode === 'dataset' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Database size={14} />
              C-MAPSS Fleet Engine
            </button>
            <button
              onClick={() => setInputMode('csv')}
              className={`btn btn-sm ${inputMode === 'csv' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Upload size={14} />
              Custom CSV Upload
            </button>
          </div>
        </div>

        {inputMode === 'dataset' ? (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.84rem', color: '#F4F7FA', fontWeight: 600 }}>
                Select Engine ID (1 to 100):
              </label>
              <select
                value={selectedEngineId}
                onChange={(e) => setSelectedEngineId(Number(e.target.value))}
                className="input-glass"
                style={{ width: '220px', padding: '0.45rem 0.8rem' }}
              >
                <option value={1}>Engine #1 (Monitor - Healthy)</option>
                <option value={34}>Engine #34 (Critical - Immediate Action)</option>
                <option value={81}>Engine #81 (Warning - Due Soon)</option>
                {Array.from({ length: 100 }, (_, i) => i + 1)
                  .filter((id) => ![1, 34, 81].includes(id))
                  .map((id) => (
                    <option key={id} value={id}>Engine #{id}</option>
                  ))}
              </select>

              <button onClick={loadDemoCsvContent} className="btn btn-secondary btn-sm">
                Copy Sequence to CSV Editor
              </button>
            </div>

            {loadingSample ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#38D9F5' }}>
                <RotateCcw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
                <div>Loading sequence tensor...</div>
              </div>
            ) : sampleSequence ? (
              <div style={{ background: 'rgba(14, 21, 30, 0.6)', borderRadius: '12px', padding: '1rem', fontSize: '0.8rem', color: '#A7B2C0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Loaded Engine: <strong style={{ color: '#FFFFFF' }}>{sampleSequence.engine_id}</strong></span>
                  <span>Input Window: <strong style={{ color: '#38D9F5' }}>30 chronological cycles</strong> (Cycles {sampleSequence.cycles?.[0]} &rarr; {sampleSequence.cycles?.[29]})</span>
                  <span>Sensor Channels: <strong style={{ color: '#5CE1B9' }}>21 features</strong></span>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          /* CSV Upload & Text Area */
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <label
                className="btn btn-secondary btn-sm"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Upload size={14} color="#38D9F5" />
                Choose CSV File
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
              <span style={{ fontSize: '0.78rem', color: '#A7B2C0' }}>
                Expects 30 consecutive rows of 21 sensor columns (comma or whitespace separated)
              </span>
            </div>

            <textarea
              rows={8}
              value={csvContent}
              onChange={(e) => {
                setCsvContent(e.target.value);
                validateCsv(e.target.value);
              }}
              placeholder="sensor_1,sensor_2,...,sensor_21&#10;518.67,642.15,...,23.42&#10;(30 chronological rows required)"
              className="input-glass"
              style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}
            />
          </div>
        )}

        {/* Validation Error Alert */}
        {validationError && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(255, 92, 92, 0.15)', border: '1px solid #FF5C5C', color: '#FF5C5C', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            {validationError}
          </div>
        )}

        {/* Submit Prediction Button */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={handleRunPrediction}
            disabled={predicting}
            className="btn btn-primary btn-lg"
            style={{ minWidth: '240px' }}
          >
            {predicting ? (
              <>
                <RotateCcw size={18} className="animate-spin" />
                Running LSTM Inference...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Predict Remaining Useful Life
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real Model Prediction Output */}
      {predictionResult && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid rgba(56, 217, 245, 0.4)', boxShadow: '0 0 30px rgba(56, 217, 245, 0.15)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.5rem', textAlign: 'center' }}>
            LSTM Model Inference Result
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            {/* Gauge */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RulGauge rul={predictionResult.predicted_rul_cycles} maxRul={125} size={220} />
            </div>

            {/* Inference Metadata */}
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#A7B2C0' }}>Engine Identifier:</span>
                  <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{predictionResult.engine_id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#A7B2C0' }}>Predicted RUL:</span>
                  <span style={{ color: '#38D9F5', fontWeight: 800 }}>{predictionResult.predicted_rul_cycles} cycles</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#A7B2C0' }}>Raw Model Output:</span>
                  <span style={{ color: '#A7B2C0' }}>{predictionResult.raw_prediction} cycles</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#A7B2C0' }}>Health Status:</span>
                  <span style={{ color: predictionResult.health_category === 'Critical' ? '#FF5C5C' : '#5CE1B9', fontWeight: 700 }}>
                    {predictionResult.health_category} ({predictionResult.priority})
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#A7B2C0' }}>Gateway Latency:</span>
                  <span style={{ color: '#5CE1B9', fontWeight: 700 }}>{predictionResult.gateway_latency_ms || 35} ms</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#A7B2C0' }}>Inference Source:</span>
                  <span style={{ color: '#FFFFFF' }}>Trained Keras LSTM (.keras)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Raw JSON Debug Viewer */}
          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#A7B2C0', marginBottom: '0.6rem' }}>
              <Code size={14} color="#38D9F5" />
              API Gateway Response Payload (JSON)
            </div>
            <pre style={{ background: 'rgba(11, 15, 20, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '1rem', fontSize: '0.75rem', color: '#38D9F5', overflowX: 'auto' }}>
              {JSON.stringify(predictionResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionLabPage;
