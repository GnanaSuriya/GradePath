import { useState, useEffect } from 'react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [profileRes, semRes] = await Promise.all([
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, { headers }),
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/semesters`, { headers })
        ]);
        
        setProfile(profileRes.data);
        setSemesters(semRes.data);
      } catch (err) {
        console.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!profile) return <div>Error loading profile.</div>;

  let totalEarnedCredits = 0;
  let totalGradePoints = 0;
  
  const chartData: any[] = [];
  let currentCGPA = 0;
  
  if (semesters.length > 0) {
    let cumCredits = 0;
    let cumGP = 0;
    for (const sem of semesters) {
      totalEarnedCredits += sem.credits;
      totalGradePoints += (sem.gpa * sem.credits);
      cumCredits += sem.credits;
      cumGP += (sem.gpa * sem.credits);
      const cgpa = cumGP / cumCredits;
      chartData.push({
        name: `Sem ${sem.semester_number}`,
        gpa: sem.gpa,
        cgpa: parseFloat(cgpa.toFixed(2))
      });
    }
    currentCGPA = totalGradePoints / totalEarnedCredits;
  }

  const latestGPA = semesters.length > 0 ? semesters[semesters.length - 1].gpa : null;
  const maxPossible = ((totalGradePoints) + ((profile.total_program_credits - totalEarnedCredits) * parseFloat(profile.grading_system))) / profile.total_program_credits;

  return (
    <div>
      <h1 className="page-title">Good morning, {user?.name.split(' ')[0]} 👋</h1>
      <p className="page-subtitle">Here is your academic progress for {profile.university} — {profile.degree} {profile.specialization}</p>

      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Current CGPA</div>
          {currentCGPA > 0 ? (
            <div style={{ fontSize: '36px', fontWeight: 700, margin: '8px 0' }}>{currentCGPA.toFixed(2)} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/ {profile.grading_system}.0</span></div>
          ) : (
            <div style={{ fontSize: '18px', fontWeight: 600, margin: '16px 0', color: 'var(--text-muted)' }}>Not calculated yet</div>
          )}
        </div>

        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Latest Semester GPA</div>
          {latestGPA ? (
             <div style={{ fontSize: '36px', fontWeight: 700, margin: '8px 0' }}>{latestGPA.toFixed(2)}</div>
          ) : (
             <div style={{ fontSize: '18px', fontWeight: 600, margin: '16px 0', color: 'var(--text-muted)' }}>Add semester results</div>
          )}
        </div>

        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Degree Credits Earned</div>
          <div style={{ fontSize: '36px', fontWeight: 700, margin: '8px 0' }}>{totalEarnedCredits} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/ {profile.total_program_credits} total</span></div>
          <div style={{ height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${(totalEarnedCredits / profile.total_program_credits) * 100}%`, height: '100%', backgroundColor: 'var(--primary)' }}></div>
          </div>
        </div>

        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>Max Possible CGPA</div>
          {currentCGPA > 0 ? (
             <div style={{ fontSize: '36px', fontWeight: 700, margin: '8px 0', color: 'var(--success)' }}>{maxPossible.toFixed(2)} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/ {profile.grading_system}.0</span></div>
          ) : (
             <div style={{ fontSize: '18px', fontWeight: 600, margin: '16px 0', color: 'var(--text-muted)' }}>Add data to calculate</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700 }}>CGPA vs Semester GPA Trajectory</h2>
            </div>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis domain={[0, parseFloat(profile.grading_system)]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="gpa" stroke="#A5B4FC" strokeWidth={3} dot={{ r: 6, fill: '#A5B4FC' }} />
                  <Line type="monotone" dataKey="cgpa" stroke="var(--primary)" strokeWidth={3} dot={{ r: 6, fill: 'var(--primary)' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Add semester results to see your trend.</div>
            )}
          </div>
        </div>

        <div className="flex-col gap-4">
          <div className="card">
             <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Current Semester</h3>
             <div style={{ marginTop: '16px' }}>
                <p style={{ color: 'var(--text-muted)' }}>Set up your current semester using the GPA calculator page to track live courses.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

