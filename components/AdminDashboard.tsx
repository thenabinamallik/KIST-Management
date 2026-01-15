
import React, { useState, useEffect } from 'react';
import { getStoredData, setStoredData, DB_KEYS } from '../store';
import { StudentWithRecords, Notice } from '../types';
import { Search, Plus, Trash2, Edit2, TrendingUp, Users, Calendar, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const AdminDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentWithRecords[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNotice, setNewNotice] = useState({ title: '', content: '', date: '', type: 'HOLIDAY' as const });

  useEffect(() => {
    setStudents(getStoredData(DB_KEYS.STUDENTS, []));
    setNotices(getStoredData(DB_KEYS.NOTICES, []));
  }, []);

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

  const filteredStudents = students.filter(s => 
    s.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.regNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Performance Aggregate Data
  const avgGpa = students.length > 0 ? (students.reduce((acc, s) => acc + (s.records[s.records.length - 1]?.gpa || 0), 0) / students.length).toFixed(2) : 0;
  
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
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
        {/* Student Management List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-white">Student Directory</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Reg Number</th>
                    <th className="px-6 py-4">Latest GPA</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img src={student.photoUrl} alt="" className="w-8 h-8 rounded-full" />
                          <span className="font-medium text-slate-700 dark:text-slate-200">{student.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{student.regNumber}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-kist-blue text-xs font-bold rounded">
                          {student.records[student.records.length - 1]?.gpa || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button className="p-2 text-slate-400 hover:text-kist-blue transition-colors"><Edit2 size={16} /></button>
                        <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
             <h3 className="font-bold text-slate-800 dark:text-white mb-6">Class Performance Trend</h3>
             <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={students.map(s => ({ name: s.username, gpa: s.records[s.records.length-1]?.gpa }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis domain={[0, 4]} stroke="#94a3b8" />
                      <Tooltip />
                      <Bar dataKey="gpa" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Notice Board Management */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
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
              <button className="w-full py-3 bg-kist-blue text-white rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-800 transition-all">
                <Plus size={18} />
                <span>Post Notice</span>
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Upcoming Notices</h3>
            <div className="space-y-4">
              {notices.length === 0 && <p className="text-slate-400 text-sm">No notices posted yet.</p>}
              {notices.map(notice => (
                <div key={notice.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 relative group">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm">{notice.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{notice.date}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      notice.type === 'HOLIDAY' ? 'bg-amber-100 text-amber-700' : 
                      notice.type === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {notice.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">{notice.content}</p>
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
    </div>
  );
};

export default AdminDashboard;
