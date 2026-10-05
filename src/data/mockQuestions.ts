export interface Answer {
  id: string
  text: string
  isCorrect: boolean
}

export interface Question {
  id: string
  text: string
  type: 'multiple_choice' | 'multi_select' | 'true_false' | 'free_text'
  answers: Answer[]
  createdBy: 'ai' | 'manual'
  createdAt: string
}

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    text: 'What is the first phase of the Software Development Life Cycle?',
    type: 'multiple_choice',
    answers: [
      { id: 'q1a1', text: 'Requirements gathering', isCorrect: true },
      { id: 'q1a2', text: 'Deployment', isCorrect: false },
      { id: 'q1a3', text: 'Testing', isCorrect: false },
      { id: 'q1a4', text: 'Maintenance', isCorrect: false },
    ],
    createdBy: 'ai',
    createdAt: '2025-02-14T10:00:00Z',
  },
  {
    id: 'q2',
    text: 'Which methodology emphasizes iterative development cycles?',
    type: 'multiple_choice',
    answers: [
      { id: 'q2a1', text: 'Waterfall', isCorrect: false },
      { id: 'q2a2', text: 'Agile', isCorrect: true },
      { id: 'q2a3', text: 'Big Bang', isCorrect: false },
      { id: 'q2a4', text: 'V-Model', isCorrect: false },
    ],
    createdBy: 'ai',
    createdAt: '2025-02-14T10:00:00Z',
  },
  {
    id: 'q3',
    text: 'What does CI/CD stand for in software development?',
    type: 'multiple_choice',
    answers: [
      { id: 'q3a1', text: 'Computer Integration / Computer Delivery', isCorrect: false },
      { id: 'q3a2', text: 'Continuous Integration / Continuous Delivery', isCorrect: true },
      { id: 'q3a3', text: 'Code Inspection / Code Deployment', isCorrect: false },
      { id: 'q3a4', text: 'Centralised Infrastructure / Centralised Distribution', isCorrect: false },
    ],
    createdBy: 'ai',
    createdAt: '2025-02-14T10:00:00Z',
  },
  {
    id: 'q4',
    text: 'What is a primary benefit of conducting code reviews?',
    type: 'multiple_choice',
    answers: [
      { id: 'q4a1', text: 'Faster deployment speed', isCorrect: false },
      { id: 'q4a2', text: 'Reduced server costs', isCorrect: false },
      { id: 'q4a3', text: 'Early detection of defects and bugs', isCorrect: true },
      { id: 'q4a4', text: 'Automatic test generation', isCorrect: false },
    ],
    createdBy: 'ai',
    createdAt: '2025-02-14T10:00:00Z',
  },
  {
    id: 'q5',
    text: 'What is the purpose of regression testing?',
    type: 'multiple_choice',
    answers: [
      { id: 'q5a1', text: 'Testing new features only', isCorrect: false },
      { id: 'q5a2', text: 'Ensuring new changes do not break existing functionality', isCorrect: true },
      { id: 'q5a3', text: 'Measuring application performance', isCorrect: false },
      { id: 'q5a4', text: 'Validating user interface design', isCorrect: false },
    ],
    createdBy: 'ai',
    createdAt: '2025-02-14T10:00:00Z',
  },
  {
    id: 'q6',
    text: 'At which phase should project requirements ideally be frozen?',
    type: 'multiple_choice',
    answers: [
      { id: 'q6a1', text: 'During the testing phase', isCorrect: false },
      { id: 'q6a2', text: 'After the requirements analysis phase', isCorrect: true },
      { id: 'q6a3', text: 'During deployment', isCorrect: false },
      { id: 'q6a4', text: 'At project kickoff', isCorrect: false },
    ],
    createdBy: 'ai',
    createdAt: '2025-02-14T10:00:00Z',
  },
]

const additionalQuestions: Question[] = [
  {
    id: 'q7',
    text: 'What is the main purpose of unit testing?',
    type: 'multiple_choice',
    answers: [
      { id: 'q7a1', text: 'Testing the entire application end-to-end', isCorrect: false },
      { id: 'q7a2', text: 'Verifying individual components work correctly in isolation', isCorrect: true },
      { id: 'q7a3', text: 'Checking database performance', isCorrect: false },
      { id: 'q7a4', text: 'Validating user requirements', isCorrect: false },
    ],
    createdBy: 'ai',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q8',
    text: 'Which version control system is most widely used in modern software development?',
    type: 'multiple_choice',
    answers: [
      { id: 'q8a1', text: 'Subversion (SVN)', isCorrect: false },
      { id: 'q8a2', text: 'Mercurial', isCorrect: false },
      { id: 'q8a3', text: 'Git', isCorrect: true },
      { id: 'q8a4', text: 'Perforce', isCorrect: false },
    ],
    createdBy: 'ai',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q9',
    text: 'What does "technical debt" refer to in software development?',
    type: 'multiple_choice',
    answers: [
      { id: 'q9a1', text: 'The cost of software licences', isCorrect: false },
      { id: 'q9a2', text: 'Shortcuts taken during development that require future rework', isCorrect: true },
      { id: 'q9a3', text: 'Budget overruns on a project', isCorrect: false },
      { id: 'q9a4', text: 'Hardware infrastructure costs', isCorrect: false },
    ],
    createdBy: 'ai',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q10',
    text: 'What is a key advantage of microservices architecture?',
    type: 'multiple_choice',
    answers: [
      { id: 'q10a1', text: 'Simpler initial development', isCorrect: false },
      { id: 'q10a2', text: 'Lower network overhead', isCorrect: false },
      { id: 'q10a3', text: 'Independent deployment and scaling of services', isCorrect: true },
      { id: 'q10a4', text: 'No need for API documentation', isCorrect: false },
    ],
    createdBy: 'ai',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q11',
    text: 'What is the purpose of a sprint retrospective in Scrum?',
    type: 'multiple_choice',
    answers: [
      { id: 'q11a1', text: 'Planning the next sprint\'s work items', isCorrect: false },
      { id: 'q11a2', text: 'Demonstrating completed work to stakeholders', isCorrect: false },
      { id: 'q11a3', text: 'Reflecting on the process and identifying improvements', isCorrect: true },
      { id: 'q11a4', text: 'Estimating story points for backlog items', isCorrect: false },
    ],
    createdBy: 'ai',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'q12',
    text: 'Which deployment strategy allows rolling back to a previous version instantly?',
    type: 'multiple_choice',
    answers: [
      { id: 'q12a1', text: 'Big bang deployment', isCorrect: false },
      { id: 'q12a2', text: 'Blue-green deployment', isCorrect: true },
      { id: 'q12a3', text: 'Manual deployment', isCorrect: false },
      { id: 'q12a4', text: 'Scheduled deployment', isCorrect: false },
    ],
    createdBy: 'ai',
    createdAt: new Date().toISOString(),
  },
]

let generateCallCount = 0

/* AI questions come with three options by default: the correct one plus the first two
   wrong ones, kept in their original order. Admins can add more in the review. */
function threeOptions(answers: Answer[]): Answer[] {
  let wrong = 0
  return answers.filter(a => a.isCorrect || wrong++ < 2)
}

export function generateMoreQuestions(): Question[] {
  generateCallCount++
  return additionalQuestions.map(q => ({
    ...q,
    id: `${q.id}_gen${generateCallCount}`,
    answers: threeOptions(q.answers).map(a => ({ ...a, id: `${a.id}_gen${generateCallCount}` })),
    createdAt: new Date().toISOString(),
  }))
}

export function combinations(n: number, k: number): number {
  if (k > n) return 0
  if (k === 0 || k === n) return 1
  let result = 1
  for (let i = 0; i < Math.min(k, n - k); i++) {
    result = result * (n - i) / (i + 1)
  }
  return Math.round(result)
}
