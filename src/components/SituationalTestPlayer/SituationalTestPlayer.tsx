import type { MutableRefObject } from 'react'
import Button from '@/components/Button/Button'
import ScenarioMedia from '@/components/ScenarioMedia/ScenarioMedia'
import type { ScenarioMediaData } from '@/data/scenarioMedia'
import MatchPairsPartial from '@/pages/quiz-lab/formats/MatchPairsPartial'
import FillBlank from '@/pages/quiz-lab/formats/FillBlank'
import Categorization from '@/pages/quiz-lab/formats/Categorization'
import SequencingDnd from '@/pages/quiz-lab/formats/SequencingDnd'
import SingleChoice from '@/pages/quiz-lab/formats/SingleChoice'
import FreeText from '@/pages/quiz-lab/formats/FreeText'
import '@/pages/quiz-lab/quiz-lab.css'
import { getAssessmentIllustration } from '@/assets/assessment-illustrations'
import type { SituationalQuestion } from '@/pages/your-courses/components/SituationalTestDrawer/SituationalTestDrawer'
import './SituationalTestPlayer.css'

/* The situational test's own artwork, heading its brief. */
const briefIllustration = getAssessmentIllustration('situational-test', 'desktop')

interface BriefProps {
  title: string
  brief: string
  onStart: () => void
  /** Where the card is drawn (Course feed Figma): `preview` is the admin preview's 600px
   *  frame, `web` the desktop feed (17024:82020), `mobile` the app (17024:75382). */
  variant?: 'preview' | 'web' | 'mobile'
  /** The scenario's image, audio clip or video, shown between the title and the brief. */
  media?: ScenarioMediaData
  /** Where the media was left, shared with wherever else it shows. */
  mediaPosition?: MutableRefObject<number>
}

/**
 * The situational test's brief card, shared by the admin preview, the web course feed
 * and the mobile app, so the three never drift.
 */
export function SituationalBrief({ title, brief, onStart, variant = 'preview', media, mediaPosition }: BriefProps) {
  const art = variant === 'mobile' ? 32 : 40
  return (
    <div className={`st-brief st-brief--${variant}`}>
      <div className="st-brief__head">
        <img src={briefIllustration} width={art} height={art} alt="" />
        <span className="st-brief__label">Brief</span>
      </div>
      <div className="st-brief__divider" />
      <div className="st-brief__body">
        <p className="st-brief__title">{title || 'Untitled situational test'}</p>
        {media ? <ScenarioMedia media={media} position={mediaPosition} /> : null}
        <p className="st-brief__text">{brief}</p>
        {/* Start is never held back, so the card says the brief stays within reach. */}
        <p className="st-brief__note">You can come back to this from any question.</p>
      </div>
      <Button size="lg" onClick={onStart}>
        Start Situational Test
      </Button>
    </div>
  )
}

/** One question, played by the learner's own renderer: the real one for the four
 *  interactive formats, the options or the open answer for the rest. */
export function SituationalQuestionScreen({ question }: { question: SituationalQuestion }) {
  const payload = question.interactive

  if (payload?.type === 'match-pairs') return <MatchPairsPartial question={payload} />
  if (payload?.type === 'fill-blank') return <FillBlank question={payload} formatKey="fill-blank" />
  if (payload?.type === 'categorization')
    return <Categorization question={payload} formatKey="categorization" />
  if (payload?.type === 'sequencing') return <SequencingDnd question={payload} />

  /* The rest are option or open-answer questions, played by the same two renderers the
     lab uses. A poll carries correctIndex -1, so SingleChoice asks without marking. */
  const options = question.options.filter((option) => option.trim())
  if (options.length > 0) {
    return (
      <SingleChoice
        question={{
          type: 'single-choice',
          prompt: question.text,
          options,
          correctIndex: question.format === 'poll' ? -1 : question.correctIndex,
          /* What the admin wrote in the drawer's explanation field, shown under the
             result. */
          explanation: question.explanation,
        }}
      />
    )
  }

  return <FreeText question={{ type: 'free-text', prompt: question.text }} />
}
