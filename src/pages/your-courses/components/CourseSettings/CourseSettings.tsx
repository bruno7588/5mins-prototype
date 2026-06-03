import { useState, type ReactNode } from 'react'
import Checkbox from '../../../../components/Checkbox/Checkbox'
import InputInteger from '../../../../components/InputInteger/InputInteger'
import Collapse from '../../../../components/Collapse/Collapse'
import './CourseSettings.css'

type SettingKey =
  | 'managersSeeAll'
  | 'complianceCourse'
  | 'addToCategory'
  | 'enablePassScore'
  | 'accessAfterDue'
  | 'rewards'
  | 'certificate'
  | 'autoReset'
  | 'lessonsInOrder'
  | 'fastForward'
  | 'backgroundPlayback'

interface SettingItem {
  key: SettingKey
  title: string
  description: ReactNode
  /** Optional content revealed when the setting is enabled. */
  expand?: ReactNode
}

interface SettingSection {
  heading: string
  items: SettingItem[]
}

const INITIAL_VALUES: Record<SettingKey, boolean> = {
  managersSeeAll: false,
  complianceCourse: false,
  addToCategory: false,
  enablePassScore: true,
  accessAfterDue: false,
  rewards: false,
  certificate: false,
  autoReset: false,
  lessonsInOrder: false,
  fastForward: false,
  backgroundPlayback: false,
}

const INITIAL_MAX_ATTEMPTS = 3
const INITIAL_DUE_DAYS = 5

function CourseSettings() {
  const [values, setValues] = useState<Record<SettingKey, boolean>>(INITIAL_VALUES)
  const [maxAttempts, setMaxAttempts] = useState(INITIAL_MAX_ATTEMPTS)
  const [newAttemptDueDays, setNewAttemptDueDays] = useState(INITIAL_DUE_DAYS)

  // Last-saved snapshot — a section's Update button is enabled only while it has unsaved changes.
  const [savedValues, setSavedValues] = useState<Record<SettingKey, boolean>>(INITIAL_VALUES)
  const [savedMaxAttempts, setSavedMaxAttempts] = useState(INITIAL_MAX_ATTEMPTS)
  const [savedDueDays, setSavedDueDays] = useState(INITIAL_DUE_DAYS)

  const toggle = (key: SettingKey) => setValues((prev) => ({ ...prev, [key]: !prev[key] }))

  const sections: SettingSection[] = [
    {
      heading: 'Data privacy',
      items: [
        {
          key: 'managersSeeAll',
          title: 'Allow Managers / Experts to see all enrolments',
          description:
            'Managers and Experts can view all course enrollments in Knowledge Hub page. When unchecked, they only see their team members and learners they assigned. This setting controls privacy for this course only.',
        },
      ],
    },
    {
      heading: 'Course organisation',
      items: [
        {
          key: 'complianceCourse',
          title: 'Compliance course',
          description:
            'When selected, this course will be treated as a compliance course and included in Reports as well as Learning records.',
        },
        {
          key: 'addToCategory',
          title: 'Add to category',
          description: (
            <>
              Add this course to a relevant category (e.g., Compliance, Marketing). These courses would show up in
              the &ldquo;Your Workspace&rdquo; page. You can edit these categories from{' '}
              <a
                className="cs-link"
                href="https://app.5mins.ai/admin/account-settings?tab=5"
                target="_blank"
                rel="noreferrer"
              >
                Account &amp; Settings
              </a>{' '}
              page.
            </>
          ),
        },
      ],
    },
    {
      heading: 'Course completion',
      items: [
        {
          key: 'enablePassScore',
          title: 'Enable Pass Score',
          description: (
            <>
              Set the minimum quiz score required to pass the course. The quiz score is the average of all lesson
              quizzes and assessments in the course. We recommend not changing the pass score once it has been set.
              Read more about it{' '}
              <a
                className="cs-link"
                href="https://5mins.featurebase.app/en/help/articles/6973225-pass-score-for-courses"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>
              .
            </>
          ),
        },
        {
          key: 'accessAfterDue',
          title: 'Allow course access after Due Date',
          description: 'Users can continue viewing lessons and assessments after the due date has passed.',
        },
        {
          key: 'rewards',
          title: 'Rewards',
          description: 'Award jewels when course is completed (max of 500 jewels).',
        },
        {
          key: 'certificate',
          title: 'Certificate',
          description: (
            <>
              Add a certificate for completion.{' '}
              <a className="cs-link" href="#">
                Read
              </a>{' '}
              how certification works.
            </>
          ),
        },
        {
          key: 'autoReset',
          title: 'Auto-reset on failure',
          description:
            "Automatically reset a learner's progress for a fresh attempt when they fail, so they can retry without admin intervention.",
          expand: (
            <div className="cs-card-expand">
              <InputInteger
                label="Maximum course attempts"
                value={maxAttempts}
                onChange={setMaxAttempts}
                min={1}
                helperText={
                  <>
                    Once a learner reaches this many attempts, auto-reset stops and they&apos;re marked{' '}
                    <span className="cs-failed">Failed</span>.
                  </>
                }
              />
              <InputInteger
                label="Due days to complete course"
                value={newAttemptDueDays}
                onChange={setNewAttemptDueDays}
                min={1}
              />
            </div>
          ),
        },
      ],
    },
    {
      heading: 'Video playback',
      items: [
        {
          key: 'lessonsInOrder',
          title: 'Course must be completed in order',
          description: 'Users must complete each course item before unlocking the next one.',
        },
        {
          key: 'fastForward',
          title: 'Allow Fast Forwarding',
          description: 'Turn on fast forward so learners can skip ahead in videos.',
        },
        {
          key: 'backgroundPlayback',
          title: 'Enable video playback in background',
          description: 'Allow learners to keep videos playing while viewing other tabs.',
        },
      ],
    },
  ]

  function sectionDirty(section: SettingSection) {
    const boolChanged = section.items.some((item) => values[item.key] !== savedValues[item.key])
    const hasAutoReset = section.items.some((item) => item.key === 'autoReset')
    const numbersChanged =
      hasAutoReset && (maxAttempts !== savedMaxAttempts || newAttemptDueDays !== savedDueDays)
    return boolChanged || numbersChanged
  }

  function saveSection(section: SettingSection) {
    setSavedValues((prev) => {
      const next = { ...prev }
      section.items.forEach((item) => {
        next[item.key] = values[item.key]
      })
      return next
    })
    if (section.items.some((item) => item.key === 'autoReset')) {
      setSavedMaxAttempts(maxAttempts)
      setSavedDueDays(newAttemptDueDays)
    }
  }

  return (
    <section className="cs">
      {sections.map((section) => (
        <div className="cs-section" key={section.heading}>
          <h3 className="cs-section-heading">{section.heading}</h3>
          <div className="cs-card">
            {section.items.map((item) => (
              <div className="cs-setting" key={item.key}>
                <Checkbox checked={values[item.key]} onChange={() => toggle(item.key)} />
                <div className="cs-card-body">
                  <span className="cs-card-title">{item.title}</span>
                  <p className="cs-card-desc">{item.description}</p>
                  {item.expand && <Collapse open={values[item.key]}>{item.expand}</Collapse>}
                </div>
              </div>
            ))}
            <div className="cs-cta">
              <button
                type="button"
                className="cs-save"
                disabled={!sectionDirty(section)}
                onClick={() => saveSection(section)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ))}
    </section>
  )
}

export default CourseSettings
