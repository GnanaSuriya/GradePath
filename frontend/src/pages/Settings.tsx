import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<string>(localStorage.getItem('gradepath-theme') || 'system');
  const [profile, setProfile] = useState<any>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [profileRes, semRes] = await Promise.all([
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, { headers }),
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/semesters`, { headers })
        ]);
        
        setProfile(profileRes.data);
        setSemesters(semRes.data);
      } catch (err) {
        console.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const applyTheme = (t: string) => {
      if (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme(theme);

    const listener = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('gradepath-theme', newTheme);
  };

  let currentCGPA = 0;
  if (semesters.length > 0) {
    let totalEarnedCredits = 0;
    let totalGradePoints = 0;
    for (const sem of semesters) {
      totalEarnedCredits += sem.credits;
      totalGradePoints += (sem.gpa * sem.credits);
    }
    if (totalEarnedCredits > 0) {
      currentCGPA = totalGradePoints / totalEarnedCredits;
    }
  }

  const getCGPAStatus = (cgpa: number, gradingSystem: number) => {
    if (cgpa === 0) return 'No CGPA data available yet.';
    
    // Normalize to 10-point scale for standard status messages
    const max = gradingSystem > 0 ? gradingSystem : 10;
    const normalized = (cgpa / max) * 10;

    if (normalized >= 9.0) return 'Excellent';
    if (normalized >= 8.0) return 'Very Good';
    if (normalized >= 7.0) return 'Good';
    if (normalized >= 6.0) return 'Satisfactory';
    return 'Needs Improvement';
  };

  if (loading) {
    return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>Loading settings...</div>;
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: '24px' }}>Settings</h1>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Appearance</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>Choose how GradePath looks.</p>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="theme" 
              value="light" 
              checked={theme === 'light'} 
              onChange={() => handleThemeChange('light')} 
            />
            <span style={{ fontWeight: 500 }}>Light</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="theme" 
              value="dark" 
              checked={theme === 'dark'} 
              onChange={() => handleThemeChange('dark')} 
            />
            <span style={{ fontWeight: 500 }}>Dark</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="radio" 
              name="theme" 
              value="system" 
              checked={theme === 'system'} 
              onChange={() => handleThemeChange('system')} 
            />
            <span style={{ fontWeight: 500 }}>System</span>
          </label>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>CGPA Status</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>Your current academic progress.</p>
        
        <div style={{ display: 'flex', gap: '48px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>CURRENT CGPA</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>
              {currentCGPA > 0 ? (
                <>
                  {currentCGPA.toFixed(2)} <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>/ {profile?.grading_system || 10}</span>
                </>
              ) : (
                <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 500 }}>Not available</span>
              )}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>STATUS</div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--primary)', marginTop: '4px' }}>
              {getCGPAStatus(currentCGPA, parseFloat(profile?.grading_system || '10'))}
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Account</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>Manage your GradePath session.</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>LOGGED IN AS</div>
            <div style={{ fontSize: '16px', fontWeight: 500 }}>{user?.email}</div>
          </div>
          <button 
            className="btn-primary" 
            style={{ backgroundColor: 'var(--error)' }}
            onClick={handleLogout}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
