import { useMemo, useState } from 'react'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import CloseButton from '@/components/CloseButton/CloseButton'
import Button from '@/components/Button/Button'
import {
  assessmentTypeFromLabel,
  getAssessmentIllustration,
} from '@/assets/assessment-illustrations'
import { typeLabel, type GeneratableType } from '@/data/aiAssessmentGeneration'
import type { SituationalQuestion } from '../SituationalTestDrawer/SituationalTestDrawer'
import './SituationalTestPreview.css'

interface Props {
  title: string
  brief: string
  questions: SituationalQuestion[]
  onClose: () => void
}

/** Stable per mount: the learner meets one shuffle, not a new one every render. */
const shuffle = <T,>(input: readonly T[]): T[] => {
  const out = input.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/* The illustration each screen is headed with. The brief is a situational test; every
   question after it is headed with its own format, so the learner sees the shape of what
   they're being asked before they read it. The artwork is keyed by display label rather
   than by the generator's own keys ('sequence' vs 'sequencing'), so it goes through the
   same bridge the outline cards use. */
const illustrationFor = (type: GeneratableType) =>
  getAssessmentIllustration(assessmentTypeFromLabel(typeLabel(type)) ?? 'situational-test', 'desktop')

/**
 * What the learner gets, screen by screen (DES-279).
 *
 * The brief comes first, exactly as the course feed shows it (Figma 17024:82020), then
 * one screen per question in the format it was written for — a sequence as a sequence,
 * a pairing as a pairing.
 *
 * Every screen is the learner's *starting* state and nothing here answers back: the
 * admin checks the answer key in the review editor, and checks the experience here.
 * Nothing is clickable that would grade, so nothing pretends to.
 */
function SituationalTestPreview({ title, brief, questions, onClose }: Props) {
  const [screen, setScreen] = useState(0)
  const onBrief = screen === 0
  const question = onBrief ? null : questions[screen - 1]
  const last = screen === questions.length

  return (
    <ConfirmModal open onClose={onClose} className="st-preview" ariaLabel="Preview situational test">
      <div className="st-preview__chrome">
        <div className="st-preview__chrome-headline">
          <h2 className="st-preview__chrome-title">Preview</h2>
          <p className="st-preview__chrome-sub">What the learner sees, screen by screen.</p>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      {/* The learner's own surface, on the card colour so it reads as a screen inside
          the admin's modal rather than more of the modal. */}
      <div className="st-preview__card" key={screen}>
        <div className="st-preview__card-head">
          <img
            src={illustrationFor(onBrief ? 'situational-test' : (question?.format ?? 'single-choice'))}
            width={40}
            height={40}
            alt=""
          />
          <span className="st-preview__card-label">
            {onBrief ? 'Brief' : typeLabel(question?.format ?? 'single-choice')}
          </span>
        </div>
        <div className="st-preview__divider" />

        {onBrief ? (
          <>
            <div className="st-preview__body">
              <p className="st-preview__heading">{title || 'Untitled situational test'}</p>
              <p className="st-preview__prose">{brief}</p>
            </div>
            {/* The screen's own CTA, and it works — a preview of a button that does
                nothing is a screenshot. */}
            <Button size="lg" onClick={() => setScreen(1)}>
              Start Situational Test
            </Button>
          </>
        ) : (
          <div className="st-preview__body">
            <p className="st-preview__heading">{question?.text}</p>
            <QuestionBody question={question as SituationalQuestion} />
          </div>
        )}
      </div>

      <div className="st-preview__footer">
        <Button
          variant="outlined"
          disabled={screen === 0}
          onClick={() => setScreen((s) => s - 1)}
        >
          Back
        </Button>
        <span className="st-preview__counter">
          {onBrief ? 'Brief' : `Question ${screen} of ${questions.length}`}
        </span>
        <Button disabled={last} onClick={() => setScreen((s) => s + 1)}>
          Next
        </Button>
      </div>
    </ConfirmModal>
  )
}

/** The interaction as the learner first meets it — unanswered, unsorted, unordered. */
function QuestionBody({ question }: { question: SituationalQuestion }) {
  const interactive = question.interactive

  /* Shuffled once per question screen. The card remounts on navigation (keyed by
     screen), so going back and forth reshuffles — which is what a learner would get
     on a second attempt anyway. */
  const scrambled = useMemo<string[]>(() => {
    if (!interactive) return []
    switch (interactive.type) {
      case 'sequencing':
        return shuffle(interactive.steps)
      case 'match-pairs':
        return shuffle(interactive.pairs.map((pair) => pair.right))
      case 'categorization':
        return shuffle(interactive.items.map((item) => item.label))
      case 'fill-blank':
        return shuffle(interactive.bank)
    }
  }, [interactive])

  if (interactive?.type === 'sequencing') {
    return (
      <div className="st-preview__stack">
        {/* Empty slots above the bank: the learner's job is to fill them in order. */}
        {interactive.steps.map((_, i) => (
          <div className="st-preview__slot" key={`slot-${i}`}>
            <span className="st-preview__slot-number">{i + 1}</span>
          </div>
        ))}
        <div className="st-preview__bank">
          {scrambled.map((step) => (
            <span className="st-preview__chip" key={step}>
              {step}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (interactive?.type === 'match-pairs') {
    return (
      <div className="st-preview__columns">
        <div className="st-preview__column">
          {interactive.pairs.map((pair) => (
            <span className="st-preview__chip" key={pair.left}>
              {pair.left}
            </span>
          ))}
        </div>
        <div className="st-preview__column">
          {scrambled.map((right) => (
            <span className="st-preview__chip" key={right}>
              {right}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (interactive?.type === 'categorization') {
    return (
      <div className="st-preview__stack">
        <div className="st-preview__columns">
          {interactive.categories.map((category) => (
            <div className="st-preview__bucket" key={category.id}>
              <span className="st-preview__bucket-label">{category.label}</span>
            </div>
          ))}
        </div>
        <div className="st-preview__bank">
          {scrambled.map((item) => (
            <span className="st-preview__chip" key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (interactive?.type === 'fill-blank') {
    return (
      <div className="st-preview__stack">
        <p className="st-preview__sentence">
          {interactive.segments.map((segment, i) =>
            typeof segment === 'string' ? (
              <span key={i}>{segment}</span>
            ) : (
              <span className="st-preview__gap" key={i} aria-label="blank" />
            ),
          )}
        </p>
        <div className="st-preview__bank">
          {scrambled.map((word) => (
            <span className="st-preview__chip" key={word}>
              {word}
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (question.options.length > 0) {
    return (
      <div className="st-preview__stack">
        {question.options
          .filter((option) => option.trim().length > 0)
          .map((option) => (
            <div className="st-preview__option" key={option}>
              <span className="st-preview__radio" />
              <span>{option}</span>
            </div>
          ))}
      </div>
    )
  }

  /* Short text and exercise: the learner writes. Shown as the empty field they get,
     not as a list of options they don't. */
  return (
    <div className="st-preview__answer-box">
      <span className="st-preview__answer-hint">The learner answers in their own words</span>
    </div>
  )
}

export default SituationalTestPreview
