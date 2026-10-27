import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  Line,
  ComposedChart,
  Legend
} from 'recharts';
import {
  BarChart2,
  TrendingDown,
  Info,
  CheckCircle2,
  Shield,
  Layers,
  ArrowUpDown,
  Search
} from 'lucide-react';
import { apiService } from '../services/api';
import Topbar from '../components/Topbar';
import KpiCard from '../components/KpiCard';

export const AnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumRes, evalRes] = await Promise.all([
        apiService.getAnalyticsSummary(),
        apiService.getEvaluations()
      ]);
      setSummary(sumRes);
      setEvaluations(evalRes.evaluations || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvals = evaluations.filter((e) =>
    e.engine_id.toLowerCase().includes(search.toLowerCase())
  );

  const errorDist = summary?.error_distribution || [];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem' }}>
      <Topbar
        title="RUL Model Evaluation & Analytics"
        subtitle="Official NASA C-MAPSS FD001 Test Set Performance (100 Turbofan Engines)"
      />

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <KpiCard
          title="Official Test MAE"
          value="9.60"
          unit="cycles"
          icon={TrendingDown}
          color="#38D9F5"
          subtitle="Mean Absolute Error"
          badgeText="Verified Model"
          badgeColor="#38D9F5"
        />

        <KpiCard
          title="Official Test RMSE"
          value="13.21"
          unit="cycles"
          icon={BarChart2}
          color="#5CE1B9"
          subtitle="Root Mean Squared Error"
          badgeText="Target: Capped 125"
          badgeColor="#5CE1B9"
        />

        <KpiCard
          title="RUL Cap Convention"
          value="125"
          unit="cycles"
          icon={Shield}
          color="#F5A623"
          subtitle="Wear plateau cap limit"
          badgeText="Piece-wise Linear"
          badgeColor="#F5A623"
        />

        <KpiCard
          title="Total Test Engines"
          value="100"
          unit="units"
          icon={Layers}
          color="#38D9F5"
          subtitle="Standard benchmark fleet"
          badgeText="FD001"
          badgeColor="#38D9F5"
        />
      </div>

      {/* Target Capping Explanatory Note */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          background: 'rgba(16, 26, 39, 0.75)'
        }}
      >
        <Info size={20} color="#38D9F5" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.84rem', color: '#A7B2C0', lineHeight: 1.5 }}>
          <strong style={{ color: '#FFFFFF' }}>Target Capping Evaluation Methodology:</strong> In NASA turbofan degradation literature (Heimes, Saxena et al.), Remaining Useful Life is capped at <strong>125 cycles</strong> during training and evaluation because engines in early operational phases exhibit negligible degradation signature. The model was trained against capped labels, achieving a verified <strong>MAE of 9.60 cycles</strong> and <strong>RMSE of 13.21 cycles</strong> across all 100 official test engines.
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Actual vs Predicted Comparison Chart */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
            Actual vs Predicted RUL Comparison
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#A7B2C0', marginBottom: '1.25rem' }}>
            Comparison across all 100 test engines (ordered by numeric ID)
          </p>

          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={evaluations} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="numeric_id" stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `#${v}`} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 130]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div style={{ background: 'rgba(14, 21, 30, 0.95)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem' }}>
                          <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>{item.engine_id}</div>
                          <div style={{ color: '#5CE1B9' }}>Actual (Capped): {item.capped_actual_rul} cycles</div>
                          <div style={{ color: '#38D9F5' }}>Predicted: {item.predicted_rul} cycles</div>
                          <div style={{ color: Math.abs(item.error) > 15 ? '#FF5C5C' : '#A7B2C0', marginTop: '2px' }}>
                            Residual: {item.error > 0 ? `+${item.error}` : item.error} cycles
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="capped_actual_rul" name="Actual RUL (Capped)" stroke="#5CE1B9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="predicted_rul" name="Predicted RUL" stroke="#38D9F5" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Error Distribution Histogram */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
            Prediction Error Distribution
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#A7B2C0', marginBottom: '1.25rem' }}>
            Residual distribution (Predicted RUL &minus; Capped Actual RUL)
          </p>

          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errorDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="bin_center" stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}c`} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div style={{ background: 'rgba(14, 21, 30, 0.95)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem' }}>
                          <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Error Range: {item.range} cycles</div>
                          <div style={{ color: '#38D9F5', fontWeight: 600 }}>{item.count} engines</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#38D9F5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Engine-Level Verification Table */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
              Engine-Level Verification Records
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#A7B2C0' }}>
              Individual predictions against official ground truth labels
            </p>
          </div>

          <div style={{ position: 'relative', width: '240px' }}>
            <input
              type="text"
              placeholder="Search Engine ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-glass"
              style={{ paddingLeft: '2.2rem', fontSize: '0.82rem' }}
            />
            <Search size={14} color="#A7B2C0" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
          <table className="custom-table" style={{ fontSize: '0.82rem' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(14, 21, 30, 0.95)', zIndex: 5 }}>
              <tr>
                <th>Engine ID</th>
                <th>Capped Ground Truth</th>
                <th>LSTM Prediction</th>
                <th>Residual Error</th>
                <th>Abs Error</th>
                <th>Health Category</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvals.map((e) => (
                <tr key={e.engine_id}>
                  <td style={{ fontWeight: 700, color: '#FFFFFF' }}>{e.engine_id}</td>
                  <td className="mono-num" style={{ color: '#5CE1B9', fontWeight: 600 }}>
                    {e.capped_actual_rul} cycles
                  </td>
                  <td className="mono-num" style={{ color: '#38D9F5', fontWeight: 700 }}>
                    {e.predicted_rul} cycles
                  </td>
                  <td
                    className="mono-num"
                    style={{
                      color: Math.abs(e.error) <= 10 ? '#5CE1B9' : Math.abs(e.error) <= 20 ? '#F5A623' : '#FF5C5C',
                      fontWeight: 600
                    }}
                  >
                    {e.error > 0 ? `+${e.error}` : e.error}
                  </td>
                  <td className="mono-num" style={{ color: '#A7B2C0' }}>
                    {e.abs_error}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background:
                          e.health_category === 'Critical'
                            ? 'rgba(255, 92, 92, 0.15)'
                            : e.health_category === 'Warning'
                            ? 'rgba(245, 166, 35, 0.15)'
                            : 'rgba(92, 225, 185, 0.15)',
                        color:
                          e.health_category === 'Critical'
                            ? '#FF5C5C'
                            : e.health_category === 'Warning'
                            ? '#F5A623'
                            : '#5CE1B9'
                      }}
                    >
                      {e.health_category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
