import type { MeshConfig, Shape } from '@/lib/meshGradient'

/* The View Answers question card's mesh gradient (the onboarding renderer, see
   src/lib/meshGradient.ts): a few large blurred shapes in the format's illustration
   colours at 16% opacity (the yellows at 8%), with no fill under them, so they sit on the page, and a fine grain on top. The same
   values in light and dark mode. Colours are read from the design tokens at runtime,
   never typed here. */

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

type ShapeSpec = Omit<Shape, 'id' | 'color' | 'phase' | 'opacity'> & { token: string }

/** Every shape's opacity, the same in light and dark mode. */
const SHAPE_OPACITY = 0.16
/** The yellows (Secondary-400/500/600) read stronger than the other hues, so they sit at 8%. */
const YELLOW_OPACITY = 0.08
const YELLOWS = new Set(['--secondary-400', '--secondary-500', '--secondary-600'])

const circle = (token: string, x: number, y: number, size: number): ShapeSpec => ({
  token, type: 'circle', x, y, size, rotation: 0, radius: 0,
})
const square = (token: string, x: number, y: number, size: number, rotation: number, radius: number): ShapeSpec => ({
  token, type: 'square', x, y, size, rotation, radius,
})

/* One set per format, in its illustration's colours (the same pairs the Answers grid
   tiles use, see AssessmentGrid.css), each placed differently so no two cards match.
   x and y are fractions of the card (0 to 1, may sit past the edge); size is a fraction
   of the card's height. */
const SHAPES: Record<string, ShapeSpec[]> = {
  /* Amber and purples. */
  'multiple-choice': [
    square('--secondary-600', 0.12, 0.2, 0.95, 28, 0.4),
    circle('--flash-poll', 0.45, 0.95, 0.9),
    square('--blaze-quiz', 0.82, 0.15, 0.8, 12, 0.3),
    circle('--secondary-400', 0.97, 0.9, 0.7),
  ],
  /* Cyan and violet. */
  'image-choice': [
    circle('--primary-500', 0.08, 0.85, 1.1),
    square('--flash-poll', 0.6, 0.1, 0.7, 40, 0.5),
    circle('--primary-300', 0.92, 0.6, 0.85),
  ],
  /* Coral and blue. */
  'fill-blank': [
    circle('--lesson-quiz', 0.9, 0.85, 1.0),
    square('--course-assessments', 0.2, 0.05, 0.85, 18, 0.35),
    circle('--lesson-quiz', 0.5, 0.5, 0.5),
  ],
  /* Red and green, the illustration's two cards. */
  'match-pairs': [
    square('--danger-500', 0.15, 0.9, 0.8, 35, 0.3),
    square('--success-500', 0.85, 0.1, 0.8, -20, 0.3),
    circle('--success-500', 0.55, 1.05, 0.6),
  ],
  /* Two violets, stepped like the order of the items. */
  'sequence': [
    circle('--blaze-quiz', 0.98, 0.5, 1.0),
    square('--flash-poll', 0.62, 0.0, 0.65, 8, 0.45),
    circle('--flash-poll', 0.3, 0.95, 0.75),
  ],
  /* Indigo and blue. */
  'categorize': [
    square('--certificate-quiz', 0.3, 0.0, 0.9, 50, 0.4),
    circle('--course-assessments', 0.7, 1.0, 0.95),
    circle('--certificate-quiz', 1.0, 0.25, 0.55),
  ],
  /* Yellow and teal. */
  'situational-test': [
    circle('--secondary-400', 0.0, 0.0, 1.05),
    square('--primary-700', 0.05, 1.0, 0.8, 22, 0.35),
    circle('--primary-700', 0.75, 0.55, 0.6),
  ],
  /* Violet and light cyan. */
  'fast-track': [
    square('--blaze-quiz', 0.0, 1.0, 0.9, -15, 0.4),
    circle('--primary-300', 1.0, 0.0, 1.0),
    circle('--blaze-quiz', 0.6, 0.2, 0.5),
  ],
  /* Blues, both on the left. */
  'short-text': [
    circle('--course-assessments', 0.2, 0.15, 0.95),
    square('--certificate-quiz', 0.15, 0.95, 0.8, 30, 0.4),
    circle('--course-assessments', 0.95, 0.9, 0.55),
  ],
  /* Yellow and amber. */
  'poll': [
    circle('--secondary-500', 0.25, 0.1, 1.0),
    circle('--secondary-600', 0.8, 0.85, 0.85),
    square('--secondary-500', 1.0, 0.1, 0.55, 25, 0.5),
  ],
  /* Orange and indigo. */
  'exercise': [
    square('--warning-600', 0.85, 0.1, 0.85, 15, 0.35),
    circle('--certificate-quiz', 0.2, 0.9, 0.95),
    circle('--warning-600', 0.45, 0.0, 0.5),
  ],
  /* Indigo and peach, top and bottom. */
  'lesson-quiz': [
    circle('--certificate-quiz', 0.5, -0.05, 1.0),
    square('--warning-200', 0.3, 1.05, 0.85, 10, 0.45),
    circle('--warning-200', 0.9, 0.95, 0.6),
  ],
}

export const hasMesh = (art: string | undefined) => !!art && art in SHAPES

/** Call again on a theme change: the shape colours are read from the tokens each time. */
export function answerMesh(art: string): MeshConfig {
  return {
    settings: {
      aspect: 'wide',
      background: 'transparent', /* no card fill: the shapes sit on the page */
      blur: 60,
      grain: 0.01,
      grainScale: 1,
      overlayColor: 'transparent',
      overlayOpacity: 0, /* no wash: the shapes sit straight on the card */
    },
    shapes: SHAPES[art].map((s, i) => {
      const { token: name, ...rest } = s
      return { ...rest, id: `${art}-${i}`, color: token(name), opacity: YELLOWS.has(name) ? YELLOW_OPACITY : SHAPE_OPACITY, phase: i * 1.7 }
    }),
  }
}
