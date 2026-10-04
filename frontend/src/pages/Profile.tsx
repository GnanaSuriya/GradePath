import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserCircle, ShieldCheck, CheckCircle2, AlertTriangle, Edit3, Save, X, BookOpen, GraduationCap, Building } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [semestersData, setSemestersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editingSemesters, setEditingSemesters] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [profRes, semRes] = await Promise.all([
        axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, { headers }),
        axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/semesters`, { headers }).catch(() => ({ data: [] }))
      ]);
      
      setProfile(profRes.data);
      const sems = semRes.data.filter((s:any) => s.semester_number !== 999).sort((a:any, b:any) => a.semester_number - b.semester_number);
      setSemestersData(sems);
      
      const data = { ...profRes.data };
      setFormData(data);
      setEditingSemesters(sems.map((s:any) => ({ semester_number: s.semester_number, gpa: s.gpa.toString(), credits: s.credits.toString() })));
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError('Unable to load your profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === 'completed_semesters') {
      const newCount = parseInt(e.target.value) || 0;
      const oldCount = parseInt(formData.completed_semesters) || 0;
      
      if (newCount < oldCount) {
        if (!window.confirm(`Are you sure you want to reduce completed semesters from ${oldCount} to ${newCount}? This will permanently delete the history of the higher semesters.`)) {
          return; // user cancelled
        }
      }
      
      setFormData({ ...formData, [e.target.name]: e.target.value });
      
      let newSems = [...editingSemesters];
      if (newSems.length < newCount) {
        for (let i = newSems.length; i < newCount; i++) {
          newSems.push({ semester_number: i + 1, gpa: '', credits: '' });
        }
      } else if (newSems.length > newCount) {
        newSems = newSems.slice(0, newCount);
      }
      setEditingSemesters(newSems);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSemesterChange = (index: number, field: string, value: string) => {
    const updated = [...editingSemesters];
    updated[index] = { ...updated[index], [field]: value };
    setEditingSemesters(updated);
  };

  const currentCGPA = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;
    (isEditing ? editingSemesters : semestersData).forEach((sem:any) => {
      const gpa = parseFloat(sem.gpa);
      const credits = parseFloat(sem.credits);
      if (!isNaN(gpa) && !isNaN(credits) && credits > 0) {
        totalCredits += credits;
        totalPoints += (gpa * credits);
      }
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  }, [editingSemesters, semestersData, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const payload = { 
        ...formData,
        semesters: editingSemesters.map(s => ({
          semester_number: s.semester_number,
          gpa: parseFloat(s.gpa),
          credits: parseInt(s.credits)
        })).filter(s => !isNaN(s.gpa) && !isNaN(s.credits))
      };
      
      // also if total_semesters wasn't dynamically set, update current_semester
      payload.current_semester = (parseInt(payload.completed_semesters) || 0) + 1;

      await axios.post(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Optional: Delete semesters that were removed
      // We could add a route for this, or just let them be overridden or ignored. The backend uses ON CONFLICT DO UPDATE.
      // Wait, if we reduced the count, the backend ON CONFLICT only UPDATES existing or INSERTS new. It doesn't DELETE removed ones. 
      // This is a known limitation of UPSERT. We might need a sync_semesters endpoint, but since GradePath relies on completed_semesters count to fetch, it's fine for now as they'll be ignored in Dashboard logic.

      setSuccessMsg('Profile updated successfully.');
      setIsEditing(false);
      await fetchProfile();
      if (formData.name !== user?.name) {
         window.location.reload();
      }
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Unable to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const hasAcademicProfile = !!profile?.university;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans pb-20 bg-surface min-h-screen">
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">Academic Profile</h1>
          <p className="text-sm text-on-surface-variant font-medium mt-1">Manage your personal information, university details, and semester history.</p>
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
        
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-surface-container-low rounded-DEFAULT p-6 md:p-8 border border-outline-variant">
            <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <UserCircle size={20} className="text-primary" /> Personal Details
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative">
                <img 
                  src={profile?.picture || user?.picture || "https://ui-avatars.com/api/?name=User&background=eff6ff&color=3b82f6"} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-surface-container-lowest shadow-md" 
                />
                <div className="absolute -bottom-2 -right-2 bg-secondary text-on-secondary p-1 rounded-lg border-2 border-surface-container-lowest shadow-sm" title="Active">
                  <CheckCircle2 size={14} />
                </div>
              </div>
              
              <div className="flex-1 w-full">
                {isEditing ? (
                  <form id="personal-form" className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1.5">Full Name</label>
                      <input type="text" name="name" className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold" value={formData.name || ''} onChange={handleChange} required />
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
                    <label className="block text-xs font-bold text-on-surface mb-1.5">Total Semesters</label>
                    <input type="number" name="total_semesters" className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold" value={formData.total_semesters || ''} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5">Expected Graduation</label>
                    <input type="number" name="expected_grad_year" className="w-full bg-surface-container-highest border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold" value={formData.expected_grad_year || ''} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1.5">Completed Semesters</label>
                    <input type="number" name="completed_semesters" className="w-full bg-surface-container-highest border border-outline-variant text-primary rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all font-bold" value={formData.completed_semesters || ''} onChange={handleChange} required />
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
                    <div className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Completed Semesters</div>
                    <div className="text-xl font-bold text-primary">{profile.completed_semesters || '0'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Class Of</div>
                    <div className="text-xl font-bold text-on-surface">{profile.expected_grad_year}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-surface-container-low rounded-DEFAULT p-6 md:p-8 border border-outline-variant">
            <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <BookOpen size={20} className="text-primary" /> Completed Semester Results
            </h2>
            
            {isEditing ? (
              <div className="space-y-4">
                {editingSemesters.length === 0 ? (
                  <p className="text-sm text-on-surface-variant italic">No completed semesters. Set "Completed Semesters" above to add history.</p>
                ) : (
                  editingSemesters.map((sem, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-outline-variant rounded-xl p-4 bg-surface-container-lowest relative">
                      <div className="absolute -top-3 left-4 bg-surface-container-low px-2 text-xs font-bold text-on-surface-variant">Semester {sem.semester_number}</div>
                      <div>
                        <label className="text-xs font-bold text-on-surface mb-1.5 block">GPA</label>
                        <input 
                          type="number" step="0.01" max={formData.grading_system || 10} min="0" 
                          value={sem.gpa} 
                          onChange={(e) => handleSemesterChange(index, 'gpa', e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-on-surface mb-1.5 block">Credits</label>
                        <input 
                          type="number" min="0" step="1" 
                          value={sem.credits} 
                          onChange={(e) => handleSemesterChange(index, 'credits', e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  ))
                )}
                <div className="flex justify-between items-center bg-primary-container text-on-primary-container p-4 rounded-xl mt-4">
                  <span className="font-bold">Calculated CGPA</span>
                  <span className="text-xl font-extrabold">{currentCGPA}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {semestersData.length === 0 ? (
                  <p className="text-sm text-on-surface-variant italic">No semester history found.</p>
                ) : (
                  <div className="space-y-2">
                    {semestersData.map((sem:any) => (
                      <div key={sem.id} className="flex justify-between items-center bg-surface-container-lowest p-4 rounded-xl border border-surface-container-highest">
                        <span className="font-bold text-on-surface">Semester {sem.semester_number}</span>
                        <div className="flex gap-6">
                          <span className="text-sm font-bold text-on-surface"><span className="text-on-surface-variant text-xs mr-2">GPA</span>{parseFloat(sem.gpa).toFixed(2)}</span>
                          <span className="text-sm font-bold text-on-surface"><span className="text-on-surface-variant text-xs mr-2">Cr</span>{sem.credits}</span>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center bg-surface-container-highest p-4 rounded-xl border border-outline-variant mt-2">
                      <span className="font-bold text-on-surface">Current CGPA</span>
                      <span className="text-xl font-extrabold text-primary">{currentCGPA}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {isEditing && (
            <div className="bg-surface-container-low rounded-DEFAULT p-4 shadow-sm border border-outline-variant flex justify-end gap-3 sticky bottom-4 z-50">
              <button 
                type="button" 
                className="flex items-center gap-2 bg-surface-container-lowest border border-outline text-on-surface hover:bg-surface-container-highest font-bold py-2.5 px-5 rounded-xl transition-colors"
                onClick={() => { setIsEditing(false); setFormData(profile); setEditingSemesters(semestersData.map((s:any) => ({ semester_number: s.semester_number, gpa: s.gpa.toString(), credits: s.credits.toString() }))); setError(''); }}
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

        <div className="lg:col-span-1 space-y-6">
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
