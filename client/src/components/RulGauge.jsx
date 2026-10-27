import React from 'react';

export const RulGauge = ({ rul = 0, maxRul = 125, size = 200, strokeWidth = 14 }) => {
  // Clamp value
  const clampedRul = Math.max(0, Math.min(maxRul, rul));
  const percentage = Math.round((clampedRul / maxRul) * 100);

  // Determine status color
  let color = '#5CE1B9'; // Monitor / Healthy
  let statusText = 'Routine Monitoring';
  let category = 'Monitor';

  if (clampedRul <= 15) {
    color = '#FF5C5C'; // Critical
    statusText = 'Critical Failure Risk';
    category = 'Critical';
  } else if (clampedRul <= 40) {
    color = '#F5A623'; // Warning
    statusText = 'Maintenance Window Due';
    category = 'Warning';
  }

  // Radial calculation (260 degree arc)
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.72; // 260 degrees arc
  const strokeDashoffset = arcLength - (arcLength * clampedRul) / maxRul;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
      <div style={{ position: 'relative', width: size, height: size * 0.85 }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-220deg)', transformOrigin: 'center' }}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Active Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s',
              filter: `drop-shadow(0 0 10px ${color}60)`
            }}
          />
        </svg>

        {/* Center Text Container */}
        <div
          style={{
            position: 'absolute',
            top: '44%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#A7B2C0', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
            Estimated RUL
          </div>
          <div
            className="mono-num"
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1.1,
              marginTop: '2px'
            }}
          >
            {clampedRul.toFixed(1)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#A7B2C0', fontWeight: 600 }}>
            cycles
          </div>
        </div>
      </div>

      {/* Status indicator bar */}
      <div
        style={{
          marginTop: '-10px',
          padding: '4px 14px',
          borderRadius: '9999px',
          background: `${color}18`,
          border: `1px solid ${color}40`,
          color: color,
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}`
          }}
        />
        {category}: {statusText}
      </div>

      <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '6px' }}>
        {percentage}% of maximum operational baseline ({maxRul} cycles)
      </div>
    </div>
  );
};

export default RulGauge;
