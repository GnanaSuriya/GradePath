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
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6 font-sans pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Current Semester: Fall 2024</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Add your current subjects to calculate Sem {currentSem} GPA and see the impact on your CGPA.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Subjects */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="flex justify-between items-center pb-2">
            <h2 className="text-lg font-bold text-gray-900">{subjects.length} Subjects Added</h2>
            <button 
              onClick={() => setShowParser(!showParser)}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
            >
              <UploadCloud size={16} /> Import from VTOP
            </button>
          </div>

          {/* VTOP Parser Drawer (Conditional) */}
          {showParser && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 mb-6">
              <h2 className="text-lg font-bold text-blue-900 mb-2">Paste VTOP Timetable</h2>
              <p className="text-sm text-blue-700/70 mb-4">
                Copy your course timetable from VTOP and paste it below. We'll automatically extract the subjects and credits.
              </p>
              <textarea 
                className="w-full bg-white border border-blue-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all mb-4"
                rows={4} 
                placeholder="Paste VTOP text here..."
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
              />
              <div className="flex gap-3">
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm"
                  onClick={handleParse} 
                  disabled={isParsing || !pasteText}
                >
                  {isParsing ? 'Extracting...' : 'Extract Subjects'}
                </button>
                <button 
                  className="bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 text-sm font-bold py-2.5 px-5 rounded-xl transition-colors"
                  onClick={() => setShowParser(false)}
                >
                  Cancel
                </button>
              </div>

              {previewSubjects.length > 0 && (
                <div className="mt-6 pt-6 border-t border-blue-100">
                  <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2"><AlertCircle size={16} /> Verify Extracted Subjects</h3>
                  <div className="space-y-3 mb-4">
                    {previewSubjects.map((sub, idx) => (
                      <div key={idx} className="bg-white border border-blue-100 rounded-xl p-3 flex flex-wrap gap-3 items-center">
                        <input className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold" value={sub.code} onChange={(e) => {
                          const newP = [...previewSubjects]; newP[idx].code = e.target.value; setPreviewSubjects(newP);
                        }}/>
                        <input className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium min-w-[150px]" value={sub.name} onChange={(e) => {
                          const newP = [...previewSubjects]; newP[idx].name = e.target.value; setPreviewSubjects(newP);
                        }}/>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-gray-500">CR:</span>
                          <input type="number" className="w-12 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-center" value={sub.credits} onChange={(e) => {
                            const newP = [...previewSubjects]; newP[idx].credits = parseInt(e.target.value) || 0; setPreviewSubjects(newP);
                          }}/>
                        </div>
                        <button onClick={() => setPreviewSubjects(previewSubjects.filter((_, i) => i !== idx))} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg ml-auto">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-3 px-5 rounded-xl transition-colors shadow-sm shadow-green-600/20 flex items-center justify-center gap-2" onClick={handleSavePreview}>
                    <CheckCircle2 size={18} /> Confirm & Save Subjects
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Subject Cards */}
          {subjects.length === 0 && !showParser ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No subjects added yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                Add your current semester subjects manually or import them directly from your VTOP timetable.
              </p>
              <button onClick={() => setShowParser(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm inline-flex items-center gap-2">
                <UploadCloud size={18} /> Import from VTOP
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {subjects.map((sub, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-blue-200 transition-colors">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{sub.code}</span>
                      {sub.type && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${sub.type.includes('Lab') ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                          {sub.type}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-800 text-base leading-tight mb-3 pr-4">{sub.name}</h3>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</span>
                        <span className="text-sm font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">{sub.credits}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Target/Expected Grade</span>
                        <div className="relative">
                          <select 
                            className={`appearance-none font-bold text-sm px-3 py-1 pr-8 rounded-lg outline-none border cursor-pointer transition-colors ${sub.grade ? getGradeColor(sub.grade) : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                            value={sub.grade || ''} 
                            onChange={(e) => updateSubjectGrade(sub.id, e.target.value)}
                          >
                            <option value="">Select</option>
                            {Object.keys(gradePoints).map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 sm:w-28 shrink-0">
                    <div className="text-center">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Points</div>
                      <div className="text-xl font-bold text-blue-600">{(sub.credits * (sub.grade_points || 0)).toFixed(1)}</div>
                    </div>
                    <button 
                      onClick={() => deleteSubject(sub.id)} 
                      className="text-[11px] font-bold text-gray-400 hover:text-red-500 sm:mt-3 flex items-center gap-1 transition-colors"
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))}
              
              <button className="w-full flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-colors group">
                <div className="bg-white p-2 rounded-full border border-gray-200 shadow-sm group-hover:border-blue-200 mb-2 transition-colors">
                  <Plus size={20} className="group-hover:text-blue-600 text-gray-400" />
                </div>
                <span className="text-sm font-bold">Add Subject Manually</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-b from-[#111827] to-[#1F2937] rounded-3xl p-6 shadow-xl text-white sticky top-24">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Live Calculation</span>
                <h2 className="text-lg font-bold text-white tracking-tight">Sem {currentSem} Result</h2>
              </div>
              <div className="p-2 bg-white/10 rounded-xl"><Calculator size={20} className="text-blue-400" /></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Credits</div>
                <div className="text-2xl font-bold text-white">{totalCredits}</div>
              </div>
              <div className="bg-blue-600/20 rounded-2xl p-4 border border-blue-500/30">
                <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-1">Total Points</div>
                <div className="text-2xl font-bold text-blue-100">{totalWeighted.toFixed(1)}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 mb-6 text-gray-900 shadow-inner">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Est. SGPA</span>
                <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1"><TrendingUp size={12}/> High</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-gray-900 tracking-tight">{currentGPA.toFixed(2)}</span>
                <span className="text-lg font-medium text-gray-400">/{gradingSystem}</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-400">Subjects Graded</span>
                <span className="font-bold text-white">{subjects.filter(s => s.grade).length} of {subjects.length}</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                  style={{ width: `${subjects.length ? (subjects.filter(s => s.grade).length / subjects.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <Link to="/projection" className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 mb-3">
              View impact on CGPA <ArrowRight size={16} />
            </Link>
            <button className="w-full bg-transparent hover:bg-white/5 border border-white/20 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors">
              Save Semester to History
            </button>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default GPACalculator;
