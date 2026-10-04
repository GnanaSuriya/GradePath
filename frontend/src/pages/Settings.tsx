import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, Monitor, Bell, Shield, Download, Trash2, LogOut } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<string>(localStorage.getItem('gradepath-theme') || 'system');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  // const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

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

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6 font-sans pb-20 bg-surface min-h-screen">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface tracking-tight">Application Settings</h1>
        <p className="text-sm text-on-surface-variant font-medium mt-1">Manage your appearance, notifications, and account preferences.</p>
      </div>

      <div className="space-y-6">
        
        {/* Appearance */}
        <div className="bg-surface-container-low rounded-DEFAULT p-6 md:p-8 border border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <Monitor size={20} className="text-primary" /> Appearance
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => handleThemeChange('light')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'light' ? 'border-primary bg-primary-container text-on-primary-container' : 'border-outline-variant hover:border-outline text-on-surface-variant bg-surface-container-lowest'}`}
            >
              <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-outline'}`}>
                <Sun size={24} />
              </div>
              <div className="font-bold">Light Mode</div>
            </button>
            
            <button 
              onClick={() => handleThemeChange('dark')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'dark' ? 'border-primary bg-primary-container text-on-primary-container' : 'border-outline-variant hover:border-outline text-on-surface-variant bg-surface-container-lowest'}`}
            >
              <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-outline'}`}>
                <Moon size={24} />
              </div>
              <div className="font-bold">Dark Mode</div>
            </button>
            
            <button 
              onClick={() => handleThemeChange('system')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'system' ? 'border-primary bg-primary-container text-on-primary-container' : 'border-outline-variant hover:border-outline text-on-surface-variant bg-surface-container-lowest'}`}
            >
              <div className={`p-3 rounded-xl ${theme === 'system' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                <Monitor size={24} />
              </div>
              <div className="font-bold">System Default</div>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-surface-container-low rounded-DEFAULT p-6 md:p-8 border border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <Bell size={20} className="text-secondary" /> Notifications
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-outline-variant rounded-xl">
              <div>
                <h3 className="font-bold text-on-surface">Email Updates</h3>
                <p className="text-xs text-on-surface-variant mt-1">Receive weekly summaries and important alerts.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-outline-variant rounded-xl">
              <div>
                <h3 className="font-bold text-on-surface">Push Notifications</h3>
                <p className="text-xs text-on-surface-variant mt-1">Get notified instantly about significant CGPA changes.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={pushNotifs} onChange={() => setPushNotifs(!pushNotifs)} />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-surface-container-low rounded-DEFAULT p-6 md:p-8 border border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <Shield size={20} className="text-tertiary" /> Data & Privacy
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-outline-variant rounded-xl gap-4">
              <div>
                <h3 className="font-bold text-on-surface">Export Academic Data</h3>
                <p className="text-xs text-on-surface-variant mt-1">Download your complete GradePath profile and semester history as CSV.</p>
              </div>
              <button className="flex items-center justify-center gap-2 bg-surface-container-low border border-outline text-on-surface hover:bg-surface-container-high font-bold py-2 px-4 rounded-xl transition-colors shadow-sm whitespace-nowrap text-sm">
                <Download size={16} /> Export CSV
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-error-container bg-error-container/20 rounded-2xl gap-4">
              <div>
                <h3 className="font-bold text-error">Delete Account</h3>
                <p className="text-xs text-on-error-container mt-1">Permanently remove your account and all associated data.</p>
              </div>
              <button className="flex items-center justify-center gap-2 bg-error text-on-error hover:bg-error/90 font-bold py-2 px-4 rounded-xl transition-colors whitespace-nowrap text-sm border-none">
                <Trash2 size={16} /> Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="flex justify-between items-center bg-surface-container rounded-DEFAULT p-6 border border-outline-variant">
          <div>
            <div className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Logged In As</div>
            <div className="font-bold text-on-surface">{user?.email}</div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm border border-outline-variant"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
