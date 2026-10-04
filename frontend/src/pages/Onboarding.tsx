import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    university: '',
    degree: '',
    specialization: '',
    total_semesters: '',
    expected_grad_year: '',
    total_program_credits: '',
    completed_semesters: '',
    grading_system: '10',
  });

  const [semestersData, setSemestersData] = useState<{semester_number: number, gpa: string, credits: string}[]>([]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSemesterChange = (index: number, field: string, value: string) => {
    const updated = [...semestersData];
    updated[index] = { ...updated[index], [field]: value };
    setSemestersData(updated);
  };

  const nextStep = () => {
    setErrorMsg('');
    if (step === 2) {
      const count = parseInt(formData.completed_semesters) || 0;
      let newSems = [...semestersData];
      if (newSems.length < count) {
        for (let i = newSems.length; i < count; i++) {
          newSems.push({ semester_number: i + 1, gpa: '', credits: '' });
        }
      } else if (newSems.length > count) {
        newSems = newSems.slice(0, count);
      }
      setSemestersData(newSems);
      
      if (count === 0) {
        setStep(4);
        return;
      }
    }
    setStep(prev => Math.min(4, prev + 1));
  };

  const prevStep = () => {
    setErrorMsg('');
    if (step === 4 && (parseInt(formData.completed_semesters) || 0) === 0) {
      setStep(2);
      return;
    }
    setStep(prev => Math.max(1, prev - 1));
  };

  const currentCGPA = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;
    semestersData.forEach(sem => {
      const gpa = parseFloat(sem.gpa);
      const credits = parseFloat(sem.credits);
      if (!isNaN(gpa) && !isNaN(credits) && credits > 0) {
        totalCredits += credits;
        totalPoints += (gpa * credits);
      }
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  }, [semestersData]);

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const payload = {
        ...formData,
        current_semester: (parseInt(formData.completed_semesters) || 0) + 1,
        semesters: semestersData.map(s => ({
          semester_number: s.semester_number,
          gpa: parseFloat(s.gpa),
          credits: parseInt(s.credits)
        })).filter(s => !isNaN(s.gpa) && !isNaN(s.credits))
      };

      await axios.post(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = '/';
    } catch (err: any) {
      console.error("PROFILE SAVE ERROR:", err);
      setErrorMsg('Unable to save your profile. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] py-12 flex flex-col items-center justify-center px-4 font-sans text-gray-900">
      <div className="w-full max-w-3xl">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-xl font-extrabold text-blue-600 mb-2 uppercase tracking-wide">GradePath</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Setup</h2>
          <p className="text-gray-500">Let's set up your academic profile.</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-between relative max-w-lg mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -z-10 -translate-y-1/2 transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
          
          {[
            { num: 1, label: 'Personal' },
            { num: 2, label: 'Academic' },
            { num: 3, label: 'Results' },
            { num: 4, label: 'Review' }
          ].map(s => (
            <div key={s.num} className="flex flex-col items-center gap-2 bg-[#ffffff] px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= s.num ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                {step > s.num ? <CheckCircle2 size={16} /> : s.num}
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-bold hidden sm:block ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>{s.label}</span>
            </div>
          ))}
        </div>
        
        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-[#ffffff] rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-10">
            
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">Full Name</label>
                    <input required type="text" name="name" className="w-full bg-[#ffffff] border border-gray-200 text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400" value={formData.name} onChange={handleFormChange} placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">Gender</label>
                    <select name="gender" className="w-full bg-[#ffffff] border border-gray-200 text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none" value={formData.gender} onChange={handleFormChange}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Academic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">Institution / University</label>
                      <input required type="text" name="university" className="w-full bg-[#ffffff] border border-gray-200 text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400" value={formData.university} onChange={handleFormChange} placeholder="e.g. VIT Chennai" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Degree</label>
                      <input required type="text" name="degree" className="w-full bg-[#ffffff] border border-gray-200 text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400" value={formData.degree} onChange={handleFormChange} placeholder="e.g. Bachelor of Technology" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Specialization / Major</label>
                      <input required type="text" name="specialization" className="w-full bg-[#ffffff] border border-gray-200 text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400" value={formData.specialization} onChange={handleFormChange} placeholder="e.g. Computer Science" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">Grading System</label>
                      <select name="grading_system" className="w-full bg-[#ffffff] border border-gray-200 text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none" value={formData.grading_system} onChange={handleFormChange}>
                        <option value="10">10-Point Scale (Standard UGC / Autonomous)</option>
                        <option value="4">4-Point Scale (US Standard)</option>
                        <option value="5">5-Point Scale</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Program Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Duration (Total Semesters)</label>
                      <input required type="number" min="1" name="total_semesters" className="w-full bg-[#ffffff] border border-gray-200 text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" value={formData.total_semesters} onChange={handleFormChange} placeholder="e.g. 8" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Completed Semesters</label>
                      <input required type="number" min="0" name="completed_semesters" className="w-full bg-[#ffffff] border border-gray-200 text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" value={formData.completed_semesters} onChange={handleFormChange} placeholder="e.g. 2" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Total Required Credits</label>
                      <input required type="number" min="1" name="total_program_credits" className="w-full bg-[#ffffff] border border-gray-200 text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" value={formData.total_program_credits} onChange={handleFormChange} placeholder="e.g. 160" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Expected Graduation Year</label>
                      <input required type="number" min="2020" name="expected_grad_year" className="w-full bg-[#ffffff] border border-gray-200 text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" value={formData.expected_grad_year} onChange={handleFormChange} placeholder="e.g. 2026" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Completed Semester Results</h3>
                <p className="text-sm text-gray-500 mb-6">Enter your GPA and credits for each semester you've completed.</p>
                
                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 pb-4">
                  {semestersData.map((sem, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-6 bg-[#ffffff]">
                      <h4 className="text-sm font-bold text-gray-900 mb-4">Semester {sem.semester_number}</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">GPA</label>
                          <input 
                            type="number" step="0.01" max={formData.grading_system} min="0" 
                            value={sem.gpa} 
                            onChange={(e) => handleSemesterChange(index, 'gpa', e.target.value)}
                            className="w-full bg-[#ffffff] border border-gray-200 text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="e.g. 8.50"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 block">Credits</label>
                          <input 
                            type="number" min="0" step="1" 
                            value={sem.credits} 
                            onChange={(e) => handleSemesterChange(index, 'credits', e.target.value)}
                            className="w-full bg-[#ffffff] border border-gray-200 text-gray-900 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            placeholder="e.g. 22"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 p-5 rounded-xl font-bold">
                  <span className="text-gray-700">Calculated Current CGPA</span>
                  <span className="text-2xl text-blue-600">{currentCGPA}</span>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Review Your Profile</h3>
                
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                    <h4 className="font-bold text-gray-900">Academic Profile</h4>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div><span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">University</span><span className="font-semibold text-gray-900">{formData.university || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">Degree</span><span className="font-semibold text-gray-900">{formData.degree || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">Specialization</span><span className="font-semibold text-gray-900">{formData.specialization || 'N/A'}</span></div>
                    <div><span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">Grading System</span><span className="font-semibold text-gray-900">{formData.grading_system}-Point</span></div>
                    <div><span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">Duration</span><span className="font-semibold text-gray-900">{formData.total_semesters} Semesters</span></div>
                    <div><span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">Completed Semesters</span><span className="font-semibold text-gray-900">{formData.completed_semesters || '0'}</span></div>
                    <div><span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">Total Credits</span><span className="font-semibold text-gray-900">{formData.total_program_credits}</span></div>
                    <div><span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">Expected Graduation</span><span className="font-semibold text-gray-900">{formData.expected_grad_year}</span></div>
                    <div><span className="text-gray-500 block text-xs uppercase tracking-wide mb-1">Gender</span><span className="font-semibold text-gray-900">{formData.gender || 'N/A'}</span></div>
                  </div>
                </div>

                {semestersData.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                      <h4 className="font-bold text-gray-900">Semester Results</h4>
                    </div>
                    <div className="p-5 space-y-3">
                      {semestersData.map((sem, i) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                          <span className="font-bold text-gray-700">Semester {sem.semester_number}</span>
                          <div className="flex gap-6">
                            <span><span className="text-gray-400 mr-2 text-xs">GPA</span><span className="font-semibold text-gray-900">{sem.gpa || '-'}</span></span>
                            <span><span className="text-gray-400 mr-2 text-xs">Credits</span><span className="font-semibold text-gray-900">{sem.credits || '-'}</span></span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center font-bold text-base pt-3 border-t border-gray-200 text-blue-600 mt-2">
                        <span>Current CGPA</span>
                        <span>{currentCGPA}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-8 mt-8 border-t border-gray-100 flex items-center justify-between">
              <button 
                onClick={prevStep}
                className={`text-sm font-bold flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <ArrowLeft size={16} /> Back
              </button>
              
              {step < 4 ? (
                <button 
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                >
                  Next Step <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit} 
                  disabled={loading} 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-8 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
                >
                  {loading ? 'Saving...' : 'Complete Profile'}
                  {!loading && <CheckCircle2 size={16} />}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
