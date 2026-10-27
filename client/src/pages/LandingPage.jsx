import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Cpu,
  Shield,
  Zap,
  ArrowRight,
  TrendingDown,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { apiService } from '../services/api';

export const LandingPage = () => {
  const [demoEngineId, setDemoEngineId] = useState(1);
  const [demoResult, setDemoResult] = useState(null);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    // Load summary KPIs
    apiService.getAnalyticsSummary()
      .then((data) => setKpis(data.kpis))
      .catch(() => {});

    // Run initial demo inference for Engine 1
    runInference(1);
  }, []);

  const runInference = async (engineId) => {
    setLoadingDemo(true);
    setDemoEngineId(engineId);
    try {
      // 1. Get real 30-cycle sample window for this engine
      const sample = await apiService.getSampleSequence(engineId);
      // 2. Call real LSTM model through Node -> Flask API
      const result = await apiService.predict({
        engine_id: sample.engine_id,
        sequence: sample.sequence
      });
      setDemoResult(result);
    } catch (err) {
      console.error('Demo inference failed:', err);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div style={{ position: 'relative', zIndex: 10 }}>
      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section
        style={{
          minHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '4rem 1.5rem 3rem 1.5rem',
          maxWidth: '1280px',
          margin: '0 auto'
        }}
      >
        {/* Animated Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'rgba(56, 217, 245, 0.12)',
            border: '1px solid rgba(56, 217, 245, 0.35)',
            boxShadow: '0 0 20px rgba(56, 217, 245, 0.2)',
            marginBottom: '1.75rem'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#38D9F5',
              boxShadow: '0 0 8px #38D9F5'
            }}
          />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38D9F5', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Predictive Maintenance Intelligence
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            maxWidth: '960px',
            marginBottom: '1.5rem'
          }}
        >
          Predict Failure. Plan Maintenance.{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #38D9F5 0%, #5CE1B9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Maximize Uptime.
          </span>
        </h1>

        {/* Supporting Text */}
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#A7B2C0',
            maxWidth: '780px',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            fontWeight: 400
          }}
        >
          Transform industrial sensor data into actionable maintenance insights with LSTM-powered Remaining Useful Life prediction.
        </p>

        {/* Primary and Secondary CTAs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '3.5rem' }}>
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            Open Dashboard
            <ArrowRight size={18} />
          </Link>
          <Link to="/analytics" className="btn btn-secondary btn-lg">
            Explore Analytics
          </Link>
          <Link to="/predict-lab" className="btn btn-outline-cyan btn-lg">
            <Sparkles size={18} />
            Test Live Inference
          </Link>
        </div>

        {/* Three Compact Feature Highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            width: '100%',
            maxWidth: '1060px'
          }}
        >
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(56, 217, 245, 0.15)',
                border: '1px solid rgba(56, 217, 245, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: '#38D9F5'
              }}
            >
              <Gauge size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.4rem' }}>
              Predictive RUL Estimation
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#A7B2C0', lineHeight: 1.5 }}>
              Sequence learning across 30 chronological operational cycles to project exact remaining machine operating hours before wear limits.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(92, 225, 185, 0.15)',
                border: '1px solid rgba(92, 225, 185, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: '#5CE1B9'
              }}
            >
              <Activity size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.4rem' }}>
              Real-Time Sensor Monitoring
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#A7B2C0', lineHeight: 1.5 }}>
              Continuous multi-channel telemetry tracking across 21 turbofan sensors including compressor exit pressures, fan speeds, and temperatures.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(245, 166, 35, 0.15)',
                border: '1px solid rgba(245, 166, 35, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                color: '#F5A623'
              }}
            >
              <Shield size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.4rem' }}>
              Maintenance Prioritization
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#A7B2C0', lineHeight: 1.5 }}>
              Triage machines automatically into Critical (&le;15 cycles), Warning (16&ndash;40 cycles), and Monitor queues to prevent catastrophic downtime.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE LIVE MODEL INFERENCE DEMO
          ========================================================================= */}
      <section style={{ maxWidth: '1180px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div
          className="glass-panel glass-panel-hover"
          style={{
            padding: '2.5rem',
            background: 'rgba(14, 21, 30, 0.85)',
            border: '1px solid rgba(56, 217, 245, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 30px rgba(56, 217, 245, 0.12)'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38D9F5', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                <Cpu size={16} />
                Live MachineGuard LSTM Engine Demo
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>
                Test Real Deep Learning Model Predictions
              </h2>
            </div>

            {/* Quick Engine Switcher */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => runInference(1)}
                className={`btn btn-sm ${demoEngineId === 1 ? 'btn-primary' : 'btn-secondary'}`}
              >
                Engine #1 (Monitor)
              </button>
              <button
                onClick={() => runInference(81)}
                className={`btn btn-sm ${demoEngineId === 81 ? 'btn-primary' : 'btn-secondary'}`}
              >
                Engine #81 (Warning)
              </button>
              <button
                onClick={() => runInference(34)}
                className={`btn btn-sm ${demoEngineId === 34 ? 'btn-primary' : 'btn-secondary'}`}
                style={demoEngineId === 34 ? { background: '#FF5C5C', color: '#FFFFFF' } : {}}
              >
                Engine #34 (Critical)
              </button>
            </div>
          </div>

          {/* Result Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            {/* Left: Predicted RUL Card */}
            <div
              style={{
                background: 'rgba(18, 27, 38, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#A7B2C0', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                Inference Result &bull; {demoResult ? demoResult.engine_id : `Engine #${demoEngineId}`}
              </div>

              {loadingDemo ? (
                <div style={{ padding: '2rem 0', color: '#38D9F5' }}>
                  <RotateCcw className="animate-spin" size={36} style={{ margin: '0 auto 10px auto' }} />
                  <div>Running LSTM sequence model...</div>
                </div>
              ) : demoResult ? (
                <div>
                  <div
                    className="mono-num"
                    style={{
                      fontSize: '3.6rem',
                      fontWeight: 800,
                      color: demoResult.health_category === 'Critical' ? '#FF5C5C' : demoResult.health_category === 'Warning' ? '#F5A623' : '#5CE1B9',
                      lineHeight: 1
                    }}
                  >
                    {demoResult.predicted_rul_cycles}
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#F4F7FA', fontWeight: 600, marginTop: '4px' }}>
                    Remaining Useful Life ({demoResult.unit})
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '1rem', padding: '6px 14px', borderRadius: '9999px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: demoResult.health_category === 'Critical' ? '#FF5C5C' : demoResult.health_category === 'Warning' ? '#F5A623' : '#5CE1B9'
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {demoResult.health_category}: {demoResult.priority}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Right: Telemetric Metadata */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem' }}>
                Verified Model Contract
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#A7B2C0' }}>Sequence Input Window:</span>
                  <span style={{ color: '#F4F7FA', fontWeight: 600 }}>30 consecutive cycles</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#A7B2C0' }}>Sensor Telemetry Channels:</span>
                  <span style={{ color: '#F4F7FA', fontWeight: 600 }}>21 features per cycle</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#A7B2C0' }}>Preprocessing Applied:</span>
                  <span style={{ color: '#F4F7FA', fontWeight: 600 }}>StandardScaler (Zero-mean, unit-var)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#A7B2C0' }}>Evaluation Cap Limit:</span>
                  <span style={{ color: '#38D9F5', fontWeight: 700 }}>125 cycles</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#A7B2C0' }}>Gateway Latency:</span>
                  <span style={{ color: '#5CE1B9', fontWeight: 700 }}>{demoResult?.gateway_latency_ms || 42} ms</span>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                <Link to={`/fleet/FD001-${String(demoEngineId).padStart(3, '0')}`} className="btn btn-outline-cyan btn-sm">
                  View Full Engine Details
                  <ChevronRight size={14} />
                </Link>
                <Link to="/predict-lab" className="btn btn-secondary btn-sm">
                  Upload Custom CSV
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PIPELINE ARCHITECTURE
          ========================================================================= */}
      <section style={{ maxWidth: '1280px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
            End-to-End Predictive Maintenance Pipeline
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#A7B2C0', maxWidth: '640px', margin: '0 auto' }}>
            High-integrity sequence transformation designed for real industrial sensor processing.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { step: '01', title: 'Sensor Telemetry', desc: '21 channels raw engine observations' },
            { step: '02', title: 'StandardScaler', desc: 'Normalized using saved training params' },
            { step: '03', title: '30-Cycle Window', desc: 'Reshaped to (1, 30, 21) sequence tensor' },
            { step: '04', title: 'LSTM Deep Model', desc: '2-Layer LSTM with 64 units & dropout' },
            { step: '05', title: 'Capped RUL (0-125)', desc: 'Piece-wise linear wear thresholding' },
            { step: '06', title: 'Maintenance Action', desc: 'Prioritized operational triage queue' }
          ].map((item, idx) => (
            <div key={idx} className="glass-card" style={{ position: 'relative' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38D9F5', marginBottom: '0.4rem' }}>
                STEP {item.step}
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.3rem' }}>
                {item.title}
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#A7B2C0', lineHeight: 1.4 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
