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
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6 font-sans pb-20">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Application Settings</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Manage your appearance, notifications, and account preferences.</p>
      </div>

      <div className="space-y-6">
        
        {/* Appearance */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Monitor size={20} className="text-blue-500" /> Appearance
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => handleThemeChange('light')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'light' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-gray-100 hover:border-gray-200 text-gray-600 bg-white'}`}
            >
              <div className={`p-3 rounded-xl ${theme === 'light' ? 'bg-blue-100 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                <Sun size={24} />
              </div>
              <div className="font-bold">Light Mode</div>
            </button>
            
            <button 
              onClick={() => handleThemeChange('dark')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'dark' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-gray-100 hover:border-gray-200 text-gray-600 bg-white'}`}
            >
              <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-100 text-blue-600' : 'bg-gray-800 text-gray-400'}`}>
                <Moon size={24} />
              </div>
              <div className="font-bold">Dark Mode</div>
            </button>
            
            <button 
              onClick={() => handleThemeChange('system')}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'system' ? 'border-blue-500 bg-blue-50/50 text-blue-700' : 'border-gray-100 hover:border-gray-200 text-gray-600 bg-white'}`}
            >
              <div className={`p-3 rounded-xl ${theme === 'system' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                <Monitor size={24} />
              </div>
              <div className="font-bold">System Default</div>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Bell size={20} className="text-purple-500" /> Notifications
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl">
              <div>
                <h3 className="font-bold text-gray-900">Email Updates</h3>
                <p className="text-xs text-gray-500 mt-1">Receive weekly summaries and important alerts.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl">
              <div>
                <h3 className="font-bold text-gray-900">Push Notifications</h3>
                <p className="text-xs text-gray-500 mt-1">Get notified instantly about significant CGPA changes.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={pushNotifs} onChange={() => setPushNotifs(!pushNotifs)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield size={20} className="text-green-500" /> Data & Privacy
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-2xl gap-4">
              <div>
                <h3 className="font-bold text-gray-900">Export Academic Data</h3>
                <p className="text-xs text-gray-500 mt-1">Download your complete GradePath profile and semester history as CSV.</p>
              </div>
              <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold py-2 px-4 rounded-xl transition-colors shadow-sm whitespace-nowrap text-sm">
                <Download size={16} /> Export CSV
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-red-100 bg-red-50/30 rounded-2xl gap-4">
              <div>
                <h3 className="font-bold text-red-900">Delete Account</h3>
                <p className="text-xs text-red-600 mt-1">Permanently remove your account and all associated data.</p>
              </div>
              <button className="flex items-center justify-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 font-bold py-2 px-4 rounded-xl transition-colors whitespace-nowrap text-sm border border-red-200">
                <Trash2 size={16} /> Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="flex justify-between items-center bg-gray-50 rounded-3xl p-6 border border-gray-200">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Logged In As</div>
            <div className="font-bold text-gray-900">{user?.email}</div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm border border-gray-200"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
