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
    <div className="flex h-[80vh] items-center justify-center bg-surface">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!profile) return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto font-sans min-h-screen bg-surface">
      <div className="bg-surface-container-low rounded-DEFAULT border border-dashed border-outline-variant text-center py-20 mt-8 shadow-sm">
        <h2 className="text-xl font-bold text-on-surface mb-2">No academic profile found</h2>
        <p className="text-on-surface-variant mb-6 max-w-md mx-auto">Please complete your academic profile to see your dashboard.</p>
        <Link to="/profile" className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-6 rounded-xl transition-colors shadow-sm inline-block">
          Go to Profile
        </Link>
      </div>
    </div>
  );

  const completedSemesters = semesters.filter(s => s.semester_number !== 999).sort((a, b) => a.semester_number - b.semester_number);
  const currentSemesterRec = semesters.find(s => s.semester_number === 999);

  let totalEarnedCredits = 0;
  let totalGradePoints = 0;
  
  const chartData: any[] = [];
  let currentCGPA = 0;
  
  if (completedSemesters.length > 0) {
    let cumCredits = 0;
    let cumGP = 0;
    for (const sem of completedSemesters) {
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

  const gradingSystem = parseFloat(profile.grading_system) || 10.0;
  const totalProgramCredits = parseInt(profile.total_program_credits) || 0;
  const remainingCredits = Math.max(0, totalProgramCredits - totalEarnedCredits);
  
  const targetCgpa = profile.target_cgpa || null;
  const requiredGPAToTarget = (targetCgpa && remainingCredits > 0) ? ((targetCgpa * totalProgramCredits) - totalGradePoints) / remainingCredits : 0;
  const achievable = requiredGPAToTarget <= gradingSystem;

  const firstName = profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Student';
  const progressPercent = totalProgramCredits > 0 ? Math.min(100, Math.max(0, (totalEarnedCredits / totalProgramCredits) * 100)) : 0;

  const latestGPA = completedSemesters.length > 0 ? completedSemesters[completedSemesters.length - 1].gpa : 0;
  const prevCGPA = chartData.length > 1 ? chartData[chartData.length - 2].cgpa : currentCGPA;
  const trend = currentCGPA - prevCGPA;

  return (
    <main className="w-full min-h-screen pt-8 pb-20 lg:pb-10 bg-surface px-4 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col w-full gap-8">
        {/* Top Greeting & Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Welcome back, {firstName} 👋</h1>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 flex-wrap mt-1">
              <span>{profile.degree} {profile.specialization}</span>
              <span className="text-outline-variant">•</span>
              <span>Semester {profile.current_semester || (completedSemesters.length + 1)}</span>
              <span className="text-outline-variant">•</span>
              <span className="inline-flex items-center gap-1">
                <GraduationCap size={16} className="text-primary" />
                {profile.university}
              </span>
            </p>
          </div>
          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link to="/history" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary/90 transition-all">
              <Plus size={18} />
              <span>Add Past Semester</span>
            </Link>
            <Link to="/calculator" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container-high transition-all border border-outline-variant">
              <UploadCloud size={18} className="text-secondary" />
              <span>GPA Calculator</span>
            </Link>
          </div>
        </div>

        {completedSemesters.length === 0 ? (
          <div className="bg-surface-container-low rounded-DEFAULT border border-dashed border-outline-variant text-center py-20 mt-4 shadow-sm">
            <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">No semester data yet</h2>
            <p className="text-on-surface-variant mb-6 max-w-md mx-auto">Add your past semesters to unlock detailed analytics, charts, and performance tracking.</p>
            <Link to="/history" className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-6 rounded-xl transition-colors shadow-sm inline-block">
              Add First Semester
            </Link>
          </div>
        ) : (
          <>
            {/* Academic Overview 4 Key Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Current CGPA */}
              <div className="flex flex-col justify-between p-5 rounded-lg bg-surface-container-lowest shadow-sm border border-outline-variant relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Current CGPA</span>
                  <span className="p-2 rounded-xl bg-primary-container text-on-primary-container">
                    <Sparkles size={20} />
                  </span>
                </div>
                <div className="my-3 flex items-baseline gap-2">
                  <span className="font-display-sm text-display-sm text-on-surface font-extrabold tracking-tight">{currentCGPA.toFixed(2)}</span>
                  <span className="font-body-sm text-body-sm text-outline">/ {gradingSystem.toFixed(1)}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className={`inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-md font-label-sm text-label-sm ${trend >= 0 ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
                    <TrendingUp size={14} className={trend < 0 ? 'rotate-180' : ''} />
                    {trend > 0 ? "+" : ""}{trend.toFixed(2)} from Sem {completedSemesters.length - 1 || 1}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Based on {totalEarnedCredits} completed credits</span>
                </div>
              </div>

              {/* Card 2: Target CGPA */}
              <div className="flex flex-col justify-between p-5 rounded-lg bg-surface-container-lowest shadow-sm border border-outline-variant relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Target CGPA</span>
                  <span className="p-2 rounded-xl bg-tertiary-container text-on-tertiary-container">
                    <Target size={20} />
                  </span>
                </div>
                {targetCgpa ? (
                  <>
                    <div className="my-3 flex items-baseline gap-2">
                      <span className="font-display-sm text-display-sm text-on-surface font-extrabold tracking-tight">{targetCgpa.toFixed(2)}</span>
                      <span className="font-body-sm text-body-sm text-outline">/ {gradingSystem.toFixed(1)}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className={`inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-md font-label-sm text-label-sm truncate max-w-full ${achievable ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
                        {achievable ? `Needs ~${requiredGPAToTarget.toFixed(2)} avg` : 'Not achievable'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="my-3 flex flex-col items-start gap-2 h-full justify-center">
                    <span className="text-sm text-on-surface-variant">No target set.</span>
                    <Link to="/profile" className="text-primary text-sm font-bold hover:underline">Set Target Goal &rarr;</Link>
                  </div>
                )}
              </div>

              {/* Card 3: Credits Completed */}
              <div className="flex flex-col justify-between p-5 rounded-lg bg-surface-container-lowest shadow-sm border border-outline-variant">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Credits Completed</span>
                  <span className="p-2 rounded-xl bg-surface-container-high text-on-surface">
                    <BookOpen size={20} />
                  </span>
                </div>
                <div className="my-3 flex items-baseline gap-2">
                  <span className="font-display-sm text-display-sm text-on-surface font-extrabold tracking-tight">{totalEarnedCredits}</span>
                  <span className="font-body-sm text-body-sm text-outline">/ {totalProgramCredits}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${progressPercent.toFixed(1)}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center font-label-sm text-label-sm text-on-surface-variant">
                    <span>{progressPercent.toFixed(1)}% Finished</span>
                    <span>{remainingCredits} remaining</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Current Semester */}
              <div className="flex flex-col justify-between p-5 rounded-lg bg-surface-container-lowest shadow-sm border border-outline-variant">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Recent Term</span>
                  <span className="p-2 rounded-xl bg-secondary-container text-on-secondary-container">
                    <Calendar size={20} />
                  </span>
                </div>
                <div className="my-3 flex items-baseline gap-2">
                  <span className="font-display-sm text-display-sm text-on-surface font-extrabold tracking-tight">Sem {completedSemesters[completedSemesters.length - 1].semester_number}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                    {latestGPA.toFixed(2)} SGPA
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{completedSemesters[completedSemesters.length - 1].credits} Credits completed</span>
                </div>
              </div>
            </div>

            {/* Performance Visual Chart Section */}
            <div className="flex flex-col p-6 lg:p-8 rounded-lg bg-surface-container-lowest shadow-sm border border-outline-variant gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Academic Trajectory Trend</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Visualizing semester-by-semester GPA vs cumulative CGPA progression</p>
                </div>
              </div>

              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCgpaTrack" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }} dy={10} />
                    <YAxis domain={[0, gradingSystem]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ fontWeight: 600, fontSize: '12px' }}
                    />
                    <Area type="monotone" name="Cumulative CGPA" dataKey="cgpa" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorCgpaTrack)" activeDot={{ r: 6 }} />
                    <Line type="monotone" name="Term SGPA" dataKey="gpa" stroke="#9CA3AF" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Current Semester Subjects or Pathway */}
            {currentSemesterRec && currentSemesterRec.subjects && currentSemesterRec.subjects.length > 0 ? (
              <div className="flex flex-col p-6 rounded-lg bg-surface-container-lowest shadow-sm border border-outline-variant gap-4">
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Current Semester Progress</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        <th className="py-3 font-bold text-sm text-on-surface-variant uppercase tracking-wider">Subject</th>
                        <th className="py-3 font-bold text-sm text-on-surface-variant uppercase tracking-wider">Code</th>
                        <th className="py-3 font-bold text-sm text-on-surface-variant uppercase tracking-wider text-right">Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentSemesterRec.subjects.map((s: any, i: number) => (
                        <tr key={i} className="border-b border-outline-variant last:border-none">
                          <td className="py-3 text-sm font-bold text-on-surface">{s.name}</td>
                          <td className="py-3 text-sm text-on-surface-variant">{s.code}</td>
                          <td className="py-3 text-sm font-bold text-on-surface text-right">{s.credits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
