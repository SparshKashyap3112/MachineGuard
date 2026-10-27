import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  Cpu,
  Layers,
  ArrowRight,
  TrendingDown,
  Wrench,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { apiService } from '../services/api';
import KpiCard from '../components/KpiCard';
import MachineStatusBadge from '../components/MachineStatusBadge';
import Topbar from '../components/Topbar';

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [criticalEngines, setCriticalEngines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [sumData, fleetData] = await Promise.all([
        apiService.getAnalyticsSummary(),
        apiService.getFleet({ healthCategory: 'critical' })
      ]);
      setSummary(sumData);
      setCriticalEngines((fleetData.engines || []).slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const kpis = summary?.kpis || {
    total_engines: 100,
    healthy_engines: 70,
    maintenance_required: 30,
    average_predicted_rul: 74.5,
    model_test_mae: 9.60,
    model_test_rmse: 13.21,
    rul_cap: 125
  };

  const distributionData = summary?.rul_distribution || [
    { category: '0-15 cycles', count: 7, color: '#FF5C5C' },
    { category: '16-40 cycles', count: 23, color: '#F5A623' },
    { category: '41-75 cycles', count: 28, color: '#38D9F5' },
    { category: '76-100 cycles', count: 22, color: '#4E98E6' },
    { category: '101-125 cycles', count: 20, color: '#5CE1B9' }
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem' }}>
      <Topbar
        title="Fleet Overview Dashboard"
        subtitle="Operational telemetry intelligence and LSTM Remaining Useful Life forecasting"
      />

      {/* Top Controls & Status Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#A7B2C0' }}>
          <span style={{ fontWeight: 600, color: '#FFFFFF' }}>Dataset:</span>
          <span>NASA C-MAPSS FD001 Test Fleet (100 Turbofans)</span>
          <span>&bull;</span>
          <span style={{ color: '#38D9F5' }}>Window: 30 Cycles</span>
        </div>

        <button
          onClick={fetchData}
          disabled={refreshing}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh Telemetry
        </button>
      </div>

      {/* Top 5 KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        <KpiCard
          title="Monitored Engines"
          value={kpis.total_engines}
          unit="units"
          icon={Cpu}
          color="#38D9F5"
          subtitle="Turbofans online"
          badgeText="100% Monitored"
          badgeColor="#38D9F5"
        />

        <KpiCard
          title="Healthy Machines"
          value={kpis.healthy_engines}
          unit="units"
          icon={CheckCircle2}
          color="#5CE1B9"
          subtitle="RUL > 40 cycles"
          badgeText="Nominal"
          badgeColor="#5CE1B9"
        />

        <KpiCard
          title="Attention Required"
          value={kpis.maintenance_required}
          unit="units"
          icon={AlertTriangle}
          color="#FF5C5C"
          subtitle="Critical & Warning"
          badgeText={`${kpis.critical_engines || 7} Critical`}
          badgeColor="#FF5C5C"
        />

        <KpiCard
          title="Average Predicted RUL"
          value={kpis.average_predicted_rul}
          unit="cycles"
          icon={Clock}
          color="#F5A623"
          subtitle="Across active fleet"
          badgeText="Cap: 125"
          badgeColor="#F5A623"
        />

        <KpiCard
          title="Model Test MAE"
          value={kpis.model_test_mae}
          unit="cycles"
          icon={Gauge}
          color="#38D9F5"
          subtitle="Official Test RMSE: 13.21"
          badgeText="Trained LSTM"
          badgeColor="#5CE1B9"
        />
      </div>

      {/* Middle Row: Fleet Health Distribution & Urgent Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* RUL Distribution Bar Chart */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
                Fleet RUL Distribution
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#A7B2C0' }}>
                Engines categorized by remaining useful operating cycles
              </p>
            </div>
            <Link to="/analytics" style={{ fontSize: '0.8rem', color: '#38D9F5', textDecoration: 'none', fontWeight: 600 }}>
              View Analytics &rarr;
            </Link>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div style={{ background: 'rgba(14, 21, 30, 0.95)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem' }}>
                          <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{item.category}</div>
                          <div style={{ color: item.color, fontWeight: 600 }}>{item.count} engines</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Action Queue */}
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '2px' }}>
                  Critical Attention Queue
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#A7B2C0' }}>
                  Machines with predicted RUL &le; 15 cycles requiring immediate maintenance
                </p>
              </div>
              <Link to="/maintenance" style={{ fontSize: '0.8rem', color: '#FF5C5C', textDecoration: 'none', fontWeight: 600 }}>
                Maintenance Center &rarr;
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {criticalEngines.length === 0 && (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#A7B2C0', fontSize: '0.85rem' }}>
                  No critical alerts currently flagged.
                </div>
              )}
              {criticalEngines.map((engine) => (
                <div
                  key={engine.engine_id}
                  style={{
                    background: 'rgba(18, 27, 38, 0.65)',
                    border: '1px solid rgba(255, 92, 92, 0.3)',
                    borderRadius: '12px',
                    padding: '0.9rem 1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#FF5C5C', boxShadow: '0 0 8px #FF5C5C' }} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.92rem' }}>
                        {engine.engine_id}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#A7B2C0' }}>
                        Observed Cycles: {engine.latest_cycle}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="mono-num" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FF5C5C' }}>
                      {engine.predicted_rul_cycles} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>cycles</span>
                    </div>
                    <Link
                      to={`/fleet/${engine.engine_id}`}
                      style={{ fontSize: '0.75rem', color: '#38D9F5', textDecoration: 'none', fontWeight: 600 }}
                    >
                      Inspect Engine &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Predictions evaluated on capped 125-cycle convention.
            </span>
            <Link to="/fleet" className="btn btn-primary btn-sm">
              View All 100 Engines
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
