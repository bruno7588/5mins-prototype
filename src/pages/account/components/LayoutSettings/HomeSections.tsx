import { useId, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowDown2, ArrowUp, Lock } from 'iconsax-react'
import Button from '@/components/Button/Button'
import Collapse from '@/components/Collapse/Collapse'
import InputField from '@/components/InputField/InputField'
import Toggle from '@/components/Toggle/Toggle'
import Tooltip from '@/components/Tooltip/Tooltip'
import {
  DEFAULT_HEADINGS,
  defaultHomeSections,
  headingFor,
  sameHomeSections,
  setHomeSections,
  useHomeSections,
  type HomeSections as HomeSectionsConfig,
  type SectionKey,
} from '@/data/homeSections'
import './HomeSections.css'

/* Account & Settings > Layout > Home page sections (DEV-5185): rename, reorder and
   hide the Your Workspace sections, and hide the home banner. Nothing reaches
   learners until Save Changes.
   Prefix: acl-hs- */

/** What a hidden section leaves behind, said under its field. */
const HIDDEN_NOTE: Record<SectionKey, string> = {
  enrolled: 'Hidden from Your Workspace. Its courses stay in search and My Courses.',
  explore: 'Hidden from Your Workspace. Its courses stay in search and My Courses.',
  events: 'Hidden from Your Workspace. Events stay on the Events page.',
  experts: 'Hidden from Your Workspace.',
}

function ShownToggle({ shown, onToggle, what, label }: { shown: boolean; onToggle: () => void; what: string; label: string }) {
  return (
    <div className="acl-hs-shown">
      <span className="acl-hs-shown__label">{shown ? 'Shown' : 'Hidden'}</span>
      <Tooltip text={shown ? `Hide ${what}` : `Show ${what}`} position="Top" alignment="End" icon={false}>
        <Toggle checked={shown} onChange={onToggle} aria-label={`${label} shown`} />
      </Tooltip>
    </div>
  )
}

function HomeSections({ onSaved }: { onSaved: () => void }) {
  const saved = useHomeSections()
  const [draft, setDraft] = useState<HomeSectionsConfig>(saved)
  const [dragKey, setDragKey] = useState<SectionKey | null>(null)
  // Only the grip starts a drag, so text in the heading field can still be selected.
  const [armedKey, setArmedKey] = useState<SectionKey | null>(null)
  const [moved, setMoved] = useState('')
  const lastSwap = useRef(0)
  const reduceMotion = useReducedMotion()
  // The card is long, so it can be folded down to its heading.
  const [expanded, setExpanded] = useState(true)
  const bodyId = useId()

  const dirty = !sameHomeSections(draft, saved)
  const isDefault = sameHomeSections(draft, defaultHomeSections())

  const move = (from: number, to: number) => {
    if (to < 0 || to >= draft.order.length || from === to) return
    const order = [...draft.order]
    const [key] = order.splice(from, 1)
    order.splice(to, 0, key)
    setDraft({ ...draft, order })
    setMoved(`${headingFor(draft, key)} moved to position ${to + 2} of ${order.length + 1}`)
  }

  // Live reorder while dragging; the pause lets a row finish gliding before it can swap back.
  const dragOver = (overKey: SectionKey) => (e: React.DragEvent) => {
    e.preventDefault()
    if (dragKey === null || dragKey === overKey || Date.now() - lastSwap.current < 220) return
    lastSwap.current = Date.now()
    move(draft.order.indexOf(dragKey), draft.order.indexOf(overKey))
  }

  const save = () => {
    setHomeSections(draft)
    // The store trims headings and drops empty or default ones: show what was saved.
    const headings: HomeSectionsConfig['headings'] = {}
    for (const k of draft.order) headings[k] = headingFor(draft, k)
    setDraft({ ...draft, headings })
    onSaved()
  }

  return (
    <section className="acl-card acl-hs">
      <div className="acl-hs-top">
        <div className="acl-head">
          <h3 className="acl-title">Home page sections</h3>
          <p className="acl-text">
            Choose the headings, order and sections learners see on Your Workspace. Learners see your
            changes after you save.
          </p>
        </div>
        <Tooltip text={expanded ? 'Collapse section' : 'Expand section'} position="Top" alignment="End" icon={false}>
          <button
            type="button"
            className="acl-hs-chevron-btn"
            aria-label={expanded ? 'Collapse home page sections' : 'Expand home page sections'}
            aria-expanded={expanded}
            aria-controls={bodyId}
            onClick={() => setExpanded(!expanded)}
          >
            <span className={`acl-hs-chevron${expanded ? ' acl-hs-chevron--open' : ''}`}>
              <ArrowDown2 size={20} color="var(--text-primary)" variant="Linear" />
            </span>
          </button>
        </Tooltip>
      </div>

      <Collapse open={expanded} className="acl-hs-collapse">
      <div className="acl-hs-body" id={bodyId}>
      <div className="acl-hs-list">
        <div className={`acl-hs-row${draft.bannerShown ? '' : ' acl-hs-row--hidden'}`}>
          <Tooltip text="The home banner always stays at the top" position="Top" alignment="Start" icon={false}>
            <span className="acl-hs-lock" tabIndex={0} aria-label="The home banner always stays at the top">
              <Lock size={16} color="var(--text-secondary)" variant="Linear" />
            </span>
          </Tooltip>
          <div className="acl-hs-card acl-hs-card--banner">
            <span className="acl-hs-num">1</span>
            <div className="acl-hs-main">
              <p className="acl-hs-name">Home banner</p>
              <p className="acl-hs-helper">
                {draft.bannerShown
                  ? "Each learner's programs and courses, at the top of Your Workspace."
                  : 'Learners see no banner. Your Workspace starts with the first section.'}
              </p>
            </div>
            <ShownToggle
              shown={draft.bannerShown}
              onToggle={() => setDraft({ ...draft, bannerShown: !draft.bannerShown })}
              what="home banner"
              label="Home banner"
            />
          </div>
        </div>

        {draft.order.map((key, index) => {
          const fallback = DEFAULT_HEADINGS[key]
          const value = draft.headings[key] ?? fallback
          const hidden = !!draft.hidden[key]
          const custom = value.trim().length > 0 && value.trim() !== fallback
          const setHeading = (heading: string) => setDraft({ ...draft, headings: { ...draft.headings, [key]: heading } })
          const helper = hidden
            ? HIDDEN_NOTE[key]
            : !value.trim()
              ? `Learners see the default: ${fallback}`
              : custom
                ? `Default: ${fallback}`
                : 'Default heading'

          return (
            <motion.div
              key={key}
              layout={reduceMotion ? false : 'position'}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <div
                className={`acl-hs-row${hidden ? ' acl-hs-row--hidden' : ''}${dragKey === key ? ' acl-hs-row--dragging' : ''}`}
                draggable={armedKey === key}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move'
                  setDragKey(key)
                }}
                onDragOver={dragOver(key)}
                onDragEnd={() => {
                  setDragKey(null)
                  setArmedKey(null)
                }}
              >
                <button
                  type="button"
                  className="acl-hs-grip"
                  aria-label={`Move ${custom ? value.trim() : fallback}. Use the up and down arrow keys.`}
                  onMouseDown={() => setArmedKey(key)}
                  onMouseUp={() => setArmedKey(null)}
                  onKeyDown={(e) => {
                    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
                    e.preventDefault()
                    move(index, index + (e.key === 'ArrowUp' ? -1 : 1))
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <circle cx="7" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="13" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="7" cy="10" r="1.5" fill="currentColor" />
                    <circle cx="13" cy="10" r="1.5" fill="currentColor" />
                    <circle cx="7" cy="15" r="1.5" fill="currentColor" />
                    <circle cx="13" cy="15" r="1.5" fill="currentColor" />
                  </svg>
                </button>
                <div className="acl-hs-card">
                  <span className="acl-hs-num">{index + 2}</span>
                  <div className="acl-hs-main">
                    <InputField
                      value={value}
                      placeholder="Leave empty to use the default"
                      onChange={(e) => setHeading(e.target.value)}
                      ariaLabel={`Heading for ${fallback}`}
                    />
                    <div className="acl-hs-helper-row">
                      <span className="acl-hs-helper">{helper}</span>
                      {custom && !hidden && (
                        <Button variant="text" size="sm" onClick={() => setHeading(fallback)}>
                          Use Default
                        </Button>
                      )}
                    </div>
                    {key === 'explore' && custom && !hidden && (
                      <span className="acl-hs-helper">The Categories page uses this heading too.</span>
                    )}
                  </div>
                  {/* The same up and down buttons as a sequencing step, for moving a row
                      without dragging. No tooltip at the ends, where the button is disabled. */}
                  <div className="acl-hs-move">
                    <Tooltip text="Move up" position="Top" icon={false} disabled={index === 0}>
                      <button
                        type="button"
                        className="acl-hs-move-btn"
                        disabled={index === 0}
                        aria-label={`Move ${custom ? value.trim() : fallback} up`}
                        onClick={() => move(index, index - 1)}
                      >
                        <ArrowUp size={16} color="currentColor" variant="Linear" />
                      </button>
                    </Tooltip>
                    <Tooltip text="Move down" position="Top" icon={false} disabled={index === draft.order.length - 1}>
                      <button
                        type="button"
                        className="acl-hs-move-btn"
                        disabled={index === draft.order.length - 1}
                        aria-label={`Move ${custom ? value.trim() : fallback} down`}
                        onClick={() => move(index, index + 1)}
                      >
                        <ArrowDown size={16} color="currentColor" variant="Linear" />
                      </button>
                    </Tooltip>
                  </div>
                  <ShownToggle
                    shown={!hidden}
                    onToggle={() => setDraft({ ...draft, hidden: { ...draft.hidden, [key]: !hidden } })}
                    what="section"
                    label={custom ? value.trim() : fallback}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* All on the left, primary first, as the other Layout cards order their buttons. */}
      <div className="acl-hs-footer">
        <Button disabled={!dirty} onClick={save}>
          Save Changes
        </Button>
        <Button variant="outlined-2" disabled={isDefault} onClick={() => setDraft(defaultHomeSections())}>
          Reset to Default
        </Button>
      </div>
      </div>
      </Collapse>
      <span className="acl-hs-live" aria-live="polite">{moved}</span>
    </section>
  )
}

export default HomeSections
