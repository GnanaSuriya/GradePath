import { useState, useEffect } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, UploadCloud, Target, Sparkles, Calendar, BookOpen, GraduationCap, ArrowRight, ArrowUpRight, BarChart2, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  if (!profile) return <div className="p-8 text-red-500">Error loading profile data.</div>;

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
        gpa: parseFloat(sem.gpa.toFixed(2)),
        cgpa: parseFloat(cgpa.toFixed(2))
      });
    }
    currentCGPA = totalGradePoints / totalEarnedCredits;
  }

  const latestGPA = semesters.length > 0 ? semesters[semesters.length - 1].gpa : 0;
  const prevCGPA = semesters.length > 1 ? chartData[chartData.length - 2].cgpa : currentCGPA;
  const trend = currentCGPA - prevCGPA;

  const gradingSystem = parseFloat(profile.grading_system);
  const totalProgramCredits = parseInt(profile.total_program_credits);
  const remainingCredits = totalProgramCredits - totalEarnedCredits;
  const maxPossible = ((totalGradePoints) + (remainingCredits * gradingSystem)) / totalProgramCredits;
  
  const targetCgpa = 9.0; // Hardcoded default target if they don't have one set, to match UI
  const requiredGPAToTarget = remainingCredits > 0 ? ((targetCgpa * totalProgramCredits) - totalGradePoints) / remainingCredits : 0;

  const firstName = user?.name?.split(' ')[0] || 'Student';
  const progressPercent = Math.min(100, Math.max(0, (totalEarnedCredits / totalProgramCredits) * 100));

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 pb-20 font-sans">
      
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {firstName} <span className="inline-block">👋</span></h1>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] uppercase font-bold flex items-center gap-1.5 border border-green-200">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Active Session
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 font-medium">
            <span className="flex items-center gap-1.5"><BookOpen size={16} className="text-blue-500" /> {profile.degree} {profile.specialization} • Semester {profile.completed_semesters + 1}</span>
            <span className="flex items-center gap-1.5"><GraduationCap size={16} className="text-blue-500" /> {profile.university}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Link to="/calculator" className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-blue-600/20 text-sm">
            <Plus size={16} /> Add Semester
          </Link>
          <Link to="/import" className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-medium transition-colors text-sm shadow-sm">
            <UploadCloud size={16} /> Import VTOP
          </Link>
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-medium transition-colors text-sm shadow-sm">
            <Target size={16} /> Set Target
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current CGPA</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><GraduationCap size={20} /></div>
          </div>
          {currentCGPA > 0 ? (
            <>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-4xl font-bold text-gray-900 tracking-tight">{currentCGPA.toFixed(2)}</span>
                <span className="text-lg font-medium text-gray-400">/{gradingSystem.toFixed(1)}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-auto">
                <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md ${trend >= 0 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowUpRight size={14} className="rotate-90" />} 
                  {trend > 0 ? '+' : ''}{trend.toFixed(2)} from Sem {semesters.length - 1 || 1}
                </span>
                <span className="text-[11px] text-gray-400 font-medium">Based on {totalEarnedCredits} completed credits</span>
              </div>
            </>
          ) : (
            <div className="text-lg font-semibold text-gray-400 my-4">Not calculated yet</div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target CGPA</span>
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><Target size={20} /></div>
          </div>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-4xl font-bold text-gray-900 tracking-tight">{targetCgpa.toFixed(2)}</span>
            <span className="text-lg font-medium text-gray-400">/{gradingSystem.toFixed(1)}</span>
          </div>
          <div className="flex flex-col gap-1.5 mt-auto">
            {remainingCredits > 0 ? (
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-100 flex items-center gap-1.5 w-max">
                <Sparkles size={12} /> Needs ~{requiredGPAToTarget.toFixed(2)} avg in next {profile.total_semesters - profile.completed_semesters} se
              </span>
            ) : (
              <span className="text-[11px] font-bold text-gray-500">Degree completed</span>
            )}
            <span className="text-[11px] text-gray-400 font-medium px-1">Goal: First Class with Distinction</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Credits Completed</span>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><BookOpen size={20} /></div>
          </div>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-4xl font-bold text-gray-900 tracking-tight">{totalEarnedCredits}</span>
            <span className="text-lg font-medium text-gray-400">/ {totalProgramCredits} Credits</span>
          </div>
          <div className="mt-auto">
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-gray-900">{progressPercent.toFixed(1)}% Finished</span>
              <span className="text-gray-400">{remainingCredits} Credits remaining</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Term</span>
            <div className="p-2 bg-green-50 rounded-xl text-green-600"><Calendar size={20} /></div>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-bold text-gray-900 tracking-tight">Sem {semesters.length || '-'}</span>
            <span className="text-sm font-medium text-gray-400">GPA: {latestGPA ? latestGPA.toFixed(2) : 'N/A'}</span>
          </div>
          <div className="flex flex-col gap-1 mt-auto">
            <span className="text-[11px] font-bold text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 w-max">
              {semesters.length > 0 ? `${semesters[semesters.length - 1].credits} Credits Earned` : 'No data yet'}
            </span>
            <span className="text-[11px] text-gray-400 font-medium px-1">Max possible CGPA: {maxPossible.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Pathway Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-green-200">Realistic Trajectory</span>
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200">High Distinction focus</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Pathway to {targetCgpa.toFixed(2)} CGPA Graduation</h2>
                <p className="text-xs text-gray-500 mt-1.5 max-w-lg leading-relaxed">
                  You need an aggregate gap recovery of <span className="font-bold text-blue-600">+{((targetCgpa - currentCGPA) || 0).toFixed(2)}</span> across your remaining {profile.total_semesters - profile.completed_semesters} terms. Following this staggered progression preserves target eligibility.
                </p>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 shrink-0">
                <div className="text-center">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Current</div>
                  <div className="text-xl font-bold text-gray-900 leading-none">{currentCGPA.toFixed(2)}</div>
                </div>
                <ArrowRight size={16} className="text-blue-500" />
                <div className="text-center">
                  <div className="text-[9px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Target</div>
                  <div className="text-xl font-bold text-blue-600 leading-none">{targetCgpa.toFixed(2)}</div>
                </div>
              </div>
            </div>
            
            {remainingCredits > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-[0_0_15px_rgba(59,130,246,0.1)] relative overflow-hidden group transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Step 1 • Current</span>
                    <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Sem {profile.completed_semesters + 1}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-[26px] font-bold text-gray-900">{(requiredGPAToTarget - 0.1).toFixed(2)}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Req. GPA</span>
                  </div>
                  <div className="text-[11px] text-gray-500 leading-snug">Target: 3 'S' grades + 2 'A' grades</div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Step 2</span>
                    <span className="text-[9px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Sem {profile.completed_semesters + 2}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-[26px] font-bold text-gray-900">{requiredGPAToTarget.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Req. GPA</span>
                  </div>
                  <div className="text-[11px] text-gray-500 leading-snug">Core Electives & Advanced Algorithms</div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Step 3</span>
                    <span className="text-[9px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Sem {profile.completed_semesters + 3}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-[26px] font-bold text-gray-900">{(requiredGPAToTarget + 0.1).toFixed(2)}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Req. GPA</span>
                  </div>
                  <div className="text-[11px] text-gray-500 leading-snug">Industry Internships & Electives</div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Step 4 • Final</span>
                    <span className="text-[9px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Sem {profile.completed_semesters + 4}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-[26px] font-bold text-gray-900">{(requiredGPAToTarget).toFixed(2)}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Req. GPA</span>
                  </div>
                  <div className="text-[11px] text-gray-500 leading-snug">Capstone Research Thesis (12 Cr)</div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                You have completed all credits required for this degree!
              </div>
            )}
          </div>

          {/* Chart Card */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Academic History & Trajectory Trend</h2>
                <p className="text-xs text-gray-500 mt-0.5">Visualizing semester-by-semester GPA with cumulative CGPA progression</p>
              </div>
              <div className="flex items-center p-1 bg-gray-50 border border-gray-200 rounded-xl shrink-0">
                <button className="px-3 py-1.5 text-xs font-bold text-gray-900 bg-white rounded-lg shadow-sm border border-gray-100">All Semesters</button>
                <button className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">Theory vs Lab</button>
                <button className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">Credit-weighted</button>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }} dy={10} />
                    <YAxis domain={[0, gradingSystem]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280', fontWeight: 600 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ fontWeight: 600, fontSize: '12px' }}
                      labelStyle={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="cgpa" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorCgpa)" name="Cumulative CGPA" activeDot={{ r: 6, fill: '#4F46E5', stroke: '#fff', strokeWidth: 2 }} />
                    <Line type="step" dataKey="gpa" stroke="#93C5FD" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#3B82F6', strokeWidth: 2 }} name="Semester GPA" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <BarChart2 size={32} className="mb-3 text-gray-300" />
                  <p className="text-sm font-medium">Add semester results to see your trend.</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-300"></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Semester GPA (SGPA)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 rounded-full bg-blue-600"></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Cumulative CGPA Progression</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          
          {/* Quick Actions / Future Simulator Teaser */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp size={100} />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp size={18} /></div>
              <h3 className="font-bold text-gray-900">Future Projection Simulator</h3>
              <span className="ml-auto bg-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">Live</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-6">
              Adjust sliders to simulate your expected Semester {profile.completed_semesters + 1} GPA and view the instantaneous impact on your cumulative CGPA.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6 relative z-10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-gray-500">Hypothetical Sem {profile.completed_semesters + 1} GPA:</span>
                <span className="text-lg font-bold text-blue-600">{requiredGPAToTarget.toFixed(2)}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between mt-1.5 text-[9px] font-bold text-gray-400">
                <span>0.00</span>
                <span>{(gradingSystem / 2).toFixed(2)}</span>
                <span>{gradingSystem.toFixed(2)} Max</span>
              </div>
            </div>
            
            <Link to="/projection" className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-blue-600 hover:text-white text-gray-700 font-medium py-2.5 rounded-xl transition-colors text-sm shadow-sm group-hover:bg-blue-600 group-hover:shadow-blue-600/20 relative z-10">
              Apply to {profile.total_semesters}-Semester Roadmap <ArrowRight size={14} />
            </Link>
          </div>

          {/* ML Predictor Teaser */}
          <div className="bg-gradient-to-br from-[#1E1B4B] to-[#312E81] rounded-3xl p-6 shadow-lg shadow-indigo-900/20 text-white relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-10">
              <Sparkles size={150} />
            </div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <Sparkles size={18} className="text-blue-300" />
              <h3 className="font-bold text-white">Predictive ML Estimator</h3>
              <span className="ml-auto bg-blue-500/30 text-blue-200 text-[9px] font-bold px-2 py-0.5 rounded border border-blue-400/30 uppercase">Beta</span>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10 mb-5 relative z-10">
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-1.5 rounded-lg shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <div className="text-xs font-bold text-white mb-1">Model Confidence: 94.2%</div>
                  <p className="text-[10px] text-indigo-200 leading-relaxed">
                    Inputs derived from 92% continuous attendance, CAT-1 performance distribution, and historic faculty grading patterns.
                  </p>
                </div>
              </div>
            </div>
            
            <Link to="/predictor" className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-indigo-900 font-bold py-2.5 rounded-xl transition-colors text-sm relative z-10 shadow-md">
              Explore Detailed ML Weights
            </Link>
          </div>
          
          {/* Empty State Switcher Hint */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4 mt-auto">
            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-relaxed">
              GradePath v2.4 • Sync active with VTOP Student Portal • Last updated: Today, 11:42 AM
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
