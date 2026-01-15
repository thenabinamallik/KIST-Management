
import React, { useState } from 'react';
import { User, Role } from '../types';
import { DB_KEYS, setStoredData } from '../store';
import { ShieldCheck, User as UserIcon, Lock, GraduationCap } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [role, setRole] = useState<Role>('STUDENT');
  const [regNumber, setRegNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regNumber || !password) {
      setError('Please enter both ID and Password');
      return;
    }

    // Simulate Authentication
    let user: User | null = null;
    if (role === 'ADMIN' && regNumber === 'ADMIN001' && password === 'admin123') {
      user = { id: 'admin-1', regNumber: 'ADMIN001', username: 'Prof. Smith', role: 'ADMIN' };
    } else if (role === 'STUDENT' && regNumber.startsWith('KIST/') && password === 'student123') {
      user = { 
        id: '1', 
        regNumber: regNumber, 
        username: 'Alice Johnson', 
        role: 'STUDENT', 
        photoUrl: 'https://picsum.photos/seed/alice/200' 
      };
    }

    if (user) {
      setStoredData(DB_KEYS.AUTH, user);
      onLogin(user);
    } else {
      setError('Invalid Credentials. Hint: Use KIST/2023/001 & student123 OR ADMIN001 & admin123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-kist-blue p-8 text-center text-white">
          <GraduationCap size={48} className="mx-auto mb-4 text-kist-gold" />
          <h1 className="text-3xl font-bold tracking-tight">KIST Portal</h1>
          <p className="text-white/70 mt-2">Sign in to track your records</p>
        </div>

        <div className="p-8">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-8">
            <button 
              onClick={() => setRole('STUDENT')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === 'STUDENT' ? 'bg-white dark:bg-slate-700 shadow-sm text-kist-blue dark:text-kist-gold' : 'text-slate-500'}`}
            >
              Student
            </button>
            <button 
              onClick={() => setRole('ADMIN')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${role === 'ADMIN' ? 'bg-white dark:bg-slate-700 shadow-sm text-kist-blue dark:text-kist-gold' : 'text-slate-500'}`}
            >
              Professor
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {role === 'ADMIN' ? 'Employee ID' : 'Registration Number'}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  placeholder={role === 'ADMIN' ? 'e.g. ADMIN001' : 'e.g. KIST/2023/001'}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-kist-blue outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-kist-blue outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-4 bg-kist-blue hover:bg-blue-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-kist-blue/20 transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              {role === 'ADMIN' ? <ShieldCheck size={20} /> : <GraduationCap size={20} />}
              <span>Login Access</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
