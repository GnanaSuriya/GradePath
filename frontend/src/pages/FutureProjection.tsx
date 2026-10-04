import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Target, TrendingUp, Info, AlertTriangle, CheckCircle2, BarChart2 } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

const FutureProjection = () => {
  const [profile, setProfile] = useState<any>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [targetCGPA, setTargetCGPA] = useState(9.00);
  
  // Custom state for semester-by-semester simulation
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
        
        // Initialize simulated semesters based on remaining
        let completedCredits = semRes.data.reduce((sum: number, s: any) => sum + s.credits, 0);
        const programTotal = profileData.total_program_credits;
        const remainingCredits = Math.max(0, programTotal - completedCredits);
        const completedSemsCount = profileData.completed_semesters;
        const totalSems = profileData.total_semesters;
        const remainingSemsCount = totalSems - completedSemsCount;
        
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
              gpa: 9.0 // default
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

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  if (!profile) return <div className="p-8 text-red-500">Error loading profile data.</div>;

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
  
  // Calculate projected CGPA from simulated sems
  let simGradePoints = 0;
  let simCredits = 0;
  simulatedSems.forEach(s => {
    simGradePoints += (s.gpa * s.credits);
    simCredits += s.credits;
  });
  
  const projectedFinalCGPA = programTotal > 0 
    ? ((totalGradePoints + simGradePoints) / (completedCredits + simCredits)) 
    : 0;

  const chartData = useMemo(() => {
    const data: any[] = [];
    let cumCr = 0;
    let cumGp = 0;
    
    // Historical
    semesters.forEach(s => {
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

  const gap = projectedFinalCGPA - currentCGPA;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">CGPA Forecaster & Goal Planner</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Simulate different scenarios to see how your future performance impacts your final CGPA.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Target Planner */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
              <Target size={150} />
            </div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100">
                <Target size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Target Scenario Planner</h2>
                <p className="text-xs text-gray-500">Find out the exact requirements to hit your milestone.</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative z-10 mb-6">
              <div className="flex justify-between items-end mb-4">
                <label className="text-sm font-bold text-gray-700">Set Goal CGPA</label>
                <div className="flex items-baseline gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                  <span className="text-2xl font-bold text-purple-600">{targetCGPA.toFixed(2)}</span>
                  <span className="text-xs font-bold text-gray-400">/ {maxGrade.toFixed(1)}</span>
                </div>
              </div>
              
              <input 
                type="range" 
                min={Math.floor(currentCGPA)} 
                max={maxGrade} 
                step="0.01" 
                value={targetCGPA} 
                onChange={(e) => setTargetCGPA(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 mb-6" 
              />
              
              <div className="flex gap-2 justify-center mb-6">
                {[8.5, 9.0, 9.5].filter(p => p <= maxGrade).map(p => (
                  <button 
                    key={p} 
                    onClick={() => setTargetCGPA(p)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                      targetCGPA === p 
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {p.toFixed(2)} Target
                  </button>
                ))}
              </div>

              {remainingCredits > 0 ? (
                <div className={`rounded-xl p-4 flex gap-3 ${requiredFutureGPA <= maxGrade ? 'bg-purple-50 border border-purple-100' : 'bg-red-50 border border-red-100'}`}>
                  {requiredFutureGPA <= maxGrade ? <CheckCircle2 size={20} className="text-purple-600 shrink-0 mt-0.5" /> : <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />}
                  <div>
                    <h4 className={`text-sm font-bold mb-1 ${requiredFutureGPA <= maxGrade ? 'text-purple-900' : 'text-red-900'}`}>
                      {requiredFutureGPA <= maxGrade ? 'Target Feasibility: Achievable' : 'Target Feasibility: Mathematically Unreachable'}
                    </h4>
                    <p className={`text-xs leading-relaxed ${requiredFutureGPA <= maxGrade ? 'text-purple-700' : 'text-red-700'}`}>
                      {requiredFutureGPA <= maxGrade 
                        ? `You need to average a ${requiredFutureGPA.toFixed(2)} GPA across your remaining ${remainingCredits} credits. This is ${(requiredFutureGPA - currentCGPA) > 0 ? `${((requiredFutureGPA - currentCGPA)).toFixed(2)} points higher than your current average, so you need to step up.` : 'below your current average, so just maintain your pace.'}`
                        : `Even if you score a perfect ${maxGrade} in all remaining ${remainingCredits} credits, you cannot reach ${targetCGPA.toFixed(2)}. The maximum possible is ${(((currentCGPA * completedCredits) + (maxGrade * remainingCredits)) / programTotal).toFixed(2)}.`
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl p-4 text-center text-sm font-bold text-gray-500">Degree Completed.</div>
              )}
            </div>
          </div>

          {/* Semester-by-Semester Projection */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                <TrendingUp size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Semester-by-Semester Simulation</h2>
                <p className="text-xs text-gray-500">Adjust expected performance for each remaining term.</p>
              </div>
            </div>

            {simulatedSems.length > 0 ? (
              <div className="space-y-4">
                {simulatedSems.map((sim, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white border border-gray-200 rounded-2xl p-4 hover:border-blue-300 transition-colors shadow-sm">
                    <div className="w-full sm:w-1/4 shrink-0 flex justify-between sm:block">
                      <div className="text-sm font-bold text-gray-900">Semester {sim.sem}</div>
                      <div className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">{sim.credits} Credits</div>
                    </div>
                    
                    <div className="flex-1 flex items-center gap-4">
                      <input 
                        type="range" 
                        min="0" 
                        max={maxGrade} 
                        step="0.05" 
                        value={sim.gpa} 
                        onChange={(e) => handleSimGpaChange(idx, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                      />
                      <div className="w-16 text-right">
                        <span className="text-lg font-bold text-blue-600">{sim.gpa.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-2xl text-gray-500 border border-dashed border-gray-300">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="font-bold">No semesters remaining to project.</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Result */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-b from-blue-900 to-indigo-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-indigo-900/20 text-white relative overflow-hidden sticky top-24">
            
            <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
              <BarChart2 size={150} />
            </div>

            <div className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-2 relative z-10">Simulation Result</div>
            <h3 className="text-xl font-bold text-white mb-6 relative z-10">Projected Final CGPA</h3>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-6 flex flex-col items-center justify-center relative z-10">
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-6xl font-bold tracking-tighter text-white">{projectedFinalCGPA.toFixed(2)}</span>
                <span className="text-xl font-medium text-blue-200">/{maxGrade}</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${gap >= 0 ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                {gap >= 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                {gap >= 0 ? '+' : ''}{gap.toFixed(2)} vs Current
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <h4 className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">Credit Breakdown</h4>
              
              <div className="flex justify-between items-end border-b border-white/10 pb-2">
                <div>
                  <div className="text-white font-bold text-sm">Completed</div>
                  <div className="text-[10px] text-blue-200">Avg: {currentCGPA.toFixed(2)}</div>
                </div>
                <div className="text-sm font-bold">{completedCredits} Cr</div>
              </div>
              
              <div className="flex justify-between items-end border-b border-white/10 pb-2">
                <div>
                  <div className="text-white font-bold text-sm">Future Projected</div>
                  <div className="text-[10px] text-blue-200">Avg: {(simCredits > 0 ? simGradePoints/simCredits : 0).toFixed(2)}</div>
                </div>
                <div className="text-sm font-bold">{simCredits} Cr</div>
              </div>

              <div className="flex justify-between items-end pt-1">
                <div className="text-blue-200 font-bold text-xs uppercase">Total Degree</div>
                <div className="text-base font-bold text-blue-400">{programTotal} Cr</div>
              </div>
            </div>

            {/* Mini Chart */}
            <div className="mt-8 h-32 relative z-10 bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="text-[9px] font-bold text-blue-300 mb-2 uppercase tracking-wider">Trajectory Preview</div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <defs>
                    <linearGradient id="colorCgpa2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E1B4B', border: '1px solid #312E81', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                    labelStyle={{ color: '#818CF8', fontSize: '10px', marginBottom: '2px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cgpa" 
                    stroke="#60A5FA" 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorCgpa2)" 
                    activeDot={{ r: 4, fill: '#fff', stroke: '#60A5FA' }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] font-medium text-blue-300 relative z-10 bg-blue-950/50 py-2 rounded-lg border border-blue-800/50">
              <Info size={14} /> Estimates assume exact credit completion.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default FutureProjection;
