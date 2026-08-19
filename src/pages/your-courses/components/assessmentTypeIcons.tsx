import type { ReactNode } from 'react'
import {
  ArchiveBook,
  ArrangeHorizontal,
  Category,
  Chart1,
  Chart21,
  Edit,
  I3Square,
  RecordCircle,
  SliderVertical1,
} from 'iconsax-react'
import type { GeneratableType } from '@/data/aiAssessmentGeneration'

/**
 * The glyph for each assessment format, in one place.
 *
 * The Add Content rail and the AI drawer's type chips both label these formats, and
 * an admin learns the glyph in one and has to recognise it in the other — so they
 * read from the same map rather than two lists that happen to agree today.
 */
export function assessmentTypeIcon(
  type: GeneratableType,
  { size = 20, active = false }: { size?: number; active?: boolean } = {},
): ReactNode {
  const variant = active ? 'Bold' : 'Linear'
  const c = 'currentColor'
  switch (type) {
    case 'single-choice':
      return <RecordCircle size={size} color={c} variant={variant} />
    case 'match-pairs':
      return <ArrangeHorizontal size={size} color={c} variant={variant} />
    case 'sequencing':
      return <I3Square size={size} color={c} variant={variant} />
    case 'categorization':
      return <Category size={size} color={c} variant={variant} />
    case 'fill-blank':
      return <SliderVertical1 size={size} color={c} variant={variant} />
    case 'short-text':
      return <Edit size={size} color={c} variant={variant} />
    case 'exercise':
      return <ArchiveBook size={size} color={c} variant={variant} />
    case 'poll':
      /* iconsax-react splits this glyph's two styles across exports: Chart1 holds its
         Linear and Chart21 its Bold, and each one's *other* variant is a different,
         boxed chart. Picking per state is the only way to keep the selected icon the
         same glyph as the resting one. */
      return active
        ? <Chart21 size={size} color={c} variant="Bold" />
        : <Chart1 size={size} color={c} variant="Linear" />
    default:
      return null
  }
}
