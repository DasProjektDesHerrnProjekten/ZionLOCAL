import { Exam } from './exams';

export const mathExam2018: Exam = {
  id: 'math-2018',
  title: 'GRADE 12 MATHEMATICS (FOR SOCIAL SCIENCE) MODEL EXAMINATIONS 2016E.C/ 2024G.C',
  subject: 'Mathematics',
  duration: 180,
  totalQuestions: 65,
  description: 'Mathematics Exam for Social Science Students',
  scheduledDate: '2026-02-27',
  status: 'ongoing',
  stream: 'both',
  password: 'MATH2018',
  questions: [
    {
      id: 1,
      text: 'The first five terms of the sequence, where a1 = 3, an = 3an−1 + 2 for all n > 1',
      options: [
        '3,15,40,110,330',
        '3,11,35,107,323',
        '3,20,45,110,330',
        '3,11,40,107,323'
      ],
      correctAnswer: 1,
      rationale: 'By substituting n=2,3,4,5: a2=3(3)+2=11, a3=3(11)+2=35, a4=3(35)+2=107, and a5=3(107)+2=323.'
    },
    {
      id: 2,
      text: 'Which one of the following is a geometric series is convergent?',
      options: [
        '∑ (1/10)^n from n=1 to ∞',
        '∑ (1/2)^n from n=1 to ∞',
        '∑ (-3)^n from n=1 to ∞',
        '∑ 3^n from n=1 to ∞'
      ],
      correctAnswer: 0,
      rationale: 'An infinite geometric series converges if the absolute value of the common ratio |r| is less than 1; here r=1/10 satisfies |1/10| < 1.'
    },
    {
      id: 3,
      text: 'The sum of the integers between 12 and 280 which are divisible by 13 is',
      options: [
        '2920',
        '3000',
        '3003',
        '3012'
      ],
      correctAnswer: 2,
      rationale: 'The sequence is 13, 26, ..., 273 with n=21 terms; using the sum formula Sn = (n/2)(a1 + an) gives (21/2)(13 + 273) = 3003.'
    },
    {
      id: 4,
      text: 'The income of a person is 300,000 birr in first year and he receives an increment of 1000 to his income per year for next 19 yrs. then, the total amount he received in 20 years in birr is:',
      options: [
        '790,000',
        '600,000',
        '800,000',
        '6,190,000'
      ],
      correctAnswer: 3,
      rationale: 'Using the arithmetic series sum formula Sn = (n/2)(2a + (n-1)d) with n=20, a=300,000, and d=1000, we get 10(600,000 + 19,000) = 6,190,000.'
    },
    {
      id: 5,
      text: 'The sum of the series 3/4 − 5/4^2 + 3/4^3 − 5/4^4 + 3/4^5 − 5/4^6 +… is:',
      options: [
        '4/5',
        '7/15',
        '2/5',
        '1/3'
      ],
      correctAnswer: 1,
      rationale: 'Separating into two geometric series: Σ3/4^(2n-1) and Σ-5/4^(2n), both with r=1/16, the sum is (4/5) - (1/3) = 7/15.'
    },
    {
      id: 6,
      text: 'The nth term of a GP 5, 25, 125,… is',
      options: [
        '5^(n-1)',
        '5^(n+1)',
        '5^n',
        '5^(n-2)'
      ],
      correctAnswer: 2,
      rationale: 'The first term a=5 and common ratio r=5, so the nth term is an = a * r^(n-1) = 5 * 5^(n-1) = 5^n.'
    },
    {
      id: 7,
      text: 'Given f(x) = 2x^2 − 7x − 10. What the absolute maximum of f on [−1,3]?',
      options: [
        '−1',
        '7/4',
        '−10',
        '9'
      ],
      correctAnswer: 3,
      rationale: 'Checking endpoints and critical points: f(-1)=9, f(3)=-13, and f(7/4)=-16.125; the function is strictly decreasing on (-∞,-3)∪(0,∞) and strictly increasing on (-3,0).'
    }
    // Add more questions here as needed
  ]
};