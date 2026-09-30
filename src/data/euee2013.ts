import { Exam } from './exams';

export const euee2013: Exam = {
  id: 'euee-2013',
  title: '2013 EUEE Examination',
  subject: 'General',
  duration: 120,
  totalQuestions: 0, // Add actual number of questions
  totalMarks: 0,
  description: '2013 EUEE Examination - Add description here',
  scheduledDate: '2026-09-26',
  status: 'active',
  stream: 'both',
  password: 'EUEE2013',
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