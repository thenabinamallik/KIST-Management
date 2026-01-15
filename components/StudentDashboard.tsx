
import React, { useState, useEffect } from 'react';
import { User, StudentWithRecords, Notice, StudentRecord } from '../types';
import { getStoredData, setStoredData, DB_KEYS } from '../store';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Legend
} from 'recharts';
import { 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Calendar, 
  BookOpen, 
  Clock, 
  Award, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown,
  LineChart as ChartIcon,
  Check,
  Percent,
  TrendingUp,
  TrendingDown,
  Star
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  setUser: (user: User) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, setUser }) => {
  const [studentData, setStudentData] = useState<StudentWithRecords | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: user.username, photoUrl: user.photoUrl });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [tempRecords, setTempRecords] = useState<StudentRecord[]>([]);
  const [editingIndices, setEditingIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const students = getStoredData<StudentWithRecords[]>(DB_KEYS.STUDENTS, []);
    const data = students.find(s => s.id === user.id);
    if (data) {
      setStudentData(data);
      setTempRecords([...data.records]);
    }
    setNotices(getStoredData(DB_KEYS.NOTICES, []));
  }, [user]);

  const handleSaveProfile = () => {
    const students = getStoredData<StudentWithRecords[]>(DB_KEYS.STUDENTS, []);
    const updatedStudents = students.map(s => 
      s.id === user.id ? { ...s, username: editForm.username, photoUrl: editForm.photoUrl } : s
    );
    
    const updatedUser = { ...user, username: editForm.username, photoUrl: editForm.photoUrl };
    
    setStoredData(DB_KEYS.STUDENTS, updatedStudents);
    setStoredData(DB_KEYS.AUTH, updatedUser);
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleTableSave = () => {
    if (!studentData) return;
    const students = getStoredData<StudentWithRecords[]>(DB_KEYS.STUDENTS, []);
    const updatedStudents = students.map(s => 
      s.id === user.id ? { ...s, records: tempRecords } : s
    );
    setStoredData(DB_KEYS.STUDENTS, updatedStudents);
    setStudentData({ ...studentData, records: tempRecords });
    setEditingIndices(new Set());
  };

  const updateTempRecord = (index: number, field: keyof StudentRecord, value: string | number) => {
    const updated = [...tempRecords];
    updated[index] = { ...updated[index], [field]: value };
    setTempRecords(updated);
  };

  const toggleRowEdit = (index: number) => {
    const newEditingIndices = new Set(editingIndices);
    if (newEditingIndices.has(index)) {
      newEditingIndices.delete(index);
    } else {
      newEditingIndices.add(index);
    }
    setEditingIndices(newEditingIndices);
  };

  const cancelTableEdit = () => {
    if (studentData) setTempRecords([...studentData.records]);
    setEditingIndices(new Set());
  };

  const currentRecords = studentData?.records || [];
  const latestGPA = currentRecords[currentRecords.length - 1]?.gpa || 0;
  const prevGPA = currentRecords.length > 1 ? currentRecords[currentRecords.length - 2]?.gpa : latestGPA;
  const gpaTrend = (latestGPA - prevGPA).toFixed(2);

  const latestAttendance = currentRecords[currentRecords.length - 1]?.attendance || 0;
  const prevAttendance = currentRecords.length > 1 ? currentRecords[currentRecords.length - 2]?.attendance : latestAttendance;
  const attTrend = latestAttendance - prevAttendance;

  const sortedTempRecords = [...tempRecords].map((r, i) => ({ ...r, originalIndex: i }))
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.semester.localeCompare(b.semester, undefined, { numeric: true });
      return b.semester.localeCompare(a.semester, undefined, { numeric: true });
    });

  const toggleSort = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-kist-gold/10 blur-3xl -mr-32 -mt-32 rounded-full"></div>
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-kist-blue overflow-hidden shadow-xl">
            <img src={editForm.photoUrl || 'https://picsum.photos/200'} alt={user.username} className="w-full h-full object-cover" />
          </div>
          {isEditing && (
            <button className="absolute bottom-0 right-0 p-2 bg-kist-blue text-white rounded-full shadow-lg hover:scale-110 transition-all">
              <Camera size={18} />
            </button>
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          {isEditing ? (
            <div className="space-y-4 max-w-sm">
              <div className="space-y-1 text-left">
                 <label className="text-xs font-bold text-slate-400 uppercase ml-1">Username</label>
                 <input 
                    type="text" 
                    value={editForm.username} 
                    onChange={e => setEditForm({...editForm, username: e.target.value})}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-kist-blue dark:text-white"
                 />
              </div>
              <div className="space-y-1 text-left">
                 <label className="text-xs font-bold text-slate-400 uppercase ml-1">Photo URL</label>
                 <input 
                    type="text" 
                    value={editForm.photoUrl} 
                    onChange={e => setEditForm({...editForm, photoUrl: e.target.value})}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-kist-blue dark:text-white text-xs"
                 />
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{user.username}</h2>
              <p className="text-slate-500 font-medium">{user.regNumber}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <span className="flex items-center space-x-2 text-xs font-bold px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-kist-blue rounded-full border border-blue-100 dark:border-blue-900/30">
                  <BookOpen size={14} /> <span>Computer Science</span>
                </span>
                <span className="flex items-center space-x-2 text-xs font-bold px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full border border-amber-100 dark:border-amber-900/30">
                  <Clock size={14} /> <span>Semester 4</span>
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleSaveProfile}
                className="flex items-center space-x-2 px-6 py-3 bg-kist-blue text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <Save size={18} /> <span>Save Profile</span>
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <Edit3 size={18} /> <span>Edit Profile</span>
            </button>
          )}
        </div>
      </header>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* GPA Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                <Award size={24} />
              </div>
              <div className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-lg ${Number(gpaTrend) >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'}`}>
                {Number(gpaTrend) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{gpaTrend}</span>
              </div>
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current GPA</p>
              <div className="flex items-baseline space-x-2">
                <h4 className="text-3xl font-black text-slate-800 dark:text-white">{latestGPA.toFixed(2)}</h4>
                <span className="text-xs text-slate-400 font-medium">/ 4.00</span>
              </div>
           </div>
        </div>

        {/* Attendance Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                <Percent size={24} />
              </div>
              <div className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-lg ${attTrend >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20'}`}>
                {attTrend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{Math.abs(attTrend)}%</span>
              </div>
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attendance</p>
              <h4 className="text-3xl font-black text-slate-800 dark:text-white">{latestAttendance}%</h4>
           </div>
        </div>

        {/* Academic Status Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                <Star size={24} />
              </div>
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Academic Standing</p>
              <h4 className={`text-xl font-black mt-1 ${latestGPA >= 3.5 ? 'text-kist-gold' : 'text-slate-800 dark:text-white'}`}>
                {latestGPA >= 3.8 ? "Dean's List" : latestGPA >= 3.5 ? "First Class" : "Good Standing"}
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Calculated based on Semester 4</p>
           </div>
        </div>

        {/* Credits Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Credits Earned</p>
              <div className="flex items-baseline space-x-2">
                <h4 className="text-3xl font-black text-slate-800 dark:text-white">64</h4>
                <span className="text-xs text-slate-400 font-medium">/ 120 Total</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '53%' }}></div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-6">
            <Award size={20} className="text-kist-blue" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">GPA History</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentRecords}>
                <defs>
                  <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="semester" stroke="#94a3b8" />
                <YAxis domain={[0, 4]} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="gpa" stroke="#1e3a8a" strokeWidth={3} fillOpacity={1} fill="url(#colorGpa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-6">
            <Percent size={20} className="text-kist-gold" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Attendance Trend</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentRecords}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="semester" stroke="#94a3b8" />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="attendance" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Notice Board</h3>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-500 text-xs font-bold rounded-full">Updates</span>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {notices.map(notice => (
              <div key={notice.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-l-4 border-kist-gold">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{notice.title}</h4>
                  <span className="text-[10px] text-slate-400 font-bold">{notice.date}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{notice.content}</p>
              </div>
            ))}
            {notices.length === 0 && (
               <div className="text-center py-12 text-slate-400">
                  <Calendar className="mx-auto mb-2 opacity-20" size={48} />
                  <p>No recent announcements</p>
               </div>
            )}
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Academic History</h3>
            <p className="text-sm text-slate-500 mt-1">Detailed breakdown of all completed semesters</p>
          </div>
          <div className="flex items-center space-x-3">
            {editingIndices.size > 0 && (
              <div className="flex items-center space-x-2 animate-in slide-in-from-right-4">
                <button onClick={cancelTableEdit} className="flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-all text-sm font-semibold">
                  <X size={16} /> <span>Cancel</span>
                </button>
                <button onClick={handleTableSave} className="flex items-center space-x-2 px-4 py-2 bg-kist-blue text-white rounded-xl hover:bg-blue-800 shadow-md shadow-kist-blue/20 transition-all text-sm font-bold">
                  <Save size={16} /> <span>Save All Changes</span>
                </button>
              </div>
            )}
            <button onClick={toggleSort} className="flex items-center space-x-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-sm font-semibold">
              <ArrowUpDown size={16} /> <span className="hidden sm:inline">Sort: {sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
              {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-700">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">Semester</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 text-center">GPA</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 text-center">Attendance %</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {sortedTempRecords.map((record) => {
                const isRowEditing = editingIndices.has(record.originalIndex);
                return (
                  <tr key={record.originalIndex} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4">
                      {isRowEditing ? (
                        <input type="text" value={record.semester} onChange={(e) => updateTempRecord(record.originalIndex, 'semester', e.target.value)} className="w-full p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white focus:ring-2 focus:ring-kist-blue outline-none" />
                      ) : (
                        <span className="font-bold text-slate-700 dark:text-slate-200">{record.semester}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isRowEditing ? (
                        <input type="number" step="0.01" min="0" max="4" value={record.gpa} onChange={(e) => updateTempRecord(record.originalIndex, 'gpa', parseFloat(e.target.value))} className="w-20 mx-auto p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center dark:text-white focus:ring-2 focus:ring-kist-blue outline-none" />
                      ) : (
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${record.gpa >= 3.5 ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : record.gpa >= 2.5 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                          {record.gpa.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isRowEditing ? (
                        <input type="number" min="0" max="100" value={record.attendance} onChange={(e) => updateTempRecord(record.originalIndex, 'attendance', parseInt(e.target.value))} className="w-20 mx-auto p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-center dark:text-white focus:ring-2 focus:ring-kist-blue outline-none" />
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="flex-1 max-w-[100px] h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden hidden sm:block">
                            <div className={`h-full rounded-full ${record.attendance >= 85 ? 'bg-emerald-500' : record.attendance >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${record.attendance}%` }}></div>
                          </div>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{record.attendance}%</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right pr-10">
                      <button onClick={() => toggleRowEdit(record.originalIndex)} className={`p-2 rounded-lg transition-all ${isRowEditing ? 'bg-kist-blue/10 text-kist-blue hover:bg-kist-blue/20' : 'text-slate-400 hover:text-kist-blue hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                        {isRowEditing ? <Check size={18} /> : <Edit3 size={18} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-kist-gold/20 text-kist-gold rounded-lg"><ChartIcon size={24} /></div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Academic Trend Analysis</h3>
            <p className="text-sm text-slate-500 mt-1">Correlation between GPA and Attendance over time</p>
          </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentRecords} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="semester" stroke="#94a3b8" tick={{ fontSize: 12, fontWeight: 500 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" domain={[0, 4]} stroke="#1e3a8a" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} label={{ value: 'GPA', angle: -90, position: 'insideLeft', offset: 10, fill: '#1e3a8a', fontWeight: 'bold' }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#fbbf24" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} label={{ value: 'Attendance %', angle: 90, position: 'insideRight', offset: 10, fill: '#fbbf24', fontWeight: 'bold' }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }} cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} />
              <Legend verticalAlign="top" height={36}/>
              <Line yAxisId="left" type="monotone" dataKey="gpa" name="GPA" stroke="#1e3a8a" strokeWidth={4} dot={{ r: 6, fill: '#1e3a8a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              <Line yAxisId="right" type="monotone" dataKey="attendance" name="Attendance (%)" stroke="#fbbf24" strokeWidth={4} strokeDasharray="5 5" dot={{ r: 6, fill: '#fbbf24', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
