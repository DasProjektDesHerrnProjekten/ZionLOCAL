import { Exam } from './exams';

export const chemistryGrade12Model1: Exam = {
  id: 'chemistry-grade12-model1',
  title: 'Chemistry Grade 12 Model Exam-1',
  subject: 'Chemistry',
  duration: 120,
  totalQuestions: 0, // Add actual number of questions
  totalMarks: 0,
  description: 'Chemistry Grade 12 Model Exam-1 - Add description here',
  scheduledDate: '2026-09-26',
  status: 'active',
  stream: 'natural',
  password: 'CHEMMODEL1',
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