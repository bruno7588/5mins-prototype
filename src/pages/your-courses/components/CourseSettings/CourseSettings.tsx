import { useState, type ReactNode } from 'react'
import Checkbox from '../../../../components/Checkbox/Checkbox'
import Toggle from '../../../../components/Toggle/Toggle'
import InputInteger from '../../../../components/InputInteger/InputInteger'
import Collapse from '../../../../components/Collapse/Collapse'
import ToastContainer, { useToast } from '../../../../components/Toast/Toast'
import './CourseSettings.css'

type SettingKey =
  | 'managersSeeAll'
  | 'complianceCourse'
  | 'addToCategory'
  | 'enablePassScore'
  | 'allowReattempts'
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
  allowReattempts: true,
  accessAfterDue: false,
  rewards: false,
  certificate: false,
  autoReset: false,
  lessonsInOrder: false,
  fastForward: false,
  backgroundPlayback: false,
}

const INITIAL_PASS_SCORE = 80
const INITIAL_QUIZ_ATTEMPTS = 2
const INITIAL_MAX_ATTEMPTS = 3
const INITIAL_DUE_DAYS = 5

function CourseSettings() {
  const [values, setValues] = useState<Record<SettingKey, boolean>>(INITIAL_VALUES)
  const [passScore, setPassScore] = useState(INITIAL_PASS_SCORE)
  const [quizAttempts, setQuizAttempts] = useState(INITIAL_QUIZ_ATTEMPTS)
  const [maxAttempts, setMaxAttempts] = useState(INITIAL_MAX_ATTEMPTS)
  const [newAttemptDueDays, setNewAttemptDueDays] = useState(INITIAL_DUE_DAYS)

  // Last-saved snapshot — a section's Update button is enabled only while it has unsaved changes.
  const [savedValues, setSavedValues] = useState<Record<SettingKey, boolean>>(INITIAL_VALUES)
  const [savedPassScore, setSavedPassScore] = useState(INITIAL_PASS_SCORE)
  const [savedQuizAttempts, setSavedQuizAttempts] = useState(INITIAL_QUIZ_ATTEMPTS)
  const [savedMaxAttempts, setSavedMaxAttempts] = useState(INITIAL_MAX_ATTEMPTS)
  const [savedDueDays, setSavedDueDays] = useState(INITIAL_DUE_DAYS)
  const toast = useToast()

  const toggle = (key: SettingKey) =>
    setValues((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      // Auto-reset can't be set unless Pass Score is enabled — turning Pass Score off clears it.
      if (key === 'enablePassScore' && !next.enablePassScore) next.autoReset = false
      return next
    })

  const sections: SettingSection[] = [
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
          // Pass score, re-attempts and auto-reset are all meaningless without a pass score,
          // so they live inside the Pass Score block and only show while it's enabled.
          expand: (
            <div className="cs-card-expand cs-passscore-group">
              <InputInteger
                className="input-integer--inline"
                label="Pass score is"
                value={passScore}
                onChange={setPassScore}
                min={1}
                max={100}
                suffix="%"
              />

              <div className="cs-setting cs-panel">
                <Toggle size="sm" checked={values.allowReattempts} onChange={() => toggle('allowReattempts')} />
                <div className="cs-card-body">
                  <span className="cs-card-title">Retake quizzes and assessments</span>
                  <p className="cs-card-desc">
                    Set how many times learners can retake assessments in the course. Off = 1 attempt.
                  </p>
                  <Collapse open={values.allowReattempts}>
                    <div className="cs-card-expand">
                      <InputInteger
                        label="Maximum retakes allowed"
                        value={quizAttempts}
                        onChange={setQuizAttempts}
                        min={1}
                      />
                    </div>
                  </Collapse>
                </div>
              </div>

              <div className="cs-setting cs-panel">
                <Toggle size="sm" checked={values.autoReset} onChange={() => toggle('autoReset')} />
                <div className="cs-card-body">
                  <span className="cs-card-title">Re-attempt course on failure</span>
                  <p className="cs-card-desc">
                    Automatically reset a learner&apos;s progress when they fail a course, so they can re-attempt
                    without admin intervention.
                  </p>
                  <Collapse open={values.autoReset}>
                    <div className="cs-card-expand">
                      <InputInteger
                        label="Maximum course re-attempts"
                        value={maxAttempts}
                        onChange={setMaxAttempts}
                        min={1}
                        helperText={
                          <>
                            Once a learner uses all re-attempts, auto-reset stops and they&apos;re marked{' '}
                            <span className="cs-failed">Failed</span>
                          </>
                        }
                      />
                      <InputInteger
                        label="Days to complete each re-attempt"
                        value={newAttemptDueDays}
                        onChange={setNewAttemptDueDays}
                        min={1}
                      />
                    </div>
                  </Collapse>
                </div>
              </div>
            </div>
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
              <span className="cs-link ui-disabled" aria-disabled="true">
                Read
              </span>{' '}
              how certification works.
            </>
          ),
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
    {
      heading: 'Data privacy',
      items: [
        {
          key: 'managersSeeAll',
          title: 'Allow Managers / Experts to see all enrolments',
          description:
            'Managers and Experts can view all course enrolments in Knowledge Hub page. When unchecked, they only see their team members and learners they assigned. This setting controls privacy for this course only.',
        },
      ],
    },
  ]

  function sectionDirty(section: SettingSection) {
    const boolChanged = section.items.some((item) => values[item.key] !== savedValues[item.key])
    // Pass score, re-attempts and auto-reset are nested inside Pass Score, not top-level
    // items, so they're tracked explicitly.
    const hasPassScore = section.items.some((item) => item.key === 'enablePassScore')
    const nestedChanged =
      hasPassScore &&
      (values.autoReset !== savedValues.autoReset ||
        values.allowReattempts !== savedValues.allowReattempts ||
        passScore !== savedPassScore ||
        (values.allowReattempts && quizAttempts !== savedQuizAttempts) ||
        (values.autoReset && (maxAttempts !== savedMaxAttempts || newAttemptDueDays !== savedDueDays)))
    return boolChanged || nestedChanged
  }

  function saveSection(section: SettingSection) {
    const hasPassScore = section.items.some((item) => item.key === 'enablePassScore')
    const autoResetChanged =
      hasPassScore &&
      (values.autoReset !== savedValues.autoReset ||
        (values.autoReset && (maxAttempts !== savedMaxAttempts || newAttemptDueDays !== savedDueDays)))

    setSavedValues((prev) => {
      const next = { ...prev }
      section.items.forEach((item) => {
        next[item.key] = values[item.key]
      })
      if (hasPassScore) {
        next.autoReset = values.autoReset
        next.allowReattempts = values.allowReattempts
      }
      return next
    })
    if (hasPassScore) {
      setSavedPassScore(passScore)
      setSavedQuizAttempts(quizAttempts)
      setSavedMaxAttempts(maxAttempts)
      setSavedDueDays(newAttemptDueDays)
    }

    if (autoResetChanged) {
      if (values.autoReset) {
        const attempts = `${maxAttempts} re-attempt${maxAttempts === 1 ? '' : 's'}`
        const days = `${newAttemptDueDays} day${newAttemptDueDays === 1 ? '' : 's'} per attempt`
        toast.show('success', `Auto-reset enabled: ${attempts}, ${days}`)
      } else {
        toast.show('success', 'Auto-reset disabled')
      }
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
      <ToastContainer toasts={toast.toasts} />
    </section>
  )
}

export default CourseSettings
