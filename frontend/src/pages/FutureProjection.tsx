import { useState, useEffect } from 'react';

import axios from 'axios';

const FutureProjection = () => {
  const [profile, setProfile] = useState<any>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetCGPA, setTargetCGPA] = useState(9.00);
  const [sliderGPA, setSliderGPA] = useState(9.25);

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

  if (loading) return <div>Loading projection...</div>;
  if (!profile) return <div>Error loading profile.</div>;

  let completedCredits = 0;
  let totalGradePoints = 0;
  
  if (semesters.length > 0) {
    for (const sem of semesters) {
      completedCredits += sem.credits;
      totalGradePoints += (sem.gpa * sem.credits);
    }
  }

  const currentCGPA = completedCredits === 0 ? 0 : totalGradePoints / completedCredits;
  const programTotal = profile.total_program_credits;
  const remainingCredits = Math.max(0, programTotal - completedCredits);
  const maxGrade = parseFloat(profile.grading_system) || 10;

  const requiredFutureGPA = remainingCredits > 0 ? ((targetCGPA * programTotal) - (currentCGPA * completedCredits)) / remainingCredits : 0;
  const maxPossibleCGPA = ((currentCGPA * completedCredits) + (maxGrade * remainingCredits)) / programTotal;
  const projectedSliderCGPA = ((currentCGPA * completedCredits) + (sliderGPA * remainingCredits)) / programTotal;

  const presets = [8.50, 8.75, 9.00, 9.25, 9.45].filter(p => p <= maxGrade);

  return (
    <div>
      <div style={{ color: '#4F46E5', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Predictive Modeling & Degree Analytics</div>
      <h1 className="page-title" style={{ marginTop: '8px' }}>How far can you go?</h1>
      <p className="page-subtitle">Explore what GPA you need in your remaining semesters to reach your target CGPA, simulate scenarios, and calculate mathematical limits.</p>

      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>CURRENT CGPA</div>
          <div style={{ fontSize: '36px', fontWeight: 700, margin: '8px 0' }}>{currentCGPA.toFixed(2)} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/ {maxGrade}.0</span></div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Based on {completedCredits} completed credits</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>COMPLETED CREDITS</div>
          <div style={{ fontSize: '36px', fontWeight: 700, margin: '8px 0' }}>{completedCredits}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{((completedCredits/programTotal)*100).toFixed(1)}% completed</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>REMAINING CREDITS</div>
          <div style={{ fontSize: '36px', fontWeight: 700, margin: '8px 0' }}>{remainingCredits}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{((remainingCredits/programTotal)*100).toFixed(1)}% remaining</div>
        </div>
        <div className="card">
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>PROGRAM TOTAL</div>
          <div style={{ fontSize: '36px', fontWeight: 700, margin: '8px 0' }}>{programTotal}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{profile.degree} {profile.specialization}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="flex-col gap-6" style={{ gridColumn: 'span 2' }}>
          
          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Target CGPA Solver</h2>
            
            <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>TARGET GRADUATION CGPA</label>
                <input type="number" className="form-control" value={targetCGPA} onChange={e => setTargetCGPA(Number(e.target.value))} step="0.01" style={{ fontSize: '18px', width: '120px', fontWeight: 600 }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>QUICK PRESETS</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {presets.map(p => (
                    <button key={p} onClick={() => setTargetCGPA(p)} className={targetCGPA === p ? 'btn-primary' : 'btn-secondary'} style={{ padding: '8px 12px', borderRadius: '8px' }}>
                      {p.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', backgroundColor: 'var(--primary-light)', padding: '24px', borderRadius: '12px', gap: '48px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, marginBottom: '8px' }}>TARGET OBJECTIVE</div>
                <div style={{ fontSize: '32px', fontWeight: 700 }}>{targetCGPA.toFixed(2)} <span style={{ fontSize: '16px', fontWeight: 500 }}>CGPA</span></div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, marginBottom: '8px' }}>REQUIRED FUTURE AVERAGE GPA</div>
                <div style={{ fontSize: '32px', fontWeight: 700 }}>{requiredFutureGPA.toFixed(2)} <span style={{ fontSize: '16px', fontWeight: 500 }}>GPA</span></div>
                <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px' }}>Across remaining {remainingCredits} credits</div>
              </div>
            </div>
            
            {remainingCredits === 0 ? (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }}>
                Program completed!
              </div>
            ) : requiredFutureGPA <= maxGrade ? (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--success-light)', color: '#065F46', borderRadius: '8px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✓ Target is mathematically achievable.
              </div>
            ) : (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--error-light)', color: '#991B1B', borderRadius: '8px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                ✗ Target is mathematically unreachable.
              </div>
            )}
          </div>

          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>'What-If?' Dynamic Projection Sandbox</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>SUSTAINED AVERAGE TERM GPA</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Maintained consistently across remaining semesters</div>
              </div>
              <div style={{ fontSize: '42px', fontWeight: 700, color: 'var(--primary)' }}>
                {sliderGPA.toFixed(2)} <span style={{ fontSize: '18px', fontWeight: 600 }}>GPA</span>
              </div>
            </div>

            <input type="range" min="0" max={maxGrade} step="0.05" value={sliderGPA} onChange={(e) => setSliderGPA(Number(e.target.value))} style={{ width: '100%', marginBottom: '32px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>SIMULATION OUTCOME</div>
                <div style={{ fontSize: '32px', fontWeight: 700 }}>
                  {projectedSliderCGPA.toFixed(2)} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/ {maxGrade}.0</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', maxWidth: '250px', fontSize: '13px', color: 'var(--text-muted)' }}>
                If you maintain a steady <strong>{sliderGPA.toFixed(2)} GPA</strong> for all remaining semesters, your cumulative graduation CGPA will reach <strong>{projectedSliderCGPA.toFixed(2)}</strong>.
              </div>
            </div>
          </div>

        </div>

        <div className="flex-col gap-6">
          <div className="card" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9 }}>ABSOLUTE UPPER BOUND</div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '8px 0 16px 0' }}>Maximum Possible Final CGPA</h3>
            <div style={{ fontSize: '48px', fontWeight: 700 }}>{maxPossibleCGPA.toFixed(2)} <span style={{ fontSize: '20px', fontWeight: 500, opacity: 0.8 }}>/ {maxGrade}.0</span></div>
            <div style={{ marginTop: '16px', fontSize: '13px', opacity: 0.9, backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '8px' }}>
              Even with max GPA across all remaining {remainingCredits} credits, your degree ceiling is capped at {maxPossibleCGPA.toFixed(2)} due to the {completedCredits} completed credits.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FutureProjection;

