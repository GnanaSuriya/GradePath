import { useState, useEffect } from 'react';
import axios from 'axios';

import { BookOpen, Plus, UploadCloud, ChevronDown, CheckCircle2, AlertCircle, X, Calculator, ArrowRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const GPACalculator = () => {
  // const { user } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  
  const [pasteText, setPasteText] = useState('');
  const [previewSubjects, setPreviewSubjects] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [showParser, setShowParser] = useState(false);

  // For 10-point scale:
  const gradePoints: Record<string, number> = {
    'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'A': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'B': return 'text-green-700 bg-green-50 border-green-200';
      case 'C': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'D': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'E': return 'text-red-600 bg-red-50 border-red-200';
      case 'F': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [subRes, profRes] = await Promise.all([
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/current-semester/subjects`, { headers }),
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, { headers })
        ]);
        
        setSubjects(subRes.data);
        setProfile(profRes.data);
      } catch (err) {
        console.error('Failed to fetch');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleParse = async () => {
    if (!pasteText) return;
    setIsParsing(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.post(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/timetable/parse`, { text: pasteText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreviewSubjects(res.data.subjects);
      if (res.data.subjects.length === 0) {
        alert('Some course information could not be identified. Please review or enter it manually.');
      }
    } catch (err) {
      alert('Error parsing timetable');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSavePreview = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.post(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/current-semester/subjects/batch`, { subjects: previewSubjects }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreviewSubjects([]);
      setPasteText('');
      setShowParser(false);
      // Reload subjects
      const subRes = await axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/current-semester/subjects`, { headers: { Authorization: `Bearer ${token}` } });
      setSubjects(subRes.data);
    } catch (err) {
      alert('Error saving subjects');
    }
  };

  const updateSubjectGrade = async (id: number, grade: string) => {
    const pts = gradePoints[grade] || 0;
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.put(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/current-semester/subjects/${id}`, { grade, grade_points: pts }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(subjects.map(s => s.id === id ? { ...s, grade, grade_points: pts } : s));
    } catch (err) {
      alert('Error updating grade');
    }
  };

  const addSubject = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api';
      await axios.post(
        `${baseUrl}/current-semester/subjects/batch`,
        { subjects: [{ code: 'NEW', name: 'New Subject', credits: 3, type: 'Theory' }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Reload subjects
      const subRes = await axios.get(
        `${baseUrl}/current-semester/subjects`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubjects(subRes.data);
    } catch (err) {
      console.error(err);
    }
  };
  const deleteSubject = async (id: number) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.delete(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/current-semester/subjects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (err) {
      alert('Error deleting subject');
    }
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const totalWeighted = subjects.reduce((sum, s) => sum + (s.credits * (s.grade_points || 0)), 0);
  const currentGPA = totalCredits === 0 ? 0 : totalWeighted / totalCredits;
  const currentSem = profile?.completed_semesters + 1 || 1;
  const gradingSystem = profile?.grading_system || 10;

  return (
    <main className="w-full min-h-screen pt-16 pb-20 lg:pb-10 bg-surface px-4 lg:px-8 max-w-7xl mx-auto"><div className="flex flex-col w-full">

{/* Interactive State Sync Overlay Modal: Bulk Import */}

<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm hidden opacity-0 transition-opacity duration-200" id="bulk-modal" style={{ display: showParser ? "flex" : "none", opacity: showParser ? 1 : 0 }}>

<div className="bg-surface-container-lowest rounded-xl max-w-xl w-full p-6 shadow-xl flex flex-col gap-4">

<div className="flex items-center justify-between">

<div className="flex items-center gap-2.5">

<div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">

<span className="material-symbols-outlined text-[20px]">content_paste</span>

</div>

<div>

<h3 className="font-headline-sm text-headline-sm text-on-surface">Bulk Paste / VTOP Import</h3>

<p className="font-body-sm text-body-sm text-on-surface-variant">Paste raw tab-separated or copied text from VTOP gradebook</p>

</div>

</div>

<button className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors" onClick={() => setShowParser(false)}>

<span className="material-symbols-outlined text-[20px]">close</span>

</button>

</div>

<div className="relative">

<textarea className="w-full rounded-DEFAULT p-3.5 bg-surface-container-low text-on-surface font-body-sm text-body-sm outline-none focus:bg-surface-container-lowest shadow-sm placeholder:text-outline" value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="CSE3001 Software Engineering 3 A

CSE3002 Operating Systems 4 S

MAT3004 Applied Statistics 3 A" rows={5}></textarea>

</div>

<div className="flex items-center justify-between pt-2">

<span className="font-label-sm text-label-sm text-on-surface-variant">Auto-detects course code, credits &amp; grade</span>

<div className="flex gap-2">

<button className="px-4 py-2 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors" onClick={() => setShowParser(false)}>Cancel</button>

<button className="px-5 py-2 rounded-full bg-primary-container text-on-primary font-label-md text-label-md shadow-sm hover:opacity-95 transition-all" onClick={handleParse}>Import Courses</button>

</div>

</div>

</div>

</div>

{/* Notification Toast */}

<div className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 z-50 flex items-center gap-2.5 px-4 py-3 rounded-DEFAULT bg-inverse-surface text-inverse-on-surface shadow-xl transform translate-y-16 opacity-0 transition-all duration-300 pointer-events-none" id="toast">

<span className="material-symbols-outlined text-[20px] text-tertiary-fixed">check_circle</span>

<span className="font-label-md text-label-md" id="toast-text">Changes updated seamlessly</span>

</div>

{/* Top Hero Bar / Metadata Cluster */}

<section className="mb-6 flex flex-col xl:flex-row xl:items-end justify-between gap-5">

<div className="flex flex-col gap-1.5 max-w-2xl">

<div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed">

<span className="material-symbols-outlined text-[16px]">verified</span>

<span className="font-label-sm text-label-sm uppercase tracking-wide">Autonomous Grade Simulation</span>

</div>

<h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">GPA Calculator</h1>

<p className="font-body-md text-body-md text-on-surface-variant">

        Calculate your semester GPA using your enrolled subjects, credits, and expected grades with university-calibrated grading algorithms.

      </p>

</div>

{/* Top Action Controls Row */}

<div className="flex flex-wrap items-center gap-2.5">

<button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-surface-container-lowest text-secondary font-label-lg text-label-lg shadow-sm hover:bg-surface-container-low transition-all" onClick={() => setShowParser(true)}>

<span className="material-symbols-outlined text-[18px]">cloud_upload</span>

<span>VTOP Bulk Import</span>

</button>

<button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-surface-container-lowest text-on-surface-variant font-label-lg text-label-lg shadow-sm hover:bg-error-container hover:text-on-error-container transition-all" id="reset-btn">

<span className="material-symbols-outlined text-[18px]">restart_alt</span>

<span>Reset</span>

</button>

<button className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary transition-all" id="add-subject-top">

<span className="material-symbols-outlined text-[20px]">add</span>

<span>Add Subject</span>

</button>

</div>

</section>

{/* Filter & University Scheme Toolbar */}

<section className="mb-6 p-4 rounded-lg bg-surface-container-lowest shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">

<div className="flex flex-wrap items-center gap-3">

<div className="flex items-center gap-2 bg-surface-container-low px-3.5 py-2 rounded-full">

<span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>

<label className="sr-only" htmlFor="sem-select">Select Semester</label>

<select className="bg-transparent font-label-lg text-label-lg text-on-surface outline-none cursor-pointer pr-2" id="sem-select">

<option>Semester 5 (Fall 2024-25)</option>

<option>Semester 6 (Winter 2024-25)</option>

<option>Semester 4 (Winter 2023-24)</option>

</select>

</div>

<div className="flex items-center gap-2 bg-surface-container-low px-3.5 py-2 rounded-full">

<span className="material-symbols-outlined text-[18px] text-tertiary">tune</span>

<label className="sr-only" htmlFor="scale-select">Grading Scale</label>

<select className="bg-transparent font-label-lg text-label-lg text-on-surface outline-none cursor-pointer pr-2" id="scale-select">

<option value="vit-10">VIT 10-Point Scale (S=10, A=9, B=8, C=7, D=6, E=4, F=0)</option>

<option value="us-4">Standard 4.0 Scale (A=4, B=3, C=2, D=1, F=0)</option>

<option value="relative-10">Relative Grading Band (Calculated Curve)</option>

</select>

</div>

</div>

{/* Quick Status Pill Indicators */}

<div className="flex items-center gap-3">

<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">

<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>

<span>Dean's Honors Range</span>

</div>

<button className="inline-flex items-center gap-1 text-primary hover:text-on-primary-fixed-variant font-label-md text-label-md transition-colors" id="toggle-formula-modal">

<span className="material-symbols-outlined text-[16px]">info</span>

<span>Grading Rules</span>

</button>

</div>

</section>

{/* Main Grid: Calculator Core (Left) + Sticky Score Command Hub (Right) */}

<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

{/* LEFT COLUMN: Subject Entry Rows (8 Cols) */}

<div className="lg:col-span-8 flex flex-col gap-4">

{/* Desktop Table Header (Hidden on Mobile) */}

<div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">

<span className="col-span-1">Seq</span>

<span className="col-span-4">Course &amp; Title</span>

<span className="col-span-2">Type / Cr</span>

<span className="col-span-2">CAT/Midterm</span>

<span className="col-span-2">Target Grade</span>

<span className="col-span-1 text-right">Points</span>

</div>

{/* Course Rows Container */}

<div className="flex flex-col gap-3" id="course-rows-container">
          {subjects.length === 0 && !showParser ? (
            <div className="text-center py-12 bg-surface-container-lowest rounded-DEFAULT border border-dashed border-outline">
              <h3 className="text-lg font-bold text-on-surface mb-2">No subjects added yet</h3>
              <p className="text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
                Add your current semester subjects manually or import them directly from your VTOP timetable.
              </p>
              <button onClick={() => setShowParser(true)} className="bg-primary hover:bg-primary-hover text-on-primary font-bold py-2.5 px-6 rounded-full transition-colors shadow-sm inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span> Import from VTOP
              </button>
            </div>
          ) : (
            subjects.map((sub, idx) => (
              <div key={sub.id || idx} className="course-row bg-surface-container-lowest rounded-DEFAULT p-4 md:py-3.5 shadow-sm hover:shadow-md transition-all flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-2 items-start md:items-center">
                <div className="flex items-center justify-between w-full md:w-auto md:col-span-1">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-outline cursor-grab">drag_indicator</span>
                    <span className="font-label-md text-label-md text-on-surface-variant">{idx + 1}</span>
                  </div>
                  <div className="flex md:hidden items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm">{sub.type || 'Course'}</span>
                    <span className="font-headline-sm text-headline-sm font-bold text-primary">{(sub.credits * (sub.grade_points || 0)).toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex flex-col w-full md:col-span-4">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">{sub.code}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{sub.name}</span>
                </div>
                <div className="w-full md:col-span-2 flex items-center justify-between md:justify-start">
                  <span className="md:hidden font-label-sm text-label-sm text-on-surface-variant">Format &amp; Credits</span>
                  <div className="bg-surface-container-low font-label-md text-label-md text-on-surface py-1.5 px-2.5 rounded-full outline-none">
                    {sub.credits} Credits
                  </div>
                </div>
                <div className="w-full md:col-span-2 flex items-center justify-between md:justify-start gap-1.5">
                  <span className="md:hidden font-label-sm text-label-sm text-on-surface-variant">Midterm / Internal</span>
                  <div className="flex items-center bg-surface-container-low px-2 py-1 rounded-DEFAULT">
                    <input className="w-14 bg-transparent font-label-md text-label-md text-on-surface outline-none text-center" type="text" placeholder="--/50" />
                  </div>
                </div>
                <div className="w-full md:col-span-2 flex items-center justify-between md:justify-start">
                  <span className="md:hidden font-label-sm text-label-sm text-on-surface-variant">Target Grade</span>
                  <select 
                    className="grade-select w-full md:w-auto bg-surface-container-high font-headline-sm text-headline-sm text-on-surface font-bold py-1.5 px-3 rounded-full outline-none transition-colors"
                    value={sub.grade || ''} 
                    onChange={(e) => updateSubjectGrade(sub.id, e.target.value)}
                  >
                    <option value="">Select</option>
                    {Object.keys(gradePoints).map(g => <option key={g} value={g}>{g} ({gradePoints[g]})</option>)}
                  </select>
                </div>
                <div className="hidden md:flex md:col-span-1 items-center justify-end gap-2">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">{(sub.credits * (sub.grade_points || 0)).toFixed(1)}</span>
                  <button onClick={() => deleteSubject(sub.id)} className="text-outline hover:text-error transition-colors p-1" title="Delete Course">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
                <div className="w-full flex md:hidden items-center justify-between pt-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Impact: {sub.credits} Cr × {sub.grade_points || 0} = {(sub.credits * (sub.grade_points || 0)).toFixed(1)} Pts</span>
                  <button onClick={() => deleteSubject(sub.id)} className="text-error font-label-sm text-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))
          )}
          </div>
          <button className="w-full py-4 rounded-DEFAULT bg-surface-container-low hover:bg-surface-container text-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 transition-all" id="add-subject-bottom" onClick={() => addSubject()}>

<span className="material-symbols-outlined text-[22px]">add_circle</span>

<span>+ Add Another Subject</span>

</button>

{/* Grade Scale Reference Card & Interactive Helper */}

<div className="mt-4 p-5 rounded-lg bg-surface-container-lowest shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">

<div className="flex items-center gap-3">

<div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0">

<span className="material-symbols-outlined text-[20px]">functions</span>

</div>

<div>

<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Calculation Standard</span>

<p className="font-headline-sm text-headline-sm text-on-surface">GPA = Σ(Credits × Grade Points) / Σ(Credits)</p>

</div>

</div>

{/* Grade Badges Pill Array */}

<div className="flex flex-wrap items-center gap-1.5">

<span className="px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">S: 10</span>

<span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">A: 9</span>

<span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-bold">B: 8</span>

<span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">C: 7</span>

<span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">D: 6</span>

<span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">E: 4</span>

<span className="px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">F: 0</span>

</div>

</div>

</div>

{/* RIGHT COLUMN: Sticky Live Result Command Card (4 Cols) */}

<div className="lg:col-span-4 sticky top-20 flex flex-col gap-4">

{/* Primary Live Score Card */}

<div className="bg-surface-container-lowest rounded-lg p-6 shadow-md flex flex-col gap-5 relative overflow-hidden">

{/* Ambient decorative gradient blurs */}

<div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary-fixed/40 blur-2xl pointer-events-none"></div>

<div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-tertiary-fixed/30 blur-2xl pointer-events-none"></div>

<div className="flex items-center justify-between relative z-10">

<div className="flex items-center gap-2">

<span className="material-symbols-outlined text-[20px] text-primary">insights</span>

<span className="font-label-lg text-label-lg text-on-surface uppercase tracking-wider font-bold">Semester Preview</span>

</div>

<span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">Class Distinction</span>

</div>

{/* Radial Score Display & Big Number */}

<div className="flex items-center justify-between gap-4 py-2 relative z-10">

<div className="flex flex-col">

<span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Calculated GPA</span>

<div className="flex items-baseline gap-1">

<span className="font-display-lg text-display-lg font-bold text-on-surface tracking-tight" id="gpa-display">9.14</span>

<span className="font-headline-sm text-headline-sm text-on-surface-variant font-medium">/ 10</span>

</div>

<span className="font-body-sm text-body-sm text-tertiary font-semibold flex items-center gap-1">

<span className="material-symbols-outlined text-[16px]">north_east</span>

<span>Exceeds Target (9.0)</span>

</span>

</div>

{/* Inline SVG Progress Gauge */}

<div className="relative w-24 h-24 shrink-0 flex items-center justify-center">

<svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">

<circle className="text-surface-container-high" cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeWidth="8"></circle>

<circle className="text-primary-container transition-all duration-700 ease-out" cx="50" cy="50" fill="none" id="gpa-ring" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="21.6" strokeLinecap="round" strokeWidth="8"></circle>

</svg>

<div className="absolute inset-0 flex flex-col items-center justify-center">

<span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Index</span>

<span className="font-headline-sm text-headline-sm font-bold text-on-surface" id="gpa-percent-display">91.4%</span>

</div>

</div>

</div>

{/* Metric Counter Grid */}

<div className="grid grid-cols-2 gap-3 pt-2 relative z-10">

<div className="p-3 rounded-DEFAULT bg-surface-container-low flex flex-col">

<span className="font-label-sm text-label-sm text-on-surface-variant">Total Credits</span>

<span className="font-headline-lg text-headline-lg font-bold text-on-surface" id="total-credits-display">21 Cr</span>

<span className="font-label-sm text-label-sm text-primary">6 Registered Units</span>

</div>

<div className="p-3 rounded-DEFAULT bg-surface-container-low flex flex-col">

<span className="font-label-sm text-label-sm text-on-surface-variant">Quality Points</span>

<div className="flex items-baseline gap-1">

<span className="font-headline-lg text-headline-lg font-bold text-on-surface" id="quality-points-display">192.0</span>

<span className="font-label-sm text-label-sm text-on-surface-variant">/ 210</span>

</div>

<span className="font-label-sm text-label-sm text-on-surface-variant">Max potential 210</span>

</div>

</div>

{/* Cumulative CGPA Shift Box */}

<div className="p-4 rounded-DEFAULT bg-surface-container flex flex-col gap-2 relative z-10">

<div className="flex items-center justify-between">

<span className="font-label-md text-label-md text-on-surface font-semibold">Impact on Cumulative CGPA</span>

<span className="material-symbols-outlined text-[18px] text-tertiary-container">rocket_launch</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant">

            Raises cumulative from <span className="font-bold text-on-surface">8.42</span> to <span className="font-bold text-primary" id="projected-cgpa">8.57</span> <span className="text-tertiary font-bold">(+0.15)</span> across 89 total credits.

          </p>

<div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">

<div className="bg-primary h-full rounded-full transition-all duration-500" id="cgpa-bar" style={{"width":"85.7%"}}></div>

</div>

</div>

{/* Primary Action CTA Cluster */}

<div className="flex flex-col gap-2.5 pt-1 relative z-10">

<button className="w-full py-3 rounded-full bg-primary-container text-on-primary font-headline-sm text-headline-sm shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2" id="save-history-btn">

<span className="material-symbols-outlined text-[20px]">save</span>

<span>Save to Semester History</span>

</button>

<button className="w-full py-2.5 rounded-full bg-surface-container text-on-surface font-label-lg text-label-lg hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2" id="export-btn">

<span className="material-symbols-outlined text-[18px]">download</span>

<span>Export Grade Sheet (PDF/CSV)</span>

</button>

</div>

</div>

{/* What-If Strategic Guidance Helper Box */}

<div className="p-5 rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-3">

<div className="flex items-center gap-2 text-secondary">

<span className="material-symbols-outlined text-[20px]">auto_awesome</span>

<span className="font-headline-sm text-headline-sm font-bold text-on-surface">Target Scenario Helper</span>

</div>

<p className="font-body-sm text-body-sm text-on-surface-variant">

          Want to break into the <span className="font-bold text-on-surface">9.50+</span> tier this semester?

        </p>

<div className="p-3 rounded-DEFAULT bg-secondary-fixed/50 flex flex-col gap-2">

<p className="font-label-md text-label-md text-on-secondary-fixed">

            Swap your <strong>B (8.0)</strong> in <strong>ECE2001 (Microprocessors)</strong> to an <strong>S (10.0)</strong> to jump your GPA to <span className="font-bold underline">9.52</span>!

          </p>

<button className="self-start px-3 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm hover:opacity-90 transition-opacity" id="apply-scenario-btn">

            Simulate S Grade in ECE2001

          </button>

</div>

<div className="flex items-center justify-between text-on-surface-variant pt-1 font-label-sm text-label-sm">

<span>Based on current internal test margins</span>

<Link className="text-primary hover:underline" to="#">View Advice</Link>

</div>

</div>

{/* Campus Benchmark Card */}

<div className="p-4 rounded-lg bg-surface-container-low flex items-center gap-3">

<span className="material-symbols-outlined text-[24px] text-on-surface-variant shrink-0">military_tech</span>

<div className="flex flex-col">

<span className="font-headline-sm text-headline-sm font-semibold text-on-surface">VIT Chennai 90th Percentile</span>

<span className="font-body-sm text-body-sm text-on-surface-variant">Students in CSE 5th Semester average 8.41 GPA</span>

</div>

</div>

</div>

</div>

{/* Interactive Logic & Micro-interactions */}



</div></main>
  );
};

export default GPACalculator;
