import { useState, useEffect } from 'react';

import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const GPACalculator = () => {
  const {} = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  
  const [pasteText, setPasteText] = useState('');
  const [previewSubjects, setPreviewSubjects] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  
  const [loading, setLoading] = useState(true);

  // For 10-point scale:
  const gradePoints: Record<string, number> = {
    'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [subRes, profRes] = await Promise.all([
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/current-semester/subjects`, { headers }),
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, { headers })
        ]);
        
        setSubjects(subRes.data);
        setProfile(profRes.data);
      } catch (err) {
        console.error('Failed to fetch');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleParse = async () => {
    if (!pasteText) return;
    setIsParsing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/timetable/parse`, { text: pasteText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreviewSubjects(res.data.subjects);
      if (res.data.subjects.length === 0) {
        alert('Some course information could not be identified. Please review or enter it manually.');
      }
    } catch (err) {
      alert('Error parsing timetable');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSavePreview = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/current-semester/subjects/batch`, { subjects: previewSubjects }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreviewSubjects([]);
      setPasteText('');
      // Reload subjects
      const subRes = await axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/current-semester/subjects`, { headers: { Authorization: `Bearer ${token}` } });
      setSubjects(subRes.data);
    } catch (err) {
      alert('Error saving subjects');
    }
  };

  const updateSubjectGrade = async (id: number, grade: string) => {
    const pts = gradePoints[grade] || 0;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/current-semester/subjects/${id}`, { grade, grade_points: pts }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(subjects.map(s => s.id === id ? { ...s, grade, grade_points: pts } : s));
    } catch (err) {
      alert('Error updating grade');
    }
  };

  const deleteSubject = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/current-semester/subjects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (err) {
      alert('Error deleting subject');
    }
  };

  if (loading) return <div>Loading...</div>;

  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const totalWeighted = subjects.reduce((sum, s) => sum + (s.credits * (s.grade_points || 0)), 0);
  const currentGPA = totalCredits === 0 ? 0 : totalWeighted / totalCredits;

  return (
    <div>
      <h1 className="page-title">Current Semester & GPA Calculator</h1>
      <p className="page-subtitle">Track your current semester, extract VTOP timetable, and estimate your GPA.</p>

      {/* VTOP Parser Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Upload / Paste VTOP Timetable</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Paste your raw timetable text from VTOP here. We will extract the subjects and credits.
        </p>
        <textarea 
          className="form-control" 
          rows={4} 
          style={{ width: '100%', marginBottom: '16px' }}
          placeholder="Paste VTOP text here..."
          value={pasteText}
          onChange={e => setPasteText(e.target.value)}
        />
        <button className="btn-primary" onClick={handleParse} disabled={isParsing || !pasteText}>
          {isParsing ? 'Extracting...' : 'Extract Subjects'}
        </button>

        {previewSubjects.length > 0 && (
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Please verify these subjects before saving</h3>
            <table style={{ width: '100%', textAlign: 'left', marginBottom: '16px' }}>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Subject</th>
                  <th>Credits</th>
                  <th>Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {previewSubjects.map((sub, idx) => (
                  <tr key={idx}>
                    <td><input className="form-control" value={sub.code} onChange={(e) => {
                      const newP = [...previewSubjects]; newP[idx].code = e.target.value; setPreviewSubjects(newP);
                    }}/></td>
                    <td><input className="form-control" value={sub.name} onChange={(e) => {
                      const newP = [...previewSubjects]; newP[idx].name = e.target.value; setPreviewSubjects(newP);
                    }}/></td>
                    <td><input type="number" className="form-control" value={sub.credits} style={{ width: '60px' }} onChange={(e) => {
                      const newP = [...previewSubjects]; newP[idx].credits = parseInt(e.target.value); setPreviewSubjects(newP);
                    }}/></td>
                    <td><input className="form-control" value={sub.type} onChange={(e) => {
                      const newP = [...previewSubjects]; newP[idx].type = e.target.value; setPreviewSubjects(newP);
                    }}/></td>
                    <td><button onClick={() => setPreviewSubjects(previewSubjects.filter((_, i) => i !== idx))} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn-primary" onClick={handleSavePreview} style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}>Confirm & Save</button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ width: '320px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>SEMESTER GPA ESTIMATION</div>
          {subjects.length > 0 ? (
            <>
              <div style={{ fontSize: '48px', fontWeight: 700, display: 'flex', alignItems: 'baseline' }}>
                {currentGPA.toFixed(2)} <span style={{ fontSize: '20px', color: 'var(--text-muted)', marginLeft: '4px' }}>/ {profile?.grading_system}.0</span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Based on <strong>{totalCredits}</strong> credits.</p>
            </>
          ) : (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Paste your VTOP timetable to add your subjects.</p>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Current Subjects</h2>
          <span className="badge-primary">{subjects.length} Courses</span>
        </div>

        {subjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            No current semester subjects. Paste your VTOP timetable above to get started.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>Subject Name & Code</th>
                <th style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>Credits</th>
                <th style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>Grade</th>
                <th style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>Weighted Pts</th>
                <th style={{ padding: '12px' }}></th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600 }}>{sub.code}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{sub.name}</div>
                  </td>
                  <td style={{ padding: '12px', width: '100px' }}>{sub.credits}</td>
                  <td style={{ padding: '12px', width: '120px' }}>
                    <select className="form-control" value={sub.grade || ''} onChange={(e) => updateSubjectGrade(sub.id, e.target.value)} style={{ fontWeight: 600 }}>
                      <option value="">Select</option>
                      {Object.keys(gradePoints).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '12px', fontWeight: 500, color: 'var(--primary)' }}>
                    {(sub.credits * (sub.grade_points || 0)).toFixed(1)} pts
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button onClick={() => deleteSubject(sub.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GPACalculator;

