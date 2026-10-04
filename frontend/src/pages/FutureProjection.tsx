import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Target, TrendingUp, Info, AlertTriangle, CheckCircle2, BarChart2, Flag, ArrowRight, Save, Download } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Line, ReferenceLine } from 'recharts';

const FutureProjection = () => {
  const [profile, setProfile] = useState<any>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetCGPA, setTargetCGPA] = useState(9.00);
  const [simulatedSems, setSimulatedSems] = useState<{sem: number, credits: number, gpa: number}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [profRes, semRes] = await Promise.all([
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, { headers }),
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/semesters`, { headers })
        ]);
        
        const profileData = profRes.data;
        setProfile(profileData);
        setSemesters(semRes.data);
        if (profileData.target_cgpa) {
          setTargetCGPA(profileData.target_cgpa);
        }
        
        // Initialize simulated semesters based on remaining
        const completedSemsCount = profileData.completed_semesters;
        const totalSems = profileData.total_semesters;
        const remainingSemsCount = totalSems - completedSemsCount;
        
        let completedCredits = semRes.data.reduce((sum: number, s: any) => sum + s.credits, 0);
        const programTotal = profileData.total_program_credits;
        const remainingCredits = Math.max(0, programTotal - completedCredits);
        
        if (remainingSemsCount > 0 && remainingCredits > 0) {
          const baseCr = Math.floor(remainingCredits / remainingSemsCount);
          let remainder = remainingCredits % remainingSemsCount;
          
          const initialSim = [];
          for (let i = 1; i <= remainingSemsCount; i++) {
            let cr = baseCr;
            if (remainder > 0) {
              cr += 1;
              remainder -= 1;
            }
            initialSim.push({
              sem: completedSemsCount + i,
              credits: cr,
              gpa: profileData.target_cgpa || 9.0
            });
          }
          setSimulatedSems(initialSim);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSimGpaChange = (index: number, val: number) => {
    const newSim = [...simulatedSems];
    newSim[index].gpa = val;
    setSimulatedSems(newSim);
  };

  const handleSimCreditsChange = (index: number, val: number) => {
    const newSim = [...simulatedSems];
    newSim[index].credits = val;
    setSimulatedSems(newSim);
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center bg-surface">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!profile || semesters.length === 0) return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto font-sans min-h-screen bg-surface">
      <div className="bg-surface-container-low rounded-DEFAULT border border-dashed border-outline-variant text-center py-20 mt-8 shadow-sm">
        <h2 className="text-xl font-bold text-on-surface mb-2">Insufficient Data</h2>
        <p className="text-on-surface-variant mb-6 max-w-md mx-auto">Please add your past semesters first to use the future projection tool.</p>
      </div>
    </div>
  );

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
  const maxGrade = parseFloat(profile.grading_system) || 10;
  
  // Dynamic remaining credits (using the total from simulation if changed)
  const remainingCredits = simulatedSems.reduce((acc, curr) => acc + curr.credits, 0);
  
  const maxPossibleFinal = remainingCredits > 0 
    ? ((totalGradePoints + (maxGrade * remainingCredits)) / (completedCredits + remainingCredits))
    : currentCGPA;

  const requiredFutureGPA = remainingCredits > 0 
    ? ((targetCGPA * (completedCredits + remainingCredits)) - totalGradePoints) / remainingCredits 
    : 0;

  const isAchievable = requiredFutureGPA <= maxGrade && requiredFutureGPA > 0;

  let simGradePoints = 0;
  let simCredits = 0;
  simulatedSems.forEach(s => {
    simGradePoints += (s.gpa * s.credits);
    simCredits += s.credits;
  });
  
  const projectedFinalCGPA = (completedCredits + simCredits) > 0 
    ? ((totalGradePoints + simGradePoints) / (completedCredits + simCredits)) 
    : 0;

  const chartData = useMemo(() => {
    const data: any[] = [];
    let cumCr = 0;
    let cumGp = 0;
    
    // Historical
    semesters.filter(s => s.semester_number !== 999).sort((a,b)=>a.semester_number - b.semester_number).forEach(s => {
      cumCr += s.credits;
      cumGp += (s.gpa * s.credits);
      data.push({
        name: `S${s.semester_number}`,
        cgpa: parseFloat((cumGp / cumCr).toFixed(2)),
        isSimulated: false
      });
    });
    
    // Simulated
    simulatedSems.forEach(s => {
      cumCr += s.credits;
      cumGp += (s.gpa * s.credits);
      data.push({
        name: `S${s.sem}`,
        cgpa: parseFloat((cumGp / cumCr).toFixed(2)),
        isSimulated: true
      });
    });
    
    return data;
  }, [semesters, simulatedSems]);

  return (
    <main className="w-full min-h-screen pt-8 pb-20 lg:pb-10 bg-surface px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col w-full gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="inline-flex items-center gap-2 text-primary font-label-md text-label-md uppercase tracking-wider">
              <TrendingUp size={18} />
              <span>Strategic Academic Modeling</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface">Future CGPA Projection</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Simulate academic pathways and find the exact GPA needed across upcoming semesters to achieve your target CGPA.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Target Controls & Stepper */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Target Card */}
            <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-lg shadow-sm border border-outline-variant flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                    <Flag size={20} />
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Target CGPA</h2>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Degree Objective Goal</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm font-bold">{maxGrade} Scale</span>
              </div>

              <div className="bg-surface-container-low p-4 rounded-lg flex items-center justify-between">
                <button 
                  onClick={() => setTargetCGPA(Math.max(0, targetCGPA - 0.1))}
                  className="w-12 h-12 rounded-full bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors font-bold text-xl"
                >
                  -
                </button>
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display-lg text-display-lg text-primary tracking-tight">{targetCGPA.toFixed(2)}</span>
                    <span className="font-headline-sm text-headline-sm text-on-surface-variant">/ {maxGrade}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setTargetCGPA(Math.min(maxGrade, targetCGPA + 0.1))}
                  className="w-12 h-12 rounded-full bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors font-bold text-xl"
                >
                  +
                </button>
              </div>

              {/* Status Box */}
              {!isAchievable && remainingCredits > 0 ? (
                <div className="p-4 rounded-lg bg-error-container text-on-error-container border border-error-container flex items-start gap-3">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm mb-1">Target Not Achievable</h4>
                    <p className="text-xs">Even with a perfect {maxGrade} GPA in all remaining credits, your maximum possible CGPA is {maxPossibleFinal.toFixed(2)}.</p>
                  </div>
                </div>
              ) : remainingCredits === 0 ? (
                <div className="p-4 rounded-lg bg-secondary-container text-on-secondary-container border border-secondary-container flex items-start gap-3">
                  <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm mb-1">Degree Completed</h4>
                    <p className="text-xs">You have no remaining credits left to simulate.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Required Avg GPA</span>
                    <span className="font-headline-md text-headline-md text-on-surface font-bold">{requiredFutureGPA.toFixed(2)}</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-surface-container-low border border-outline-variant flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Remaining Credits</span>
                    <span className="font-headline-md text-headline-md text-on-surface font-bold">{remainingCredits}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper for Simulated Semesters */}
            {remainingCredits > 0 && (
              <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-lg shadow-sm border border-outline-variant flex flex-col gap-6">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Plan Remaining Semesters</h3>
                <div className="space-y-4">
                  {simulatedSems.map((sim, idx) => (
                    <div key={idx} className="flex flex-col p-4 border border-outline-variant rounded-lg bg-surface-container-low gap-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-on-surface">Semester {sim.sem}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-on-surface-variant mb-1">Credits</label>
                          <input 
                            type="number" 
                            min="0"
                            value={sim.credits}
                            onChange={(e) => handleSimCreditsChange(idx, parseInt(e.target.value) || 0)}
                            className="w-full bg-surface-container-highest border-none text-on-surface rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-on-surface-variant mb-1">Expected GPA</label>
                          <input 
                            type="number" 
                            step="0.01" min="0" max={maxGrade}
                            value={sim.gpa}
                            onChange={(e) => handleSimGpaChange(idx, parseFloat(e.target.value) || 0)}
                            className="w-full bg-surface-container-highest border-none text-on-surface rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Scenarios & Chart */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            <div className="bg-gradient-to-br from-primary to-secondary p-6 lg:p-8 rounded-lg shadow-sm text-on-primary">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/20 text-on-primary-container font-label-sm text-label-sm mb-2 backdrop-blur-sm">
                    Based on your simulated plan
                  </span>
                  <h2 className="font-headline-md text-headline-md font-bold tracking-tight">Projected Final CGPA</h2>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <Target size={24} />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-display-xl text-[64px] font-extrabold tracking-tighter leading-none">{projectedFinalCGPA.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 lg:p-8 rounded-lg shadow-sm border border-outline-variant flex flex-col gap-6">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Projection Trajectory</h3>
              <div className="h-[300px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }} dy={10} />
                    <YAxis domain={[0, maxGrade]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ fontWeight: 600, fontSize: '12px' }}
                    />
                    {targetCGPA && (
                       <ReferenceLine y={targetCGPA} label={{ position: 'top', value: 'Target Goal', fill: '#10B981', fontSize: 10, fontWeight: 700 }} stroke="#10B981" strokeDasharray="4 4" />
                    )}
                    <Area 
                      type="monotone" 
                      name="Cumulative CGPA" 
                      dataKey="cgpa" 
                      stroke="#4F46E5" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorCgpa)" 
                      activeDot={{ r: 6 }} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
};

export default FutureProjection;
