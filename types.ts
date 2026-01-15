
export type Role = 'ADMIN' | 'STUDENT';

export interface User {
  id: string;
  regNumber: string;
  username: string;
  role: Role;
  photoUrl?: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'HOLIDAY' | 'EVENT' | 'URGENT';
}

export interface StudentRecord {
  semester: string;
  gpa: number;
  attendance: number;
}

export interface StudentWithRecords extends User {
  records: StudentRecord[];
}
