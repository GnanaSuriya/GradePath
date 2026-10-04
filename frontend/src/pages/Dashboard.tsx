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
    <main className="w-full min-h-screen pt-16 pb-20 lg:pb-10 bg-surface px-4 lg:px-8 max-w-7xl mx-auto"><div className="flex flex-col w-full gap-8">

{/* Top Greeting & Header Bar */}

<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

<div className="flex flex-col gap-1">

<div className="flex items-center gap-2">

<h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Welcome back, {firstName} 👋</h1>

<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary font-label-sm text-label-sm">

<span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>

          Active Session

        </span>

</div>

<p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 flex-wrap">

<span>{profile.degree} {profile.specialization}</span>

<span className="text-outline-variant">•</span>

<span>Semester {profile.completed_semesters + 1}</span>

<span className="text-outline-variant">•</span>

<span className="inline-flex items-center gap-1">

<span className="material-symbols-outlined text-[16px] text-primary">school</span>

          {profile.university}

        </span>

</p>

</div>

{/* Quick Actions */}

<div className="flex items-center gap-2.5 flex-wrap">

<button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm hover:bg-primary transition-all active:scale-[0.98]" type="button">

<span className="material-symbols-outlined text-[18px]">add</span>

<span>Add Semester</span>

</button>

<button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container-high transition-all" type="button">

<span className="material-symbols-outlined text-[18px] text-secondary">cloud_download</span>

<span>Import VTOP</span>

</button>

<button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container-low text-on-surface-variant font-label-lg text-label-lg hover:bg-surface-container transition-all" type="button">

<span className="material-symbols-outlined text-[18px] text-primary">track_changes</span>

<span>Set Target CGPA</span>

</button>

</div>

</div>

{/* Academic Overview 4 Key Metric Cards */}

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

{/* Card 1: Current CGPA */}

<div className="flex flex-col justify-between p-5 rounded-lg bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">

<div className="flex items-center justify-between">

<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Current CGPA</span>

<span className="p-2 rounded-xl bg-primary/10 text-primary">

<span className="material-symbols-outlined text-[20px]">military_tech</span>

</span>

</div>

<div className="my-3 flex items-baseline gap-2">

<span className="font-display-sm text-display-sm text-on-surface font-extrabold tracking-tight">{currentCGPA.toFixed(2)}</span>

<span className="font-body-sm text-body-sm text-outline">/ 10.0</span>

</div>

<div className="flex flex-col gap-1.5">

<span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-md bg-tertiary-container/15 text-tertiary font-label-sm text-label-sm">

<span className="material-symbols-outlined text-[14px]">trending_up</span>

          {trend > 0 ? "+" : ""}{trend.toFixed(2)} from Sem {semesters.length - 1 || 1}

        </span>

<span className="font-label-sm text-label-sm text-on-surface-variant">Based on {totalEarnedCredits} completed credits</span>

</div>

</div>

{/* Card 2: Target CGPA */}

<div className="flex flex-col justify-between p-5 rounded-lg bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">

<div className="flex items-center justify-between">

<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Target CGPA</span>

<span className="p-2 rounded-xl bg-secondary/10 text-secondary">

<span className="material-symbols-outlined text-[20px]">stars</span>

</span>

</div>

<div className="my-3 flex items-baseline gap-2">

<span className="font-display-sm text-display-sm text-on-surface font-extrabold tracking-tight">{targetCgpa.toFixed(2)}</span>

<span className="font-body-sm text-body-sm text-outline">/ 10.0</span>

</div>

<div className="flex flex-col gap-1.5">

<span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-md bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm truncate max-w-full">

<span className="material-symbols-outlined text-[14px]">bolt</span>

          Needs ~{requiredGPAToTarget.toFixed(2)} avg to reach target

        </span>

<span className="font-label-sm text-label-sm text-on-surface-variant">Goal: First Class with Distinction</span>

</div>

</div>

{/* Card 3: Credits Completed */}

<div className="flex flex-col justify-between p-5 rounded-lg bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">

<div className="flex items-center justify-between">

<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Credits Completed</span>

<span className="p-2 rounded-xl bg-surface-container-high text-on-surface">

<span className="material-symbols-outlined text-[20px]">fact_check</span>

</span>

</div>

<div className="my-3 flex items-baseline gap-2">

<span className="font-display-sm text-display-sm text-on-surface font-extrabold tracking-tight">{totalEarnedCredits}</span>

<span className="font-body-sm text-body-sm text-outline">/ {totalProgramCredits} Credits</span>

</div>

<div className="flex flex-col gap-1.5">

<div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">

<div className="h-full bg-primary-container rounded-full" style={{"width":"{progressPercent.toFixed(1)}%"}}></div>

</div>

<div className="flex justify-between items-center font-label-sm text-label-sm text-on-surface-variant">

<span>{progressPercent.toFixed(1)}% Finished</span>

<span>{remainingCredits} Credits remaining</span>

</div>

</div>

</div>

{/* Card 4: Current Semester */}

<div className="flex flex-col justify-between p-5 rounded-lg bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow">

<div className="flex items-center justify-between">

<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Current Term</span>

<span className="p-2 rounded-xl bg-tertiary-container/15 text-tertiary">

<span className="material-symbols-outlined text-[20px]">date_range</span>

</span>

</div>

<div className="my-3 flex items-baseline gap-2">

<span className="font-display-sm text-display-sm text-on-surface font-extrabold tracking-tight">Sem 5</span>

<span className="font-body-sm text-body-sm text-outline">Fall '24</span>

</div>

<div className="flex flex-col gap-1.5">

<span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">

<span className="material-symbols-outlined text-[14px]">auto_stories</span>

          Ongoing (21 Credits)

        </span>

<span className="font-label-sm text-label-sm text-on-surface-variant">5 Theory • 2 Lab modules</span>

</div>

</div>

</div>

{/* Hero CGPA Pathway Banner & Step Trajectory */}

<div className="flex flex-col p-6 lg:p-8 rounded-lg bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container shadow-sm">

<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-surface-container-high">

<div className="flex flex-col gap-2 max-w-xl">

<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm w-fit">

<span className="material-symbols-outlined text-[16px]">verified</span>

<span>Realistic Trajectory • Feasible with High Distinction focus</span>

</div>

<h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Pathway to {targetCgpa.toFixed(2)} CGPA Graduation</h2>

<p className="font-body-md text-body-md text-on-surface-variant">

          You need an aggregate gap recovery of <span className="font-bold text-primary">+0.58</span> across your remaining 4 terms. Following this staggered progression preserves target eligibility.

        </p>

</div>

<div className="flex items-center gap-6 p-4 rounded-xl bg-surface-container-lowest shadow-sm">

<div className="flex flex-col items-center">

<span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Current</span>

<span className="font-headline-xl text-headline-xl text-on-surface font-black">{currentCGPA.toFixed(2)}</span>

</div>

<div className="flex flex-col items-center justify-center">

<span className="material-symbols-outlined text-[28px] text-primary">arrow_forward</span>

<span className="font-label-sm text-label-sm text-primary font-bold">+0.58</span>

</div>

<div className="flex flex-col items-center">

<span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Target</span>

<span className="font-headline-xl text-headline-xl text-secondary font-black">{targetCgpa.toFixed(2)}</span>

</div>

</div>

</div>

{/* Stepper Pathway */}

<div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

<div className="flex flex-col p-4 rounded-xl bg-surface-container-lowest/80 backdrop-blur-sm shadow-sm relative">

<div className="flex items-center justify-between mb-2">

<span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">Step 1 • Current</span>

<span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">Sem 5</span>

</div>

<div className="flex items-baseline gap-1 my-1">

<span className="font-headline-xl text-headline-xl text-on-surface font-bold">9.35</span>

<span className="font-body-sm text-body-sm text-on-surface-variant">Required GPA</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant">Target: 3 'S' grades + 2 'A' grades</p>

<div className="mt-3 w-full bg-surface-container rounded-full h-1.5 overflow-hidden">

<div className="bg-primary-container h-full rounded-full" style={{"width":"82%"}}></div>

</div>

</div>

<div className="flex flex-col p-4 rounded-xl bg-surface-container-lowest/80 backdrop-blur-sm shadow-sm relative">

<div className="flex items-center justify-between mb-2">

<span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Step 2</span>

<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">Sem 6</span>

</div>

<div className="flex items-baseline gap-1 my-1">

<span className="font-headline-xl text-headline-xl text-on-surface font-bold">9.40</span>

<span className="font-body-sm text-body-sm text-on-surface-variant">Required GPA</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant">Core Electives &amp; Advanced Algorithms</p>

<div className="mt-3 w-full bg-surface-container rounded-full h-1.5 overflow-hidden">

<div className="bg-secondary h-full rounded-full" style={{"width":"60%"}}></div>

</div>

</div>

<div className="flex flex-col p-4 rounded-xl bg-surface-container-lowest/80 backdrop-blur-sm shadow-sm relative">

<div className="flex items-center justify-between mb-2">

<span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Step 3</span>

<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">Sem 7</span>

</div>

<div className="flex items-baseline gap-1 my-1">

<span className="font-headline-xl text-headline-xl text-on-surface font-bold">9.45</span>

<span className="font-body-sm text-body-sm text-on-surface-variant">Required GPA</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant">Industry Internships &amp; Electives</p>

<div className="mt-3 w-full bg-surface-container rounded-full h-1.5 overflow-hidden">

<div className="bg-secondary h-full rounded-full" style={{"width":"40%"}}></div>

</div>

</div>

<div className="flex flex-col p-4 rounded-xl bg-surface-container-lowest/80 backdrop-blur-sm shadow-sm relative">

<div className="flex items-center justify-between mb-2">

<span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">Step 4 • Final</span>

<span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">Sem 8</span>

</div>

<div className="flex items-baseline gap-1 my-1">

<span className="font-headline-xl text-headline-xl text-on-surface font-bold">9.20</span>

<span className="font-body-sm text-body-sm text-on-surface-variant">Required GPA</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant">Capstone Research Thesis (12 Cr)</p>

<div className="mt-3 w-full bg-surface-container rounded-full h-1.5 overflow-hidden">

<div className="bg-tertiary-container h-full rounded-full" style={{"width":"25%"}}></div>

</div>

</div>

</div>

</div>

{/* Performance Visual Chart Section */}

<div className="flex flex-col p-6 lg:p-8 rounded-lg bg-surface-container-lowest shadow-sm gap-6">

<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

<div className="flex flex-col gap-1">

<h3 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Academic History &amp; Trajectory Trend</h3>

<p className="font-body-sm text-body-sm text-on-surface-variant">Visualizing semester-by-semester GPA with cumulative CGPA progression</p>

</div>

{/* Filter Chips */}

<div className="flex items-center gap-1.5 p-1 rounded-full bg-surface-container-low self-start md:self-auto overflow-x-auto max-w-full">

<button className="px-3.5 py-1.5 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm" type="button">All Semesters</button>

<button className="px-3.5 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" type="button">Theory vs Lab</button>

<button className="px-3.5 py-1.5 rounded-full text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" type="button">Credit-weighted</button>

</div>

</div>

{/* Responsive SVG Data Visualization */}

<div className="w-full flex flex-col gap-4">

<div className="relative w-full h-64 sm:h-72">

<svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 280">

<defs>

<linearGradient id="barGrad" x1="0" x2="0" y1="0" y2="1">

<stop offset="0%" stop-color="#2563eb" stop-opacity="0.9"></stop>

<stop offset="100%" stop-color="#2563eb" stop-opacity="0.3"></stop>

</linearGradient>

<linearGradient id="projGrad" x1="0" x2="0" y1="0" y2="1">

<stop offset="0%" stop-color="#4b41e1" stop-opacity="0.8"></stop>

<stop offset="100%" stop-color="#4b41e1" stop-opacity="0.2"></stop>

</linearGradient>

</defs>

{/* Horizontal Reference Gridlines */}

<line stroke="#dae2fd" strokeDasharray="4,4" strokeWidth="1" x1="40" x2="780" y1="30" y2="30"></line>

<text fill="#737686" font-family="Plus Jakarta Sans" font-size="11" text-anchor="end" x="30" y="34">10.0</text>

<line stroke="#dae2fd" strokeDasharray="4,4" strokeWidth="1" x1="40" x2="780" y1="85" y2="85"></line>

<text fill="#737686" font-family="Plus Jakarta Sans" font-size="11" text-anchor="end" x="30" y="89">9.0</text>

<line stroke="#dae2fd" strokeDasharray="4,4" strokeWidth="1" x1="40" x2="780" y1="140" y2="140"></line>

<text fill="#737686" font-family="Plus Jakarta Sans" font-size="11" text-anchor="end" x="30" y="144">8.0</text>

<line stroke="#dae2fd" strokeDasharray="4,4" strokeWidth="1" x1="40" x2="780" y1="195" y2="195"></line>

<text fill="#737686" font-family="Plus Jakarta Sans" font-size="11" text-anchor="end" x="30" y="199">7.0</text>

{/* Bars: Semester 1 (8.10) */}

{/* y = 250 - (val - 6.0) * 55 */}

{/* Sem 1: 8.10 -> 250 - 2.1*55 = 134.5; height = 250 - 134.5 = 115.5 */}

<rect className="transition-all hover:opacity-80 cursor-pointer" fill="url(#barGrad)" height="115.5" rx="8" width="56" x="90" y="134.5"></rect>

<text fill="#131b2e" font-family="Plus Jakarta Sans" font-size="12" font-weight="700" text-anchor="middle" x="118" y="125">8.10</text>

{/* Bars: Semester 2 (8.35) -> 250 - 2.35*55 = 120.75; height = 129.25 */}

<rect className="transition-all hover:opacity-80 cursor-pointer" fill="url(#barGrad)" height="129.25" rx="8" width="56" x="230" y="120.75"></rect>

<text fill="#131b2e" font-family="Plus Jakarta Sans" font-size="12" font-weight="700" text-anchor="middle" x="258" y="111">8.35</text>

{/* Bars: Semester 3 (8.28) -> 250 - 2.28*55 = 124.6; height = 125.4 */}

<rect className="transition-all hover:opacity-80 cursor-pointer" fill="url(#barGrad)" height="125.4" rx="8" width="56" x="370" y="124.6"></rect>

<text fill="#131b2e" font-family="Plus Jakarta Sans" font-size="12" font-weight="700" text-anchor="middle" x="398" y="115">8.28</text>

{/* Bars: Semester 4 (8.95) -> 250 - 2.95*55 = 87.75; height = 162.25 */}

<rect className="transition-all hover:opacity-80 cursor-pointer" fill="url(#barGrad)" height="162.25" rx="8" width="56" x="510" y="87.75"></rect>

<text fill="#131b2e" font-family="Plus Jakarta Sans" font-size="12" font-weight="700" text-anchor="middle" x="538" y="78">8.95</text>

{/* Bars: Semester {profile.completed_semesters + 1} (Projected 9.30) -> 250 - 3.3*55 = 68.5; height = 181.5 */}

<rect className="transition-all hover:opacity-80 cursor-pointer" fill="url(#projGrad)" height="181.5" rx="8" stroke="#4b41e1" strokeDasharray="3,3" strokeWidth="2" width="56" x="650" y="68.5"></rect>

<text fill="#4b41e1" font-family="Plus Jakarta Sans" font-size="12" font-weight="700" text-anchor="middle" x="678" y="58">~9.30</text>

{/* Trendline (CGPA Cumulative curve): Sem1=8.10(118, 134.5), Sem2=8.23(258, 127.35), Sem3=8.25(398, 126.25), Sem4={currentCGPA.toFixed(2)}(538, 116.9), Sem5 proj={latestGPA.toFixed(2)}(678, 107) */}

<path d="M 118 134.5 Q 188 131, 258 127.35 T 398 126.25 T 538 116.9 T 678 107" fill="none" stroke="#004ac6" strokeLinecap="round" strokeWidth="3"></path>

<path d="M 538 116.9 L 678 107" fill="none" stroke="#4b41e1" strokeDasharray="4,4" strokeLinecap="round" strokeWidth="3"></path>

{/* Data Points on CGPA Line */}

<circle cx="118" cy="134.5" fill="#faf8ff" r="4.5" stroke="#004ac6" strokeWidth="2.5"></circle>

<circle cx="258" cy="127.35" fill="#faf8ff" r="4.5" stroke="#004ac6" strokeWidth="2.5"></circle>

<circle cx="398" cy="126.25" fill="#faf8ff" r="4.5" stroke="#004ac6" strokeWidth="2.5"></circle>

<circle cx="538" cy="116.9" fill="#2563eb" r="5" stroke="#faf8ff" strokeWidth="2"></circle>

<circle cx="678" cy="107" fill="#faf8ff" r="4.5" stroke="#4b41e1" strokeWidth="2"></circle>

{/* X-Axis Labels */}

<text fill="#434655" font-family="Plus Jakarta Sans" font-size="12" font-weight="600" text-anchor="middle" x="118" y="270">Sem 1 (20 Cr)</text>

<text fill="#434655" font-family="Plus Jakarta Sans" font-size="12" font-weight="600" text-anchor="middle" x="258" y="270">Sem 2 (22 Cr)</text>

<text fill="#434655" font-family="Plus Jakarta Sans" font-size="12" font-weight="600" text-anchor="middle" x="398" y="270">Sem 3 (18 Cr)</text>

<text fill="#434655" font-family="Plus Jakarta Sans" font-size="12" font-weight="600" text-anchor="middle" x="538" y="270">Sem 4 (18 Cr)</text>

<text fill="#4b41e1" font-family="Plus Jakarta Sans" font-size="12" font-weight="700" text-anchor="middle" x="678" y="270">Sem 5 • Live (21 Cr)</text>

</svg>

</div>

{/* Legend */}

<div className="flex items-center justify-center gap-6 pt-2 flex-wrap font-label-md text-label-md text-on-surface-variant">

<div className="flex items-center gap-2">

<span className="w-3.5 h-3.5 rounded-sm bg-primary-container"></span>

<span>Semester GPA (SGPA)</span>

</div>

<div className="flex items-center gap-2">

<span className="w-4 h-0.5 bg-primary rounded-full"></span>

<span>Cumulative CGPA Progression</span>

</div>

<div className="flex items-center gap-2">

<span className="w-3.5 h-3.5 rounded-sm bg-secondary-fixed text-secondary flex items-center justify-center">

<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>

</span>

<span>Projected Estimate</span>

</div>

</div>

</div>

</div>

{/* Two-Column Interactive Workspace */}

<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

{/* Left Column: Current Semester Live Estimates (7 cols) */}

<div className="lg:col-span-7 flex flex-col gap-6">

<div className="flex flex-col p-6 rounded-lg bg-surface-container-lowest shadow-sm gap-5">

<div className="flex items-center justify-between">

<div className="flex flex-col gap-1">

<div className="flex items-center gap-2">

<h3 className="font-headline-md text-headline-md text-on-surface font-bold">Semester {profile.completed_semesters + 1} Subjects</h3>

<span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">5 Registered</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant">Live mid-term estimations and projected grade points</p>

</div>

<button className="p-2 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" type="button">

<span className="material-symbols-outlined text-[20px]">tune</span>

</button>

</div>

{/* Subject Rows List */}

<div className="flex flex-col gap-3">

{/* Subject 1 */}

<div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low/70 hover:bg-surface-container-low transition-colors">

<div className="flex items-center gap-3 min-w-0">

<span className="w-10 h-10 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-label-md text-label-md font-bold shrink-0">

                CSE

              </span>

<div className="flex flex-col min-w-0">

<div className="flex items-center gap-2 flex-wrap">

<span className="font-label-md text-label-md text-primary font-bold">CSE3001</span>

<span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">Software Engineering</span>

</div>

<span className="font-body-sm text-body-sm text-on-surface-variant">3 Credits • Slot C1 + TC1 • CAT-1: 44/50</span>

</div>

</div>

<div className="flex items-center gap-3 shrink-0 ml-2">

<div className="flex flex-col items-end">

<span className="px-2.5 py-1 rounded-lg bg-tertiary-container/15 text-tertiary font-label-md text-label-md font-bold">

                  Proj. A / 9.0

                </span>

<span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">27.0 pts</span>

</div>

</div>

</div>

{/* Subject 2 */}

<div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low/70 hover:bg-surface-container-low transition-colors">

<div className="flex items-center gap-3 min-w-0">

<span className="w-10 h-10 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-label-md text-label-md font-bold shrink-0">

                CSE

              </span>

<div className="flex flex-col min-w-0">

<div className="flex items-center gap-2 flex-wrap">

<span className="font-label-md text-label-md text-secondary font-bold">CSE3002</span>

<span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">Operating Systems</span>

</div>

<span className="font-body-sm text-body-sm text-on-surface-variant">4 Credits • Embedded Lab • CAT-1: 48/50</span>

</div>

</div>

<div className="flex items-center gap-3 shrink-0 ml-2">

<div className="flex flex-col items-end">

<span className="px-2.5 py-1 rounded-lg bg-tertiary-container/20 text-tertiary font-label-md text-label-md font-bold">

                  Proj. S / 10.0

                </span>

<span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">40.0 pts</span>

</div>

</div>

</div>

{/* Subject 3 */}

<div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low/70 hover:bg-surface-container-low transition-colors">

<div className="flex items-center gap-3 min-w-0">

<span className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center font-label-md text-label-md font-bold shrink-0">

                MAT

              </span>

<div className="flex flex-col min-w-0">

<div className="flex items-center gap-2 flex-wrap">

<span className="font-label-md text-label-md text-on-surface-variant font-bold">MAT3004</span>

<span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">Applied Statistics</span>

</div>

<span className="font-body-sm text-body-sm text-on-surface-variant">3 Credits • Slot B2 • CAT-1: 41/50</span>

</div>

</div>

<div className="flex items-center gap-3 shrink-0 ml-2">

<div className="flex flex-col items-end">

<span className="px-2.5 py-1 rounded-lg bg-tertiary-container/15 text-tertiary font-label-md text-label-md font-bold">

                  Proj. A / 9.0

                </span>

<span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">27.0 pts</span>

</div>

</div>

</div>

{/* Subject 4 */}

<div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low/70 hover:bg-surface-container-low transition-colors">

<div className="flex items-center gap-3 min-w-0">

<span className="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center font-label-md text-label-md font-bold shrink-0">

                ECE

              </span>

<div className="flex flex-col min-w-0">

<div className="flex items-center gap-2 flex-wrap">

<span className="font-label-md text-label-md text-on-surface-variant font-bold">ECE2001</span>

<span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">Microprocessors &amp; Microcontrollers</span>

</div>

<span className="font-body-sm text-body-sm text-on-surface-variant">4 Credits • Hardware Lab • CAT-1: 37/50</span>

</div>

</div>

<div className="flex items-center gap-3 shrink-0 ml-2">

<div className="flex flex-col items-end">

<span className="px-2.5 py-1 rounded-lg bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md font-bold">

                  Proj. B / 8.0

                </span>

<span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">32.0 pts</span>

</div>

</div>

</div>

{/* Subject 5 */}

<div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low/70 hover:bg-surface-container-low transition-colors">

<div className="flex items-center gap-3 min-w-0">

<span className="w-10 h-10 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-label-md text-label-md font-bold shrink-0">

                CSE

              </span>

<div className="flex flex-col min-w-0">

<div className="flex items-center gap-2 flex-wrap">

<span className="font-label-md text-label-md text-primary font-bold">CSE3999</span>

<span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">Technical Project &amp; Seminar</span>

</div>

<span className="font-body-sm text-body-sm text-on-surface-variant">3 Credits • Review 1 Complete (95%)</span>

</div>

</div>

<div className="flex items-center gap-3 shrink-0 ml-2">

<div className="flex flex-col items-end">

<span className="px-2.5 py-1 rounded-lg bg-tertiary-container/20 text-tertiary font-label-md text-label-md font-bold">

                  Proj. S / 10.0

                </span>

<span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">30.0 pts</span>

</div>

</div>

</div>

</div>

{/* Action Row */}

<div className="flex items-center justify-between pt-2 border-t border-surface-container-high flex-wrap gap-3">

<div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant">

<span>Projected Sem 5 GPA:</span>

<span className="font-bold text-primary text-headline-sm">9.18</span>

<span className="text-outline-variant">•</span>

<span>156 Quality Points</span>

</div>

<div className="flex items-center gap-2">

<button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors" type="button">

<span className="material-symbols-outlined text-[16px]">add</span>

<span>Add Subject</span>

</button>

<button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md transition-colors shadow-sm" type="button">

<span className="material-symbols-outlined text-[16px]">calculate</span>

<span>Simulate Semester</span>

</button>

</div>

</div>

</div>

{/* Academic Advisor Advice Snippet */}

<div className="flex items-start gap-4 p-5 rounded-lg bg-surface-container-lowest shadow-sm">

<div className="p-2.5 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed shrink-0">

<span className="material-symbols-outlined text-[24px]">psychology_alt</span>

</div>

<div className="flex flex-col gap-1">

<span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Strategic Recommendation for CAT-2</span>

<p className="font-body-sm text-body-sm text-on-surface-variant">

            Converting <span className="font-semibold text-on-surface">ECE2001 (Microprocessors)</span> from B to A grade point (+4 credit units) increases your semester GPA by <span className="font-bold text-tertiary">+0.24</span>, securing the optimal trajectory for an overall {targetCgpa.toFixed(2)} CGPA by end of Year 3.

          </p>

</div>

</div>

</div>

{/* Right Column: Quick Academic Tools & Projections (5 cols) */}

<div className="lg:col-span-5 flex flex-col gap-6">

{/* Live Future Projection Simulator Widget */}

<div className="flex flex-col p-6 rounded-lg bg-surface-container-lowest shadow-sm gap-5">

<div className="flex items-center justify-between">

<div className="flex items-center gap-2">

<span className="p-2 rounded-xl bg-primary-fixed text-on-primary-fixed">

<span className="material-symbols-outlined text-[20px]">tune</span>

</span>

<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Future Projection Simulator</h3>

</div>

<span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">Live</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant">

          Adjust the slider to simulate your expected Semester {profile.completed_semesters + 1} GPA and view instantaneous impact on cumulative CGPA.

        </p>

{/* Interactive Slider Box */}

<div className="flex flex-col gap-4 p-4 rounded-xl bg-surface-container-low">

<div className="flex justify-between items-center">

<span className="font-label-md text-label-md text-on-surface-variant">Hypothetical Sem 5 GPA:</span>

<span className="font-headline-md text-headline-md font-bold text-primary" id="sliderValueDisplay">9.40</span>

</div>

<input className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary focus:outline-none" id="gpaSlider" max="10.00" min="7.00" step="0.05" type="range" value="9.40"/>

<div className="flex justify-between text-outline font-label-sm text-label-sm">

<span>7.00</span>

<span>8.50</span>

<span>10.00 Max</span>

</div>

{/* Dynamic Output Card */}

<div className="mt-2 p-3 rounded-lg bg-surface-container-lowest flex items-center justify-between">

<div className="flex flex-col">

<span className="font-label-sm text-label-sm text-on-surface-variant">Resulting CGPA (99 Credits)</span>

<span className="font-headline-lg text-headline-lg font-black text-on-surface" id="simulatedCgpa">8.63</span>

</div>

<div className="flex flex-col items-end">

<span className="font-label-sm text-label-sm text-on-surface-variant">Net Shift</span>

<span className="font-label-md text-label-md font-bold text-tertiary" id="cgpaDelta">+0.21 CGPA</span>

</div>

</div>

</div>

<button className="w-full py-2.5 rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2" type="button">

<span>Apply to 4-Year Graduation Roadmap</span>

<span className="material-symbols-outlined text-[18px]">arrow_forward</span>

</button>

</div>

{/* Experimental ML Mark Estimator Teaser Card */}

<div className="flex flex-col p-6 rounded-lg bg-gradient-to-br from-secondary-fixed/30 to-surface-container-lowest shadow-sm gap-4 relative overflow-hidden">

<div className="flex items-center justify-between">

<div className="flex items-center gap-2">

<span className="material-symbols-outlined text-[20px] text-secondary">auto_awesome</span>

<span className="font-headline-sm text-headline-sm text-on-surface font-bold">Predictive ML Mark Estimator</span>

</div>

<span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold">Beta</span>

</div>

<div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-lowest/80 backdrop-blur-sm">

<span className="material-symbols-outlined text-[20px] text-on-surface-variant shrink-0 mt-0.5">info</span>

<p className="font-body-sm text-body-sm text-on-surface-variant">

<strong className="text-on-surface font-semibold">Model Confidence: 94.2%</strong><br/>

            Inputs derived from 92% continuous attendance, CAT-1 performance distribution, and historic faculty grading patterns in CSE Dept.

          </p>

</div>

<div className="flex flex-col gap-2">

<div className="flex justify-between items-center font-label-sm text-label-sm">

<span className="text-on-surface-variant">Expected Semester Band:</span>

<span className="font-bold text-on-surface">9.15 – 9.38 SGPA</span>

</div>

<div className="w-full bg-surface-container rounded-full h-2 overflow-hidden flex">

<div className="h-full bg-tertiary-container" style={{"width":"70%"}}></div>

<div className="h-full bg-secondary-container" style={{"width":"20%"}}></div>

<div className="h-full bg-surface-container-high" style={{"width":"10%"}}></div>

</div>

</div>

<a className="font-label-md text-label-md text-secondary hover:text-on-secondary-fixed font-bold inline-flex items-center gap-1 self-start pt-1" href="#">

<span>Explore Detailed ML Model Weights</span>

<span className="material-symbols-outlined text-[16px]">chevron_right</span>

</a>

</div>

{/* Empty State / New Student Preview Switcher */}

<div className="flex flex-col p-5 rounded-lg bg-surface-container-lowest shadow-sm gap-4">

<div className="flex items-center justify-between">

<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Demo / State Switcher</span>

<button className="px-3 py-1 rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm text-label-sm transition-colors" type="button">

            Toggle Empty State Preview

          </button>

</div>

{/* Container toggled by simple script */}

<div className="hidden flex flex-col items-center justify-center p-6 text-center rounded-xl bg-surface-container-low gap-3 transition-all" id="emptyStateBox">

<div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-outline">

<span className="material-symbols-outlined text-[28px]">folder_off</span>

</div>

<div className="flex flex-col gap-1 max-w-xs">

<span className="font-headline-sm text-headline-sm text-on-surface font-bold">No semester data yet</span>

<span className="font-body-sm text-body-sm text-on-surface-variant">Complete your profile or import your academic timetable from VTOP to unlock forecasting.</span>

</div>

<button className="mt-2 px-4 py-2 rounded-full bg-primary-container text-on-primary font-label-md text-label-md shadow-sm" type="button">

            Import VTOP Data

          </button>

</div>

<p className="font-label-sm text-label-sm text-outline">

          GradePath v2.4 • Sync active with VTOP Student Portal • Last updated: Today, 11:42 AM

        </p>

</div>

</div>

</div>

</div>

</main>
  );
};

export default Dashboard;
