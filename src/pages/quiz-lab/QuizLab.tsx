import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneFrame from '@/components/mobile/PhoneFrame/PhoneFrame'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import DesktopPreview from '@/components/DesktopPreview/DesktopPreview'
import QuizHeader from './components/QuizHeader'
import { FORMAT_ORDER, QUIZ_SAMPLES, type FormatKey } from './quizData'
import MatchPairsPartial from './formats/MatchPairsPartial'
import FillBlank from './formats/FillBlank'
import Categorization from './formats/Categorization'
import SequencingDnd from './formats/SequencingDnd'
import SelectAll from './formats/SelectAll'
import SingleChoice from './formats/SingleChoice'
import ImageChoice from './formats/ImageChoice'
import FreeText from './formats/FreeText'
import './quiz-lab.css'

/**
 * Quiz Lab (DES-321) — a sandbox to test every lesson quiz format mobile-first,
 * one format per screen, before wiring them into the real lesson player. The
 * format switcher lives on the desktop stage (it's a lab control, not part of
 * the mobile app); the selected format renders inside the PhoneFrame.
 */
function QuizLab() {
  const navigate = useNavigate()
  const [format, setFormat] = useState<FormatKey>('match-pairs')
  /** Phone (the app) or the desktop feed's 544px panel (learner web). */
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile')
  const activeLabel = FORMAT_ORDER.find((f) => f.key === format)?.label ?? ''

  const renderFormat = () => {
    const q = QUIZ_SAMPLES[format]
    if (q.type === 'match-pairs') {
      return <MatchPairsPartial question={q} />
    }
    switch (q.type) {
      case 'fill-blank':
        return <FillBlank question={q} formatKey={format} />
      case 'categorization':
        return <Categorization question={q} formatKey={format} />
      case 'sequencing':
        return <SequencingDnd question={q} />
      case 'select-all':
        return <SelectAll question={q} />
      case 'single-choice':
        return <SingleChoice question={q} />
      case 'image-choice':
        return <ImageChoice question={q} />
      case 'free-text':
        return <FreeText question={q} />
    }
  }

  return (
    <div className="ql-lab" data-theme="dark">
      <header className="ql-lab__bar">
        <h1 className="ql-lab__title">Quiz Lab</h1>
        <ContentSwitcher
          items={[
            { key: 'mobile', label: 'Mobile' },
            { key: 'desktop', label: 'Desktop' },
          ]}
          activeKey={device}
          onChange={(key) => setDevice(key as 'mobile' | 'desktop')}
        />
      </header>

      <div className="ql-lab__body">
        {/* The formats as a side panel (DS side panel items, navigation.md), so the
            list has room to grow and the stage keeps the full height. */}
        <nav className="ql-lab__nav" aria-label="Quiz formats">
          {FORMAT_ORDER.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`ql-lab__nav-item${f.key === format ? ' is-selected' : ''}`}
              aria-current={f.key === format ? 'page' : undefined}
              onClick={() => setFormat(f.key)}
            >
              {f.label}
            </button>
          ))}
        </nav>

        <div className="ql-lab__main">
          {/* Remount on format or device change so each preview starts fresh. */}
          {device === 'mobile' ? (
            <PhoneFrame onExit={() => navigate('/workspace')}>
              <div key={format} className="ql-quizview">
                <QuizHeader
                  label={activeLabel}
                  used={1}
                  total={3}
                  onClose={() => navigate('/workspace')}
                />
                {renderFormat()}
              </div>
            </PhoneFrame>
          ) : (
            /* The same renderers in the panel the desktop feed gives them, as the
               course builder's Preview shows them. */
            <div className="ql-lab__desktop">
              <DesktopPreview>
                <div key={format} className="ql-quizview">
                  <QuizHeader
                    label={activeLabel}
                    used={1}
                    total={3}
                    onClose={() => navigate('/workspace')}
                  />
                  {renderFormat()}
                </div>
              </DesktopPreview>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizLab
