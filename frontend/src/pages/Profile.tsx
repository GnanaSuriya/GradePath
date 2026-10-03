import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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
    } catch (err) {
      setError('Unable to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>Loading profile...</div>;
  }

  const hasAcademicProfile = !!profile?.university;

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: '24px' }}>Profile</h1>
      
      {successMsg && (
        <div style={{ padding: '12px', backgroundColor: 'var(--success-light)', color: '#065F46', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
          {successMsg}
        </div>
      )}
      {error && (
        <div style={{ padding: '12px', backgroundColor: 'var(--error-light)', color: '#991B1B', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Personal Information</h2>
          {!isEditing && <button className="btn-secondary" onClick={() => setIsEditing(true)}>Edit Profile</button>}
        </div>
        
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <img src={profile?.picture || user?.picture} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '40px' }} />
          
          <div style={{ flex: 1 }}>
            {isEditing ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="form-control" value={profile?.email || user?.email} disabled style={{ backgroundColor: 'var(--bg-page)' }} />
                  <small style={{ color: 'var(--text-muted)' }}>Email address cannot be changed.</small>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>NAME</div>
                  <div style={{ fontSize: '16px', fontWeight: 500 }}>{profile?.name || user?.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>EMAIL</div>
                  <div style={{ fontSize: '16px', fontWeight: 500 }}>{profile?.email || user?.email}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Academic Information</h2>
        
        {!hasAcademicProfile && !isEditing ? (
          <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--bg-page)', borderRadius: '8px' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Your academic profile hasn't been set up yet.</p>
            <button className="btn-primary" onClick={() => navigate('/onboarding')}>Set Up Academic Profile</button>
          </div>
        ) : isEditing ? (
          <form id="profile-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>University / College</label>
                <input type="text" name="university" className="form-control" value={formData.university || ''} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Degree / Program</label>
                <input type="text" name="degree" className="form-control" value={formData.degree || ''} onChange={handleChange} required />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Specialization</label>
                <input type="text" name="specialization" className="form-control" value={formData.specialization || ''} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Grading System (Max GPA)</label>
                <select name="grading_system" className="form-control" value={formData.grading_system || '10'} onChange={handleChange}>
                  <option value="10">10-Point Scale</option>
                  <option value="4">4-Point Scale</option>
                  <option value="5">5-Point Scale</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Current Semester</label>
                <input type="number" name="current_semester" className="form-control" value={formData.current_semester || ''} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Total Semesters in Program</label>
                <input type="number" name="total_semesters" className="form-control" value={formData.total_semesters || ''} onChange={handleChange} required />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Expected Graduation Year</label>
                <input type="number" name="expected_grad_year" className="form-control" value={formData.expected_grad_year || ''} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Total Program Credits</label>
                <input type="number" name="total_program_credits" className="form-control" value={formData.total_program_credits || ''} onChange={handleChange} required />
              </div>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>UNIVERSITY / COLLEGE</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>{profile.university}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>DEGREE</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>{profile.degree}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>SPECIALIZATION</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>{profile.specialization}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>GRADING SYSTEM</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>{profile.grading_system}-Point Scale</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>CURRENT SEMESTER</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>{profile.current_semester || (profile.completed_semesters + 1)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL SEMESTERS</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>{profile.total_semesters}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>EXPECTED GRADUATION</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>{profile.expected_grad_year}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL PROGRAM CREDITS</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>{profile.total_program_credits}</div>
            </div>
          </div>
        )}
        
        {isEditing && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button className="btn-secondary" onClick={() => { setIsEditing(false); setFormData(profile); setError(''); }}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
