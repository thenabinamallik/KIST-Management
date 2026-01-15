
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import Sidebar from './components/Sidebar';
import { initializeDB, getStoredData, DB_KEYS } from './store';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initializeDB();
    const savedUser = getStoredData<User | null>(DB_KEYS.AUTH, null);
    if (savedUser) {
      setUser(savedUser);
    }
    
    // Check dark mode preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem(DB_KEYS.AUTH);
    setUser(null);
    navigate('/');
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900' : 'bg-slate-50'} flex`}>
      {user && <Sidebar user={user} onLogout={handleLogout} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />}
      
      <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ${user ? 'md:ml-64' : ''}`}>
        <Routes>
          <Route path="/" element={!user ? <Login onLogin={setUser} /> : <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} />} />
          <Route path="/admin/*" element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/student/*" element={user?.role === 'STUDENT' ? <StudentDashboard user={user} setUser={setUser} /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
