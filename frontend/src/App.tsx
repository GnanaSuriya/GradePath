import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LayoutDashboard, Calculator, TrendingUp, Clock, BarChart2, UploadCloud, Sparkles, User, Settings, Sun, Bell, Menu, X, ChevronDown, GraduationCap } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import GPACalculator from './pages/GPACalculator';
import FutureProjection from './pages/FutureProjection';
import MLPredictor from './pages/MLPredictor';
import Onboarding from './pages/Onboarding';
import SemesterHistory from './pages/SemesterHistory';
import CGPATracker from './pages/CGPATracker';
import Profile from './pages/Profile';
import SettingsPage from './pages/Settings';

const SidebarItem = ({ to, icon: Icon, label, badge, badgeColor, end, onClick }: any) => {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-xl ${
          isActive ? 'bg-primary text-on-primary text-white shadow-md shadow-blue-500/20' : 'text-on-surface-variant hover:bg-surface-container/80 hover:text-on-surface'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className={isActive ? 'text-white' : 'text-on-surface-variant'} strokeWidth={isActive ? 2.5 : 2} />
          <span className="flex-1">{label}</span>
          {badge && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                badgeColor === 'green'
                  ? isActive ? 'bg-green-400/20 text-green-100' : 'bg-green-100 text-green-700'
                  : isActive ? 'bg-blue-400/20 text-blue-100' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-inverse-surface/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-surface-container-lowest border-r border-outline-variant transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 p-6">
          <div className="w-10 h-10 bg-primary text-on-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-600/20">
            <GraduationCap size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-bold text-[18px] text-on-surface leading-tight">GradePath</h1>
            <p className="text-[10px] font-bold text-primary tracking-wider uppercase">Academic Planner</p>
          </div>
          <button className="lg:hidden ml-auto text-on-surface-variant" onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-2 flex flex-col gap-1 flex-1 overflow-y-auto">
          <SidebarItem to="/" end icon={LayoutDashboard} label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
          <SidebarItem to="/calculator" icon={Calculator} label="GPA Calculator" onClick={() => setMobileMenuOpen(false)} />
          <SidebarItem to="/projection" icon={TrendingUp} label="Future Projection" onClick={() => setMobileMenuOpen(false)} />
          <SidebarItem to="/history" icon={Clock} label="Semester History" onClick={() => setMobileMenuOpen(false)} />
          <SidebarItem to="/tracker" icon={BarChart2} label="CGPA Tracker" onClick={() => setMobileMenuOpen(false)} />
          
          <div className="my-2" />
          <SidebarItem to="/import" icon={UploadCloud} label="VTOP Import" badge="New" onClick={() => setMobileMenuOpen(false)} />
          <SidebarItem to="/predictor" icon={Sparkles} label="ML Prediction" badge="Beta" badgeColor="green" onClick={() => setMobileMenuOpen(false)} />
          
          <div className="mt-auto mb-2 border-t border-surface-container-high pt-4" />
          <SidebarItem to="/profile" icon={User} label="Profile" onClick={() => setMobileMenuOpen(false)} />
          <SidebarItem to="/settings" icon={Settings} label="Settings" onClick={() => setMobileMenuOpen(false)} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-[72px] bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-4 lg:px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-on-surface-variant rounded-lg hover:bg-surface-container" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-full border border-outline-variant text-sm font-medium text-on-surface">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Fall 2024 • Semester 5
              <span className="text-primary ml-1">On Track</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="flex items-center gap-2">
              <button className="p-2 text-outline hover:text-on-surface-variant transition-colors">
                <Sun size={20} />
              </button>
              <button className="p-2 text-outline hover:text-on-surface-variant transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
            
            <div className="flex items-center gap-3 border-l border-outline-variant pl-3 lg:pl-6">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-on-surface">{user?.name || 'Student'}</div>
                <div className="text-[11px] font-medium text-on-surface-variant">
                  {profile ? `${profile.degree} ${profile.specialization}` : 'Loading...'}
                </div>
              </div>
              {user?.picture ? (
                <img src={user.picture} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-outline-variant shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold border border-blue-200">
                  {(user?.name || 'S').charAt(0)}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Container */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

function AppContent() {
  const { user, loading, login } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4">
        <div className="bg-surface-container-lowest rounded-3xl p-10 max-w-md w-full shadow-lg border border-surface-container-high text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-primary text-on-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-6">
            <GraduationCap size={32} strokeWidth={2.5} />
          </div>
          <p className="text-[11px] font-bold text-primary tracking-widest uppercase mb-2 bg-blue-50 px-3 py-1 rounded-full">Academic GPA & CGPA Planner</p>
          <h1 className="text-3xl font-bold text-on-surface mb-4 tracking-tight">GradePath</h1>
          <p className="text-primary font-semibold mb-6">Plan your grades. Track your progress. Reach your goal.</p>
          <p className="text-on-surface-variant text-sm mb-8 leading-relaxed px-4">
            A student-focused academic companion to track semester credits, simulate future CGPA targets, and stay on top of university requirements.
          </p>
          
          <button 
            onClick={() => login()}
            className="w-full flex items-center justify-center gap-3 bg-surface-container-lowest border border-outline-variant hover:border-outline hover:bg-surface-container-low text-on-surface font-semibold py-3 px-6 rounded-xl transition-all shadow-sm mb-6"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Sparkles size={14} className="text-green-500" />
            <span>Secured with university SSO compatibility.</span>
          </div>
          <p className="text-[10px] text-outline mt-2">We never view or store your university account passwords.</p>
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
          <Route path="/import" element={<GPACalculator />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<SettingsPage />} />
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
