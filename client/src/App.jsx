import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import VideoBackground from './components/VideoBackground';

import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import FleetPage from './pages/FleetPage';
import MachineDetailsPage from './pages/MachineDetailsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import MaintenancePage from './pages/MaintenancePage';
import PredictionLabPage from './pages/PredictionLabPage';
import ModelInfoPage from './pages/ModelInfoPage';

const AppContent = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isLanding = location.pathname === '/';

  // Video overlay density logic
  const overlayVariant = isLanding ? 'hero' : 'dense';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Cinematic Industrial Video Background using uploaded machine-bg-1.mp4 and machine-bg-2.mp4 */}
      <VideoBackground overlayVariant={overlayVariant} />

      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', zIndex: 10 }}>
        {/* Render Sidebar on all dashboard/application routes */}
        {!isLanding && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        {/* Page Content View */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/fleet" element={<FleetPage />} />
            <Route path="/fleet/:engineId" element={<MachineDetailsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/predict-lab" element={<PredictionLabPage />} />
            <Route path="/model-info" element={<ModelInfoPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
