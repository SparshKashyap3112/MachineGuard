import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cpu, Activity, ShieldCheck, Gauge, Wrench, BarChart2, Layers, Menu, X } from 'lucide-react';
import { apiService } from '../services/api';

export const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemHealth, setSystemHealth] = useState({ status: 'checking' });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    apiService.getHealth()
      .then((data) => setSystemHealth(data))
      .catch(() => setSystemHealth({ status: 'offline' }));
  }, []);

  const navLinks = [
    { name: 'Overview', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Fleet Monitoring', path: '/fleet' },
    { name: 'RUL Analytics', path: '/analytics' },
    { name: 'Maintenance', path: '/maintenance' },
    { name: 'Prediction Lab', path: '/predict-lab' },
    { name: 'Model Info', path: '/model-info' }
  ];

  const isHealthy = systemHealth.status === 'healthy';

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        backgroundColor: isScrolled ? 'rgba(11, 15, 20, 0.85)' : 'rgba(11, 15, 20, 0.45)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0.85rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: '#F4F7FA'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(56, 217, 245, 0.25) 0%, rgba(92, 225, 185, 0.15) 100%)',
              border: '1px solid rgba(56, 217, 245, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(56, 217, 245, 0.2)'
            }}
          >
            <Cpu size={20} color="#38D9F5" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                Machine<span style={{ color: '#38D9F5' }}>Guard</span>
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(56, 217, 245, 0.15)',
                  color: '#38D9F5',
                  border: '1px solid rgba(56, 217, 245, 0.3)',
                  letterSpacing: '0.04em'
                }}
              >
                AI
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#A7B2C0', letterSpacing: '0.02em' }}>
              LSTM RUL Intelligence
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'none', gap: '0.4rem', alignItems: 'center' }} className="desktop-nav">
          <style>{`
            @media (min-width: 992px) {
              .desktop-nav { display: flex !important; }
              .mobile-toggle { display: none !important; }
            }
          `}</style>

          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#38D9F5' : '#A7B2C0',
                  background: isActive ? 'rgba(56, 217, 245, 0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(56, 217, 245, 0.25)' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#A7B2C0';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* System Health Status & Primary CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Health Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: isHealthy ? 'rgba(92, 225, 185, 0.1)' : 'rgba(255, 92, 92, 0.1)',
              border: isHealthy ? '1px solid rgba(92, 225, 185, 0.3)' : '1px solid rgba(255, 92, 92, 0.3)',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: isHealthy ? '#5CE1B9' : '#FF5C5C'
            }}
            title={isHealthy ? 'Node Gateway & Python LSTM Engine Operational' : 'Model Inference Service Initializing'}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isHealthy ? '#5CE1B9' : '#FF5C5C',
                boxShadow: isHealthy ? '0 0 6px #5CE1B9' : '0 0 6px #FF5C5C'
              }}
            />
            {isHealthy ? 'Model Active' : 'Service Connecting'}
          </div>

          <Link to="/dashboard" className="btn btn-primary btn-sm" style={{ display: 'none' }} id="nav-cta-btn">
            Open Dashboard
          </Link>
          <style>{`
            @media (min-width: 768px) {
              #nav-cta-btn { display: inline-flex !important; }
            }
          `}</style>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#F4F7FA',
              cursor: 'pointer',
              display: 'flex',
              padding: '6px'
            }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'rgba(11, 15, 20, 0.95)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '1.25rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: location.pathname === link.path ? '#38D9F5' : '#F4F7FA',
                background: location.pathname === link.path ? 'rgba(56, 217, 245, 0.1)' : 'transparent',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-primary"
            style={{ marginTop: '0.5rem', width: '100%' }}
          >
            Open Dashboard
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
