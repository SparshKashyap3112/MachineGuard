import React from 'react';

export const KpiCard = ({ title, value, unit, icon: Icon, color = '#38D9F5', subtitle, badgeText, badgeColor }) => {
  return (
    <div
      className="glass-panel glass-panel-hover"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: color,
          opacity: 0.1,
          filter: 'blur(25px)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#A7B2C0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.15)`,
            border: `1px solid ${color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
          }}
        >
          {Icon && <Icon size={18} />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '0.6rem' }}>
        <span className="mono-num" style={{ fontSize: '1.9rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '0.85rem', color: '#A7B2C0', fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748B' }}>
        <span>{subtitle}</span>
        {badgeText && (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: badgeColor ? `${badgeColor}20` : 'rgba(255,255,255,0.08)',
              color: badgeColor || '#A7B2C0',
              border: `1px solid ${badgeColor || '#FFFFFF'}30`
            }}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
