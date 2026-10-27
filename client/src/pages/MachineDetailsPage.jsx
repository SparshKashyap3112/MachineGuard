import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Gauge,
  Clock,
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Wrench,
  Sparkles,
  Table
} from 'lucide-react';
import { apiService } from '../services/api';
import Topbar from '../components/Topbar';
import RulGauge from '../components/RulGauge';
import MachineStatusBadge from '../components/MachineStatusBadge';
import SensorTrendChart from '../components/SensorTrendChart';

export const MachineDetailsPage = () => {
  const { engineId } = useParams();
  const [engine, setEngine] = useState(null);
  const [sensorHistory, setSensorHistory] = useState([]);
  const [latestWindow, setLatestWindow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live inference state
  const [runningInference, setRunningInference] = useState(false);
  const [livePrediction, setLivePrediction] = useState(null);

  // Tab state for raw 30-cycle window vs charts
  const [activeTab, setActiveTab] = useState('charts'); // 'charts' | 'raw_data'

  useEffect(() => {
    loadEngineData();
  }, [engineId]);

  const loadEngineData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [engRes, sensRes, winRes] = await Promise.all([
        apiService.getEngine(engineId),
        apiService.getEngineSensors(engineId),
        apiService.getEngineWindow(engineId)
      ]);

      setEngine(engRes.engine);
      setSensorHistory(sensRes.history || []);
      setLatestWindow(winRes);
    } catch (err) {
      console.error('Failed to load engine details:', err);
      setError(err.message || 'Engine not found');
    } finally {
      setLoading(false);
    }
  };

  const handleRunInference = async () => {
    if (!latestWindow) return;
    setRunningInference(true);
    try {
      const res = await apiService.predict({
        engine_id: engine.engine_id,
        sequence: latestWindow.sequence
      });
      setLivePrediction(res);
    } catch (err) {
      console.error('Inference error:', err);
    } finally {
      setRunningInference(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center', color: '#38D9F5' }}>
        <Activity size={36} className="animate-pulse" style={{ margin: '0 auto 12px auto' }} />
        <div>Loading turbofan engine telemetry...</div>
      </div>
    );
  }

  if (error || !engine) {
    return (
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', margin: '0 auto' }}>
          <AlertTriangle size={42} color="#FF5C5C" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>Turbofan Not Found</h2>
          <p style={{ color: '#A7B2C0', marginBottom: '1.5rem' }}>{error || 'Unable to retrieve engine records.'}</p>
          <Link to="/fleet" className="btn btn-primary">Back to Fleet Overview</Link>
        </div>
      </div>
    );
  }

  const currentRul = livePrediction ? livePrediction.predicted_rul_cycles : engine.predicted_rul_cycles;
  const currentCategory = livePrediction ? livePrediction.health_category : engine.health_category;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Back button & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link to="/fleet" className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}>
          <ArrowLeft size={14} />
          Fleet List
        </Link>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>
              Engine {engine.engine_id}
            </h1>
            <MachineStatusBadge status={currentCategory} />
          </div>
          <p style={{ fontSize: '0.8rem', color: '#A7B2C0' }}>
            NASA C-MAPSS FD001 Turbofan Assembly Telemetry Analysis
          </p>
        </div>
      </div>

      {/* Main Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Left: Prominent RUL Gauge Card */}
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <RulGauge rul={currentRul} maxRul={125} size={220} />

          {/* Run Live Inference Button */}
          <div style={{ marginTop: '1.25rem', width: '100%', textAlign: 'center' }}>
            <button
              onClick={handleRunInference}
              disabled={runningInference}
              className="btn btn-primary"
              style={{ width: '100%', maxWidth: '280px' }}
            >
              {runningInference ? (
                <>
                  <RotateCcw size={16} className="animate-spin" />
                  Executing LSTM Forward-Pass...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Run Live LSTM Inference
                </>
              )}
            </button>

            {livePrediction && (
              <div style={{ marginTop: '0.8rem', fontSize: '0.75rem', color: '#5CE1B9' }}>
                &bull; Live Model Response: {livePrediction.predicted_rul_cycles} cycles (Latency: {livePrediction.gateway_latency_ms} ms)
              </div>
            )}
          </div>
        </div>

        {/* Center: Operational Telemetry & Operating Settings */}
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem' }}>
              Operational Telemetry
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.25rem' }}>
              <div className="glass-card">
                <div style={{ fontSize: '0.72rem', color: '#A7B2C0', textTransform: 'uppercase' }}>Observed Cycles</div>
                <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF' }}>
                  {engine.latest_cycle}
                </div>
              </div>

              <div className="glass-card">
                <div style={{ fontSize: '0.72rem', color: '#A7B2C0', textTransform: 'uppercase' }}>Sliding Window</div>
                <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38D9F5' }}>
                  30 cycles
                </div>
              </div>

              <div className="glass-card">
                <div style={{ fontSize: '0.72rem', color: '#A7B2C0', textTransform: 'uppercase' }}>Setting 1 (Altitude)</div>
                <div className="mono-num" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#FFFFFF' }}>
                  {engine.operating_settings?.setting_1.toFixed(4) || '0.0000'}
                </div>
              </div>

              <div className="glass-card">
                <div style={{ fontSize: '0.72rem', color: '#A7B2C0', textTransform: 'uppercase' }}>Setting 2 (Mach No.)</div>
                <div className="mono-num" style={{ fontSize: '1.1rem', fontWeight: 600, color: '#FFFFFF' }}>
                  {engine.operating_settings?.setting_2.toFixed(4) || '0.0000'}
                </div>
              </div>
            </div>
          </div>

          {/* Statistical Disclaimer */}
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.72rem', color: '#A7B2C0' }}>
            <strong style={{ color: '#F5A623' }}>Statistical Notice:</strong> RUL is a sequence estimation and not a guaranteed failure timestamp. Capped at 125 cycles following standard turbofan benchmark conventions.
          </div>
        </div>

        {/* Right: Actionable Maintenance Suggestions */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={18} color="#38D9F5" />
            Recommended Maintenance Actions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {engine.recommended_actions?.map((action, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  background: 'rgba(18, 27, 38, 0.5)',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <CheckCircle2 size={16} color={currentCategory === 'Critical' ? '#FF5C5C' : '#5CE1B9'} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.82rem', color: '#F4F7FA', lineHeight: 1.4 }}>{action}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Link to="/maintenance" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Manage in Maintenance Center &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Sensor History & Raw Data Tabs */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              Multi-Channel Sensor Degradation Trends
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#A7B2C0' }}>
              Historical progression across all {engine.latest_cycle} recorded operational cycles
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('charts')}
              className={`btn btn-sm ${activeTab === 'charts' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Activity size={14} />
              Interactive Trends
            </button>
            <button
              onClick={() => setActiveTab('raw_data')}
              className={`btn btn-sm ${activeTab === 'raw_data' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Table size={14} />
              Latest 30 Cycles Table
            </button>
          </div>
        </div>

        {activeTab === 'charts' ? (
          <SensorTrendChart data={sensorHistory} height={340} />
        ) : (
          /* Raw 30-Cycle Window Table */
          <div style={{ overflowX: 'auto' }}>
            <div style={{ fontSize: '0.8rem', color: '#A7B2C0', marginBottom: '0.8rem' }}>
              Displaying the exact 30 chronological rows passed into the StandardScaler &rarr; LSTM tensor input:
            </div>
            <table className="custom-table" style={{ fontSize: '0.78rem' }}>
              <thead>
                <tr>
                  <th>Cycle</th>
                  <th>s2 (T24)</th>
                  <th>s3 (T30)</th>
                  <th>s4 (T50)</th>
                  <th>s7 (P30)</th>
                  <th>s8 (Nf)</th>
                  <th>s9 (Nc)</th>
                  <th>s11 (Ps30)</th>
                  <th>s12 (phi)</th>
                  <th>s15 (BPR)</th>
                </tr>
              </thead>
              <tbody>
                {latestWindow?.raw_rows?.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: '#38D9F5' }}>Cycle {row.cycle}</td>
                    <td className="mono-num">{row.sensor_2?.toFixed(2)}</td>
                    <td className="mono-num">{row.sensor_3?.toFixed(2)}</td>
                    <td className="mono-num">{row.sensor_4?.toFixed(2)}</td>
                    <td className="mono-num">{row.sensor_7?.toFixed(2)}</td>
                    <td className="mono-num">{row.sensor_8?.toFixed(1)}</td>
                    <td className="mono-num">{row.sensor_9?.toFixed(1)}</td>
                    <td className="mono-num">{row.sensor_11?.toFixed(2)}</td>
                    <td className="mono-num">{row.sensor_12?.toFixed(2)}</td>
                    <td className="mono-num">{row.sensor_15?.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineDetailsPage;
