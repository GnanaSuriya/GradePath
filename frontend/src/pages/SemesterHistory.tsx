import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Plus, Trash2, BookOpen, Calendar, BarChart2 } from 'lucide-react';

const SemesterHistory = () => {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newSem, setNewSem] = useState({ semester_number: 1, gpa: 0, credits: 0 });

  const fetchSemesters = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.get(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/semesters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter out the 'current semester' dummy record if it exists
      setSemesters(res.data.filter((s: any) => s.semester_number !== 999));
      
      // Auto-increment the semester number for the form
      const maxSem = res.data.length > 0 ? Math.max(...res.data.map((s: any) => s.semester_number)) : 0;
      setNewSem({ semester_number: maxSem + 1, gpa: 0, credits: 0 });
    } catch (err) {
      console.error('Error fetching semesters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.post(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/semesters`, newSem, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSemesters();
    } catch (err) {
      alert('Error adding semester');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.delete(`${(import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:5000/api')}/semesters/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSemesters();
    } catch (err) {
      alert('Error deleting semester');
    }
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  const totalCredits = semesters.reduce((sum, s) => sum + s.credits, 0);
  const totalPoints = semesters.reduce((sum, s) => sum + (s.gpa * s.credits), 0);
  const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans pb-20 bg-surface min-h-screen">
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface tracking-tight mb-2">Semester History</h1>
        <p className="text-sm text-on-surface-variant font-medium">Add your completed semesters to track your CGPA timeline and predict future scores.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Clock size={20} className="text-primary" /> Academic Timeline
            </h2>
            <span className="bg-blue-50 text-primary text-xs font-bold px-3 py-1 rounded-lg border border-primary-container">
              {semesters.length} Semesters Recorded
            </span>
          </div>

          {semesters.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-low rounded-DEFAULT border border-dashed border-outline-variant">
              <div className="w-16 h-16 bg-gray-50 text-outline rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} />
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">No history found</h3>
              <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
                Start building your academic profile by adding your first completed semester using the form.
              </p>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {semesters.sort((a, b) => a.semester_number - b.semester_number).map((sem, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  
                  {/* Timeline dot */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <span className="text-xs font-bold">{sem.semester_number}</span>
                  </div>
                  
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-surface-container-lowest rounded-DEFAULT p-5 border border-outline-variant hover:border-primary transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-base font-bold text-on-surface">Semester {sem.semester_number}</h3>
                        <div className="text-xs font-medium text-on-surface-variant mt-0.5 flex items-center gap-1">
                          <Calendar size={12} /> {sem.semester_number % 2 !== 0 ? 'Fall' : 'Spring'} Term
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(sem.id)}
                        className="text-outline hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="bg-surface-container-low rounded-lg p-3 flex-1 border border-outline-variant">
                        <div className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">GPA</div>
                        <div className="text-xl font-bold text-primary">{sem.gpa.toFixed(2)}</div>
                      </div>
                      <div className="bg-surface-container-low rounded-lg p-3 flex-1 border border-outline-variant">
                        <div className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Credits</div>
                        <div className="text-xl font-bold text-on-surface">{sem.credits}</div>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Forms & Stats */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-surface-container-lowest rounded-DEFAULT p-6 border border-outline-variant">
            <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <Plus size={20} className="text-primary" /> Add Past Semester
            </h2>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">Semester Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"><BookOpen size={16} /></span>
                  <input 
                    required 
                    type="number" 
                    min="1" max="20" 
                    className="w-full bg-gray-50 border border-gray-200 text-on-surface rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all font-bold" 
                    value={newSem.semester_number || ''} 
                    onChange={e => setNewSem({...newSem, semester_number: parseInt(e.target.value)})} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Term GPA</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" min="0" max="10"
                    className="w-full bg-gray-50 border border-gray-200 text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all font-bold" 
                    value={newSem.gpa || ''} 
                    onChange={e => setNewSem({...newSem, gpa: parseFloat(e.target.value)})} 
                    placeholder="e.g. 8.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">Credits</label>
                  <input 
                    required 
                    type="number" 
                    min="1" max="50"
                    className="w-full bg-gray-50 border border-gray-200 text-on-surface rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all font-bold" 
                    value={newSem.credits || ''} 
                    onChange={e => setNewSem({...newSem, credits: parseInt(e.target.value)})} 
                    placeholder="e.g. 22"
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-on-primary text-sm font-bold py-3.5 px-4 rounded-xl transition-colors shadow-md shadow-blue-600/20 mt-2"
              >
                Save Semester Record
              </button>
            </form>
          </div>

          <div className="bg-primary rounded-DEFAULT p-6 shadow-sm text-on-primary">
            <h2 className="text-sm font-bold text-primary-container uppercase tracking-widest mb-6 flex items-center gap-2">
              <BarChart2 size={16} /> Aggregate Statistics
            </h2>
            
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-bold tracking-tight">{cgpa}</span>
              <span className="text-sm font-medium text-outline">CGPA</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                <span className="text-sm text-outline">Total Credits</span>
                <span className="font-bold">{totalCredits}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                <span className="text-sm text-outline">Total Grade Points</span>
                <span className="font-bold">{totalPoints.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-outline">Semesters Recorded</span>
                <span className="font-bold">{semesters.length}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SemesterHistory;
