import type { MeshConfig, Shape } from '@/lib/meshGradient'

/* The My Progress section cards' mesh gradients: the onboarding renderer
   (src/lib/meshGradient.ts), set quieter than the View Answers card
   (src/pages/your-courses/answerMesh.ts): a few large shapes at 12% opacity (the
   yellows at 6%) under a heavy blur, so they melt into each other with no visible
   edges; no fill under them, a fine grain on top. Colours are read from
   the design tokens at runtime, never typed here. */

export type ProgressSection = 'courses' | 'external'

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

type ShapeSpec = Omit<Shape, 'id' | 'color' | 'phase' | 'opacity'> & { token: string }

const SHAPE_OPACITY = 0.12
/** The yellows read stronger than the other hues, so they sit at 6%. */
const YELLOW_OPACITY = 0.06
const YELLOWS = new Set(['--secondary-400', '--secondary-500', '--secondary-600'])

const circle = (token: string, x: number, y: number, size: number): ShapeSpec => ({
  token, type: 'circle', x, y, size, rotation: 0, radius: 0,
})
const square = (token: string, x: number, y: number, size: number, rotation: number, radius: number): ShapeSpec => ({
  token, type: 'square', x, y, size, rotation, radius,
})

/* One set per section, in the colours of what it shows. x and y are fractions of the
   card (0 to 1, may sit past the edge); size is a fraction of the card's height. */
const SHAPES: Record<ProgressSection, ShapeSpec[]> = {
  /* 5Mins courses: the brand cyans into the course blue. */
  courses: [
    circle('--primary-500', 0.05, 0.1, 0.9),
    square('--course-assessments', 0.95, 0.9, 0.8, 25, 0.4),
    circle('--primary-300', 0.6, 0.0, 0.5),
  ],
  /* External training: certificate blue and indigo. */
  external: [
    circle('--course-assessments', 0.1, 0.0, 1.0),
    square('--certificate-quiz', 0.9, 1.0, 0.9, 18, 0.4),
    circle('--certificate-quiz', 0.5, 0.2, 0.45),
  ],
}

/** Call again on a theme change: the shape colours are read from the tokens each time. */
export function progressMesh(section: ProgressSection): MeshConfig {
  return {
    settings: {
      aspect: 'wide',
      background: 'transparent',
      blur: 80,
      grain: 0.01,
      grainScale: 1,
      overlayColor: 'transparent',
      overlayOpacity: 0,
    },
    shapes: SHAPES[section].map((s, i) => {
      const { token: name, ...rest } = s
      return { ...rest, id: `${section}-${i}`, color: token(name), opacity: YELLOWS.has(name) ? YELLOW_OPACITY : SHAPE_OPACITY, phase: i * 1.7 }
    }),
  }
}
