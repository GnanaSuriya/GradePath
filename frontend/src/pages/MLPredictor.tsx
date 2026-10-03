import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MLPredictor = () => {
  const [formData, setFormData] = useState<any>({
    age: '',
    gender: 'Male',
    quiz1_marks: '',
    quiz2_marks: '',
    quiz3_marks: '',
    total_assignments: '',
    midterm_marks: '',
    previous_gpa: '', 
    total_lectures: '',
    lectures_attended: '',
    total_lab_sessions: '',
    labs_attended: ''
  });
  
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const profRes = await axios.get(`${import.meta.env.VITE_API_URL}/profile`, { headers });
        const profile = profRes.data;
        
        setFormData((prev: any) => ({
          ...prev,
          gender: profile.gender || 'Male'
        }));

      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ml/predict`, formData, { headers });
      setPrediction(res.data.predicted_final_marks);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'ML model unavailable. Please check the Python ML service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ color: '#4F46E5', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Predictive Modeling</div>
      <h1 className="page-title" style={{ marginTop: '8px' }}>Experimental Machine-Learning Estimate</h1>
      
      <div className="card" style={{ backgroundColor: 'var(--primary-light)', borderColor: 'var(--primary)', marginBottom: '24px' }}>
        <p style={{ color: 'var(--primary)', fontWeight: 600, margin: 0 }}>
          This model estimates final marks using academic assessment and activity data. It is experimental and is not a guaranteed result.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Input Academic Activity Features</h2>
          
          <form onSubmit={handlePredict} className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Age</label>
              <input type="number" name="age" className="form-control" value={formData.age} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quiz 1 Marks</label>
              <input type="number" step="0.1" name="quiz1_marks" className="form-control" value={formData.quiz1_marks} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Quiz 2 Marks</label>
              <input type="number" step="0.1" name="quiz2_marks" className="form-control" value={formData.quiz2_marks} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Quiz 3 Marks</label>
              <input type="number" step="0.1" name="quiz3_marks" className="form-control" value={formData.quiz3_marks} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Total Assignments</label>
              <input type="number" name="total_assignments" className="form-control" value={formData.total_assignments} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Midterm Marks</label>
              <input type="number" step="0.1" name="midterm_marks" className="form-control" value={formData.midterm_marks} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Previous GPA</label>
              <input type="number" step="0.01" name="previous_gpa" className="form-control" value={formData.previous_gpa} onChange={handleChange} required />
              <small style={{ color: 'var(--error)', fontSize: '11px', marginTop: '4px' }}>Must be on a 4.0 Scale (Model Requirement)</small>
            </div>
            <div className="form-group">
              <label>Total Lectures</label>
              <input type="number" name="total_lectures" className="form-control" value={formData.total_lectures} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Lectures Attended</label>
              <input type="number" name="lectures_attended" className="form-control" value={formData.lectures_attended} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Total Lab Sessions</label>
              <input type="number" name="total_lab_sessions" className="form-control" value={formData.total_lab_sessions} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Labs Attended</label>
              <input type="number" name="labs_attended" className="form-control" value={formData.labs_attended} onChange={handleChange} required />
            </div>

            <div style={{ gridColumn: 'span 2', marginTop: '16px' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
                {loading ? 'Running Inference...' : 'Generate Prediction'}
              </button>
            </div>
          </form>
        </div>

        <div className="flex-col gap-4">
          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Prediction Result</h2>
            {error && (
              <div style={{ padding: '12px', backgroundColor: 'var(--error-light)', color: '#991B1B', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' }}>
                {error}
              </div>
            )}
            {prediction !== null && !error ? (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>PREDICTED FINAL MARKS</div>
                <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--primary)' }}>
                  {prediction} <span style={{ fontSize: '20px', color: 'var(--text-muted)' }}>/ 100</span>
                </div>
              </div>
            ) : (
              !error && <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Fill out the form and submit to see prediction.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLPredictor;
