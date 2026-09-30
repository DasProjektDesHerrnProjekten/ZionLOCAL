import { Exam } from './exams';

export const satExamNew: Exam = {
  id: 'sat-exam-new',
  title: 'SAT Examination',
  subject: 'SAT',
  duration: 60,
  totalQuestions: 0, // Add actual number of questions
  totalMarks: 0,
  description: 'SAT Examination - Add description here',
  scheduledDate: '2026-09-26',
  status: 'active',
  stream: 'both',
  password: 'SATNEW',
  questions: [
    // Add questions here following this format:
    // {
    //   id: 1,
    //   text: 'Question text here',
    //   options: ['Option A', 'Option B', 'Option C', 'Option D'],
    //   correctAnswer: 0, // index of correct answer (0 = A, 1 = B, etc.)
    // }
  ]
};