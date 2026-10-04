import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserCircle, ShieldCheck, CheckCircle2, AlertTriangle, Edit3, Save, X, BookOpen, GraduationCap, Building } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      const data = { ...res.data };
      if (!data.current_semester && data.completed_semesters !== undefined) {
         data.current_semester = Number(data.completed_semesters) + 1;
      }
      setFormData(data);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError('Unable to load your profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const payload = { ...formData };
      if (payload.current_semester) {
         payload.completed_semesters = Number(payload.current_semester) - 1;
      }
      await axios.post(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Profile updated successfully.');
      setIsEditing(false);
      await fetchProfile();
      // Reload page to update header user info context if necessary
      if (formData.name !== user?.name) {
         window.location.reload();
      }
      
      // clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Unable to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const hasAcademicProfile = !!profile?.university;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans pb-20 bg-surface min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">Academic Profile</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Manage your personal information and university details.</p>
        </div>
        {!isEditing && hasAcademicProfile && (
          <button 
            onClick={() => setIsEditing(true)}
            className="hidden sm:flex items-center gap-2 bg-surface-container border border-outline hover:bg-surface-container-high text-on-surface text-sm font-bold py-2 px-4 rounded-xl transition-colors shadow-sm"
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        )}
      </div>
      
      {successMsg && (
        <div className="bg-secondary-container border border-secondary text-on-secondary-container px-4 py-3 rounded-xl flex items-center gap-3 mb-6 shadow-sm">
          <CheckCircle2 size={20} className="shrink-0" />
          <p className="text-sm font-bold">{successMsg}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-error-container border border-error text-on-error-container px-4 py-3 rounded-xl flex items-center gap-3 mb-6 shadow-sm">
          <AlertTriangle size={20} className="shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Details */}
          <div className="bg-surface-container-low rounded-DEFAULT p-6 md:p-8 border border-outline-variant">
            <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <UserCircle size={20} className="text-primary" /> Personal Details
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative">
                <img 
                  src={profile?.picture || user?.picture || "https://ui-avatars.com/api/?name=User&background=eff6ff&color=3b82f6"} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md" 
                />
                <div className="absolute -bottom-2 -right-2 bg-secondary text-on-secondary p-1 rounded-lg border-2 border-white shadow-sm" title="Active">
                  <CheckCircle2 size={14} />
                </div>
              </div>
              
              <div className="flex-1 w-full">
                {isEditing ? (
                  <form id="personal-form" className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1.5">Full Name</label>
                      <input type="text" name="name" className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold" value={formData.name || ''} onChange={handleChange} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1.5">Email Address</label>
                      <input type="email" className="w-full bg-surface-container border border-outline-variant text-on-surface-variant rounded-xl px-4 py-3 text-sm font-bold cursor-not-allowed" value={profile?.email || user?.email} disabled />
                      <p className="text-[10px] text-outline mt-1 font-medium">Email address is tied to your Google account and cannot be changed.</p>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <div className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Full Name</div>
                      <div className="text-base font-bold text-on-surface">{profile?.name || user?.name}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Email Address</div>
                      <div className="text-base font-bold text-on-surface truncate">{profile?.email || user?.email}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Account Provider</div>
                      <div className="text-base font-bold text-on-surface">Google OAuth</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-surface-container-low rounded-DEFAULT p-6 md:p-8 border border-outline-variant">
            <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <GraduationCap size={20} className="text-primary" /> Academic Information
            </h2>
            
            {!hasAcademicProfile && !isEditing ? (
              <div className="text-center py-10 bg-surface-container-highest rounded-2xl border border-dashed border-outline">
                <p className="text-sm font-bold text-on-surface-variant mb-4">Your academic profile hasn't been set up yet.</p>
                <button className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm" onClick={() => navigate('/onboarding')}>
                  Set Up Academic Profile
                </button>
              </div>
            ) : isEditing ? (
              <form id="profile-form" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5">University / College</label>
                    <input type="text" name="university" className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold" value={formData.university || ''} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5">Degree Program</label>
                    <input type="text" name="degree" className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold" value={formData.degree || ''} onChange={handleChange} required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-on-surface mb-1.5">Specialization / Major</label>
                    <input type="text" name="specialization" className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold" value={formData.specialization || ''} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5">Grading System</label>
                    <select name="grading_system" className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold appearance-none" value={formData.grading_system || '10'} onChange={handleChange}>
                      <option value="10">10-Point Scale (CGPA)</option>
                      <option value="4">4-Point Scale (US GPA)</option>
                      <option value="5">5-Point Scale</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5">Total Program Credits</label>
                    <input type="number" name="total_program_credits" className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold" value={formData.total_program_credits || ''} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5">Current Semester</label>
                    <input type="number" name="current_semester" className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold" value={formData.current_semester || ''} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5">Total Semesters</label>
                    <input type="number" name="total_semesters" className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold" value={formData.total_semesters || ''} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5">Expected Graduation</label>
                    <input type="number" name="expected_grad_year" className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold" value={formData.expected_grad_year || ''} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5">Target CGPA Goal</label>
                    <input type="number" step="0.01" name="target_cgpa" className="w-full bg-surface-container-high border-none text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold" value={formData.target_cgpa || ''} onChange={handleChange} />
                  </div>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-outline uppercase tracking-wider mb-1"><Building size={12}/> University / College</div>
                  <div className="text-base font-bold text-on-surface">{profile.university}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-outline uppercase tracking-wider mb-1"><BookOpen size={12}/> Program Details</div>
                  <div className="text-base font-bold text-on-surface">{profile.degree} in {profile.specialization}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Grading System</div>
                  <div className="text-sm font-bold text-on-surface bg-surface-container-highest px-3 py-1.5 rounded-lg border border-outline-variant inline-block">{profile.grading_system}-Point Scale</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Total Degree Credits</div>
                  <div className="text-sm font-bold text-on-surface bg-surface-container-highest px-3 py-1.5 rounded-lg border border-outline-variant inline-block">{profile.total_program_credits} Credits</div>
                </div>
                <div className="col-span-1 sm:col-span-2 pt-4 border-t border-outline-variant grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Current Term</div>
                    <div className="text-xl font-bold text-primary">Sem {profile.current_semester || (profile.completed_semesters + 1)}<span className="text-xs text-outline font-medium">/{profile.total_semesters}</span></div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Target CGPA</div>
                    <div className="text-xl font-bold text-primary">{profile.target_cgpa ? profile.target_cgpa.toFixed(2) : '--'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Class Of</div>
                    <div className="text-xl font-bold text-on-surface">{profile.expected_grad_year}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          {isEditing && (
            <div className="bg-surface-container-low rounded-DEFAULT p-4 shadow-sm border border-outline-variant flex justify-end gap-3 sticky bottom-4 z-50">
              <button 
                type="button" 
                className="flex items-center gap-2 bg-surface-container-lowest border border-outline text-on-surface hover:bg-surface-container-highest font-bold py-2.5 px-5 rounded-xl transition-colors"
                onClick={() => { setIsEditing(false); setFormData(profile); setError(''); }}
              >
                <X size={18} /> Cancel
              </button>
              <button 
                type="button" 
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-on-primary font-bold py-2.5 px-6 rounded-xl transition-colors shadow-md shadow-primary/20"
                onClick={handleSubmit} 
                disabled={saving}
              >
                {saving ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Saving...</>
                ) : (
                  <><Save size={18} /> Save Changes</>
                )}
              </button>
            </div>
          )}
          
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Profile Completion */}
          <div className="bg-surface-container-low rounded-DEFAULT p-6 border border-outline-variant">
            <h3 className="text-[10px] font-bold text-outline uppercase tracking-wider mb-4">Profile Status</h3>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500 border border-green-100 shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="text-lg font-bold text-on-surface leading-tight">100% Complete</div>
                <div className="text-xs text-on-surface-variant font-medium">All required details provided</div>
              </div>
            </div>
            
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden mt-4 mb-2">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-surface-container-low rounded-DEFAULT p-6 border border-outline-variant">
            <h3 className="text-[10px] font-bold text-outline uppercase tracking-wider mb-4">Security & Account</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  <span className="text-sm font-bold text-on-surface">Account Status</span>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">Active</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary" />
                  <span className="text-sm font-bold text-on-surface">Email Verified</span>
                </div>
                <span className="text-xs font-bold text-on-surface">Yes (Google)</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-on-surface">Join Date</span>
                <span className="text-xs font-bold text-on-surface-variant">October 2024</span>
              </div>
            </div>
          </div>
          
          <button 
            className="w-full sm:hidden flex items-center justify-center gap-2 bg-surface-container-lowest border border-outline-variant text-on-surface text-sm font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 size={18} /> Edit Profile
          </button>

        </div>

      </div>
    </div>
  );
};

export default Profile;
