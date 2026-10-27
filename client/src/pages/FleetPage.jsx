import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  Activity,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  List,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Play
} from 'lucide-react';
import { apiService } from '../services/api';
import Topbar from '../components/Topbar';
import MachineStatusBadge from '../components/MachineStatusBadge';

export const FleetPage = () => {
  const [fleet, setFleet] = useState([]);
  const [filteredFleet, setFilteredFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('predicted_rul_cycles');
  const [sortOrder, setSortOrder] = useState('asc');

  // Quick inference state
  const [inferencingId, setInferencingId] = useState(null);
  const [liveToast, setLiveToast] = useState(null);

  useEffect(() => {
    fetchFleet();
  }, []);

  const fetchFleet = async () => {
    try {
      setLoading(true);
      const res = await apiService.getFleet();
      setFleet(res.engines || []);
      setFilteredFleet(res.engines || []);
    } catch (err) {
      console.error('Failed to load fleet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let list = [...fleet];

    // Filter category
    if (categoryFilter !== 'all') {
      list = list.filter((e) => e.health_category.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.engine_id.toLowerCase().includes(q) || String(e.numeric_id).includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === 'string') {
        return sortOrder === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    setFilteredFleet(list);
  }, [search, categoryFilter, sortBy, sortOrder, fleet]);

  const runQuickInference = async (engine) => {
    setInferencingId(engine.engine_id);
    try {
      const windowData = await apiService.getEngineWindow(engine.numeric_id);
      const res = await apiService.predict({
        engine_id: engine.engine_id,
        sequence: windowData.sequence
      });

      setLiveToast({
        engine_id: res.engine_id,
        rul: res.predicted_rul_cycles,
        category: res.health_category,
        latency: res.gateway_latency_ms
      });

      setTimeout(() => setLiveToast(null), 5000);
    } catch (err) {
      console.error('Inference error:', err);
    } finally {
      setInferencingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem' }}>
      <Topbar
        title="Fleet Telemetry Monitoring"
        subtitle="100 NASA C-MAPSS FD001 Turbofans under LSTM Remaining Useful Life surveillance"
      />

      {/* Live Toast Notification for real inference */}
      {liveToast && (
        <div
          style={{
            position: 'fixed',
            top: '84px',
            right: '24px',
            zIndex: 100,
            background: 'rgba(14, 21, 30, 0.95)',
            border: '1px solid #38D9F5',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 217, 245, 0.3)',
            borderRadius: '12px',
            padding: '1rem 1.4rem',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38D9F5', boxShadow: '0 0 10px #38D9F5' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem' }}>
              Real Inference Executed: {liveToast.engine_id}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#A7B2C0' }}>
              Predicted RUL: <strong style={{ color: '#38D9F5' }}>{liveToast.rul} cycles</strong> &bull; Latency: {liveToast.latency} ms
            </div>
          </div>
        </div>
      )}

      {/* Filter and Control Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Filter by Engine ID (e.g. 34)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-glass"
              style={{ paddingLeft: '2.2rem', paddingRight: '1rem', fontSize: '0.84rem' }}
            />
            <Search size={14} color="#A7B2C0" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Health Category Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Engines' },
              { id: 'critical', label: 'Critical (≤15)' },
              { id: 'warning', label: 'Warning (16-40)' },
              { id: 'monitor', label: 'Monitor (>40)' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                style={{
                  background: categoryFilter === cat.id ? 'rgba(56, 217, 245, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: categoryFilter === cat.id ? '1px solid #38D9F5' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: categoryFilter === cat.id ? '#38D9F5' : '#A7B2C0',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sorting & Layout View Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="input-glass"
            style={{ width: 'auto', padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
          >
            <option value="predicted_rul_cycles-asc">RUL: Lowest First (Urgent)</option>
            <option value="predicted_rul_cycles-desc">RUL: Highest First</option>
            <option value="latest_cycle-desc">Cycles: Highest First</option>
            <option value="numeric_id-asc">Engine ID: Ascending</option>
          </select>

          {/* Table / Grid Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '2px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? 'rgba(56, 217, 245, 0.25)' : 'transparent',
                border: 'none',
                color: viewMode === 'table' ? '#38D9F5' : '#A7B2C0',
                padding: '5px 8px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'rgba(56, 217, 245, 0.25)' : 'transparent',
                border: 'none',
                color: viewMode === 'grid' ? '#38D9F5' : '#A7B2C0',
                padding: '5px 8px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Fleet Content */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#38D9F5' }}>
          <Activity size={36} className="animate-pulse" style={{ margin: '0 auto 10px auto' }} />
          <div>Loading fleet telemetry records...</div>
        </div>
      ) : filteredFleet.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#A7B2C0' }}>
          <div>No turbofan engines matched your current search filters.</div>
          <button
            onClick={() => { setSearch(''); setCategoryFilter('all'); }}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '1rem' }}
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="glass-panel" style={{ padding: '0.75rem', overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Engine ID</th>
                <th>Observed Cycles</th>
                <th>Predicted RUL</th>
                <th>Health Status</th>
                <th>Action Window</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFleet.map((engine) => (
                <tr key={engine.engine_id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.92rem' }}>
                        {engine.engine_id}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="mono-num" style={{ color: '#A7B2C0', fontWeight: 600 }}>
                      {engine.latest_cycle} cycles
                    </span>
                  </td>
                  <td>
                    <span
                      className="mono-num"
                      style={{
                        fontWeight: 800,
                        fontSize: '1rem',
                        color:
                          engine.health_category === 'Critical'
                            ? '#FF5C5C'
                            : engine.health_category === 'Warning'
                            ? '#F5A623'
                            : '#5CE1B9'
                      }}
                    >
                      {engine.predicted_rul_cycles}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '4px' }}>cycles</span>
                  </td>
                  <td>
                    <MachineStatusBadge status={engine.health_category} size="sm" />
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#A7B2C0' }}>
                      {engine.maintenance_window}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => runQuickInference(engine)}
                        disabled={inferencingId === engine.engine_id}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                        title="Execute live LSTM model forward-pass"
                      >
                        <Play size={11} color="#38D9F5" />
                        {inferencingId === engine.engine_id ? 'Inferring...' : 'Inference'}
                      </button>
                      <Link
                        to={`/fleet/${engine.engine_id}`}
                        className="btn btn-outline-cyan btn-sm"
                        style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                      >
                        Details
                        <ChevronRight size={12} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Mode */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filteredFleet.map((engine) => (
            <div
              key={engine.engine_id}
              className="glass-panel glass-panel-hover"
              style={{
                padding: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
                      {engine.engine_id}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#A7B2C0' }}>
                      Latest Observed: {engine.latest_cycle} cycles
                    </div>
                  </div>
                  <MachineStatusBadge status={engine.health_category} size="sm" />
                </div>

                <div style={{ background: 'rgba(14, 21, 30, 0.6)', borderRadius: '12px', padding: '1rem', margin: '1rem 0', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#A7B2C0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Predicted RUL
                  </div>
                  <div
                    className="mono-num"
                    style={{
                      fontSize: '2.2rem',
                      fontWeight: 800,
                      color:
                        engine.health_category === 'Critical'
                          ? '#FF5C5C'
                          : engine.health_category === 'Warning'
                          ? '#F5A623'
                          : '#5CE1B9',
                      lineHeight: 1.1
                    }}
                  >
                    {engine.predicted_rul_cycles}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>cycles remaining</div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#A7B2C0', marginBottom: '1.25rem' }}>
                  <strong>Action:</strong> {engine.priority}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => runQuickInference(engine)}
                  disabled={inferencingId === engine.engine_id}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Play size={12} color="#38D9F5" />
                  {inferencingId === engine.engine_id ? 'Inferring...' : 'Inference'}
                </button>
                <Link to={`/fleet/${engine.engine_id}`} className="btn btn-outline-cyan btn-sm" style={{ flex: 1 }}>
                  Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FleetPage;
