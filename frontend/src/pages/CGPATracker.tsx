import { useState, useEffect } from 'react';

import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Link } from 'react-router-dom';

const CGPATracker = () => {
  const [profile, setProfile] = useState<any>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [profRes, semRes] = await Promise.all([
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, { headers }),
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/semesters`, { headers })
        ]);
        
        setProfile(profRes.data);
        setSemesters(semRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!profile || semesters.length === 0 || semesters.filter(s => s.semester_number !== 999).length === 0) {
    return (
      <div>
        <h1 className="page-title">CGPA Tracker</h1>
        <p className="page-subtitle">Visualize your academic progression and cumulative performance.</p>
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', marginTop: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No semester data yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add your first semester to start tracking your CGPA.</p>
          <Link to="/history" className="btn-primary" style={{ padding: '12px 24px', textDecoration: 'none' }}>
            Go to Semester History
          </Link>
        </div>
      </div>
    );
  }

  // Calculate Cumulative CGPA
  const sortedSemesters = semesters.filter(s => s.semester_number !== 999).sort((a, b) => a.semester_number - b.semester_number);
  
  let runningGpaPts = 0;
  let runningCredits = 0;
  const historyData = sortedSemesters.map(sem => {
    runningCredits += sem.credits;
    runningGpaPts += (sem.gpa * sem.credits);
    const cumulativeCGPA = runningCredits > 0 ? (runningGpaPts / runningCredits) : 0;
    
    return {
      name: `Sem ${sem.semester_number}`,
      semester_number: sem.semester_number,
      gpa: sem.gpa,
      credits: sem.credits,
      cumulativeCGPA: cumulativeCGPA,
      targetCGPA: profile.target_cgpa
    };
  });

  const currentCGPA = runningCredits > 0 ? (runningGpaPts / runningCredits) : 0;
  const maxGrade = parseFloat(profile.grading_system) || 10;
  const programTotal = profile.total_program_credits || 0;
  const remainingCredits = Math.max(0, programTotal - runningCredits);

  let requiredFutureGPA = null;
  if (profile.target_cgpa && remainingCredits > 0) {
    requiredFutureGPA = ((profile.target_cgpa * programTotal) - (currentCGPA * runningCredits)) / remainingCredits;
  }

  return (
    <div>
      <h1 className="page-title">CGPA Tracker</h1>
      <p className="page-subtitle">Visualize your academic progression and cumulative performance.</p>

      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '24px', marginTop: '24px' }}>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>CURRENT CGPA</div>
          <div style={{ fontSize: '36px', fontWeight: 700, margin: '8px 0' }}>{currentCGPA.toFixed(2)} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/ {maxGrade.toFixed(1)}</span></div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>COMPLETED SEMESTERS</div>
          <div style={{ fontSize: '36px', fontWeight: 700, margin: '8px 0' }}>{sortedSemesters.length}</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>COMPLETED CREDITS</div>
          <div style={{ fontSize: '36px', fontWeight: 700, margin: '8px 0' }}>{runningCredits}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>of {programTotal} total credits</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>TARGET CGPA</div>
          <div style={{ fontSize: '36px', fontWeight: 700, margin: '8px 0' }}>{profile.target_cgpa ? profile.target_cgpa.toFixed(2) : '--'}</div>
          {profile.target_cgpa && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Diff: {(currentCGPA - profile.target_cgpa).toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {profile.target_cgpa && requiredFutureGPA !== null && (
        <div className="card" style={{ marginBottom: '24px', backgroundColor: 'var(--primary-light)', borderColor: 'var(--primary)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--primary)' }}>Target Analysis</h2>
          {requiredFutureGPA <= maxGrade ? (
             <p>You need to maintain an average GPA of <strong>{requiredFutureGPA.toFixed(2)}</strong> over your remaining {remainingCredits} credits to reach your target CGPA of {profile.target_cgpa.toFixed(2)}.</p>
          ) : (
             <p style={{ color: 'var(--error)' }}><strong>Unreachable:</strong> You would need an average GPA of {requiredFutureGPA.toFixed(2)} over your remaining {remainingCredits} credits to reach your target CGPA of {profile.target_cgpa.toFixed(2)}, which exceeds the maximum grade of {maxGrade.toFixed(1)}.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>CGPA Progression</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={historyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis domain={[0, maxGrade]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                
                {profile.target_cgpa && (
                   <ReferenceLine y={profile.target_cgpa} label={{ position: 'top', value: 'Target', fill: '#10B981', fontSize: 12 }} stroke="#10B981" strokeDasharray="3 3" />
                )}
                
                <Line type="monotone" name="Cumulative CGPA" dataKey="cumulativeCGPA" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Term GPA" dataKey="gpa" stroke="#9CA3AF" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Semester Breakdown</h2>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Semester</th>
                <th style={{ padding: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>GPA</th>
                <th style={{ padding: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>Credits</th>
                <th style={{ padding: '8px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>CGPA</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((row) => (
                <tr key={row.semester_number} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600, fontSize: '14px' }}>Sem {row.semester_number}</td>
                  <td style={{ padding: '12px 8px', fontSize: '14px' }}>{row.gpa.toFixed(2)}</td>
                  <td style={{ padding: '12px 8px', fontSize: '14px' }}>{row.credits}</td>
                  <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--primary)', textAlign: 'right', fontSize: '14px' }}>
                    {row.cumulativeCGPA.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <Link to="/history" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Edit Semesters</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGPATracker;

