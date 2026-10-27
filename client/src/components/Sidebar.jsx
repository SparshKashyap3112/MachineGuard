import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Activity,
  Wrench,
  BarChart3,
  FlaskConical,
  Info,
  ChevronLeft,
  ChevronRight,
  Database,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = ({ collapsed, onToggle }) => {
  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Fleet Monitoring', path: '/fleet', icon: Activity },
    { name: 'RUL Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Maintenance Center', path: '/maintenance', icon: Wrench },
    { name: 'Prediction Lab', path: '/predict-lab', icon: FlaskConical },
    { name: 'Model Information', path: '/model-info', icon: Info }
  ];

  return (
    <aside
      style={{
        width: collapsed ? '80px' : '260px',
        minHeight: 'calc(100vh - 72px)',
        backgroundColor: 'rgba(14, 21, 30, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 0.75rem',
        position: 'sticky',
        top: '72px',
        zIndex: 30
      }}
    >
      <div>
        {/* Toggle Button */}
        <div style={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', marginBottom: '1.25rem', padding: '0 0.5rem' }}>
          <button
            onClick={onToggle}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px',
              color: '#A7B2C0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: collapsed ? '0.75rem 0' : '0.75rem 1rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#38D9F5' : '#A7B2C0',
                  background: isActive ? 'linear-gradient(90deg, rgba(56, 217, 245, 0.15) 0%, rgba(56, 217, 245, 0.03) 100%)' : 'transparent',
                  border: isActive ? '1px solid rgba(56, 217, 245, 0.3)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 16px rgba(56, 217, 245, 0.15)' : 'none',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                })}
                title={collapsed ? item.name : undefined}
              >
                <Icon size={19} style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Dataset & Architecture Info Pill (Bottom) */}
      {!collapsed ? (
        <div
          style={{
            background: 'rgba(18, 27, 38, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '0.9rem',
            fontSize: '0.74rem',
            color: '#A7B2C0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#5CE1B9', fontWeight: 600, marginBottom: '4px' }}>
            <Database size={13} />
            <span>NASA C-MAPSS FD001</span>
          </div>
          <div style={{ color: '#F4F7FA', fontWeight: 500, marginBottom: '2px' }}>
            Input: 30 Cycles × 21 Sensors
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
            Target: Capped RUL (125)
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center' }} title="NASA C-MAPSS FD001">
          <Database size={18} color="#5CE1B9" />
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
