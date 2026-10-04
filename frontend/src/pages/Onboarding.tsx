import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const Onboarding = () => {
  const [formData, setFormData] = useState({
    university: '',
    degree: '',
    specialization: '',
    total_semesters: '',
    expected_grad_year: '',
    total_program_credits: '',
    completed_semesters: '',
    grading_system: '10',
    gender: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.post(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.href = '/';
    } catch (err) {
      alert('Error saving profile');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 flex flex-col items-center justify-center px-4 font-sans">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-3xl shadow-lg border border-surface-container-high overflow-hidden">
        
        {/* Header */}
        <div className="p-8 pb-6 border-b border-surface-container">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-primary tracking-wider uppercase">Profile Setup</span>
            <span className="text-xs font-medium text-on-surface-variant">100% Completed</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mb-6">
            <div className="bg-primary text-on-primary h-full w-full rounded-full"></div>
          </div>
          
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium shrink-0">
              <CheckCircle2 size={14} /> 1. University
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary text-white rounded-full text-xs font-medium shrink-0">
              <span className="w-4 h-4 bg-surface-container-lowest/20 rounded-full flex items-center justify-center text-[10px]">2</span> Degree & Program
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container text-on-surface-variant rounded-full text-xs font-medium shrink-0">
              3. Structure
            </div>
          </div>

          <h1 className="text-2xl font-bold text-on-surface mb-2">Let's set up your academic profile</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Tell us a little about your course so GradePath can calculate your academic progress accurately.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5 bg-surface-container-lowest">
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-semibold text-on-surface">Institution / University</label>
            </div>
            <input required type="text" name="university" className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.university} onChange={handleChange} placeholder="e.g. VIT Chennai" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Degree</label>
              <input required type="text" name="degree" className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.degree} onChange={handleChange} placeholder="e.g. Bachelor of Technology" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Specialization / Major</label>
              <input required type="text" name="specialization" className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.specialization} onChange={handleChange} placeholder="e.g. Computer Science" />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs font-semibold text-on-surface">Grading System</label>
              <span className="text-[10px] font-medium text-on-surface-variant">Standard UGC Scale</span>
            </div>
            <select name="grading_system" className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none" value={formData.grading_system} onChange={handleChange}>
              <option value="10">10-Point Scale (Standard UGC / Autonomous)</option>
              <option value="4">4-Point Scale (US Standard)</option>
              <option value="5">5-Point Scale</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-3 text-center flex flex-col justify-center">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Duration</span>
              <div className="flex items-center justify-center gap-1">
                <input required type="number" name="total_semesters" className="w-8 bg-transparent text-lg font-bold text-on-surface text-center p-0 border-none focus:ring-0" value={formData.total_semesters} onChange={handleChange} />
                <span className="text-sm font-semibold text-on-surface">Sems</span>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center flex flex-col justify-center">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Completed</span>
              <div className="flex items-center justify-center gap-1">
                <input required type="number" name="completed_semesters" className="w-8 bg-transparent text-lg font-bold text-blue-700 text-center p-0 border-none focus:ring-0" value={formData.completed_semesters} onChange={handleChange} />
                <span className="text-sm font-semibold text-blue-700">Sems</span>
              </div>
            </div>
            <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-3 text-center flex flex-col justify-center">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Req.</span>
              <div className="flex items-center justify-center gap-1">
                <input required type="number" name="total_program_credits" className="w-10 bg-transparent text-lg font-bold text-on-surface text-center p-0 border-none focus:ring-0" value={formData.total_program_credits} onChange={handleChange} />
                <span className="text-sm font-semibold text-on-surface">Cr</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Expected Grad Year</label>
              <input required type="number" name="expected_grad_year" className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.expected_grad_year} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5">Gender (For ML Predictor)</label>
              <select name="gender" className="w-full bg-surface-container-low border border-outline-variant text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between">
            <div className="flex gap-4">
              <button type="button" className="text-sm font-medium text-on-surface-variant hover:text-on-surface">Back</button>
            </div>
            <button type="submit" disabled={loading} className="bg-primary text-on-primary hover:bg-blue-700 text-white text-sm font-medium py-3 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-sm shadow-blue-600/20">
              {loading ? 'Saving...' : 'Save & Continue'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
