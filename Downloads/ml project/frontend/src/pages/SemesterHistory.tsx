import { useState, useEffect } from 'react';

import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SemesterHistory = () => {
  const {} = useAuth();
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newSem, setNewSem] = useState({ semester_number: 1, gpa: 0, credits: 0 });

  const fetchSemesters = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/semesters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter out the 'current semester' dummy record if it exists
      setSemesters(res.data.filter((s: any) => s.semester_number !== 999));
    } catch (err) {
      console.error('Error fetching semesters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/semesters`, newSem, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSemesters();
      setNewSem({ semester_number: newSem.semester_number + 1, gpa: 0, credits: 0 });
    } catch (err) {
      alert('Error adding semester');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/semesters/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSemesters();
    } catch (err) {
      alert('Error deleting semester');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="page-title">Semester History</h1>
      <p className="page-subtitle">Add your completed semesters to track your CGPA.</p>
      
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Add Completed Semester</h2>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label>Semester Number</label>
            <input required type="number" min="1" max="20" className="form-control" value={newSem.semester_number} onChange={e => setNewSem({...newSem, semester_number: parseInt(e.target.value)})} />
          </div>
          <div>
            <label>GPA</label>
            <input required type="number" step="0.01" className="form-control" value={newSem.gpa} onChange={e => setNewSem({...newSem, gpa: parseFloat(e.target.value)})} />
          </div>
          <div>
            <label>Credits Earned</label>
            <input required type="number" className="form-control" value={newSem.credits} onChange={e => setNewSem({...newSem, credits: parseInt(e.target.value)})} />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '12px' }}>Save Semester</button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Your Semesters</h2>
        {semesters.length === 0 ? (
          <div style={{ color: 'var(--text-muted)' }}>No semester results yet. Add your completed semester GPA above.</div>
        ) : (
          <table style={{ width: '100%', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>Semester</th>
                <th style={{ padding: '12px' }}>GPA</th>
                <th style={{ padding: '12px' }}>Credits</th>
                <th style={{ padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {semesters.map((sem, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>Semester {sem.semester_number}</td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>{sem.gpa.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>{sem.credits}</td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => handleDelete(sem.id)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
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

export default SemesterHistory;

