
import React, { useState, useEffect, useRef } from 'react';
import { getStoredData, setStoredData, DB_KEYS } from '../store';
import { StudentWithRecords, Notice, StudentRecord } from '../types';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  TrendingUp, 
  Users, 
  Calendar, 
  X, 
  UserPlus, 
  Save, 
  GraduationCap, 
  Camera, 
  Check, 
  History,
  AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentWithRecords[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNotice, setNewNotice] = useState({ title: '', content: '', date: '', type: 'HOLIDAY' as const });
  
  // Student Modal State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithRecords | null>(null);
  const [studentForm, setStudentForm] = useState<{
    username: string;
    regNumber: string;
    photoUrl: string;
    records: StudentRecord[];
  }>({
    username: '',
    regNumber: '',
    photoUrl: '',
    records: []
  });

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  // Student CRUD Logic
  const openAddModal = () => {
    setEditingStudent(null);
    setStudentForm({ 
      username: '', 
      regNumber: '', 
      photoUrl: `https://picsum.photos/seed/${Math.random()}/200`,
      records: []
    });
    setIsStudentModalOpen(true);
  };

  const openEditModal = (student: StudentWithRecords) => {
    setEditingStudent(student);
    setStudentForm({
      username: student.username,
      regNumber: student.regNumber,
      photoUrl: student.photoUrl || '',
      records: [...student.records]
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
        ...studentForm
      };
      updatedStudents = [...students, newStudent];
    }

    refreshStudents(updatedStudents);
    closeStudentModal();
  };

  const closeStudentModal = () => {
    stopCamera();
    setIsStudentModalOpen(false);
  };

  const deleteStudent = (id: string) => {
    if (window.confirm('Delete student and all academic records permanently?')) {
      const updated = students.filter(s => s.id !== id);
      refreshStudents(updated);
    }
  };

  // Record Management inside Modal
  const addRecordRow = () => {
    const nextSem = studentForm.records.length + 1;
    setStudentForm({
      ...studentForm,
      records: [...studentForm.records, { semester: `Sem ${nextSem}`, gpa: 0, attendance: 0 }]
    });
  };

  const updateRecord = (idx: number, field: keyof StudentRecord, value: string | number) => {
    const updated = [...studentForm.records];
    updated[idx] = { ...updated[idx], [field]: value };
    setStudentForm({ ...studentForm, records: updated });
  };

  const removeRecord = (idx: number) => {
    const updated = studentForm.records.filter((_, i) => i !== idx);
    setStudentForm({ ...studentForm, records: updated });
  };

  // Camera Logic
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400, facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      alert("Professor: Please ensure camera permissions are enabled.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        setStudentForm({ ...studentForm, photoUrl: canvasRef.current.toDataURL('image/png') });
        stopCamera();
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.regNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgGpa = students.length > 0 
    ? (students.reduce((acc, s) => acc + (s.records[s.records.length - 1]?.gpa || 0), 0) / students.length).toFixed(2) 
    : "0.00";
  
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Professor Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400">Official Student Management Terminal</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter list..."
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
            <span className="hidden sm:inline">New Registration</span>
          </button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-slate-500">Total Enrollment</p><h3 className="text-3xl font-bold text-slate-800 dark:text-white">{students.length}</h3></div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-kist-blue rounded-xl"><Users size={24} /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-slate-500">Avg. Academic GPA</p><h3 className="text-3xl font-bold text-slate-800 dark:text-white">{avgGpa}</h3></div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl"><TrendingUp size={24} /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-slate-500">Notices Issued</p><h3 className="text-3xl font-bold text-slate-800 dark:text-white">{notices.length}</h3></div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl"><Calendar size={24} /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main List */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center space-x-2">
                <GraduationCap className="text-kist-blue" size={20} />
                <span>Verified Student List</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Student Identity</th>
                    <th className="px-6 py-4">Registration #</th>
                    <th className="px-6 py-4">Latest GPA</th>
                    <th className="px-6 py-4 text-right">Records Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 group transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={student.photoUrl || `https://picsum.photos/seed/${student.id}/200`} className="w-10 h-10 rounded-full object-cover bg-slate-100" />
                          <span className="font-bold text-slate-700 dark:text-slate-200">{student.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm font-medium">{student.regNumber}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-kist-blue">
                          {student.records[student.records.length - 1]?.gpa?.toFixed(2) || '0.00'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button onClick={() => openEditModal(student)} className="p-2 text-slate-400 hover:text-kist-blue hover:bg-kist-blue/10 rounded-lg"><Edit2 size={16} /></button>
                        <button onClick={() => deleteStudent(student.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Notices & Stats */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Post Announcement</h3>
            <form onSubmit={handleAddNotice} className="space-y-4">
              <input type="text" placeholder="Subject" required className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl dark:text-white text-sm" value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})} />
              <textarea placeholder="Message content..." required className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl dark:text-white text-sm min-h-[100px]" value={newNotice.content} onChange={e => setNewNotice({...newNotice, content: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" required className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl dark:text-white text-xs" value={newNotice.date} onChange={e => setNewNotice({...newNotice, date: e.target.value})} />
                <select className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl dark:text-white text-xs" value={newNotice.type} onChange={e => setNewNotice({...newNotice, type: e.target.value as any})}>
                  <option value="HOLIDAY">Holiday</option><option value="EVENT">Event</option><option value="URGENT">Urgent</option>
                </select>
              </div>
              <button className="w-full py-3 bg-kist-blue text-white rounded-xl font-bold flex items-center justify-center space-x-2">
                <Plus size={18} /><span>Publish Notice</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Enhanced Professor Edit Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-kist-blue p-6 text-white flex justify-between items-center shrink-0">
              <div><h3 className="text-xl font-bold">{editingStudent ? 'Edit Student Records' : 'New Student Registration'}</h3><p className="text-white/70 text-sm">Professor's Official Entry Form</p></div>
              <button onClick={closeStudentModal} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveStudent} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Photo & Identity Section */}
                <div className="space-y-4">
                  <div className="relative mx-auto w-32 h-32">
                    <div className="w-full h-full rounded-full border-4 border-slate-100 overflow-hidden bg-slate-50">
                      {isCameraOpen ? (
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                      ) : (
                        <img src={studentForm.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 flex space-x-1">
                      {isCameraOpen ? (
                        <button type="button" onClick={capturePhoto} className="p-2 bg-emerald-500 text-white rounded-full shadow-lg"><Check size={16} /></button>
                      ) : (
                        <button type="button" onClick={startCamera} className="p-2 bg-kist-blue text-white rounded-full shadow-lg"><Camera size={16} /></button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Full Name</label><input type="text" required value={studentForm.username} onChange={e => setStudentForm({...studentForm, username: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-lg dark:bg-slate-900 dark:text-white" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Reg Number</label><input type="text" required value={studentForm.regNumber} onChange={e => setStudentForm({...studentForm, regNumber: e.target.value})} className="w-full p-2 bg-slate-50 border rounded-lg dark:bg-slate-900 dark:text-white" /></div>
                  </div>
                </div>

                {/* Academic Summary Section */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center space-x-2 mb-4 text-kist-blue font-bold text-sm"><History size={16} /><span>Performance Insights</span></div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Total Semesters</span><span className="font-bold dark:text-white">{studentForm.records.length}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Cumulative GPA</span><span className="font-bold text-kist-blue">{(studentForm.records.reduce((acc, r) => acc + r.gpa, 0) / (studentForm.records.length || 1)).toFixed(2)}</span></div>
                  </div>
                </div>
              </div>

              {/* Records Management Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-700 dark:text-white flex items-center space-x-2"><History size={18} className="text-kist-blue" /><span>Semester Records</span></h4>
                  <button type="button" onClick={addRecordRow} className="text-xs font-bold text-kist-blue flex items-center space-x-1 hover:underline"><Plus size={14} /><span>Add Semester</span></button>
                </div>

                <div className="space-y-3">
                  {studentForm.records.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm italic">No academic history entries.</div>
                  ) : studentForm.records.map((rec, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm animate-in slide-in-from-left-2">
                      <div className="flex-1 shrink-0"><input type="text" value={rec.semester} onChange={e => updateRecord(idx, 'semester', e.target.value)} className="w-full text-xs font-bold bg-transparent dark:text-white outline-none" placeholder="Semester Name" /></div>
                      <div className="w-20"><label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">GPA</label><input type="number" step="0.01" value={rec.gpa} onChange={e => updateRecord(idx, 'gpa', parseFloat(e.target.value))} className="w-full p-1 text-xs bg-slate-50 dark:bg-slate-800 rounded border outline-none dark:text-white" /></div>
                      <div className="w-20"><label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Att %</label><input type="number" value={rec.attendance} onChange={e => updateRecord(idx, 'attendance', parseInt(e.target.value))} className="w-full p-1 text-xs bg-slate-50 dark:bg-slate-800 rounded border outline-none dark:text-white" /></div>
                      <button type="button" onClick={() => removeRecord(idx)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex space-x-3 sticky bottom-0 bg-white dark:bg-slate-800 pb-2">
                <button type="button" onClick={closeStudentModal} className="flex-1 py-3 border rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-kist-blue text-white font-bold rounded-xl hover:bg-blue-800 shadow-lg shadow-kist-blue/20 transition-all flex items-center justify-center space-x-2">
                  <Save size={18} /><span>Commit Changes</span>
                </button>
              </div>
            </form>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
