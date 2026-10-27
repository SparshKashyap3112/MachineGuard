import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  Database,
  Shield,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { apiService } from '../services/api';
import Topbar from '../components/Topbar';

export const ModelInfoPage = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getModelInfo()
      .then((res) => setModelInfo(res.model))
      .catch((err) => console.error('Failed to load model info:', err))
      .finally(() => setLoading(false));
  }, []);

  const pipelineSteps = [
    {
      step: '01',
      title: 'Raw Sensor Telemetry',
      desc: 'Ingests continuous multi-channel operational readings across 21 sensors for a single turbofan engine.'
    },
    {
      step: '02',
      title: 'StandardScaler Preprocessing',
      desc: 'Transforms sensor features using saved training parameters: zero-mean and unit-variance normalization.'
    },
    {
      step: '03',
      title: '30-Cycle Temporal Window',
      desc: 'Constructs chronological sequential window of shape (1, 30, 21) capturing temporal degradation trajectories.'
    },
    {
      step: '04',
      title: 'LSTM Recurrent Inference',
      desc: 'Propagates sequence through 64 recurrent memory units with tanh activations to capture long-term wear patterns.'
    },
    {
      step: '05',
      title: 'Target Capping (0-125 Cycles)',
      desc: 'Clips continuous output to the 125-cycle operational wear plateau following standard C-MAPSS literature.'
    },
    {
      step: '06',
      title: 'Actionable Maintenance Triage',
      desc: 'Assigns Critical (≤15), Warning (16-40), or Monitor priority to guide ground crew and engineering staff.'
    }
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem' }}>
      <Topbar
        title="Machine Learning Model & Architecture"
        subtitle="Deep Sequence Learning Specification: Long Short-Term Memory (LSTM) for Turbofan RUL Prediction"
      />

      {/* Visual Pipeline Stepper */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.4rem', textAlign: 'center' }}>
          Predictive Maintenance Inference Pipeline
        </h3>
        <p style={{ fontSize: '0.84rem', color: '#A7B2C0', textAlign: 'center', marginBottom: '2rem', maxWidth: '680px', margin: '0 auto 2rem auto' }}>
          Sensor Data &rarr; StandardScaler Preprocessing &rarr; 30-Cycle Window &rarr; LSTM Model &rarr; RUL Estimate &rarr; Maintenance Review
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {pipelineSteps.map((p, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38D9F5', marginBottom: '0.4rem' }}>
                  STEP {p.step}
                </div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.4rem' }}>
                  {p.title}
                </h4>
                <p style={{ fontSize: '0.76rem', color: '#A7B2C0', lineHeight: 1.45 }}>
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture & Hyperparameters Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Layer-by-Layer Breakdown */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#38D9F5" />
            Keras Neural Network Architecture
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { name: 'InputLayer', shape: '(None, 30, 21)', params: 0, desc: '30 cycles of 21 standardized sensor features' },
              { name: 'LSTM (64 units)', shape: '(None, 64)', params: 22016, desc: 'Recurrent memory cells with tanh & sigmoid gates' },
              { name: 'Dropout (0.2)', shape: '(None, 64)', params: 0, desc: '20% drop probability for regularization' },
              { name: 'Dense (32 units)', shape: '(None, 32)', params: 2080, desc: 'Fully connected ReLU feature extraction' },
              { name: 'Dense (1 unit)', shape: '(None, 1)', params: 33, desc: 'Linear scalar prediction: Remaining Useful Life' }
            ].map((layer, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(18, 27, 38, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem' }}>{layer.name}</div>
                  <div style={{ fontSize: '0.74rem', color: '#A7B2C0' }}>{layer.desc}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono-num" style={{ color: '#38D9F5', fontSize: '0.85rem', fontWeight: 600 }}>{layer.shape}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{layer.params.toLocaleString()} params</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(56, 217, 245, 0.08)', borderRadius: '10px', border: '1px solid rgba(56, 217, 245, 0.2)', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <span style={{ color: '#A7B2C0' }}>Total Trainable Parameters:</span>
            <span className="mono-num" style={{ fontWeight: 800, color: '#38D9F5' }}>24,129 (72,389 total with optimizer state)</span>
          </div>
        </div>

        {/* Hyperparameters & Training Specs */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="#5CE1B9" />
            Training Configuration & Metrics
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#A7B2C0' }}>Benchmark Dataset:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>NASA C-MAPSS FD001 Turbofan</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#A7B2C0' }}>Input Sliding Window:</span>
              <span style={{ color: '#38D9F5', fontWeight: 700 }}>30 consecutive cycles</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#A7B2C0' }}>Number of Sensor Features:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>21 standardized channels</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#A7B2C0' }}>RUL Upper Cap (Plateau):</span>
              <span style={{ color: '#F5A623', fontWeight: 700 }}>125 cycles</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#A7B2C0' }}>Loss Function:</span>
              <span style={{ color: '#FFFFFF', fontWeight: 600 }}>Mean Squared Error (MSE)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#A7B2C0' }}>Official Test MAE:</span>
              <span style={{ color: '#38D9F5', fontWeight: 800 }}>9.60 cycles</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#A7B2C0' }}>Official Test RMSE:</span>
              <span style={{ color: '#5CE1B9', fontWeight: 800 }}>13.21 cycles</span>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '0.9rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.75rem', color: '#A7B2C0', lineHeight: 1.5 }}>
            <strong style={{ color: '#F5A623' }}>Model Persistence:</strong> Loaded natively by Python Flask from <code>machineguard_artifacts/machineguard_lstm.keras</code> with <code>sensor_scaler.pkl</code> and <code>model_config.json</code>.
          </div>
        </div>
      </div>

      {/* 21 Sensor Features Directory */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
          21-Sensor Telemetry Dictionary
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#A7B2C0', marginBottom: '1.25rem' }}>
          Exact chronological channels ingested during training and online inference
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.9rem' }}>
          {[
            { id: 'sensor_1', name: 'Fan Inlet Temp (T2)', unit: '°R', desc: 'Total temperature at fan inlet' },
            { id: 'sensor_2', name: 'LPC Outlet Temp (T24)', unit: '°R', desc: 'Low-pressure compressor outlet total temp' },
            { id: 'sensor_3', name: 'HPC Outlet Temp (T30)', unit: '°R', desc: 'High-pressure compressor outlet total temp' },
            { id: 'sensor_4', name: 'LPT Outlet Temp (T50)', unit: '°R', desc: 'Low-pressure turbine outlet total temp' },
            { id: 'sensor_5', name: 'Fan Inlet Pressure (P2)', unit: 'psia', desc: 'Pressure at engine inlet' },
            { id: 'sensor_6', name: 'Bypass Duct Pressure (P15)', unit: 'psia', desc: 'Total pressure in bypass duct' },
            { id: 'sensor_7', name: 'HPC Outlet Pressure (P30)', unit: 'psia', desc: 'High-pressure compressor exit pressure' },
            { id: 'sensor_8', name: 'Physical Fan Speed (Nf)', unit: 'rpm', desc: 'Rotational speed of fan rotor' },
            { id: 'sensor_9', name: 'Physical Core Speed (Nc)', unit: 'rpm', desc: 'Rotational speed of core compressor rotor' },
            { id: 'sensor_10', name: 'Engine Pressure Ratio', unit: 'ratio', desc: 'P50 / P2 pressure ratio' },
            { id: 'sensor_11', name: 'HPC Static Pressure (Ps30)', unit: 'psia', desc: 'Static pressure at compressor exit' },
            { id: 'sensor_12', name: 'Fuel Flow Ratio (phi)', unit: 'pps/psia', desc: 'Fuel flow to static pressure Ps30' },
            { id: 'sensor_13', name: 'Corrected Fan Speed (NRf)', unit: 'rpm', desc: 'Corrected rotational speed of fan' },
            { id: 'sensor_14', name: 'Corrected Core Speed (NRc)', unit: 'rpm', desc: 'Corrected rotational speed of core' },
            { id: 'sensor_15', name: 'Bypass Ratio (BPR)', unit: 'ratio', desc: 'Ratio between bypass duct air and core air' },
            { id: 'sensor_16', name: 'Burner Fuel-Air Ratio', unit: 'ratio', desc: 'Fuel to air mass ratio in combustor' },
            { id: 'sensor_17', name: 'Bleed Enthalpy (htBleed)', unit: 'BTU', desc: 'Bleed air enthalpy' },
            { id: 'sensor_18', name: 'Demanded Fan Speed (PCNfR)', unit: 'rpm', desc: 'Demanded rotational fan speed' },
            { id: 'sensor_19', name: 'Demanded Corr. Fan Speed', unit: 'rpm', desc: 'Demanded corrected fan speed' },
            { id: 'sensor_20', name: 'HPT Coolant Bleed (W32)', unit: 'lbm/s', desc: 'High-pressure turbine coolant bleed' },
            { id: 'sensor_21', name: 'LPT Coolant Bleed', unit: 'lbm/s', desc: 'Low-pressure turbine coolant bleed' }
          ].map((s) => (
            <div
              key={s.id}
              style={{
                background: 'rgba(18, 27, 38, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                padding: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.85rem' }}>{s.name}</span>
                <span className="mono-num" style={{ fontSize: '0.72rem', color: '#38D9F5', fontWeight: 600 }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#A7B2C0' }}>{s.desc}</div>
              <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '4px' }}>Feature ID: {s.id}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModelInfoPage;
