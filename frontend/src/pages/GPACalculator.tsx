import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Save, Sparkles, BookOpen, Calculator, UploadCloud, ChevronRight, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const GPACalculator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [pastSemesters, setPastSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Core data
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // Modes: 'manual' or 'vtop'
  const [mode, setMode] = useState<'manual' | 'vtop'>('manual');
  
  // VTOP state
  const [vtopText, setVtopText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [vtopPreview, setVtopPreview] = useState<any[]>([]);
  const [vtopStep, setVtopStep] = useState<1 | 2 | 3>(1); // 1: Paste, 2: Review, 3: Confirm
  
  // Manual state
  const [saving, setSaving] = useState(false);
  const [semesterSelection, setSemesterSelection] = useState<number>(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Grade Points based on 10 point scale by default, or 4 point
  const gradeOptions = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
  const gradePoints: Record<string, number> = {
    'S': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [subRes, profRes, semRes] = await Promise.all([
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/current-semester/subjects`, { headers }),
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, { headers }),
          axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/semesters`, { headers })
        ]);
        
        setProfile(profRes.data);
        const history = semRes.data.filter((s: any) => s.semester_number !== 999);
        setPastSemesters(history);
        
        if (subRes.data && subRes.data.length > 0) {
           setSubjects(subRes.data.map((s:any) => ({...s, saved: true})));
        } else {
           // Provide empty subject
           setSubjects([{ id: 'temp-'+Date.now(), name: '', code: '', credits: 3, grade: 'A', saved: false }]);
        }
        
        const calcSem = (profRes.data.completed_semesters || 0) + 1;
        setSemesterSelection(calcSem);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddRow = () => {
    setSubjects(prev => [...prev, { id: 'temp-'+crypto.randomUUID(), name: '', code: '', credits: 3, grade: 'A', saved: false }]);
  };

  const handleUpdateSubject = (id: string | number, field: string, value: any) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value, saved: false } : s));
  };

  const handleRemoveSubject = (id: string | number) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const handleSaveManual = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api';
      
      // Filter out empty rows
      const validSubjects = subjects.filter(s => s.name.trim() !== '' && s.credits > 0);
      
      const payload = validSubjects.map(s => ({
         name: s.name,
         code: s.code || 'NA',
         credits: Number(s.credits),
         type: 'Theory',
         grade: s.grade,
         grade_points: gradePoints[s.grade]
      }));

      await axios.post(`${baseUrl}/current-semester/subjects/batch`, { subjects: payload }, { headers });
      
      const semNum = (profile?.completed_semesters || 0) + 1;
      const calcTotalCredits = validSubjects.reduce((sum, s) => sum + Number(s.credits), 0);
      const calcTotalPoints = validSubjects.reduce((sum, s) => sum + (Number(s.credits) * (gradePoints[s.grade] || 0)), 0);
      const calcGPA = calcTotalCredits > 0 ? (calcTotalPoints / calcTotalCredits) : 0;

      await axios.post(`${baseUrl}/semesters`, {
        semester_number: semNum,
        gpa: calcGPA,
        credits: calcTotalCredits
      }, { headers });
      
      // Update completed_semesters to ensure next current semester increments
      if (profile) {
        await axios.post(`${baseUrl}/profile`, {
          ...profile,
          completed_semesters: Math.max(profile.completed_semesters || 0, semNum)
        }, { headers });
      }
      
      alert('Saved successfully!');
      navigate('/history');
    } catch (err) {
      alert('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEverything = async () => {
    setIsDeletingAll(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api';
      
      await axios.delete(`${baseUrl}/current-semester/subjects/all`, { headers });
      
      setSubjects([]);
      setVtopPreview([]);
      setVtopText('');
      setVtopStep(1);
      setShowDeleteConfirm(false);
    } catch (err) {
      alert('Failed to delete everything. Please try again.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleParseVTOP = async () => {
    if (!vtopText.trim()) return;
    setIsParsing(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.post(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/timetable/parse`, { text: vtopText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.subjects && res.data.subjects.length > 0) {
        setVtopPreview(res.data.subjects.map((s:any, idx:number) => ({...s, id: 'preview-'+idx, grade: 'A'})));
        setVtopStep(2);
      } else {
        alert('No subjects detected. Please ensure you copied the timetable correctly.');
      }
    } catch (err) {
      alert('Error parsing timetable');
    } finally {
      setIsParsing(false);
    }
  };

  const handleUpdatePreview = (id: string, field: string, value: any) => {
    setVtopPreview(vtopPreview.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSaveVTOP = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api';
      
      const payload = vtopPreview.map(s => ({
         name: s.name,
         code: s.code || 'NA',
         credits: Number(s.credits),
         type: s.type || 'Theory',
         grade: s.grade,
         grade_points: gradePoints[s.grade]
      }));

      await axios.post(`${baseUrl}/current-semester/subjects/batch`, { subjects: payload }, { headers });
      
      setMode('manual');
      // Fetch fresh subjects, ensuring we ONLY get what was just saved
      const subRes = await axios.get(`${baseUrl}/current-semester/subjects`, { headers });
      setSubjects(subRes.data.map((s:any) => ({...s, saved: true})));
      setVtopPreview([]);
      setVtopText('');
      setVtopStep(1);
    } catch (err) {
      alert('Failed to save imported subjects.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center bg-surface">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!profile || Object.keys(profile).length === 0) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center bg-surface p-4 text-center">
        <div className="w-16 h-16 bg-surface-container-low text-primary rounded-full flex items-center justify-center mb-4">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-2">Profile Incomplete</h2>
        <p className="text-on-surface-variant max-w-md mx-auto mb-6">Complete your Profile Setup to use the GPA Calculator.</p>
        <Link to="/profile" className="bg-primary text-on-primary font-bold py-2.5 px-6 rounded-lg hover:bg-primary/90 transition-colors">
          Go to Profile Setup
        </Link>
      </div>
    );
  }

  const currentSemesterNumber = (profile.completed_semesters || 0) + 1;

  // Calculations for Manual Mode
  const validForCalc = subjects.filter(s => s.name.trim() !== '' && s.credits > 0);
  const currentTotalCredits = validForCalc.reduce((sum, s) => sum + Number(s.credits), 0);
  const currentTotalPoints = validForCalc.reduce((sum, s) => sum + (Number(s.credits) * (gradePoints[s.grade] || 0)), 0);
  const currentGPA = currentTotalCredits > 0 ? (currentTotalPoints / currentTotalCredits) : 0;
  
  const pastTotalCredits = pastSemesters.reduce((sum, s) => sum + s.credits, 0);
  const pastTotalPoints = pastSemesters.reduce((sum, s) => sum + (s.credits * s.gpa), 0);
  
  const overallCredits = pastTotalCredits + currentTotalCredits;
  const overallPoints = pastTotalPoints + currentTotalPoints;
  const projectedCGPA = overallCredits > 0 ? (overallPoints / overallCredits) : 0;

  return (
    <main className="w-full min-h-screen pt-8 pb-20 lg:pb-10 bg-surface px-4 lg:px-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight">Semester {currentSemesterNumber} GPA Calculator</h1>
            <p className="text-sm text-on-surface-variant font-medium mt-1">Calculate your Semester {currentSemesterNumber} GPA and projected CGPA.</p>
          </div>
          <div className="flex bg-surface-container-low rounded-lg border border-outline-variant p-1">
            <button 
              onClick={() => setMode('manual')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'manual' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface hover:bg-surface-container'}`}
            >
              Manual Entry
            </button>
            <button 
              onClick={() => setMode('vtop')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${mode === 'vtop' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface hover:bg-surface-container'}`}
            >
              VTOP Import
            </button>
          </div>
        </div>

        {mode === 'manual' && (
          <div className="flex flex-col gap-8">
            
            {/* Step 1: Semester Selection */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-6 shadow-sm flex flex-col gap-4">
              <h2 className="font-bold text-on-surface flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs">1</span>
                Select Semester
              </h2>
              <div className="max-w-xs">
                <select 
                  className="w-full bg-surface-container-high border-none text-on-surface rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary font-bold"
                  value={semesterSelection}
                  onChange={(e) => setSemesterSelection(Number(e.target.value))}
                >
                  <option value={currentSemesterNumber}>Current Semester (Sem {currentSemesterNumber})</option>
                  <option value={999}>Custom / Planning</option>
                </select>
              </div>
            </div>

            {/* Step 2: Subjects */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs">2</span>
                  Enter Subjects & Grades
                </h2>
                <button 
                  onClick={handleAddRow}
                  className="text-sm font-bold text-primary bg-primary-container px-3 py-1.5 rounded-lg hover:bg-primary-container/80 transition-colors flex items-center gap-1"
                >
                  <Plus size={16} /> Add Row
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      <th className="py-3 px-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider w-2/5">Subject Name</th>
                      <th className="py-3 px-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider w-1/5">Course Code</th>
                      <th className="py-3 px-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider w-1/6">Credits</th>
                      <th className="py-3 px-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider w-1/6">Expected Grade</th>
                      <th className="py-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-on-surface-variant font-medium">
                          No subjects added. Click "Add Row" to start.
                        </td>
                      </tr>
                    ) : (
                      subjects.map((sub, i) => (
                      <tr key={sub.id} className="border-b border-outline-variant last:border-none hover:bg-surface-container-low transition-colors group">
                        <td className="py-2 px-2">
                          <input 
                            type="text" 
                            placeholder="e.g. Software Engineering"
                            value={sub.name}
                            onChange={(e) => handleUpdateSubject(sub.id, 'name', e.target.value)}
                            className="w-full bg-surface-container-highest border-none rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary font-medium placeholder:text-outline"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input 
                            type="text" 
                            placeholder="e.g. CSE3001"
                            value={sub.code}
                            onChange={(e) => handleUpdateSubject(sub.id, 'code', e.target.value)}
                            className="w-full bg-surface-container-highest border-none rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary placeholder:text-outline"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input 
                            type="number" 
                            min="1" max="10"
                            value={sub.credits}
                            onChange={(e) => handleUpdateSubject(sub.id, 'credits', Number(e.target.value))}
                            className="w-full bg-surface-container-highest border-none rounded-lg px-3 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select 
                            value={sub.grade}
                            onChange={(e) => handleUpdateSubject(sub.id, 'grade', e.target.value)}
                            className="w-full bg-surface-container-highest border-none rounded-lg px-3 py-2 text-sm text-on-surface font-bold focus:ring-2 focus:ring-primary"
                          >
                            {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <button 
                            onClick={() => handleRemoveSubject(sub.id)}
                            title="Delete subject"
                            className="p-2 rounded-lg text-outline hover:bg-error-container hover:text-error transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step 3 & 4: Calculate & Save */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-primary rounded-DEFAULT p-6 shadow-sm text-on-primary flex flex-col justify-between">
                  <div>
                    <h2 className="font-bold mb-4 flex items-center gap-2 opacity-90">
                      <span className="w-6 h-6 rounded-full bg-surface-container-lowest/20 flex items-center justify-center text-xs">3</span>
                      Current Semester
                    </h2>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[42px] font-extrabold tracking-tighter leading-none">{currentGPA.toFixed(2)}</span>
                    </div>
                    <p className="text-xs font-bold text-on-primary/80 uppercase tracking-widest">Semester {currentSemesterNumber} GPA</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/20">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Credits</div>
                      <div className="text-xl font-bold">{currentTotalCredits}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Grade Points</div>
                      <div className="text-xl font-bold">{currentTotalPoints}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary-container rounded-DEFAULT p-6 shadow-sm text-on-primary-container flex flex-col justify-between">
                  <div>
                    <h2 className="font-bold mb-4 flex items-center gap-2 opacity-90">
                      <Sparkles size={18} />
                      CGPA After This Semester
                    </h2>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[42px] font-extrabold tracking-tighter leading-none">{projectedCGPA.toFixed(2)}</span>
                    </div>
                    <p className="text-xs font-bold text-on-primary-container/80 uppercase tracking-widest">Projected Cumulative</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-black/10">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Total Credits</div>
                      <div className="text-xl font-bold">{overallCredits}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="font-bold text-on-surface mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs">4</span>
                    Save to Profile
                  </h2>
                  <p className="text-sm text-on-surface-variant mb-6">Saving this will update your current semester's academic standing and sync with your dashboard.</p>
                </div>
                
                <button 
                  onClick={handleSaveManual}
                  disabled={saving || validForCalc.length === 0}
                  className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : <Save size={20} />}
                  Save Semester
                </button>
              </div>

            </div>

            {/* Danger Zone */}
            <div className="mt-8 border-t border-error/20 pt-8">
              <div className="bg-error-container/10 border border-error/20 rounded-DEFAULT p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-error flex items-center gap-2">
                    <AlertTriangle size={18} />
                    Danger Zone
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-1">Remove all subjects and reset this GPA calculation.</p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="whitespace-nowrap py-2.5 px-6 rounded-lg bg-error text-on-error font-bold shadow-sm hover:bg-error/90 transition-colors"
                >
                  Delete Everything
                </button>
              </div>
            </div>

          </div>
        )}

        {mode === 'vtop' && (
          <div className="flex flex-col gap-6">
            
            {/* VTOP Step Progress */}
            <div className="flex items-center justify-between mb-2">
              {[
                { step: 1, label: 'Paste Data' },
                { step: 2, label: 'Review & Edit' },
                { step: 3, label: 'Confirm' }
              ].map((s, i, arr) => (
                <React.Fragment key={s.step}>
                  <div className="flex flex-col items-center gap-2 relative z-10 w-24">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${vtopStep >= s.step ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                      {s.step}
                    </div>
                    <span className={`text-xs font-bold text-center ${vtopStep >= s.step ? 'text-on-surface' : 'text-on-surface-variant'}`}>{s.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="flex-1 h-1 bg-surface-container-high -mt-6">
                      <div className="h-full bg-primary transition-all duration-300" style={{ width: vtopStep > s.step ? '100%' : '0%' }}></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {vtopStep === 1 && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-6 shadow-sm flex flex-col gap-4">
                <h3 className="font-bold text-on-surface">Paste VTOP Timetable / Grades</h3>
                <p className="text-sm text-on-surface-variant">Copy the text from your VTOP portal and paste it here. We will automatically extract the course names, codes, and credits.</p>
                <textarea 
                  className="w-full rounded-lg p-4 bg-surface-container-high text-on-surface font-mono text-xs outline-none focus:ring-2 focus:ring-primary shadow-inner border-none min-h-[200px]"
                  placeholder="Paste here... e.g. CSE3001 Software Engineering 3 Theory"
                  value={vtopText}
                  onChange={e => setVtopText(e.target.value)}
                />
                <button 
                  onClick={handleParseVTOP}
                  disabled={isParsing || !vtopText.trim()}
                  className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {isParsing ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : 'Extract Subjects'}
                </button>
              </div>
            )}

            {vtopStep === 2 && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-on-surface">Review Extracted Subjects</h3>
                    <p className="text-sm text-on-surface-variant mt-1">Make any corrections to the extracted data below.</p>
                  </div>
                  <button onClick={() => setVtopStep(1)} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                    <ArrowLeft size={16} /> Back to paste
                  </button>
                </div>
                
                <div className="overflow-x-auto border border-outline-variant rounded-lg mt-2">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low">
                      <tr className="border-b border-outline-variant">
                        <th className="py-3 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Subject Name</th>
                        <th className="py-3 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Code</th>
                        <th className="py-3 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider w-24">Credits</th>
                        <th className="py-3 px-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider w-32">Expected Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vtopPreview.map(sub => (
                        <tr key={sub.id} className="border-b border-outline-variant last:border-none hover:bg-surface-container-lowest">
                          <td className="py-2 px-2">
                            <input 
                              type="text" value={sub.name} onChange={(e) => handleUpdatePreview(sub.id, 'name', e.target.value)}
                              className="w-full bg-surface-container-highest border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input 
                              type="text" value={sub.code} onChange={(e) => handleUpdatePreview(sub.id, 'code', e.target.value)}
                              className="w-full bg-surface-container-highest border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input 
                              type="number" value={sub.credits} onChange={(e) => handleUpdatePreview(sub.id, 'credits', Number(e.target.value))}
                              className="w-full bg-surface-container-highest border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <select 
                              value={sub.grade} onChange={(e) => handleUpdatePreview(sub.id, 'grade', e.target.value)}
                              className="w-full bg-surface-container-highest border-none rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary font-bold"
                            >
                              {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-4">
                  <button 
                    onClick={() => setVtopStep(3)}
                    className="py-3 px-8 rounded-xl bg-primary text-on-primary font-bold shadow-sm hover:bg-primary/90 transition-all flex items-center gap-2"
                  >
                    Proceed to Confirm <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {vtopStep === 3 && (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-DEFAULT p-6 shadow-sm flex flex-col gap-6 items-center text-center max-w-lg mx-auto mt-4">
                <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">Ready to Save</h3>
                  <p className="text-sm text-on-surface-variant">You are about to import <b>{vtopPreview.length}</b> subjects into your current semester. This will replace any unsaved manual entries.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button 
                    onClick={() => setVtopStep(2)}
                    className="py-3.5 rounded-xl bg-surface-container text-on-surface font-bold hover:bg-surface-container-high transition-colors"
                  >
                    Edit Again
                  </button>
                  <button 
                    onClick={handleSaveVTOP}
                    disabled={saving}
                    className="py-3.5 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? 'Saving...' : 'Confirm & Save'}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-surface rounded-xl shadow-lg max-w-md w-full p-6 border border-outline-variant">
            <h3 className="text-xl font-bold text-on-surface mb-2">Delete Everything?</h3>
            <p className="text-on-surface-variant mb-6 text-sm">
              This will remove all subjects currently entered in the GPA Calculator and reset the calculator. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-2.5 rounded-lg font-bold text-on-surface hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEverything}
                disabled={isDeletingAll}
                className="px-5 py-2.5 rounded-lg font-bold bg-error text-on-error hover:bg-error/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeletingAll ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : null}
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default GPACalculator;
