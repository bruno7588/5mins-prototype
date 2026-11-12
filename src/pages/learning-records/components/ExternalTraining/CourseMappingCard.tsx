import { Fragment } from 'react'
import { ArrangeHorizontal } from 'iconsax-react'
import Dropdown, { type DropdownOption } from '@/components/Dropdown/Dropdown'

/* "Names that aren't on your approved list" (D15): each course name found in an upload
   that doesn't match an approved course, mapped once to a course or skipped.
   Used by the CSV review. Prefix: lret- */

interface Props {
  /** [name as found, how many rows use it] */
  unmatched: [string, number][]
  mappings: Record<string, string>
  options: DropdownOption[]
  /** "Name in your file" or "Name on the certificate". */
  nameHeader: string
  onChange: (name: string, value: string) => void
}

function CourseMappingCard({ unmatched, mappings, options, nameHeader, onChange }: Props) {
  return (
    <div className="lret-match">
      <div className="aet-step__body">
        <h3 className="aet-step__title">Names that aren't on your approved list</h3>
        <p className="aet-text">We'll remember this, so next time these rows match on their own.</p>
      </div>
      {/* Two columns, as Match the pairs (MatchPairsBody): the name found, the link
          glyph, then the approved course it maps to. */}
      <div className="lret-match__grid" role="group" aria-label="Match names to courses">
        <span className="lret-match__head">{nameHeader}</span>
        <span aria-hidden="true" />
        <span className="lret-match__head">Course in 5Mins</span>
        {unmatched.map(([name, n]) => (
          <Fragment key={name}>
            <span className="lret-match__name">
              <span className="lret-match__label">{name}</span>
              <span className="lret-match__count">
                {n} row{n === 1 ? '' : 's'}
              </span>
            </span>
            <ArrangeHorizontal size={20} color="var(--text-tertiary)" variant="Linear" className="lret-match__link" />
            <Dropdown
              className="lret-match__control"
              placeholder="Search for a course"
              searchable
              searchPlaceholder="Search approved courses"
              options={options}
              value={mappings[name] ?? ''}
              onChange={(v) => onChange(name, v)}
            />
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export default CourseMappingCard
