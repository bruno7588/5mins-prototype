import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneFrame from '@/components/mobile/PhoneFrame/PhoneFrame'
import ContentSwitcher from '@/components/ContentSwitcher/ContentSwitcher'
import { FORMAT_ORDER, QUIZ_SAMPLES, type FormatKey } from './quizData'
import MatchPairsPartial from './formats/MatchPairsPartial'
import FillBlank from './formats/FillBlank'
import TrueFalse from './formats/TrueFalse'
import Categorization from './formats/Categorization'
import Sequencing from './formats/Sequencing'
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

  const renderFormat = () => {
    const q = QUIZ_SAMPLES[format]
    if (q.type === 'match-pairs') {
      return <MatchPairsPartial question={q} />
    }
    switch (q.type) {
      case 'fill-blank':
        return <FillBlank question={q} formatKey={format} />
      case 'true-false':
        return <TrueFalse question={q} formatKey={format} />
      case 'categorization':
        return <Categorization question={q} formatKey={format} />
      case 'sequencing':
        return <Sequencing question={q} formatKey={format} />
    }
  }

  return (
    <div className="ql-lab">
      <div className="ql-lab__bar">
        <span className="ql-lab__title">Quiz Lab</span>
        <span className="ql-lab__sub">
          New lesson quiz formats we're exploring. Everything is tap-only and mobile-first.
        </span>
        <ContentSwitcher
          items={FORMAT_ORDER.map((f) => ({ key: f.key, label: f.label }))}
          activeKey={format}
          onChange={(key) => setFormat(key as FormatKey)}
        />
      </div>

      <PhoneFrame onExit={() => navigate('/workspace')}>
        {/* Remount on format change so each preview starts fresh. */}
        <div key={format} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {renderFormat()}
        </div>
      </PhoneFrame>
    </div>
  )
}

export default QuizLab
