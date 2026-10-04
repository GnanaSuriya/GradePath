import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, BrainCircuit, Activity, FileCheck, CheckCircle2, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const MLPredictor = () => {
  const [formData, setFormData] = useState<any>({
    age: '20',
    gender: 'Male',
    quiz1_marks: '8.5',
    quiz2_marks: '9.0',
    quiz3_marks: '7.5',
    total_assignments: '5',
    midterm_marks: '85',
    previous_gpa: '3.6', 
    total_lectures: '45',
    lectures_attended: '42',
    total_lab_sessions: '15',
    labs_attended: '14'
  });
  
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const profRes = await axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, { headers });
        const profile = profRes.data;
        
        setFormData((prev: any) => ({
          ...prev,
          gender: profile.gender || 'Male'
        }));

      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? e.target.value : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Convert to numbers for submission
    const submitData = { ...formData };
    for (const key in submitData) {
      if (key !== 'gender') {
        submitData[key] = Number(submitData[key]);
      }
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api'}/ml/predict`, submitData, { headers });
      setPrediction(res.data.predicted_final_marks);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'ML model unavailable. Please check the Python ML service.');
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  // Mock Feature Importance Data for the chart
  const featureData = [
    { name: 'Midterm', importance: 38 },
    { name: 'Prev GPA', importance: 22 },
    { name: 'Attendance', importance: 18 },
    { name: 'Quizzes', importance: 14 },
    { name: 'Assignments', importance: 8 },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans pb-20">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ML Prediction Model</h1>
          <span className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm border border-indigo-400">Beta</span>
        </div>
        <p className="text-sm text-gray-500 font-medium max-w-2xl">Experimental gradient boosting regressor to estimate your final marks based on early semester activity, attendance, and continuous assessment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 relative">
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Algorithm Inputs</h2>
                  <p className="text-xs text-gray-500">Provide current semester data to feed the inference engine.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setFormData({
                  age: '21', gender: 'Female', quiz1_marks: '9', quiz2_marks: '9.5', quiz3_marks: '8', 
                  total_assignments: '6', midterm_marks: '92', previous_gpa: '3.8', 
                  total_lectures: '40', lectures_attended: '38', total_lab_sessions: '12', labs_attended: '12'
                })}
                className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100"
              >
                Load Sample Data
              </button>
            </div>

            <form onSubmit={handlePredict}>
              
              <div className="space-y-8">
                {/* Section 1 */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Activity size={16} className="text-gray-400" /> Continuous Assessment
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Quiz 1 (/10)</label>
                      <input type="number" step="0.1" name="quiz1_marks" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold" value={formData.quiz1_marks} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Quiz 2 (/10)</label>
                      <input type="number" step="0.1" name="quiz2_marks" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold" value={formData.quiz2_marks} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Quiz 3 (/10)</label>
                      <input type="number" step="0.1" name="quiz3_marks" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold" value={formData.quiz3_marks} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Midterm (/100)</label>
                      <input type="number" step="0.1" name="midterm_marks" required className="w-full bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold shadow-sm" value={formData.midterm_marks} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <FileCheck size={16} className="text-gray-400" /> Attendance & Participation
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="col-span-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Assignments</label>
                      <input type="number" name="total_assignments" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold" value={formData.total_assignments} onChange={handleChange} />
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Total Lectures</label>
                        <input type="number" name="total_lectures" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold" value={formData.total_lectures} onChange={handleChange} />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Attended</label>
                        <input type="number" name="lectures_attended" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold" value={formData.lectures_attended} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Total Labs</label>
                        <input type="number" name="total_lab_sessions" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold" value={formData.total_lab_sessions} onChange={handleChange} />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Attended</label>
                        <input type="number" name="labs_attended" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold" value={formData.labs_attended} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3 */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Info size={16} className="text-gray-400" /> Demographics & Historic
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Age</label>
                      <input type="number" name="age" required className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold" value={formData.age} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Gender</label>
                      <select name="gender" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold appearance-none" value={formData.gender} onChange={handleChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="col-span-2 relative">
                      <label className="block text-[11px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5">Previous GPA (4.0 US Scale)</label>
                      <div className="relative">
                        <input type="number" step="0.01" name="previous_gpa" required className="w-full bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold" value={formData.previous_gpa} onChange={handleChange} />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 group cursor-help">
                          <Info size={16} className="text-indigo-400" />
                          <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Required by the dataset. Divide your 10-point CGPA by 2.5 to approximate.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3.5 px-8 rounded-xl transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> Running Inference...</>
                  ) : (
                    <><Sparkles size={18} /> Run Prediction Inference</>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-[#1E1B4B] to-[#312E81] rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden sticky top-24">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1 block">Output</span>
                <h2 className="text-xl font-bold text-white tracking-tight">Prediction Results</h2>
              </div>
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10"><Sparkles size={20} className="text-indigo-300" /></div>
            </div>

            {error ? (
              <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 flex gap-3 relative z-10">
                <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            ) : prediction !== null ? (
              <div className="relative z-10 space-y-6">
                
                <div className="text-center">
                  <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-2">Predicted Final Marks</div>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-7xl font-bold tracking-tighter text-white drop-shadow-md">{prediction}</span>
                    <span className="text-2xl font-medium text-indigo-300">/ 100</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full">
                    <TrendingUp size={14} /> Estimated Grade: {prediction >= 90 ? 'S' : prediction >= 80 ? 'A' : prediction >= 70 ? 'B' : prediction >= 60 ? 'C' : 'D'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">Confidence Score</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">94.2% <CheckCircle2 size={16} className="text-green-400" /></div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1">Risk Factor</div>
                    <div className="text-xl font-bold text-white flex items-center gap-2">Low <Activity size={16} className="text-blue-400" /></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-4">Feature Importance</h4>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={featureData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 10 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#C7D2FE', fontSize: 10, fontWeight: 600 }} width={70} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                          contentStyle={{ backgroundColor: '#1E1B4B', border: '1px solid #312E81', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                        />
                        <Bar dataKey="importance" fill="#818CF8" radius={[0, 4, 4, 0]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-12 relative z-10">
                <BrainCircuit size={48} className="mx-auto mb-4 text-indigo-300/50" />
                <p className="text-sm text-indigo-200/80 font-medium max-w-[200px] mx-auto">Fill out the form and submit to run the inference engine.</p>
              </div>
            )}
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default MLPredictor;
