import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { CheckCircle2, ArrowRight, ArrowLeft, GraduationCap } from 'lucide-react';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
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
    if (step === 2) {
      // Initialize semester array if needed based on completed_semesters count
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
        setStep(4); // Skip step 3 if no completed semesters
        return;
      }
    }
    setStep(prev => Math.min(4, prev + 1));
  };

  const prevStep = () => {
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
    } catch (err) {
      alert('Error saving profile and semester history.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface py-12 flex flex-col items-center justify-center px-4 font-sans">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-3xl shadow-lg border border-outline-variant overflow-hidden">
        
        {/* Header */}
        <div className="p-8 pb-6 border-b border-surface-container">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-primary tracking-wider uppercase">Profile Setup</span>
            <span className="text-xs font-medium text-on-surface-variant">Step {step} of 4</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mb-6 flex">
            <div className={`bg-primary h-full transition-all duration-300`} style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
          
          <h1 className="text-2xl font-bold text-on-surface mb-2">
            {step === 1 && "Personal Information"}
            {step === 2 && "Academic Information"}
            {step === 3 && "Completed Semester Results"}
            {step === 4 && "Review & Complete"}
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {step === 1 && "Basic details for your profile."}
            {step === 2 && "Tell us about your university structure."}
            {step === 3 && "Enter your GPA and credits for each semester you've completed."}
            {step === 4 && "Review everything before saving your profile."}
          </p>
        </div>

        <div className="p-8 pt-6 bg-surface-container-lowest">
          
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-on-surface mb-1.5 block">Full Name</label>
                <input required type="text" name="name" className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.name} onChange={handleFormChange} placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface mb-1.5 block">Gender</label>
                <select name="gender" className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none" value={formData.gender} onChange={handleFormChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-on-surface mb-1.5 block">Institution / University</label>
                <input required type="text" name="university" className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.university} onChange={handleFormChange} placeholder="e.g. VIT Chennai" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Degree</label>
                  <input required type="text" name="degree" className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.degree} onChange={handleFormChange} placeholder="e.g. B.Tech" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Specialization</label>
                  <input required type="text" name="specialization" className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.specialization} onChange={handleFormChange} placeholder="e.g. CSE" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface mb-1.5 block">Grading System</label>
                <select name="grading_system" className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none" value={formData.grading_system} onChange={handleFormChange}>
                  <option value="10">10-Point Scale (Standard UGC / Autonomous)</option>
                  <option value="4">4-Point Scale (US Standard)</option>
                  <option value="5">5-Point Scale</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Total Semesters</label>
                  <input required type="number" name="total_semesters" className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.total_semesters} onChange={handleFormChange} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Expected Grad Year</label>
                  <input required type="number" name="expected_grad_year" className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.expected_grad_year} onChange={handleFormChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Completed Semesters</label>
                  <input required type="number" name="completed_semesters" className="w-full bg-surface-container-low border border-outline-variant text-primary font-bold rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.completed_semesters} onChange={handleFormChange} placeholder="e.g. 2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">Total Program Credits</label>
                  <input required type="number" name="total_program_credits" className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.total_program_credits} onChange={handleFormChange} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4">
                {semestersData.map((sem, index) => (
                  <div key={index} className="border border-outline-variant rounded-xl p-4 bg-surface-container-low relative">
                    <div className="absolute -top-3 left-4 bg-surface-container-low px-2 text-xs font-bold text-on-surface-variant">Semester {sem.semester_number}</div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="text-xs font-semibold text-on-surface mb-1.5 block">GPA</label>
                        <input 
                          type="number" step="0.01" max={formData.grading_system} min="0" 
                          value={sem.gpa} 
                          onChange={(e) => handleSemesterChange(index, 'gpa', e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g. 8.50"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-on-surface mb-1.5 block">Credits</label>
                        <input 
                          type="number" min="0" step="1" 
                          value={sem.credits} 
                          onChange={(e) => handleSemesterChange(index, 'credits', e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g. 22"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between bg-primary-container text-on-primary-container p-4 rounded-xl font-bold">
                <span>Calculated Current CGPA</span>
                <span className="text-2xl">{currentCGPA}</span>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-sm">
              <div className="space-y-3 bg-surface-container-low p-5 rounded-xl border border-outline-variant">
                <h3 className="font-bold text-lg text-on-surface flex items-center gap-2"><GraduationCap size={18} /> Academic Profile</h3>
                <div className="grid grid-cols-2 gap-y-2 text-on-surface">
                  <span className="text-on-surface-variant">University:</span> <span className="font-medium text-right">{formData.university || 'N/A'}</span>
                  <span className="text-on-surface-variant">Degree:</span> <span className="font-medium text-right">{formData.degree} ({formData.specialization})</span>
                  <span className="text-on-surface-variant">Graduation Year:</span> <span className="font-medium text-right">{formData.expected_grad_year}</span>
                  <span className="text-on-surface-variant">Completed Sems:</span> <span className="font-medium text-right">{formData.completed_semesters || '0'}</span>
                  <span className="text-on-surface-variant">Total Credits:</span> <span className="font-medium text-right">{formData.total_program_credits}</span>
                  <span className="text-on-surface-variant">Scale:</span> <span className="font-medium text-right">{formData.grading_system}-Point</span>
                </div>
              </div>

              {semestersData.length > 0 && (
                <div className="space-y-3 bg-surface-container-low p-5 rounded-xl border border-outline-variant">
                  <h3 className="font-bold text-lg text-on-surface">Completed Semester Results</h3>
                  <div className="space-y-2">
                    {semestersData.map((sem, i) => (
                      <div key={i} className="flex justify-between items-center bg-surface-container-lowest p-2 rounded-lg border border-surface-container-highest">
                        <span className="font-medium text-on-surface">Semester {sem.semester_number}</span>
                        <div className="text-right flex gap-4">
                          <span><span className="text-on-surface-variant text-xs mr-1">GPA</span>{sem.gpa || '-'}</span>
                          <span><span className="text-on-surface-variant text-xs mr-1">Cr</span>{sem.credits || '-'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-outline-variant text-primary mt-2">
                    <span>Current CGPA</span>
                    <span>{currentCGPA}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-8 flex items-center justify-between">
            <button 
              onClick={prevStep}
              className={`text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
            >
              <ArrowLeft size={16} /> Back
            </button>
            
            {step < 4 ? (
              <button 
                onClick={nextStep}
                className="bg-primary hover:bg-primary/90 text-on-primary text-sm font-medium py-3 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="bg-primary hover:bg-primary/90 text-on-primary text-sm font-medium py-3 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-sm"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
                {!loading && <CheckCircle2 size={16} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
