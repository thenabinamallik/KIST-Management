
import React, { useState, useEffect } from 'react';
import { getStoredData, setStoredData, DB_KEYS } from '../store';
import { StudentWithRecords, Notice, StudentRecord } from '../types';
import { Search, Plus, Trash2, Edit2, TrendingUp, Users, Calendar, AlertCircle, X, UserPlus, Save, GraduationCap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentWithRecords[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNotice, setNewNotice] = useState({ title: '', content: '', date: '', type: 'HOLIDAY' as const });
  
  // Modal State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithRecords | null>(null);
  const [studentForm, setStudentForm] = useState({
    username: '',
    regNumber: '',
    photoUrl: ''
  });

  useEffect(() => {
    setStudents(getStoredData(DB_KEYS.STUDENTS, []));
    setNotices(getStoredData(DB_KEYS.NOTICES, []));
  }, []);

  const refreshStudents = (updated: StudentWithRecords[]) => {
    setStudents(updated);
    setStoredData(DB_KEYS.STUDENTS, updated);
  };

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedNotices = [...notices, { ...newNotice, id: Date.now().toString() }];
    setNotices(updatedNotices);
    setStoredData(DB_KEYS.NOTICES, updatedNotices);
    setNewNotice({ title: '', content: '', date: '', type: 'HOLIDAY' });
  };

  const deleteNotice = (id: string) => {
    const updated = notices.filter(n => n.id !== id);
    setNotices(updated);
    setStoredData(DB_KEYS.NOTICES, updated);
  };

  // Student CRUD
  const openAddModal = () => {
    setEditingStudent(null);
    setStudentForm({ username: '', regNumber: '', photoUrl: `https://picsum.photos/seed/${Math.random()}/200` });
    setIsStudentModalOpen(true);
  };

  const openEditModal = (student: StudentWithRecords) => {
    setEditingStudent(student);
    setStudentForm({
      username: student.username,
      regNumber: student.regNumber,
      photoUrl: student.photoUrl || ''
    });
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedStudents: StudentWithRecords[];

    if (editingStudent) {
      updatedStudents = students.map(s => 
        s.id === editingStudent.id 
          ? { ...s, ...studentForm } 
          : s
      );
    } else {
      const newStudent: StudentWithRecords = {
        id: Date.now().toString(),
        role: 'STUDENT',
        ...studentForm,
        records: [] // Start with empty records
      };
      updatedStudents = [...students, newStudent];
    }

    refreshStudents(updatedStudents);
    setIsStudentModalOpen(false);
  };

  const deleteStudent = (id: string) => {
    if (window.confirm('Are you sure you want to remove this student? All records will be lost.')) {
      const updated = students.filter(s => s.id !== id);
      refreshStudents(updated);
    }
  };

  const filteredStudents = students.filter(s => 
    s.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.regNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgGpa = students.length > 0 
    ? (students.reduce((acc, s) => {
        const latest = s.records[s.records.length - 1]?.gpa || 0;
        return acc + latest;
      }, 0) / students.length).toFixed(2) 
    : "0.00";
  
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Professor Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400">Managing KIST Academic Operations</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-kist-blue dark:text-white"
            />
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2 bg-kist-blue text-white rounded-lg font-bold hover:bg-blue-800 transition-all shadow-md shadow-kist-blue/20"
          >
            <UserPlus size={18} />
            <span className="hidden sm:inline">Add Student</span>
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Students</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">{students.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-kist-blue rounded-xl">
              <Users size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Avg. Class GPA</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">{avgGpa}</h3>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Notices</p>
              <h3 className="text-3xl font-bold mt-1 text-slate-800 dark:text-white">{notices.length}</h3>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl">
              <Calendar size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <GraduationCap className="text-kist-blue" size={20} />
                <span>Student Directory</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Student Info</th>
                    <th className="px-6 py-4">Reg Number</th>
                    <th className="px-6 py-4">Latest GPA</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No students found matching your search.</td>
                    </tr>
                  ) : filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                            <img src={student.photoUrl || `https://picsum.photos/seed/${student.id}/200`} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-kist-blue transition-colors">{student.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm font-medium">{student.regNumber}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          (student.records[student.records.length - 1]?.gpa || 0) >= 3.5 
                            ? 'bg-green-50 text-green-600 dark:bg-green-900/20' 
                            : 'bg-blue-50 text-kist-blue dark:bg-blue-900/20'
                        }`}>
                          {student.records[student.records.length - 1]?.gpa?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button 
                          onClick={() => openEditModal(student)}
                          className="p-2 text-slate-400 hover:text-kist-blue hover:bg-kist-blue/10 rounded-lg transition-all"
                          title="Edit Student"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteStudent(student.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Student"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
             <h3 className="font-bold text-slate-800 dark:text-white mb-6">Class Performance Comparison</h3>
             <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={students.map(s => ({ 
                     name: s.username.split(' ')[0], 
                     gpa: s.records[s.records.length-1]?.gpa || 0 
                   }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis domain={[0, 4]} stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="gpa" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Post New Notice</h3>
            <form onSubmit={handleAddNotice} className="space-y-4">
              <input 
                type="text" 
                placeholder="Title" 
                required
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-kist-blue dark:text-white text-sm"
                value={newNotice.title}
                onChange={e => setNewNotice({...newNotice, title: e.target.value})}
              />
              <textarea 
                placeholder="Content" 
                required
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-kist-blue dark:text-white text-sm min-h-[100px]"
                value={newNotice.content}
                onChange={e => setNewNotice({...newNotice, content: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="date" 
                  required
                  className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-kist-blue dark:text-white text-sm"
                  value={newNotice.date}
                  onChange={e => setNewNotice({...newNotice, date: e.target.value})}
                />
                <select 
                  className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-kist-blue dark:text-white text-sm"
                  value={newNotice.type}
                  onChange={e => setNewNotice({...newNotice, type: e.target.value as any})}
                >
                  <option value="HOLIDAY">Holiday</option>
                  <option value="EVENT">Event</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <button className="w-full py-3 bg-kist-blue text-white rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-800 transition-all shadow-md shadow-kist-blue/20">
                <Plus size={18} />
                <span>Post Notice</span>
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Upcoming Notices</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {notices.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="mx-auto text-slate-200 mb-2" size={32} />
                  <p className="text-slate-400 text-sm italic">No notices posted yet.</p>
                </div>
              )}
              {notices.map(notice => (
                <div key={notice.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 relative group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{notice.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-bold">{notice.date}</p>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                      notice.type === 'HOLIDAY' ? 'bg-amber-100 text-amber-700' : 
                      notice.type === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {notice.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-3">{notice.content}</p>
                  <button 
                    onClick={() => deleteNotice(notice.id)}
                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Student Management Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-kist-blue p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
                <p className="text-white/70 text-sm">Fill in the student credentials</p>
              </div>
              <button onClick={() => setIsStudentModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveStudent} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={studentForm.username}
                  onChange={e => setStudentForm({...studentForm, username: e.target.value})}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-kist-blue dark:text-white"
                  placeholder="e.g. Alice Johnson"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Registration Number</label>
                <input 
                  type="text" 
                  required
                  value={studentForm.regNumber}
                  onChange={e => setStudentForm({...studentForm, regNumber: e.target.value})}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-kist-blue dark:text-white"
                  placeholder="e.g. KIST/2023/045"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Photo URL (Optional)</label>
                <input 
                  type="text" 
                  value={studentForm.photoUrl}
                  onChange={e => setStudentForm({...studentForm, photoUrl: e.target.value})}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-kist-blue dark:text-white text-xs"
                  placeholder="https://..."
                />
              </div>

              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="flex-1 py-3 border-2 border-slate-100 dark:border-slate-700 text-slate-500 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-kist-blue text-white font-bold rounded-xl hover:bg-blue-800 shadow-lg shadow-kist-blue/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Save size={18} />
                  <span>{editingStudent ? 'Update' : 'Register'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
