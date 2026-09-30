import { Exam } from './exams';

export const eueeEnglish2010: Exam = {
  id: 'euee-english-2010',
  title: '2010 EUEE English Examination',
  subject: 'English',
  duration: 120,
  totalQuestions: 0, // Add actual number of questions
  totalMarks: 0,
  description: '2010 EUEE English Examination - Add description here',
  scheduledDate: '2026-09-26',
  status: 'active',
  stream: 'both',
  password: 'ENGLISH2010',
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