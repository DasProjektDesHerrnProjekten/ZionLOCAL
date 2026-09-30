import { Exam } from './exams';

export const geographyModel2nd2026: Exam = {
  id: 'geography-model-2nd-2026',
  title: 'Geography Model 2nd 2026',
  subject: 'Geography',
  duration: 120,
  totalQuestions: 0, // Add actual number of questions
  totalMarks: 0,
  description: 'Geography Model 2nd 2026 - Add description here',
  scheduledDate: '2026-09-26',
  status: 'active',
  stream: 'social',
  password: 'GEO2026',
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