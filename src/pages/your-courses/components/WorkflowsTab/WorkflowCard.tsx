import Toggle from '../../../../components/Toggle/Toggle'
import Dropdown from '../../../../components/Dropdown/Dropdown'
import Badge from '../../../../components/Badge/Badge'
import Tooltip from '../../../../components/Tooltip/Tooltip'

interface Props {
  enabled: boolean
  frequency: string
  scope: string
  lastSent?: string
  onToggle: () => void
  onFrequencyChange: (v: string) => void
  onScopeChange: (v: string) => void
  onPreview: () => void
}

const FREQUENCY_OPTIONS = [
  { value: 'week', label: 'Week' },
  { value: 'fortnight', label: 'Fortnight' },
  { value: 'month', label: 'Month' },
]

const SCOPE_OPTIONS = [
  {
    value: 'direct',
    label: 'Direct reports',
    description: 'Team members who report to you',
  },
  {
    value: 'org',
    label: 'My organisation',
    description: 'Includes indirect reports from each manager under you',
  },
]

function WorkflowCard({
  enabled,
  frequency,
  scope,
  lastSent,
  onToggle,
  onFrequencyChange,
  onScopeChange,
  onPreview,
}: Props) {
  return (
    <article className="workflow-card">
      <header className="workflow-card__header">
        <div className="workflow-card__headline">
          <h3 className="workflow-card__title">Team Progress Update</h3>
          <p className="workflow-card__desc">
            Send each manager an email of their team's courses, due in the next 30 days.{' '}
            <button type="button" className="workflow-card__preview-link" onClick={onPreview}>
              Preview email template
            </button>
          </p>
        </div>
        <Toggle live checked={enabled} onChange={onToggle} />
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
          <span>on monday at 9:00 AM UTC</span>
        </li>
        <li className="workflow-card__rule">
          <span>Include</span>
          <Dropdown
            size="md"
            options={SCOPE_OPTIONS}
            value={scope}
            onChange={onScopeChange}
            readOnly={!enabled}
            className="workflow-card__inline-dropdown"
          />
          <Tooltip
            text="Only sent to managers who have at least one team member."
            position="Top"
            alignment="Center"
            iconColor={enabled ? undefined : 'var(--text-disabled)'}
          />
        </li>
      </ul>

      <div
        className={`workflow-card__collapsible${enabled ? ' workflow-card__collapsible--open' : ''}`}
        aria-hidden={!enabled}
      >
        <div className="workflow-card__collapsible-inner">
          {lastSent && (
            <footer className="workflow-card__footer">
              <Badge
                type="informative"
                label={`Last sent ${lastSent}`}
                className="workflow-card__last-sent-badge"
              />
            </footer>
          )}
        </div>
      </div>
    </article>
  )
}

export default WorkflowCard
