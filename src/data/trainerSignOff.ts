import { useSyncExternalStore } from 'react'

/**
 * DES-335 trainer sign-off (Scottish licensing).
 *
 * A course with `requiresSignOff` ends with a Personal Licence Holder confirming,
 * on the learner's device, that they delivered the training. The record keeps the
 * attestation exactly as it was shown, so the certificate and the CSV print the
 * words the licence holder actually ticked.
 */

/** Ticket wording (D5). Legal replaces it later as a straight copy swap. */
export const SIGN_OFF_ATTESTATION = (learnerName: string) =>
  `I confirm that I am a personal licence holder and that I delivered this training to ${learnerName}.`

/** The prototype's learner (matches the mobile app profile). */
export const SIGN_OFF_LEARNER = { id: 'u_anthony', name: 'Anthony Wallace', email: 'anthony.wallace@email.com' }

export interface SignOffRecord {
  courseId: string
  learnerId: string
  learnerName: string
  holderName: string
  licenceNumber: string
  issuingBoard: string
  /** The attestation text exactly as shown when it was ticked. */
  attestation: string
  /** ISO timestamp. */
  signedAt: string
}

/** "12 Oct 2026". A bare "2026-10-12" is read as a local day, not UTC midnight. */
export const formatSignOffDate = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T00:00:00` : iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

/** The local calendar day of an ISO timestamp, as "2026-10-12". */
const localDay = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* ── Learner store ──
   In memory only: web, mobile and admin see the same sign-off while you move
   around the prototype, and a page refresh starts the demo over. */
let records: Record<string, SignOffRecord> = {}
const listeners = new Set<() => void>()

export function saveSignOff(record: SignOffRecord) {
  records = { ...records, [record.courseId]: record }
  listeners.forEach((l) => l())
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function useSignOff(courseId: string): SignOffRecord | undefined {
  return useSyncExternalStore(subscribe, () => records[courseId])
}

export type SignOffState = 'locked' | 'ready' | 'completed'

/** Locked until every step is done; completed once the licence holder signs. */
export const signOffState = (contentProgress: number, record?: SignOffRecord): SignOffState =>
  record ? 'completed' : contentProgress >= 100 ? 'ready' : 'locked'

/**
 * The sign-off counts as the course's last step, so the course reads under 100%
 * until it is signed: content progress scaled by lessons / (lessons + 1).
 */
export const courseProgressWithSignOff = (contentProgress: number, lessons: number, signed: boolean) =>
  signed ? 100 : Math.floor((contentProgress * lessons) / (lessons + 1))

/* ── Admin responses (Sign-off tab) ── */

export type SignOffStatus = 'signed' | 'awaiting' | 'in-progress'

export interface SignOffRow {
  id: string
  name: string
  email: string
  team: string
  /** ISO date the learner completed every step; null while still learning. */
  completedOn: string | null
  status: SignOffStatus
  holderName?: string
  licenceNumber?: string
  issuingBoard?: string
  attestation?: string
  signedOn?: string
}

type Seed = [name: string, team: string, status: SignOffStatus, completedOn?: string, holder?: number, signedOn?: string]

const HOLDERS = [
  { name: 'Fiona MacLeod', licence: 'GCC/PL/04821', board: 'Glasgow Licensing Board' },
  { name: 'Callum Reid', licence: 'CEC/PL/11937', board: 'City of Edinburgh Licensing Board' },
  { name: 'Morag Sinclair', licence: 'ABZ/PL/2276', board: 'Aberdeen City Licensing Board' },
  { name: 'Euan Fraser', licence: 'HC/PL/0938', board: 'Highland Licensing Board' },
]

const SEEDS: Seed[] = [
  ['Sophia Carter', 'Bar, Glasgow Central', 'signed', '2026-09-02', 0, '2026-09-02'],
  ['Oliver Bennett', 'Bar, Glasgow Central', 'signed', '2026-09-03', 0, '2026-09-04'],
  ['Charlotte Hughes', 'Bar, Inverness', 'in-progress'],
  ['Emma Thompson', 'Restaurant, Edinburgh', 'signed', '2026-09-05', 1, '2026-09-05'],
  ['Noah Davis', 'Bar, Aberdeen', 'in-progress'],
  ['Liam Johnson', 'Restaurant, Edinburgh', 'awaiting', '2026-10-08'],
  ['Ava Martinez', 'Room Service, Edinburgh', 'signed', '2026-09-09', 1, '2026-09-10'],
  ['Isabella Lewis', 'Bar, Aberdeen', 'signed', '2026-09-11', 2, '2026-09-11'],
  ['James Walker', 'Banqueting, Aberdeen', 'awaiting', '2026-10-09'],
  ['Mia Robinson', 'Banqueting, Aberdeen', 'signed', '2026-09-14', 2, '2026-09-15'],
  ['Lucas Wright', 'Bar, Inverness', 'signed', '2026-09-16', 3, '2026-09-16'],
  ['Ethan Clarke', 'Restaurant, Inverness', 'signed', '2026-09-18', 3, '2026-09-19'],
  ['Amelia Scott', 'Bar, Glasgow Central', 'awaiting', '2026-10-10'],
  ['Harris Campbell', 'Bar, Glasgow Central', 'signed', '2026-09-22', 0, '2026-09-22'],
  ['Isla Stewart', 'Restaurant, Edinburgh', 'signed', '2026-09-23', 1, '2026-09-24'],
  ['Ruaridh Murray', 'Room Service, Edinburgh', 'in-progress'],
  ['Eilidh Paterson', 'Bar, Aberdeen', 'signed', '2026-09-25', 2, '2026-09-25'],
  ['Finlay Robertson', 'Banqueting, Aberdeen', 'awaiting', '2026-10-11'],
  ['Niamh Kerr', 'Bar, Inverness', 'signed', '2026-09-29', 3, '2026-09-30'],
  ['Zofia Nowak', 'Restaurant, Inverness', 'signed', '2026-10-01', 3, '2026-10-01'],
  ['Mateo García', 'Bar, Glasgow Central', 'in-progress'],
  ['Aoife Byrne', 'Restaurant, Edinburgh', 'signed', '2026-10-02', 1, '2026-10-03'],
  ['Kwame Mensah', 'Bar, Aberdeen', 'signed', '2026-10-06', 2, '2026-10-06'],
  ['Grace Thomson', 'Banqueting, Aberdeen', 'in-progress'],
]

const email = (name: string) =>
  `${name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '.')}@email.com`

const seededRows: SignOffRow[] = SEEDS.map(([name, team, status, completedOn, holder, signedOn], i) => {
  const h = holder !== undefined ? HOLDERS[holder] : undefined
  return {
    id: `so${i + 1}`,
    name,
    email: email(name),
    team,
    completedOn: completedOn ?? null,
    status,
    holderName: h?.name,
    licenceNumber: h?.licence,
    issuingBoard: h?.board,
    attestation: h ? SIGN_OFF_ATTESTATION(name) : undefined,
    signedOn: signedOn,
  }
})

/**
 * The course's responses: the seeded cohort plus the prototype learner, whose row
 * follows what was signed on the learner side for the demo course.
 */
export function getSignOffRows(record?: SignOffRecord): SignOffRow[] {
  const own: SignOffRow = record
    ? {
        id: 'so-own',
        name: SIGN_OFF_LEARNER.name,
        email: SIGN_OFF_LEARNER.email,
        team: 'Bar, Glasgow Central',
        completedOn: localDay(record.signedAt),
        status: 'signed',
        holderName: record.holderName,
        licenceNumber: record.licenceNumber,
        issuingBoard: record.issuingBoard,
        attestation: record.attestation,
        signedOn: localDay(record.signedAt),
      }
    : {
        id: 'so-own',
        name: SIGN_OFF_LEARNER.name,
        email: SIGN_OFF_LEARNER.email,
        team: 'Bar, Glasgow Central',
        completedOn: '2026-10-12',
        status: 'awaiting',
      }
  return [own, ...seededRows]
}

/** The course the admin Sign-off tab reports on in the prototype. */
export const SIGN_OFF_DEMO_COURSE = { id: 'p7c1', title: 'Licensing (Scotland) Staff Training' }

export const SIGN_OFF_STATUS_LABEL: Record<SignOffStatus, string> = {
  signed: 'Signed off',
  awaiting: 'Needs sign-off',
  'in-progress': 'Course not completed',
}

const csvCell = (v: string | null | undefined) => {
  const s = v ?? ''
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** UTF-8 CSV (with BOM, so Excel keeps accented names). */
export function signOffCsv(rows: SignOffRow[]): string {
  const header = [
    'Learner name',
    'Email',
    'Team',
    'Completion date',
    'Status',
    'Licence holder name',
    'Personal licence number',
    'Issuing licensing board',
    'Attestation',
    'Signed on',
  ]
  const lines = rows.map((r) =>
    [
      r.name,
      r.email,
      r.team,
      r.completedOn,
      SIGN_OFF_STATUS_LABEL[r.status],
      r.holderName,
      r.licenceNumber,
      r.issuingBoard,
      r.attestation,
      r.signedOn,
    ]
      .map(csvCell)
      .join(','),
  )
  return '﻿' + [header.join(','), ...lines].join('\n')
}
