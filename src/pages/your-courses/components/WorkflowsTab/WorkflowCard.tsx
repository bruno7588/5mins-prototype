import Toggle from '../../../../components/Toggle/Toggle'
import Dropdown from '../../../../components/Dropdown/Dropdown'
import Badge from '../../../../components/Badge/Badge'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import Collapse from '@/components/Collapse/Collapse'
import Button from '@/components/Button/Button'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface Props {
  enabled: boolean
  frequency: string
  excluded: string[]
  lastSent?: string
  onToggle: () => void
  onFrequencyChange: (v: string) => void
  onExcludedChange: (ids: string[]) => void
  onPreview: () => void
}

const FREQUENCY_OPTIONS = [
  { value: 'week', label: 'Week' },
  { value: 'fortnight', label: 'Fortnight' },
  { value: 'month', label: 'Month' },
]

/* Demo team managers: only managers with at least one team member are listed. Every one
   gets the update unless the admin ticks them to exclude them; their direct reports are
   then in nobody's update, which the team count under each name makes visible. */
const MANAGERS = [
  { id: 'm1', name: 'Sarah Jones', team: 12 },
  { id: 'm2', name: 'David Chen', team: 8 },
  { id: 'm3', name: 'Priya Patel', team: 5 },
  { id: 'm4', name: 'Tom Walker', team: 3 },
  { id: 'm5', name: 'Grace Okafor', team: 1 },
]
const MANAGER_OPTIONS = MANAGERS.map((m) => ({
  value: m.id,
  label: m.name,
  description: `${m.team} team ${m.team === 1 ? 'member' : 'members'}`,
}))

function WorkflowCard({
  enabled,
  frequency,
  excluded,
  lastSent,
  onToggle,
  onFrequencyChange,
  onExcludedChange,
  onPreview,
}: Props) {
  const reduceMotion = useReducedMotion()
  return (
    <article className="workflow-card">
      <header className="workflow-card__header">
        <div className="workflow-card__headline">
          <div className="workflow-card__title-row">
            <h3 className="workflow-card__title">Team progress update</h3>
            <Tooltip text="Only sent to managers who have at least one team member." position="Top" alignment="Center" iconSize={20} />
          </div>
          <p className="workflow-card__desc">
            Send each manager an email of their team's courses, due in the next 30 days.{' '}
            <Button variant="link" onClick={onPreview}>
              Preview Email Template
            </Button>
          </p>
        </div>
        <Toggle checked={enabled} onChange={onToggle} />
      </header>

      <ul className={`workflow-card__rules${enabled ? '' : ' workflow-card__rules--disabled'}`}>
        <li className="workflow-card__rule">
          <span>Repeat every</span>
          <Dropdown
            size="md"
            options={FREQUENCY_OPTIONS}
            value={frequency}
            onChange={onFrequencyChange}
            readOnly={!enabled}
            className="workflow-card__inline-dropdown"
          />
          <span>{frequency === 'month' ? 'on the first Monday' : 'on Monday'} at 9:00 AM UTC</span>
        </li>
        <li className="workflow-card__rule">
          <span>Don't send to</span>
          <Dropdown
            size="md"
            multiple
            searchable
            searchPlaceholder="Search team managers"
            // Managers without a team are left out on purpose; say so, or a missing name reads as a bug.
            emptyText={(q) => `No team managers match “${q}”. Only managers with at least one team member are listed.`}
            options={MANAGER_OPTIONS}
            values={excluded}
            onChangeValues={onExcludedChange}
            triggerText={
              excluded.length === 0
                ? 'No exclusions'
                : excluded.length === 1
                  ? MANAGERS.find((m) => m.id === excluded[0])?.name
                  : `${excluded.length} team managers`
            }
            readOnly={!enabled}
            className="workflow-card__inline-dropdown"
          />
          {/* Excluded managers at a glance; each × removes one, as unticking it in the menu does. */}
          <div className="workflow-card__excluded">
            <Collapse open={excluded.length > 0}>
              <div className="workflow-card__excluded-list">
                <AnimatePresence mode="popLayout" initial={false}>
                  {excluded.map((id) => {
                    const name = MANAGERS.find((m) => m.id === id)?.name ?? id
                    return (
                      <motion.span
                        key={id}
                        layout
                        initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.9 }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease: [0.42, 0, 0.58, 1] }}
                      >
                        <Badge
                          type="informative"
                          label={name}
                          onDismiss={enabled ? () => onExcludedChange(excluded.filter((e) => e !== id)) : undefined}
                          dismissLabel={`Remove ${name} from exclusions`}
                        />
                      </motion.span>
                    )
                  })}
                </AnimatePresence>
              </div>
            </Collapse>
          </div>
        </li>
      </ul>

      <Collapse open={enabled}>
        {lastSent && (
          <footer className="workflow-card__footer">
            <Badge
              type="informative"
              label={`Last sent ${lastSent}`}
              className="workflow-card__last-sent-badge"
            />
          </footer>
        )}
      </Collapse>
    </article>
  )
}

export default WorkflowCard
