import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Component
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div style={{ padding: '24px', fontWeight: 'bold', fontSize: '20px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>GP</div>
          GradePath
        </div>
        <div style={{ padding: '0 12px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px', marginTop: '16px' }}>NAVIGATION</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={navStyle}>Dashboard</NavLink>
          <NavLink to="/calculator" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={navStyle}>GPA Calculator</NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={navStyle}>Semester History</NavLink>
          <NavLink to="/tracker" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={navStyle}>CGPA Tracker</NavLink>
          <NavLink to="/projection" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={navStyle}>Future Projection</NavLink>
          <NavLink to="/predictor" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={navStyle}>AI Predictor</NavLink>
        </nav>
        
        <div style={{ padding: '0 12px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px', marginTop: '32px' }}>SYSTEM</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 12px' }}>
          <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={navStyle}>Profile</NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={navStyle}>Settings</NavLink>
        </nav>
      </aside>
      
      <main className="main-content">
        <header className="top-header">
          <div className="flex-row gap-4">
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Academic standing</span>
            <span className="badge-success">Good Standing</span>
          </div>
          <div className="flex-row gap-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{user?.name || 'Student'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.email || ''}</div>
              </div>
              {user?.picture ? (
                <img src={user.picture} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '20px' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: 'var(--border)' }}></div>
              )}
            </div>
          </div>
        </header>
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
};

const navStyle = ({ isActive }: any) => ({
  padding: '10px 16px',
  borderRadius: '8px',
  color: isActive ? 'var(--primary)' : 'var(--text-main)',
  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
  fontWeight: isActive ? 600 : 500,
  textDecoration: 'none'
});

import Dashboard from './pages/Dashboard';
import GPACalculator from './pages/GPACalculator';
import FutureProjection from './pages/FutureProjection';
import MLPredictor from './pages/MLPredictor';
import Onboarding from './pages/Onboarding';
import SemesterHistory from './pages/SemesterHistory';
import CGPATracker from './pages/CGPATracker';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function AppContent() {
  const { user, loading, login } = useAuth();
  
  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ width: '400px', textAlign: 'center' }}>
          <h2>Sign in to GradePath</h2>
          <p className="page-subtitle" style={{ marginTop: '8px' }}>Manage your academic journey</p>
          <button className="btn-primary" onClick={() => login()} style={{ width: '100%', marginTop: '16px' }}>Sign in with Google</button>
        </div>
      </div>
    );
  }

  if (user.needsOnboarding) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Onboarding />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calculator" element={<GPACalculator />} />
          <Route path="/history" element={<SemesterHistory />} />
          <Route path="/tracker" element={<CGPATracker />} />
          <Route path="/projection" element={<FutureProjection />} />
          <Route path="/predictor" element={<MLPredictor />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
