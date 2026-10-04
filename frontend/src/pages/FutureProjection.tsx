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
    <main className="w-full min-h-screen pt-16 pb-20 lg:pb-10 bg-surface px-4 lg:px-8 max-w-7xl mx-auto"><div className="flex flex-col w-full gap-8">

<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">

<div className="flex flex-col gap-1.5">

<div className="inline-flex items-center gap-2 text-primary font-label-md text-label-md uppercase tracking-wider">

<span className="material-symbols-outlined text-[18px]">model_training</span>

<span>Strategic Academic Modeling</span>

</div>

<h1 className="font-headline-xl text-headline-xl text-on-surface">Future CGPA Projection</h1>

<p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">

        Simulate academic pathways and find the exact GPA needed across upcoming semesters to achieve your target CGPA.

      </p>

</div>

<div className="flex items-center gap-3">

<button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-lg text-label-lg transition-all shadow-sm" id="resetDefaultsBtn" type="button">

<span className="material-symbols-outlined text-[18px]">restart_alt</span>

<span>Reset Baseline</span>

</button>

<button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg transition-all shadow-md" id="exportReportBtn" type="button">

<span className="material-symbols-outlined text-[18px]">download</span>

<span>Export Projection Report</span>

</button>

</div>

</div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

<div className="lg:col-span-5 flex flex-col gap-6">

<div className="bg-surface-container-lowest p-6 lg:p-8 rounded-lg shadow-sm flex flex-col gap-6">

<div className="flex items-center justify-between">

<div className="flex items-center gap-2.5">

<div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">

<span className="material-symbols-outlined text-[22px]">flag</span>

</div>

<div>

<h2 className="font-headline-sm text-headline-sm text-on-surface">Target CGPA</h2>

<p className="font-label-sm text-label-sm text-on-surface-variant">Degree Objective Goal</p>

</div>

</div>

<span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">10.0 Scale</span>

</div>

<div className="bg-surface-container-low p-4 rounded-lg flex items-center justify-between">

<button aria-label="Decrease target" className="w-12 h-12 rounded-full bg-surface-container-lowest text-on-surface hover:bg-primary hover:text-on-primary shadow-sm flex items-center justify-center transition-colors" onClick={() => setTargetCGPA(Math.max(5.0, targetCGPA - 0.1))} type="button">

<span className="material-symbols-outlined text-[24px]">remove</span>

</button>

<div className="flex flex-col items-center">

<div className="flex items-baseline gap-1">

<span className="font-display-lg text-display-lg text-primary tracking-tight" id="targetDisplayVal">{targetCGPA.toFixed(2)}</span>

<span className="font-headline-sm text-headline-sm text-on-surface-variant">/ 10</span>

</div>

<span className="font-label-sm text-label-sm text-outline">Adjust using - / +</span>

</div>

<button aria-label="Increase target" className="w-12 h-12 rounded-full bg-surface-container-lowest text-on-surface hover:bg-primary hover:text-on-primary shadow-sm flex items-center justify-center transition-colors" onClick={() => setTargetCGPA(Math.min(maxGrade, targetCGPA + 0.1))} type="button">

<span className="material-symbols-outlined text-[24px]">add</span>

</button>

</div>

<div className="grid grid-cols-2 gap-3">

<div className="p-3.5 rounded-DEFAULT bg-surface-container-low flex flex-col gap-1">

<span className="font-label-sm text-label-sm text-on-surface-variant">Current CGPA</span>

<div className="flex items-baseline gap-1.5">

<span className="font-headline-lg text-headline-lg text-on-surface font-bold">{currentCGPA.toFixed(2)}</span>

<span className="font-label-sm text-label-sm text-tertiary font-bold">+0.14 vs S4</span>

</div>

</div>

<div className="p-3.5 rounded-DEFAULT bg-surface-container-low flex flex-col gap-1">

<span className="font-label-sm text-label-sm text-on-surface-variant">Completed Credits</span>

<div className="flex items-baseline gap-1.5">

<span className="font-headline-lg text-headline-lg text-on-surface font-bold">{completedCredits}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant">/ {programTotal}</span>

</div>

</div>

<div className="p-3.5 rounded-DEFAULT bg-surface-container-low flex flex-col gap-1">

<span className="font-label-sm text-label-sm text-on-surface-variant">Remaining Credits</span>

<div className="flex items-baseline gap-1.5">

<span className="font-headline-lg text-headline-lg text-secondary font-bold">{remainingCredits}</span>

<span className="font-label-sm text-label-sm text-on-surface-variant">({simulatedSems.length} Sems)</span>

</div>

</div>

<div className="p-3.5 rounded-DEFAULT bg-surface-container-low flex flex-col gap-1">

<span className="font-label-sm text-label-sm text-on-surface-variant">Degree Completion</span>

<div className="flex items-baseline gap-1.5">

<span className="font-headline-lg text-headline-lg text-on-surface font-bold">{programTotal > 0 ? ((completedCredits / programTotal) * 100).toFixed(1) : 0}%</span>

<span className="font-label-sm text-label-sm text-on-surface-variant">Done</span>

</div>

</div>

</div>

<div className="flex flex-col gap-2">

<div className="flex justify-between items-center text-label-sm font-label-sm text-on-surface-variant">

<span>Overall Degree Credit Bar</span>

<span className="font-bold text-on-surface">78 of {programTotal} Credits</span>

</div>

<div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden flex">

<div className="bg-primary h-full rounded-full transition-all duration-500" style={{width: `${programTotal > 0 ? (completedCredits / programTotal) * 100 : 0}%`}}></div>

</div>

</div>

</div>

</div>

<div className="lg:col-span-7 flex flex-col">

<div className="h-full bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container-lowest p-6 lg:p-8 rounded-lg shadow-sm flex flex-col justify-between gap-6 relative overflow-hidden">

<div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-primary-fixed/20 blur-2xl pointer-events-none"></div>

<div className="flex flex-wrap items-center justify-between gap-3 relative z-10">

<div className="flex items-center gap-2">

<span className="material-symbols-outlined text-[22px] text-primary">psychology</span>

<span className="font-headline-sm text-headline-sm text-on-surface">Requirement Engine</span>

</div>

<span className="px-3.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md font-bold tracking-wide" id="feasibilityBadge">

            Challenging but Achievable

          </span>

</div>

<div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-auto relative z-10">

<div className="sm:col-span-6 flex flex-col">

<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Required Average Future GPA</span>

<div className="flex items-baseline gap-2 mt-1">

<span className="font-display-lg text-display-lg text-primary tracking-tight font-extrabold" id="requiredGpaDisplay">{requiredFutureGPA > 0 ? requiredFutureGPA.toFixed(2) : "0.00"}</span>

<span className="font-headline-md text-headline-md text-outline">/ 10.0</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant mt-2">

              Across Semesters 5, 6, 7, and 8 (82 total planned credits)

            </p>

</div>

<div className="sm:col-span-6 flex flex-col items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur rounded-DEFAULT shadow-sm">

<svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">

<circle className="text-surface-container-high" cx="60" cy="60" fill="none" r="50" stroke="currentColor" strokeWidth="10"></circle>

<circle className="text-primary transition-all duration-700" cx="60" cy="60" fill="none" id="gaugeRing" r="50" stroke="currentColor" strokeDasharray="314.159" strokeDashoffset="14.1" strokeLinecap="round" strokeWidth="10"></circle>

</svg>

<div className="-mt-24 flex flex-col items-center pointer-events-none mb-6">

<span className="font-headline-lg text-headline-lg text-on-surface font-extrabold" id="gaugePercent">95.5%</span>

<span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Intensity</span>

</div>

</div>

</div>

<div className="p-4 rounded-DEFAULT bg-surface-container-high/60 relative z-10 flex items-start gap-3.5">

<span className="material-symbols-outlined text-[20px] text-primary shrink-0 mt-0.5">info</span>

<p className="font-body-sm text-body-sm text-on-surface leading-relaxed" id="dynamicExplanation">

            To elevate your <strong className="text-on-surface">{currentCGPA.toFixed(2)}</strong> to <strong className="text-primary">{targetCGPA.toFixed(2)}</strong> over <strong className="text-on-surface">82 remaining credits</strong>, you need an average semester GPA of <strong className="text-primary">{requiredFutureGPA > 0 ? requiredFutureGPA.toFixed(2) : "0.00"}</strong> across your remaining 4 semesters.

          </p>

</div>

</div>

</div>

</div>

<div className="flex flex-col gap-4">

<div className="flex items-center justify-between">

<div className="flex items-center gap-2.5">

<span className="material-symbols-outlined text-[22px] text-secondary">explore</span>

<h2 className="font-headline-lg text-headline-lg text-on-surface">Target Scenario Outcomes</h2>

</div>

<span className="font-label-md text-label-md text-on-surface-variant hidden sm:inline">Calculated against 82 remaining credits</span>

</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

<div className="p-5 rounded-lg bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md">

<div className="flex flex-col gap-2">

<span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold self-start">

            Scenario 1

          </span>

<span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Maintain 8.50 GPA</span>

<p className="font-body-sm text-body-sm text-on-surface-variant">Conservative progression</p>

</div>

<div className="flex flex-col gap-2 pt-3">

<div className="flex items-baseline justify-between">

<span className="font-label-sm text-label-sm text-outline">Projected CGPA</span>

<span className="font-headline-md text-headline-md font-bold text-on-surface">8.46</span>

</div>

<span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm text-center">

            Below Target (Safe Passing)

          </span>

</div>

</div>

<div className="p-5 rounded-lg bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md">

<div className="flex flex-col gap-2">

<span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold self-start">

            Scenario 2

          </span>

<span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Attain {targetCGPA.toFixed(2)} GPA</span>

<p className="font-body-sm text-body-sm text-on-surface-variant">Consistent excellence</p>

</div>

<div className="flex flex-col gap-2 pt-3">

<div className="flex items-baseline justify-between">

<span className="font-label-sm text-label-sm text-outline">Projected CGPA</span>

<span className="font-headline-md text-headline-md font-bold text-on-surface">8.72</span>

</div>

<span className="px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm text-center font-semibold">

            Good Growth (+0.30)

          </span>

</div>

</div>

<div className="p-5 rounded-lg bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md">

<div className="flex flex-col gap-2">

<span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold self-start">

            Scenario 3

          </span>

<span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Attain 9.50 GPA</span>

<p className="font-body-sm text-body-sm text-on-surface-variant">Honor Roll standard</p>

</div>

<div className="flex flex-col gap-2 pt-3">

<div className="flex items-baseline justify-between">

<span className="font-label-sm text-label-sm text-outline">Projected CGPA</span>

<span className="font-headline-md text-headline-md font-bold text-tertiary">8.97</span>

</div>

<span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm text-center font-bold">

            Very Close (-0.03 from 9.0)

          </span>

</div>

</div>

<div className="p-5 rounded-lg bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md ring-2 ring-primary/20">

<div className="flex flex-col gap-2">

<span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold self-start">

            Scenario 4

          </span>

<span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Attain 9.75 GPA</span>

<p className="font-body-sm text-body-sm text-on-surface-variant">Top Dean's List marks</p>

</div>

<div className="flex flex-col gap-2 pt-3">

<div className="flex items-baseline justify-between">

<span className="font-label-sm text-label-sm text-outline">Projected CGPA</span>

<span className="font-headline-md text-headline-md font-bold text-primary">9.10</span>

</div>

<span className="px-2.5 py-1 rounded-full bg-primary text-on-primary font-label-sm text-label-sm text-center font-bold shadow-sm">

            Target Exceeded! 🎯

          </span>

</div>

</div>

<div className="p-5 rounded-lg bg-surface-container-lowest shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md">

<div className="flex flex-col gap-2">

<span className="px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold self-start">

            Maximum Possible

          </span>

<span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Perfect 10.0 GPA</span>

<p className="font-body-sm text-body-sm text-on-surface-variant">All 'S' Grades throughout</p>

</div>

<div className="flex flex-col gap-2 pt-3">

<div className="flex items-baseline justify-between">

<span className="font-label-sm text-label-sm text-outline">Max CGPA Cap</span>

<span className="font-headline-md text-headline-md font-bold text-on-surface">9.23</span>

</div>

<span className="px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm text-center font-bold">

            Mathematical Ceiling

          </span>

</div>

</div>

</div>

</div>

<div className="bg-surface-container-lowest p-6 lg:p-8 rounded-lg shadow-sm flex flex-col gap-6">

<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

<div className="flex items-center gap-2.5">

<div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">

<span className="material-symbols-outlined text-[22px]">tune</span>

</div>

<div>

<h2 className="font-headline-sm text-headline-sm text-on-surface">Personalized Semester-by-Semester Roadmap</h2>

<p className="font-body-sm text-body-sm text-on-surface-variant">Adjust sliders to model exact semester GPA outcomes and track progressive CGPA build-up.</p>

</div>

</div>

<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">

<span className="w-2 h-2 rounded-full bg-tertiary"></span>

<span id="roadmapOutcomeIndicator">Roadmap Achieves: {targetCGPA.toFixed(2)} CGPA</span>

</div>

</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {simulatedSems.map((s, index) => {
          const runPts = totalGradePoints + simulatedSems.slice(0, index + 1).reduce((sum, sx) => sum + sx.gpa * sx.credits, 0);
          const runCr = completedCredits + simulatedSems.slice(0, index + 1).reduce((sum, sx) => sum + sx.credits, 0);
          const runCgpa = (runPts / runCr).toFixed(2);
          return (
            <div key={index} className="p-5 rounded-DEFAULT bg-surface-container-low flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-lg text-label-lg text-on-surface font-bold">Semester {s.sem}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{s.credits} Credits Planned</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-bold">Upcoming</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-outline">Projected GPA</span>
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">{s.gpa.toFixed(2)}</span>
                </div>
                <input className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary" max="10.00" min="7.00" step="0.05" type="range" value={s.gpa} onChange={(e) => handleSimGpaChange(index, parseFloat(e.target.value))}/>
                <div className="flex justify-between text-label-sm font-label-sm text-outline">
                  <span>7.00</span>
                  <span>8.50</span>
                  <span>10.00</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Running CGPA</span>
                <span className="font-label-lg text-label-lg font-bold text-on-surface">{runCgpa}</span>
              </div>
            </div>
          );
        })}
        </div>

<div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4"></div>

<div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">

<div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">

<span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>

<span>All 82 remaining credits factored into progression trajectory.</span>

</div>

<div className="flex items-center gap-3 w-full sm:w-auto">

<button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-secondary text-on-secondary hover:bg-secondary-container font-label-lg text-label-lg transition-all shadow-md" id="saveGoalBtn" type="button">

<span className="material-symbols-outlined text-[20px]">save</span>

<span>Save Roadmap as Study Goal</span>

</button>

</div>

</div>

</div>

<div className="p-6 rounded-lg bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-6">

<div className="flex items-center gap-4">

<div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shrink-0">

<span className="material-symbols-outlined text-[26px]">insights</span>

</div>

<div className="flex flex-col">

<h3 className="font-headline-sm text-headline-sm text-on-surface">Academic Strategy Recommendation</h3>

<p className="font-body-sm text-body-sm text-on-surface-variant">

          In Semester 5, prioritize heavy-credit courses like Algorithms &amp; Operating Systems (4 credits each) to build momentum toward the target.

        </p>

</div>

</div>

<div className="flex items-center gap-2 shrink-0">

<span className="px-3 py-1 rounded-full bg-surface-container-lowest text-primary font-label-md text-label-md font-bold shadow-sm">

        Course Load: Optimal (21 Cr)

      </span>

</div>

</div>

</div>

</main>
  );
};

export default FutureProjection;
