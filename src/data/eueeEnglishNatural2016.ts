import { Exam } from './exams';

export const eueeEnglishNatural2016: Exam = {
  id: 'euee-english-natural-2016',
  title: '2016 EUEE English for Natural Science',
  subject: 'English',
  duration: 120,
  totalQuestions: 0, // Add actual number of questions
  totalMarks: 0,
  description: '2016 EUEE English for Natural Science - Add description here',
  scheduledDate: '2026-09-26',
  status: 'active',
  stream: 'natural',
  password: 'ENGNAT2016',
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