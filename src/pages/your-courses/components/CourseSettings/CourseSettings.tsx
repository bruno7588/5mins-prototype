import { useState, type ReactNode } from 'react'
import Button from '@/components/Button/Button'
import { useNavigate } from 'react-router-dom'
import { Clock } from 'iconsax-react'
import Checkbox from '../../../../components/Checkbox/Checkbox'
import Toggle from '../../../../components/Toggle/Toggle'
import InputInteger from '../../../../components/InputInteger/InputInteger'
import Collapse from '../../../../components/Collapse/Collapse'
import Dropdown from '@/components/Dropdown/Dropdown'
import { formatValidity, getCourseRule, setCourseRule } from '@/data/courseValidity'
import ToastContainer, { useToast } from '../../../../components/Toast/Toast'
import { SETTINGS_TAB_COURSE_ID } from '@/pages/account/data/mockAudit'
import './CourseSettings.css'

type SettingKey =
  | 'managersSeeAll'
  | 'complianceCourse'
  | 'addToCategory'
  | 'enablePassScore'
  | 'allowReattempts'
  | 'accessAfterDue'
  | 'rewards'
  | 'electronicSignature'
  | 'certificate'
  | 'completionValidity'
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
  electronicSignature: false,
  certificate: false,
  completionValidity: false,
  autoReset: false,
  lessonsInOrder: false,
  fastForward: false,
  backgroundPlayback: false,
}

const INITIAL_PASS_SCORE = 80
const INITIAL_QUIZ_ATTEMPTS = 2
const INITIAL_MAX_ATTEMPTS = 3
const INITIAL_DUE_DAYS = 5

/* Demo workspace categories, edited under Account & Settings > Categories. */
const CATEGORY_OPTIONS = [
  { value: 'compliance', label: 'Compliance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'co-pilot', label: 'Co-Pilot Mastery' },
  { value: 'onboarding', label: 'Onboarding' },
]

type ValidityUnit = 'months' | 'years'
const UNIT_OPTIONS = [
  { value: 'months', label: 'Months' },
  { value: 'years', label: 'Years' },
]
/* Up to 20 years either way (DES-366), matching External Training's 240 months. */
const VALIDITY_MAX: Record<ValidityUnit, number> = { months: 240, years: 20 }

/** The saved period as the field shows it: whole years when it divides, else months. */
function validityFields(months: number | null): { amount: number; unit: ValidityUnit } {
  if (months == null) return { amount: 3, unit: 'years' }
  return months % 12 === 0 ? { amount: months / 12, unit: 'years' } : { amount: months, unit: 'months' }
}

function CourseSettings({ courseTitle }: { courseTitle: string }) {
  const rule = getCourseRule(courseTitle)
  const initialValues: Record<SettingKey, boolean> = {
    ...INITIAL_VALUES,
    certificate: rule.certificate,
    completionValidity: rule.validityMonths != null,
  }
  const initialValidity = validityFields(rule.validityMonths)
  const [values, setValues] = useState<Record<SettingKey, boolean>>(initialValues)
  const [validityAmount, setValidityAmount] = useState(initialValidity.amount)
  const [validityUnit, setValidityUnit] = useState<ValidityUnit>(initialValidity.unit)
  const [savedValidity, setSavedValidity] = useState(initialValidity)
  const [passScore, setPassScore] = useState(INITIAL_PASS_SCORE)
  const [quizAttempts, setQuizAttempts] = useState(INITIAL_QUIZ_ATTEMPTS)
  const [maxAttempts, setMaxAttempts] = useState(INITIAL_MAX_ATTEMPTS)
  const [newAttemptDueDays, setNewAttemptDueDays] = useState(INITIAL_DUE_DAYS)
  const [categories, setCategories] = useState<string[]>([])
  const [savedCategories, setSavedCategories] = useState<string[]>([])

  // Last-saved snapshot — a section's Update button is enabled only while it has unsaved changes.
  const [savedValues, setSavedValues] = useState<Record<SettingKey, boolean>>(initialValues)
  const [savedPassScore, setSavedPassScore] = useState(INITIAL_PASS_SCORE)
  const [savedQuizAttempts, setSavedQuizAttempts] = useState(INITIAL_QUIZ_ATTEMPTS)
  const [savedMaxAttempts, setSavedMaxAttempts] = useState(INITIAL_MAX_ATTEMPTS)
  const [savedDueDays, setSavedDueDays] = useState(INITIAL_DUE_DAYS)
  const toast = useToast()
  const navigate = useNavigate()

  // Settings-history entry point (Admin-only): deep link into the Audit log with
  // the Course filter applied.
  const openSettingsHistory = () =>
    navigate(`/account?tab=audit-log&course=${SETTINGS_TAB_COURSE_ID}`)

  const toggle = (key: SettingKey) =>
    setValues((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      // Auto-reset can't be set unless Pass Score is enabled — turning Pass Score off clears it.
      if (key === 'enablePassScore' && !next.enablePassScore) next.autoReset = false
      return next
    })

  // A period outside 1 to 20 years (or 240 months), e.g. 35 left in the field after
  // switching Months to Years, blocks Save until it is fixed.
  const validityInvalid =
    values.completionValidity && (validityAmount < 1 || validityAmount > VALIDITY_MAX[validityUnit])
  const validityMonths = values.completionValidity
    ? validityAmount * (validityUnit === 'years' ? 12 : 1)
    : null
  const savedValidityMonths = savedValues.completionValidity
    ? savedValidity.amount * (savedValidity.unit === 'years' ? 12 : 1)
    : null

  // Section order and content follow the production app.
  const sections: SettingSection[] = [
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
              <Button variant="link" onClick={() => window.open('https://app.5mins.ai/admin/account-settings?tab=5', '_blank', 'noreferrer')}>
                Account &amp; Settings
              </Button>{' '}
              page.
            </>
          ),
          expand: (
            <div className="cs-card-expand">
              <Dropdown
                multiple
                label="Category"
                placeholder="Select a category"
                summaryLabel="Categories"
                options={CATEGORY_OPTIONS}
                values={categories}
                onChangeValues={setCategories}
                className="cs-category"
              />
            </div>
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
              <Button variant="link" onClick={() => window.open('https://5mins.featurebase.app/en/help/articles/6973225-pass-score-for-courses', '_blank', 'noreferrer')}>
                here
              </Button>
              .
            </>
          ),
          // Pass score, re-attempts and auto-reset are all meaningless without a pass score,
          // so they live inside the Pass Score block and only show while it's enabled.
          expand: (
            <div className="cs-card-expand cs-passscore-group">
              <InputInteger
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
          key: 'completionValidity',
          title: 'Expiry date',
          // The where-it-shows note sits in the description, so it reads before the setting is on.
          description: `Completions expire a set time after the learner completes the course. Applies to past and new completions, and shows in Learning Records${
            values.certificate ? ', Course Progress, and certificates.' : ' and Course Progress.'
          }`,
          expand: (
            <div className="cs-card-expand">
              <div className="cs-validity-row">
                <InputInteger
                  className="cs-validity-int"
                  label="Completion valid for"
                  value={validityAmount}
                  onChange={setValidityAmount}
                  min={1}
                  max={VALIDITY_MAX[validityUnit]}
                  validation={validityInvalid ? 'error' : 'none'}
                />
                <Dropdown
                  options={UNIT_OPTIONS}
                  value={validityUnit}
                  onChange={(v) => setValidityUnit(v as ValidityUnit)}
                  className="cs-validity-unit"
                />
              </div>
              {validityInvalid && (
                <p className="cs-validity-error" role="alert">
                  Enter a whole number from 1 to {VALIDITY_MAX[validityUnit]}
                </p>
              )}
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
          key: 'electronicSignature',
          title: 'Electronic Signature',
          description: 'An Electronic Signature is required to complete the course.',
        },
        {
          key: 'certificate',
          title: 'Certificate',
          description: (
            <>
              Add a certificate for completion.{' '}
              <Button variant="link" className="ui-disabled" aria-disabled="true">
                Read
              </Button>{' '}
              how certification works.
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
    const hasValidity = section.items.some((item) => item.key === 'completionValidity')
    const validityChanged = hasValidity && validityMonths !== savedValidityMonths
    return boolChanged || nestedChanged || validityChanged
  }

  /** Saves one section; returns true when it showed its own toast. */
  function saveSection(section: SettingSection): boolean {
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

    if (section.items.some((item) => item.key === 'completionValidity')) {
      setSavedValidity({ amount: validityAmount, unit: validityUnit })
      setCourseRule(courseTitle, { validityMonths, certificate: values.certificate })
      if (validityMonths !== savedValidityMonths) {
        toast.show(
          'success',
          validityMonths == null ? 'Completion validity removed' : `Completion validity set to ${formatValidity(validityMonths)}`,
        )
      }
    }

    if (autoResetChanged) {
      if (values.autoReset) {
        const attempts = `${maxAttempts} re-attempt${maxAttempts === 1 ? '' : 's'}`
        const days = `${newAttemptDueDays} day${newAttemptDueDays === 1 ? '' : 's'} per attempt`
        toast.show('success', `Auto-reset enabled: ${attempts}, ${days}`)
      } else {
        toast.show('success', 'Auto-reset disabled')
      }
      return true
    }
    return validityMonths !== savedValidityMonths && section.items.some((item) => item.key === 'completionValidity')
  }

  // One Update Settings for the whole page (as production): enabled while anything is unsaved.
  const categoriesChanged = categories.join() !== savedCategories.join()
  const dirty = sections.some(sectionDirty) || categoriesChanged

  function saveAll() {
    // A section's own toast (validity, auto-reset) says more; otherwise a plain confirmation.
    const toasted = sections.filter(sectionDirty).map(saveSection).some(Boolean)
    setSavedCategories(categories)
    if (!toasted) toast.show('success', 'Course settings updated')
  }

  return (
    <section className="cs">
      {/* Sticky: stays at the top of the page while the settings scroll under it. */}
      <div className="cs-header">
        <div className="cs-header-row">
          <h2 className="cs-title">Course settings</h2>
          <div className="cs-header-actions">
            <Button
              variant="outlined-2"
              icon={<Clock size={20} color="currentColor" variant="Linear" />}
              onClick={openSettingsHistory}
            >
              Settings History
            </Button>
            <Button disabled={!dirty || validityInvalid} onClick={saveAll}>
              Update Settings
            </Button>
          </div>
        </div>
        <div className="cs-header-divider" />
      </div>
      {sections.map((section) => (
        <div className="cs-section" key={section.heading}>
          <h3 className="cs-section-heading">{section.heading}</h3>
          {/* One card per setting, as production */}
          {section.items.map((item) => (
            <div className="cs-card cs-setting" key={item.key}>
              <Checkbox checked={values[item.key]} onChange={() => toggle(item.key)} />
              <div className="cs-card-body">
                <span className="cs-card-title">{item.title}</span>
                <p className="cs-card-desc">{item.description}</p>
                {item.expand && <Collapse open={values[item.key]}>{item.expand}</Collapse>}
              </div>
            </div>
          ))}
        </div>
      ))}
      <ToastContainer toasts={toast.toasts} />
    </section>
  )
}

export default CourseSettings
