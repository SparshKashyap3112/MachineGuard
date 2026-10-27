import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Sliders,
  Shield,
  FileText,
  Search,
  User,
  Calendar,
  X
} from 'lucide-react';
import { apiService } from '../services/api';
import Topbar from '../components/Topbar';
import MachineStatusBadge from '../components/MachineStatusBadge';

export const MaintenancePage = () => {
  const [criticalThreshold, setCriticalThreshold] = useState(15);
  const [warningThreshold, setWarningThreshold] = useState(40);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('critical'); // 'critical' | 'warning' | 'monitor'

  // Review modal state
  const [selectedEngine, setSelectedEngine] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewerName, setReviewerName] = useState('Chief Maintenance Engineer');
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    loadOverview();
  }, [criticalThreshold, warningThreshold]);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const res = await apiService.getMaintenanceOverview({
        critical: criticalThreshold,
        warning: warningThreshold
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load maintenance overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (engine) => {
    setSelectedEngine(engine);
    setReviewNotes(engine.review?.notes || '');
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!selectedEngine) return;
    setSavingReview(true);
    try {
      await apiService.saveMaintenanceReview(selectedEngine.engine_id, {
        reviewed: true,
        notes: reviewNotes,
        reviewer: reviewerName
      });
      setSelectedEngine(null);
      loadOverview();
    } catch (err) {
      console.error('Failed to save review:', err);
    } finally {
      setSavingReview(false);
    }
  };

  const currentList = data?.categories?.[activeTab] || [];
  const filteredList = currentList.filter((eng) =>
    eng.engine_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem' }}>
      <Topbar
        title="Fleet Maintenance Prioritization Center"
        subtitle="Operational triage queue based on LSTM Remaining Useful Life degradation limits"
      />

      {/* Safety Notice & Configurable Thresholds */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F5A623', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              <Sliders size={16} />
              Configurable Safety Thresholds
            </div>
            <p style={{ fontSize: '0.8rem', color: '#A7B2C0', maxWidth: '650px', lineHeight: 1.4 }}>
              Adjust operational triage limits. <em>Note: These thresholds are configurable operational planning parameters and do not represent OEM-certified safety limits.</em>
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
            {/* Critical slider */}
            <div style={{ minWidth: '180px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                <span style={{ color: '#FF5C5C', fontWeight: 600 }}>Critical Limit:</span>
                <span className="mono-num" style={{ color: '#FFFFFF', fontWeight: 700 }}>&le; {criticalThreshold} cycles</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#FF5C5C', cursor: 'pointer' }}
              />
            </div>

            {/* Warning slider */}
            <div style={{ minWidth: '180px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                <span style={{ color: '#F5A623', fontWeight: 600 }}>Warning Limit:</span>
                <span className="mono-num" style={{ color: '#FFFFFF', fontWeight: 700 }}>&le; {warningThreshold} cycles</span>
              </div>
              <input
                type="range"
                min="25"
                max="60"
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#F5A623', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs & Summary Counts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('critical')}
            style={{
              background: activeTab === 'critical' ? 'rgba(255, 92, 92, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: activeTab === 'critical' ? '1px solid #FF5C5C' : '1px solid rgba(255, 255, 255, 0.1)',
              color: activeTab === 'critical' ? '#FF5C5C' : '#A7B2C0',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertTriangle size={15} />
            Critical Queue ({data?.summary?.critical || 0})
          </button>

          <button
            onClick={() => setActiveTab('warning')}
            style={{
              background: activeTab === 'warning' ? 'rgba(245, 166, 35, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: activeTab === 'warning' ? '1px solid #F5A623' : '1px solid rgba(255, 255, 255, 0.1)',
              color: activeTab === 'warning' ? '#F5A623' : '#A7B2C0',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Clock size={15} />
            Warning Queue ({data?.summary?.warning || 0})
          </button>

          <button
            onClick={() => setActiveTab('monitor')}
            style={{
              background: activeTab === 'monitor' ? 'rgba(92, 225, 185, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: activeTab === 'monitor' ? '1px solid #5CE1B9' : '1px solid rgba(255, 255, 255, 0.1)',
              color: activeTab === 'monitor' ? '#5CE1B9' : '#A7B2C0',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={15} />
            Routine Monitor ({data?.summary?.monitor || 0})
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '220px' }}>
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

      {/* Machines List */}
      <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        {filteredList.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#A7B2C0' }}>
            No turbofans currently match this category queue.
          </div>
        ) : (
          <table className="custom-table" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Engine ID</th>
                <th>Predicted RUL</th>
                <th>Observed Cycles</th>
                <th>Inspection Window</th>
                <th>Review Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((engine) => {
                const isReviewed = engine.review?.reviewed;
                return (
                  <tr key={engine.engine_id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{engine.engine_id}</span>
                    </td>
                    <td>
                      <span
                        className="mono-num"
                        style={{
                          fontWeight: 800,
                          fontSize: '1.05rem',
                          color:
                            activeTab === 'critical'
                              ? '#FF5C5C'
                              : activeTab === 'warning'
                              ? '#F5A623'
                              : '#5CE1B9'
                        }}
                      >
                        {engine.predicted_rul_cycles}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', marginLeft: '4px' }}>cycles</span>
                    </td>
                    <td className="mono-num" style={{ color: '#A7B2C0' }}>
                      {engine.latest_cycle} cycles
                    </td>
                    <td>
                      <span style={{ color: '#F4F7FA' }}>{engine.maintenance_window}</span>
                    </td>
                    <td>
                      {isReviewed ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#5CE1B9', fontSize: '0.75rem', fontWeight: 600 }}>
                          <CheckCircle2 size={13} />
                          Reviewed
                        </span>
                      ) : (
                        <span style={{ color: '#64748B', fontSize: '0.75rem' }}>Pending Review</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenReview(engine)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                        >
                          <FileText size={12} color="#38D9F5" />
                          {isReviewed ? 'Edit Notes' : 'Review'}
                        </button>
                        <Link
                          to={`/fleet/${engine.engine_id}`}
                          className="btn btn-outline-cyan btn-sm"
                          style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                        >
                          Inspect &rarr;
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Notes Modal */}
      {selectedEngine && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '2rem',
              background: 'rgba(14, 21, 30, 0.96)',
              border: '1px solid rgba(56, 217, 245, 0.3)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setSelectedEngine(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: '#A7B2C0',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
              Maintenance Review: {selectedEngine.engine_id}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#A7B2C0', marginBottom: '1.25rem' }}>
              Predicted RUL: <strong style={{ color: '#38D9F5' }}>{selectedEngine.predicted_rul_cycles} cycles</strong> ({selectedEngine.health_category})
            </p>

            <form onSubmit={handleSaveReview}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#A7B2C0', marginBottom: '6px' }}>
                  Reviewer Name / Title:
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="input-glass"
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#A7B2C0', marginBottom: '6px' }}>
                  Engineering Inspection Notes & Directives:
                </label>
                <textarea
                  rows={4}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Record bore-scope findings, vibration analysis sign-off, or planned overhaul date..."
                  className="input-glass"
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setSelectedEngine(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReview}
                  className="btn btn-primary btn-sm"
                >
                  {savingReview ? 'Saving...' : 'Mark as Reviewed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
