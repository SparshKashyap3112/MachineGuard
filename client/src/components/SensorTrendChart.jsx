import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

const SENSOR_PALETTE = {
  sensor_2: { color: '#38D9F5', name: 'LPC Outlet Temp (T24)' },
  sensor_3: { color: '#5CE1B9', name: 'HPC Outlet Temp (T30)' },
  sensor_4: { color: '#FF7B72', name: 'LPT Outlet Temp (T50)' },
  sensor_7: { color: '#D2A8FF', name: 'HPC Outlet Press (P30)' },
  sensor_11: { color: '#F5A623', name: 'HPC Static Press (Ps30)' },
  sensor_12: { color: '#79C0FF', name: 'Fuel Flow Ratio (phi)' },
  sensor_15: { color: '#FFA657', name: 'Bypass Ratio (BPR)' }
};

export const SensorTrendChart = ({ data = [], height = 320 }) => {
  const [activeSensors, setActiveSensors] = useState(['sensor_2', 'sensor_3', 'sensor_4', 'sensor_11']);

  const toggleSensor = (key) => {
    if (activeSensors.includes(key)) {
      if (activeSensors.length > 1) {
        setActiveSensors(activeSensors.filter((s) => s !== key));
      }
    } else {
      setActiveSensors([...activeSensors, key]);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: 'rgba(14, 21, 30, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            padding: '10px 14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            fontSize: '0.8rem'
          }}
        >
          <div style={{ fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
            Cycle #{label}
          </div>
          {payload.map((entry, index) => {
            const meta = SENSOR_PALETTE[entry.dataKey] || { name: entry.dataKey };
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: entry.color
                  }}
                />
                <span style={{ color: '#A7B2C0' }}>{meta.name}:</span>
                <span className="mono-num" style={{ fontWeight: 600, color: '#FFFFFF' }}>
                  {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Sensor Channel Filter Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
        {Object.entries(SENSOR_PALETTE).map(([key, info]) => {
          const isSelected = activeSensors.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggleSensor(key)}
              style={{
                background: isSelected ? `${info.color}20` : 'rgba(255, 255, 255, 0.04)',
                border: isSelected ? `1px solid ${info.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                color: isSelected ? info.color : '#A7B2C0',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.18s ease'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: info.color,
                  opacity: isSelected ? 1 : 0.4
                }}
              />
              {info.name}
            </button>
          );
        })}
      </div>

      {/* Chart Container */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            <XAxis
              dataKey="cycle"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `C${v}`}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            {activeSensors.map((sensorKey) => {
              const meta = SENSOR_PALETTE[sensorKey] || { color: '#38D9F5' };
              return (
                <Line
                  key={sensorKey}
                  type="monotone"
                  dataKey={sensorKey}
                  stroke={meta.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: meta.color, stroke: '#0B0F14', strokeWidth: 2 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SensorTrendChart;
