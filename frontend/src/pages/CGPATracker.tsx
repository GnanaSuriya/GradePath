import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Link } from 'react-router-dom';
import { TrendingUp, BookOpen, GraduationCap, Medal, Calendar, ChevronRight, BarChart2 } from 'lucide-react';

const CGPATracker = () => {
  const [profile, setProfile] = useState<any>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!profile || semesters.length === 0 || semesters.filter(s => s.semester_number !== 999).length === 0) {
    return (
      <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">CGPA Tracker & Analysis</h1>
        <p className="text-sm text-gray-500 font-medium">Deep dive into your academic performance trends.</p>
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 text-center py-20 mt-8 shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No semester data yet</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">Add your past semesters in the history tab to unlock detailed analytics, charts, and performance tracking.</p>
          <Link to="/history" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm inline-block">
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
      cumulativeCGPA: parseFloat(cumulativeCGPA.toFixed(2)),
      targetCGPA: profile.target_cgpa
    };
  });

  const currentCGPA = runningCredits > 0 ? (runningGpaPts / runningCredits) : 0;
  const lastSemGPA = sortedSemesters[sortedSemesters.length - 1].gpa;
  const prevCGPA = historyData.length > 1 ? historyData[historyData.length - 2].cumulativeCGPA : currentCGPA;
  const trend = currentCGPA - prevCGPA;

  const maxGrade = parseFloat(profile.grading_system) || 10;
  const programTotal = profile.total_program_credits || 0;
  const remainingCredits = Math.max(0, programTotal - runningCredits);

  if (profile.target_cgpa && remainingCredits > 0) {
    // requiredFutureGPA = ((profile.target_cgpa * programTotal) - (currentCGPA * runningCredits)) / remainingCredits;
  }

  // Estimated Standing logic based on CGPA
  let standing = "Good Standing";
  let standingColor = "text-green-600 bg-green-50 border-green-200";
  if (currentCGPA >= (maxGrade * 0.9)) {
    standing = "Top 10% (Est)";
    standingColor = "text-purple-700 bg-purple-50 border-purple-200";
  } else if (currentCGPA >= (maxGrade * 0.8)) {
    standing = "Top 25% (Est)";
    standingColor = "text-blue-700 bg-blue-50 border-blue-200";
  } else if (currentCGPA < (maxGrade * 0.6)) {
    standing = "Needs Improvement";
    standingColor = "text-orange-700 bg-orange-50 border-orange-200";
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">CGPA Tracker & Analysis</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Deep dive into your academic performance trends and semester-wise breakdown.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity"><GraduationCap size={80} /></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Current CGPA</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><GraduationCap size={18} /></div>
          </div>
          <div className="flex items-baseline gap-1 mb-2 relative z-10">
            <span className="text-4xl font-bold text-gray-900 tracking-tight">{currentCGPA.toFixed(2)}</span>
            <span className="text-lg font-medium text-gray-400">/{maxGrade.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-2 mt-auto relative z-10">
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} /> 
              {trend > 0 ? '+' : ''}{trend.toFixed(2)}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">vs previous term</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Last Semester</span>
            <div className="p-2 bg-green-50 rounded-xl text-green-600"><Calendar size={18} /></div>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-bold text-gray-900 tracking-tight">{lastSemGPA.toFixed(2)}</span>
            <span className="text-lg font-medium text-gray-400">SGPA</span>
          </div>
          <div className="mt-auto">
            <span className="text-[11px] font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
              Sem {sortedSemesters[sortedSemesters.length - 1].semester_number}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Credits</span>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><BookOpen size={18} /></div>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-bold text-gray-900 tracking-tight">{runningCredits}</span>
            <span className="text-lg font-medium text-gray-400">Earned</span>
          </div>
          <div className="mt-auto">
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(runningCredits/programTotal)*100}%` }}></div>
            </div>
            <div className="text-[10px] text-gray-400 font-bold">{((runningCredits/programTotal)*100).toFixed(1)}% of Degree</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Overall Standing</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Medal size={18} /></div>
          </div>
          <div className="flex items-center h-full pb-4 pt-2">
            <div className={`px-4 py-2 rounded-xl border text-sm font-bold ${standingColor}`}>
              {standing}
            </div>
          </div>
          <div className="mt-auto text-[10px] text-gray-400 font-medium leading-tight">
            Based on historical data for {profile.university} {profile.degree}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Cumulative Progression & Trajectory</h2>
                <p className="text-xs text-gray-500 mt-0.5">Tracking CGPA (smooth area) vs SGPA (dashed line)</p>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer>
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCgpaTrack" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }} dy={10} />
                  <YAxis domain={[0, maxGrade]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ fontWeight: 600, fontSize: '12px' }}
                    labelStyle={{ color: '#6B7280', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '20px', color: '#6B7280' }} />
                  
                  {profile.target_cgpa && (
                     <ReferenceLine y={profile.target_cgpa} label={{ position: 'top', value: 'Target Goal', fill: '#10B981', fontSize: 10, fontWeight: 700 }} stroke="#10B981" strokeDasharray="4 4" />
                  )}
                  
                  <Area type="monotone" name="Cumulative CGPA" dataKey="cumulativeCGPA" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorCgpaTrack)" activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }} />
                  <Line type="monotone" name="Term SGPA" dataKey="gpa" stroke="#9CA3AF" strokeWidth={2} dot={{ r: 4, fill: '#fff', stroke: '#9CA3AF', strokeWidth: 2 }} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Table & Target */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col h-full max-h-[500px]">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-4">Semester Performance Breakdown</h2>
            
            <div className="overflow-y-auto flex-1 pr-2 -mr-2">
              <div className="space-y-3">
                {historyData.slice().reverse().map((row) => (
                  <div key={row.semester_number} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-blue-100 hover:shadow-sm transition-all group">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">Sem {row.semester_number}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">{row.credits} Cr</span>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Term SGPA</div>
                        <div className="text-lg font-bold text-gray-900">{row.gpa.toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5">Cum. CGPA</div>
                        <div className="text-xl font-bold text-blue-600">{row.cumulativeCGPA.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <Link to="/history" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
                Edit Historical Data <ChevronRight size={14} />
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CGPATracker;
