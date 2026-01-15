
import React, { useState, useEffect } from 'react';
import { User, StudentWithRecords, Notice, StudentRecord } from '../types';
import { getStoredData, DB_KEYS } from '../store';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  Calendar, 
  BookOpen, 
  Clock, 
  Award, 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown,
  LineChart as ChartIcon,
  Percent,
  TrendingUp,
  TrendingDown,
  Star,
  Info,
  Search
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  setUser: (user: User) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [studentData, setStudentData] = useState<StudentWithRecords | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showStandingInfo, setShowStandingInfo] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [semesterSearch, setSemesterSearch] = useState('');

  useEffect(() => {
    const students = getStoredData<StudentWithRecords[]>(DB_KEYS.STUDENTS, []);
    const data = students.find(s => s.id === user.id);
    if (data) {
      setStudentData(data);
    }
    setNotices(getStoredData(DB_KEYS.NOTICES, []));
  }, [user]);

  const currentRecords = studentData?.records || [];
  const latestGPA = currentRecords[currentRecords.length - 1]?.gpa || 0;
  const prevGPA = currentRecords.length > 1 ? currentRecords[currentRecords.length - 2]?.gpa : latestGPA;
  const gpaTrend = (latestGPA - prevGPA).toFixed(2);

  const latestAttendance = currentRecords[currentRecords.length - 1]?.attendance || 0;
  const prevAttendance = currentRecords.length > 1 ? currentRecords[currentRecords.length - 2]?.attendance : latestAttendance;
  const attTrend = latestAttendance - prevAttendance;

  const filteredAndSortedRecords = [...currentRecords]
    .filter(r => r.semester.toLowerCase().includes(semesterSearch.toLowerCase()))
    .sort((a, b) => {
      const cmp = a.semester.localeCompare(b.semester, undefined, { numeric: true });
      return sortOrder === 'asc' ? cmp : -cmp;
    });

  const toggleSort = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-kist-gold/10 blur-3xl -mr-32 -mt-32 rounded-full"></div>
        
        <div className="w-32 h-32 rounded-full border-4 border-kist-blue overflow-hidden shadow-xl bg-slate-100 dark:bg-slate-900">
          <img src={studentData?.photoUrl || user.photoUrl || 'https://picsum.photos/200'} alt={user.username} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{studentData?.username || user.username}</h2>
          <p className="text-slate-500 font-medium">{user.regNumber}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <span className="flex items-center space-x-2 text-xs font-bold px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-kist-blue rounded-full border border-blue-100 dark:border-blue-900/30">
              <BookOpen size={14} /> <span>Computer Science</span>
            </span>
            <span className="flex items-center space-x-2 text-xs font-bold px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full border border-amber-100 dark:border-amber-900/30">
              <Clock size={14} /> <span>{currentRecords.length > 0 ? `Semester ${currentRecords.length}` : 'New Student'}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl">
                <Award size={24} />
              </div>
              <div className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-lg ${Number(gpaTrend) >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                {Number(gpaTrend) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{gpaTrend}</span>
              </div>
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current GPA</p>
              <h4 className="text-3xl font-black text-slate-800 dark:text-white">{latestGPA.toFixed(2)}</h4>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl">
                <Percent size={24} />
              </div>
              <div className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-lg ${attTrend >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                {attTrend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{Math.abs(attTrend)}%</span>
              </div>
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attendance</p>
              <h4 className="text-3xl font-black text-slate-800 dark:text-white">{latestAttendance}%</h4>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl">
                <Star size={24} />
              </div>
              <button 
                onMouseEnter={() => setShowStandingInfo(true)}
                onMouseLeave={() => setShowStandingInfo(false)}
                className="p-1.5 text-slate-400 hover:text-kist-blue transition-colors"
              >
                <Info size={18} />
              </button>
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Academic Standing</p>
              <h4 className={`text-xl font-black mt-1 ${latestGPA >= 3.5 ? 'text-kist-gold' : 'text-slate-800 dark:text-white'}`}>
                {latestGPA >= 3.8 ? "Dean's List" : latestGPA >= 3.5 ? "First Class" : "Good Standing"}
              </h4>
           </div>

           {showStandingInfo && (
             <div className="absolute top-16 right-6 z-20 w-56 bg-white dark:bg-slate-700 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-600 animate-in zoom-in-95 fade-in duration-200">
               <h5 className="text-xs font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                 <Award size={14} className="text-kist-gold" /> Grading Criteria
               </h5>
               <ul className="space-y-2">
                 <li className="flex justify-between items-center text-[11px]"><span className="font-bold text-kist-gold">Dean's List</span> <span className="text-slate-400">GPA ≥ 3.80</span></li>
                 <li className="flex justify-between items-center text-[11px]"><span className="font-bold text-blue-500">First Class</span> <span className="text-slate-400">GPA ≥ 3.50</span></li>
                 <li className="flex justify-between items-center text-[11px]"><span className="font-bold text-slate-400">Good Standing</span> <span className="text-slate-400">GPA &lt; 3.50</span></li>
               </ul>
             </div>
           )}
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
           <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl">
                <BookOpen size={24} />
              </div>
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Credits Earned</p>
              <h4 className="text-3xl font-black text-slate-800 dark:text-white">{currentRecords.length * 20}</h4>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${(currentRecords.length / 8) * 100}%` }}></div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2 mb-6">
            <ChartIcon size={20} className="text-kist-blue" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Trend Analysis</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentRecords}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="semester" stroke="#94a3b8" />
                <YAxis yAxisId="left" domain={[0, 4]} stroke="#1e3a8a" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#fbbf24" />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="gpa" stroke="#1e3a8a" strokeWidth={3} name="GPA" dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="attendance" stroke="#fbbf24" strokeWidth={3} name="Attendance %" strokeDasharray="5 5" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Latest Notices</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {notices.map(notice => (
              <div key={notice.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-l-4 border-kist-gold">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{notice.title}</h4>
                  <span className="text-[10px] text-slate-400 font-bold">{notice.date}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{notice.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Academic History</h3>
            <p className="text-sm text-slate-500 mt-1">Official records verified by KIST Registrar</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search semester..."
                value={semesterSearch}
                onChange={(e) => setSemesterSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-kist-blue dark:text-white text-sm w-full sm:w-48"
              />
            </div>
            <button onClick={toggleSort} className="flex items-center space-x-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-sm font-semibold">
              <ArrowUpDown size={16} /> <span className="hidden sm:inline">Sort: {sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
              {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-700">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Semester</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">GPA</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Attendance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredAndSortedRecords.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-slate-400 italic">No matching records.</td></tr>
              ) : filteredAndSortedRecords.map((record, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{record.semester}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${record.gpa >= 3.5 ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                      {record.gpa.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">{record.attendance}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
