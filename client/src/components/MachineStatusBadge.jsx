import React from 'react';

export const MachineStatusBadge = ({ status = 'Monitor', size = 'md' }) => {
  let badgeClass = 'badge-healthy';
  let dotColor = '#5CE1B9';
  let label = status;

  const normalized = status?.toLowerCase() || '';

  if (normalized.includes('crit')) {
    badgeClass = 'badge-critical';
    dotColor = '#FF5C5C';
    label = 'Critical';
  } else if (normalized.includes('warn')) {
    badgeClass = 'badge-warning';
    dotColor = '#F5A623';
    label = 'Warning';
  } else {
    badgeClass = 'badge-healthy';
    dotColor = '#5CE1B9';
    label = 'Monitor';
  }

  const padding = size === 'sm' ? '2px 8px' : '4px 12px';
  const fontSize = size === 'sm' ? '0.7rem' : '0.75rem';

  return (
    <span className={`badge ${badgeClass}`} style={{ padding, fontSize }}>
      <span className="pulse-dot" style={{ backgroundColor: dotColor }} />
      {label}
    </span>
  );
};

export default MachineStatusBadge;
