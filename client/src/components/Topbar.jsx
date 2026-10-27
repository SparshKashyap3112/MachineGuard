import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Activity, ShieldAlert, Cpu } from 'lucide-react';

export const Topbar = ({ title, subtitle }) => {
  const [searchId, setSearchId] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    // clean numeric id
    const clean = searchId.replace(/[^0-9]/g, '');
    if (clean) {
      navigate(`/fleet/FD001-${clean.padStart(3, '0')}`);
      setSearchId('');
    }
  };

  return (
    <header
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.75rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.55rem', fontWeight: 700, color: '#F4F7FA', letterSpacing: '-0.02em', marginBottom: '2px' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '0.85rem', color: '#A7B2C0' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Quick Search */}
        <form onSubmit={handleSearch} style={{ position: 'relative', width: '220px' }}>
          <input
            type="text"
            placeholder="Search Engine ID (e.g. 34)..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="input-glass"
            style={{
              paddingLeft: '2.2rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              fontSize: '0.82rem',
              borderRadius: '10px'
            }}
          />
          <Search
            size={14}
            color="#A7B2C0"
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}
          />
        </form>

        <button
          onClick={() => navigate('/predict-lab')}
          className="btn btn-outline-cyan btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Sparkles size={14} />
          Inference Lab
        </button>
      </div>
    </header>
  );
};

export default Topbar;
