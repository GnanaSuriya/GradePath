import { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, TrendingUp, Info, AlertTriangle, CheckCircle2, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const FutureProjection = () => {
  const [profile, setProfile] = useState<any>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [targetCGPA, setTargetCGPA] = useState(9.00);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        console.log("Fetching Future Projection Data...");
        
        const [profRes, semRes] = await Promise.all([
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, { headers }),
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/semesters`, { headers })
        ]);
        
        console.log("Profile Response:", profRes.data);
        console.log("Semesters Response:", semRes.data);

        setProfile(profRes.data);
        setSemesters(semRes.data);
        if (profRes.data.target_cgpa) {
          setTargetCGPA(profRes.data.target_cgpa);
        }
      } catch (err) {
        console.error("Future Projection API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center bg-surface">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  // Case C: User has semester data but total program credits is missing
  if (!profile || !profile.total_program_credits) {
    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto font-sans min-h-screen bg-surface">
        <div className="bg-surface-container-low rounded-DEFAULT border border-dashed border-outline-variant text-center py-20 mt-8 shadow-sm">
          <h2 className="text-xl font-bold text-on-surface mb-2">Missing Program Information</h2>
          <p className="text-on-surface-variant mb-6 max-w-md mx-auto">We need your total program credits to calculate future projections. Please update your academic profile.</p>
          <Link to="/profile" className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-6 rounded-xl transition-colors shadow-sm inline-block">
            Update Profile
          </Link>
        </div>
      </div>
    );
  }

  // Calculate Base Stats
  const validSemesters = semesters.filter(s => s.semester_number !== 999 && s.credits > 0);
  
  // Case B: User has profile but no completed semester data.
  if (validSemesters.length === 0) {
    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto font-sans min-h-screen bg-surface">
        <div className="bg-surface-container-low rounded-DEFAULT border border-dashed border-outline-variant text-center py-20 mt-8 shadow-sm">
          <h2 className="text-xl font-bold text-on-surface mb-2">No Semester Data</h2>
          <p className="text-on-surface-variant mb-6 max-w-md mx-auto">Add your semester results to calculate your future CGPA.</p>
          <Link to="/history" className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-6 rounded-xl transition-colors shadow-sm inline-block">
            Add Semester Results
          </Link>
        </div>
      </div>
    );
  }

  let completedCredits = 0;
  let totalQualityPoints = 0;
  
  validSemesters.forEach(sem => {
    completedCredits += sem.credits;
    totalQualityPoints += (sem.gpa * sem.credits);
  });

  const currentCGPA = totalQualityPoints / completedCredits;
  const programTotal = parseInt(profile.total_program_credits) || 0;
  const remainingCredits = Math.max(0, programTotal - completedCredits);
  const maxGrade = parseFloat(profile.grading_system) || 10;

  console.log("Calculated Projection Inputs:", { currentCGPA, completedCredits, programTotal, remainingCredits, maxGrade });

  const maxPossibleQualityPoints = totalQualityPoints + (remainingCredits * maxGrade);
  const maxPossibleCGPA = programTotal > 0 ? (maxPossibleQualityPoints / programTotal) : currentCGPA;

  const requiredFutureQualityPoints = (targetCGPA * programTotal) - totalQualityPoints;
  const requiredFutureGPA = remainingCredits > 0 ? (requiredFutureQualityPoints / remainingCredits) : 0;

  const isAchievable = requiredFutureGPA <= maxGrade && requiredFutureGPA > 0 && remainingCredits > 0;

  console.log("Calculated Projection Result:", { requiredFutureGPA, maxPossibleCGPA, isAchievable });

  // Predefined scenarios
  const scenarios = [8.0, 8.5, 9.0, 9.5, 10.0].filter(g => g <= maxGrade);

  const calculateScenarioCGPA = (futureGPA: number) => {
    if (programTotal === 0) return 0;
    const futureQualityPoints = futureGPA * remainingCredits;
    return (totalQualityPoints + futureQualityPoints) / programTotal;
  };

  return (
    <main className="w-full min-h-screen pt-8 pb-20 lg:pb-10 bg-surface px-4 lg:px-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-8">
        
        <div className="flex flex-col gap-1.5">
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Future Projection</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Simulate academic pathways to achieve your target CGPA.
          </p>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex flex-col gap-1">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Current CGPA</span>
            <span className="text-2xl font-extrabold text-on-surface">{currentCGPA.toFixed(2)}</span>
          </div>
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex flex-col gap-1">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Completed Credits</span>
            <span className="text-2xl font-extrabold text-on-surface">{completedCredits}</span>
          </div>
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex flex-col gap-1">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Remaining Credits</span>
            <span className="text-2xl font-extrabold text-on-surface">{remainingCredits}</span>
          </div>
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex flex-col gap-1">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Max Possible CGPA</span>
            <span className="text-2xl font-extrabold text-on-surface">{maxPossibleCGPA.toFixed(2)}</span>
          </div>
        </div>

        <hr className="border-outline-variant" />

        {/* Target CGPA */}
        <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-xl border border-outline-variant shadow-sm flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex flex-col gap-4">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Target CGPA</h2>
              <div className="flex items-center gap-3">
                <input 
                  type="number"
                  min="0"
                  max={maxGrade}
                  step="0.01"
                  value={targetCGPA}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 0) setTargetCGPA(val);
                  }}
                  className="bg-surface-container-highest border-none text-on-surface rounded-lg px-4 py-3 text-xl font-extrabold focus:ring-2 focus:ring-primary w-32"
                />
                <span className="text-on-surface-variant font-medium">/ {maxGrade}</span>
              </div>
            </div>

            <div className="hidden md:block w-px h-24 bg-outline-variant"></div>

            <div className="flex flex-col gap-4 flex-1">
              <h3 className="font-bold text-on-surface-variant uppercase tracking-wider text-sm">Required Future GPA</h3>
              {remainingCredits === 0 ? (
                <div>
                  <span className="text-3xl font-extrabold text-on-surface">N/A</span>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary-container text-on-secondary-container text-sm font-bold">
                    <CheckCircle2 size={16} /> Degree Completed
                  </div>
                </div>
              ) : isAchievable ? (
                <div>
                  <span className="text-4xl font-extrabold text-primary">{requiredFutureGPA.toFixed(2)}</span>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary-container text-on-secondary-container text-sm font-bold">
                    <CheckCircle2 size={16} /> Achievable
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-3xl font-extrabold text-error">Not possible</span>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-error-container text-on-error-container text-sm font-bold">
                    <AlertTriangle size={16} /> Target CGPA is not achievable with the remaining credits.
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        <hr className="border-outline-variant" />

        {/* Scenarios */}
        {remainingCredits > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Scenario Projection</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {scenarios.map((gpa) => (
                <div key={gpa} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col items-center justify-center text-center gap-2 hover:border-primary transition-colors group">
                  <span className="text-sm font-bold text-on-surface-variant">Future GPA</span>
                  <span className="text-xl font-extrabold text-on-surface bg-surface-container px-3 py-1 rounded-lg group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">{gpa.toFixed(1)}</span>
                  <div className="w-4 h-4 text-outline mt-1 mb-1">
                    <TrendingUp size={16} />
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Final CGPA</span>
                  <span className="text-2xl font-extrabold text-primary">{calculateScenarioCGPA(gpa).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
};

export default FutureProjection;
