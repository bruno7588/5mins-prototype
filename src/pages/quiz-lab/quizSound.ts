import { play } from 'cuelume'
import type { SoundName } from 'cuelume'

/**
 * Semantic quiz interaction sounds (cuelume). Keeping the action → sound map in
 * one place makes the palette easy to tune. cuelume synthesises live (no files)
 * and is a no-op until the first user gesture resumes the AudioContext.
 */
export type QuizCue = 'select' | 'place' | 'remove' | 'correct' | 'incorrect' | 'continue'

const CUE_SOUND: Record<QuizCue, SoundName> = {
  select: 'tick', // crisp instant tick — highlight an option
  place: 'toggle', // mechanical click — commit into a gap / bucket / pair
  remove: 'droplet', // descending note — return to the bank
  correct: 'success', // warm confirmation
  incorrect: 'error', // soft, non-punishing refusal
  continue: 'page', // papery flick — move on
}

export function cue(name: QuizCue) {
  play(CUE_SOUND[name])
}
