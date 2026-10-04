import React, { useState } from 'react';
import axios from 'axios';

const Onboarding = () => {
  const [formData, setFormData] = useState({
    university: '',
    degree: '',
    specialization: '',
    total_semesters: '',
    expected_grad_year: '',
    total_program_credits: '',
    completed_semesters: '',
    grading_system: '10',
    gender: 'Male',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.post(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = '/';
    } catch (err) {
      alert('Error saving profile');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      <div className="card" style={{ width: '600px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Academic Profile Setup</h1>
          <p style={{ color: 'var(--text-muted)' }}>Complete your profile to get started.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label>University / College</label>
            <input required type="text" name="university" className="form-control" value={formData.university} onChange={handleChange} />
          </div>
          <div>
            <label>Degree / Program</label>
            <input required type="text" name="degree" className="form-control" value={formData.degree} onChange={handleChange} />
          </div>
          <div>
            <label>Specialization</label>
            <input required type="text" name="specialization" className="form-control" value={formData.specialization} onChange={handleChange} />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label>Total Semesters in Program</label>
              <input required type="number" name="total_semesters" className="form-control" value={formData.total_semesters} onChange={handleChange} />
            </div>
            <div style={{ flex: 1 }}>
              <label>Expected Graduation Year</label>
              <input required type="number" name="expected_grad_year" className="form-control" value={formData.expected_grad_year} onChange={handleChange} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label>Total Program Credits</label>
              <input required type="number" name="total_program_credits" className="form-control" value={formData.total_program_credits} onChange={handleChange} />
            </div>
            <div style={{ flex: 1 }}>
              <label>Semesters Already Completed</label>
              <input required type="number" name="completed_semesters" className="form-control" value={formData.completed_semesters} onChange={handleChange} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label>Grading System (Max GPA)</label>
              <select name="grading_system" className="form-control" value={formData.grading_system} onChange={handleChange}>
                <option value="10">10-Point Scale</option>
                <option value="4">4-Point Scale</option>
                <option value="5">5-Point Scale</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Gender (For ML Predictor)</label>
              <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '16px', padding: '12px' }}>
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
