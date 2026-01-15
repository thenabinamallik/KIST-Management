
import { User, Notice, StudentWithRecords, Role } from './types';

// Initial Mock Data
const INITIAL_STUDENTS: StudentWithRecords[] = [
  {
    id: '1',
    regNumber: 'KIST/2023/001',
    username: 'Alice Johnson',
    role: 'STUDENT',
    photoUrl: 'https://picsum.photos/seed/alice/200',
    records: [
      { semester: 'Sem 1', gpa: 3.8, attendance: 95 },
      { semester: 'Sem 2', gpa: 3.9, attendance: 92 },
      { semester: 'Sem 3', gpa: 3.7, attendance: 88 },
    ]
  },
  {
    id: '2',
    regNumber: 'KIST/2023/002',
    username: 'Bob Smith',
    role: 'STUDENT',
    photoUrl: 'https://picsum.photos/seed/bob/200',
    records: [
      { semester: 'Sem 1', gpa: 3.2, attendance: 85 },
      { semester: 'Sem 2', gpa: 3.4, attendance: 80 },
    ]
  }
];

const INITIAL_NOTICES: Notice[] = [
  { id: 'n1', title: 'Summer Break', content: 'University will remain closed for 2 weeks.', date: '2024-06-15', type: 'HOLIDAY' },
  { id: 'n2', title: 'Independence Day', content: 'Holiday for national celebration.', date: '2024-08-15', type: 'HOLIDAY' },
];

export const getStoredData = <T,>(key: string, initial: T): T => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : initial;
};

export const setStoredData = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const DB_KEYS = {
  STUDENTS: 'kist_students',
  NOTICES: 'kist_notices',
  AUTH: 'kist_auth_user'
};

// Singleton-ish approach for simplicity in this SPA
export const initializeDB = () => {
  if (!localStorage.getItem(DB_KEYS.STUDENTS)) {
    setStoredData(DB_KEYS.STUDENTS, INITIAL_STUDENTS);
  }
  if (!localStorage.getItem(DB_KEYS.NOTICES)) {
    setStoredData(DB_KEYS.NOTICES, INITIAL_NOTICES);
  }
};
