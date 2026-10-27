import React from 'react';
import { Shield, Cpu, Activity, ExternalLink, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer
      style={{
        marginTop: '5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(11, 15, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        padding: '3rem 1.75rem 2rem 1.75rem',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand & Purpose */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.8rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(56, 217, 245, 0.2)',
                  border: '1px solid rgba(56, 217, 245, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Cpu size={18} color="#38D9F5" />
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                Machine<span style={{ color: '#38D9F5' }}>Guard</span> AI
              </span>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#A7B2C0', lineHeight: 1.6, marginBottom: '1rem' }}>
              Enterprise deep learning platform for predictive maintenance and Remaining Useful Life (RUL) forecasting of turbofan industrial assets using Long Short-Term Memory sequence networks.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#5CE1B9' }}>
              <Activity size={14} />
              <span>Official Benchmark: MAE 9.60 cycles | RMSE 13.21 cycles</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Platform Navigation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.84rem' }}>
              <Link to="/dashboard" style={{ color: '#A7B2C0', textDecoration: 'none' }}>Operational Dashboard</Link>
              <Link to="/fleet" style={{ color: '#A7B2C0', textDecoration: 'none' }}>Fleet Health Telemetry</Link>
              <Link to="/analytics" style={{ color: '#A7B2C0', textDecoration: 'none' }}>RUL Error & Scatter Analytics</Link>
              <Link to="/maintenance" style={{ color: '#A7B2C0', textDecoration: 'none' }}>Maintenance Priority Queue</Link>
              <Link to="/predict-lab" style={{ color: '#A7B2C0', textDecoration: 'none' }}>CSV Upload & Live Predict Lab</Link>
              <Link to="/model-info" style={{ color: '#A7B2C0', textDecoration: 'none' }}>LSTM Architecture & Pipeline</Link>
            </div>
          </div>

          {/* Architecture & Dataset */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Technical Specifications
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.82rem', color: '#A7B2C0' }}>
              <div><strong style={{ color: '#F4F7FA' }}>Model:</strong> 2-Layer LSTM (64 units) + Dropout + Dense</div>
              <div><strong style={{ color: '#F4F7FA' }}>Window:</strong> 30 cycles sliding sequence</div>
              <div><strong style={{ color: '#F4F7FA' }}>Sensors:</strong> 21 operational telemetry channels</div>
              <div><strong style={{ color: '#F4F7FA' }}>Dataset:</strong> NASA C-MAPSS FD001 Turbofan</div>
              <div><strong style={{ color: '#F4F7FA' }}>Backend:</strong> Node.js Gateway &rarr; Python Flask</div>
              <div><strong style={{ color: '#F4F7FA' }}>Target:</strong> Capped degradation (125 cycles)</div>
            </div>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div
          style={{
            background: 'rgba(16, 26, 39, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <Shield size={18} color="#F5A623" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '0.77rem', color: '#A7B2C0', lineHeight: 1.5 }}>
            <strong style={{ color: '#F5A623' }}>Industrial Safety Notice:</strong> MachineGuard AI Remaining Useful Life (RUL) estimates are probabilistic sequence learning predictions intended exclusively for maintenance prioritization and decision support. Model outputs do not guarantee failure timing or replace certified original equipment manufacturer (OEM) airworthiness and mechanical safety protocols.
          </p>
        </div>

        {/* Bottom Credits */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.78rem',
            color: '#64748B'
          }}
        >
          <div>
            &copy; 2026 MachineGuard AI Systems. Industrial Predictive Maintenance & RUL Intelligence.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span>Trained Keras Model</span>
            <span>&bull;</span>
            <span>Flask Inference Engine</span>
            <span>&bull;</span>
            <span>Node.js API Gateway</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
