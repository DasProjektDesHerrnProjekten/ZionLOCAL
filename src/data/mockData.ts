export interface StudentResult {
  id: string;
  studentId: string;
  studentName: string;
  admissionId: string;
  class: string;
  section: string;
  examId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  submittedAt: string;
  duration: number; // time taken in minutes
  status: 'passed' | 'failed';
}

export interface Violation {
  id: string;
  studentId: string;
  studentName: string;
  admissionId: string;
  examId: string;
  examTitle: string;
  type: 'tab_switch' | 'copy_attempt' | 'paste_attempt' | 'fullscreen_exit' | 'suspicious_activity';
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface StudentRecord {
  id: string;
  admissionId: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  examsTaken: number;
  averageScore: number;
}

export const studentRecords: StudentRecord[] = [
  {
    id: '1',
    admissionId: 'ADM001',
    name: 'John Anderson',
    class: '10th',
    section: 'A',
    rollNumber: '15',
    email: 'john.anderson@school.edu',
    phone: '+1 234 567 8901',
    status: 'active',
    examsTaken: 5,
    averageScore: 78,
  },
  {
    id: '2',
    admissionId: 'ADM002',
    name: 'Sarah Williams',
    class: '12th',
    section: 'B',
    rollNumber: '08',
    email: 'sarah.williams@school.edu',
    phone: '+1 234 567 8902',
    status: 'active',
    examsTaken: 8,
    averageScore: 92,
  },
  {
    id: '3',
    admissionId: 'ADM003',
    name: 'Michael Brown',
    class: '10th',
    section: 'A',
    rollNumber: '22',
    email: 'michael.brown@school.edu',
    phone: '+1 234 567 8903',
    status: 'active',
    examsTaken: 4,
    averageScore: 65,
  },
  {
    id: '4',
    admissionId: 'ADM004',
    name: 'Emily Davis',
    class: '11th',
    section: 'C',
    rollNumber: '03',
    email: 'emily.davis@school.edu',
    phone: '+1 234 567 8904',
    status: 'suspended',
    examsTaken: 3,
    averageScore: 45,
  },
  {
    id: '5',
    admissionId: 'ADM005',
    name: 'David Wilson',
    class: '12th',
    section: 'A',
    rollNumber: '11',
    email: 'david.wilson@school.edu',
    phone: '+1 234 567 8905',
    status: 'active',
    examsTaken: 7,
    averageScore: 88,
  },
];

export const studentResults: StudentResult[] = [
  {
    id: 'r1',
    studentId: '1',
    studentName: 'John Anderson',
    admissionId: 'ADM001',
    class: '10th',
    section: 'A',
    examId: 'exam-1',
    examTitle: 'Mathematics Mid-Term',
    score: 8,
    totalQuestions: 10,
    percentage: 80,
    submittedAt: '2024-12-15T10:30:00',
    duration: 45,
    status: 'passed',
  },
  {
    id: 'r2',
    studentId: '2',
    studentName: 'Sarah Williams',
    admissionId: 'ADM002',
    class: '12th',
    section: 'B',
    examId: 'exam-1',
    examTitle: 'Mathematics Mid-Term',
    score: 9,
    totalQuestions: 10,
    percentage: 90,
    submittedAt: '2024-12-15T10:25:00',
    duration: 38,
    status: 'passed',
  },
  {
    id: 'r3',
    studentId: '3',
    studentName: 'Michael Brown',
    admissionId: 'ADM003',
    class: '10th',
    section: 'A',
    examId: 'exam-1',
    examTitle: 'Mathematics Mid-Term',
    score: 5,
    totalQuestions: 10,
    percentage: 50,
    submittedAt: '2024-12-15T10:55:00',
    duration: 58,
    status: 'failed',
  },
  {
    id: 'r4',
    studentId: '4',
    studentName: 'Emily Davis',
    admissionId: 'ADM004',
    class: '11th',
    section: 'C',
    examId: 'exam-2',
    examTitle: 'Science Quarterly Test',
    score: 3,
    totalQuestions: 8,
    percentage: 37.5,
    submittedAt: '2024-12-14T14:20:00',
    duration: 44,
    status: 'failed',
  },
  {
    id: 'r5',
    studentId: '5',
    studentName: 'David Wilson',
    admissionId: 'ADM005',
    class: '12th',
    section: 'A',
    examId: 'exam-2',
    examTitle: 'Science Quarterly Test',
    score: 7,
    totalQuestions: 8,
    percentage: 87.5,
    submittedAt: '2024-12-14T14:15:00',
    duration: 35,
    status: 'passed',
  },
];

export const violations: Violation[] = [
  {
    id: 'v1',
    studentId: '4',
    studentName: 'Emily Davis',
    admissionId: 'ADM004',
    examId: 'exam-2',
    examTitle: 'Science Quarterly Test',
    type: 'tab_switch',
    description: 'Switched to another browser tab during examination',
    timestamp: '2024-12-14T14:10:32',
    severity: 'high',
  },
  {
    id: 'v2',
    studentId: '4',
    studentName: 'Emily Davis',
    admissionId: 'ADM004',
    examId: 'exam-2',
    examTitle: 'Science Quarterly Test',
    type: 'copy_attempt',
    description: 'Attempted to copy question text',
    timestamp: '2024-12-14T14:12:15',
    severity: 'medium',
  },
  {
    id: 'v3',
    studentId: '3',
    studentName: 'Michael Brown',
    admissionId: 'ADM003',
    examId: 'exam-1',
    examTitle: 'Mathematics Mid-Term',
    type: 'fullscreen_exit',
    description: 'Exited fullscreen mode during examination',
    timestamp: '2024-12-15T10:40:22',
    severity: 'medium',
  },
  {
    id: 'v4',
    studentId: '1',
    studentName: 'John Anderson',
    admissionId: 'ADM001',
    examId: 'exam-1',
    examTitle: 'Mathematics Mid-Term',
    type: 'paste_attempt',
    description: 'Attempted to paste content into answer field',
    timestamp: '2024-12-15T10:22:45',
    severity: 'high',
  },
  {
    id: 'v5',
    studentId: '3',
    studentName: 'Michael Brown',
    admissionId: 'ADM003',
    examId: 'exam-1',
    examTitle: 'Mathematics Mid-Term',
    type: 'suspicious_activity',
    description: 'Multiple rapid answer changes detected',
    timestamp: '2024-12-15T10:50:11',
    severity: 'low',
  },
];
