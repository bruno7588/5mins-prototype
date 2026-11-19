/* Enrolments-tab stand-in data: the same completed learners as the course page. */
export interface ProtoLearner {
  id: number
  name: string
  email: string
  status: 'Completed' | 'In Progress' | 'Not Started' | 'Failed'
  completionDate: string | null
  deactivated?: boolean
}

export const LEARNERS: ProtoLearner[] = [
  { id: 1, name: 'Anthony Wallace', email: 'anthony.wallace@email.com', status: 'Failed', completionDate: 'Sep 25, 2025' },
  { id: 2, name: 'Sophia Carter', email: 'sophia.carter@email.com', status: 'Completed', completionDate: 'Sep 25, 2025' },
  { id: 3, name: 'Oliver Bennett', email: 'oliver.bennett@email.com', status: 'Not Started', completionDate: null },
  { id: 7, name: 'Noah Davis', email: 'noah.davis@email.com', status: 'In Progress', completionDate: null },
  { id: 8, name: 'Isabella Lewis', email: 'isabella.lewis@email.com', status: 'Completed', completionDate: 'Sep 12, 2025' },
  { id: 9, name: 'James Walker', email: 'james.walker@email.com', status: 'Completed', completionDate: 'Aug 30, 2025' },
  { id: 11, name: 'Ethan Clarke', email: 'ethan.clarke@email.com', status: 'Completed', completionDate: 'Aug 21, 2025', deactivated: true },
  { id: 12, name: 'Grace Hughes', email: 'grace.hughes@email.com', status: 'Completed', completionDate: 'Sep 04, 2025', deactivated: true },
]

export const CERTS_ACTIVE = LEARNERS.filter((l) => l.status === 'Completed' && !l.deactivated).length
export const CERTS_ALL = LEARNERS.filter((l) => l.status === 'Completed').length
export const DEACTIVATED_COMPLETED = CERTS_ALL - CERTS_ACTIVE
export const certCount = (n: number) => `${n} certificate${n === 1 ? '' : 's'}`

/** Each variant reports the download through the page toast. */
export type OnDownload = (count: number) => void
