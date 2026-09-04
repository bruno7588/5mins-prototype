/**
 * Limited Admin drawer — the flow for making one person a Limited Admin and
 * defining the people they cover.
 *
 * Dedicated to this one role: there is no role selector, because every other
 * role is managed elsewhere. Save applies straight from the drawer, so the
 * scope summary and the role description carry the weight a confirmation step
 * would otherwise repeat.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Add, Danger, InfoCircle, Trash } from 'iconsax-react'
import Button from '@/components/Button/Button'
import CloseButton from '@/components/CloseButton/CloseButton'
import Dropdown from '@/components/Dropdown/Dropdown'
import type { DropdownOption } from '@/components/Dropdown/Dropdown'
import Alert from '@/components/Alert/Alert'
import { useOverlayA11y } from '@/hooks/useOverlayA11y'
import type { UserField } from '@/data/userFields'
import { emptyScope, isScopeComplete, orphanedConditions } from '../../limitedAdmin'
import type { LimitedAdminScope, ScopeCondition } from '../../limitedAdmin'
import './LimitedAdminDrawer.css'

export interface LimitedAdminPerson {
  id: number
  name: string
  email: string
  avatar: string
  avatarImg?: string
  isTeamManager?: boolean
  limitedAdmin?: LimitedAdminScope | null
}

interface Props {
  open: boolean
  person: LimitedAdminPerson | null
  fields: UserField[]
  onClose: () => void
  onSave: (scope: LimitedAdminScope) => void
}

function LimitedAdminDrawer({ open, person, fields, onClose, onSave }: Props) {
  const [closing, setClosing] = useState(false)
  const [scope, setScope] = useState<LimitedAdminScope>(emptyScope)
  const panelRef = useRef<HTMLElement>(null)

  const isEditing = Boolean(person?.limitedAdmin)

  /* Reset the form each time the drawer opens on a person. */
  useEffect(() => {
    if (!open) return
    setClosing(false)
    setScope(
      person?.limitedAdmin && person.limitedAdmin.conditions.length > 0
        ? { conditions: person.limitedAdmin.conditions.map((c) => ({ ...c, values: [...c.values] })) }
        : emptyScope(),
    )
  }, [open, person])

  function handleClose() {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onClose()
    }, 300)
  }

  useOverlayA11y(panelRef, open && !closing, { onEscape: handleClose })

  const orphans = useMemo(
    () => (person?.limitedAdmin ? orphanedConditions(person.limitedAdmin, fields) : []),
    [person, fields],
  )

  if (!open || !person) return null

  const fieldOptions: DropdownOption[] = fields.map((f) => ({
    value: String(f.id),
    label: f.name,
  }))

  function updateCondition(index: number, next: Partial<ScopeCondition>) {
    setScope((s) => ({
      conditions: s.conditions.map((c, i) => (i === index ? { ...c, ...next } : c)),
    }))
  }

  function addCondition() {
    setScope((s) => ({ conditions: [...s.conditions, { fieldId: 0, values: [] }] }))
  }

  function removeCondition(index: number) {
    setScope((s) => ({ conditions: s.conditions.filter((_, i) => i !== index) }))
  }

  /* A field already used by another condition cannot be picked twice — two
     conditions on one field would contradict each other under AND. */
  function availableFields(index: number): DropdownOption[] {
    const taken = new Set(
      scope.conditions.filter((_, i) => i !== index).map((c) => c.fieldId),
    )
    return fieldOptions.filter((o) => !taken.has(Number(o.value)))
  }

  const canSave = isScopeComplete(scope)
  const hasFields = fields.length > 0
  const replacingTeamManager = Boolean(person.isTeamManager) && !isEditing

  const saveLabel = replacingTeamManager
    ? 'Replace Team Manager Role'
    : isEditing
      ? 'Save Scope'
      : 'Make Limited Admin'

  return (
    <div
      className={`lad-overlay${closing ? ' lad-overlay--closing' : ''}`}
      /* Only a press on the backdrop itself closes. The panel must NOT stop
         propagation instead: React would stop the native event at the root, so
         it would never reach the document-level listeners that close a portalled
         dropdown when you click outside it. */
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <aside
        ref={panelRef}
        className={`lad-panel${closing ? ' lad-panel--closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Edit Limited Admin scope' : 'Make Limited Admin'}
        tabIndex={-1}
      >
        <header className="lad-header">
          <div className="lad-header__top">
            <h2 className="lad-title">{isEditing ? 'Edit scope' : 'Make Limited Admin'}</h2>
            <CloseButton onClick={handleClose} ariaLabel="Close" />
          </div>
          <div className="lad-divider" />
        </header>

        <div className="lad-body">
          {/* Who this is about */}
          <div className="lad-person">
            <div className="lad-person__avatar">
              {person.avatarImg ? <img src={person.avatarImg} alt="" /> : person.avatar}
            </div>
            <div className="lad-person__text">
              <p className="lad-person__name">{person.name}</p>
              <p className="lad-person__email">{person.email}</p>
            </div>
          </div>

          {/* What the role means */}
          <Alert
            type="Callout"
            customIcon={<InfoCircle size={20} color="var(--text-secondary)" variant="Linear" />}
            message="A Limited Admin manages people, enrolments and learning records for the people in their scope only. They cannot see reports, teams, cohorts or settings, and cannot manage other admins."
          />

          {orphans.length > 0 && (
            <Alert
              type="Alert"
              customIcon={<Danger size={20} color="var(--text-warning)" variant="Bold" />}
              title="This scope is out of date"
              message="A field or value it relies on has been removed. Until you fix it, this Limited Admin sees nobody."
            />
          )}

          {replacingTeamManager && (
            <Alert
              type="Alert"
              customIcon={<Danger size={20} color="var(--text-warning)" variant="Bold" />}
              title="This will replace their Team Manager role"
              message={`${person.name} will no longer manage their current team.`}
            />
          )}

          {/* Scope: one row per field, read as a sentence. */}
          {!hasFields ? (
            <p className="lad-empty">
              There are no custom user fields yet. Create one on the User fields page
              before scoping a Limited Admin.
            </p>
          ) : (
            <>
              {scope.conditions.map((condition, index) => {
                const field = fields.find((f) => f.id === condition.fieldId)
                return (
                  <div className="lad-scope-row" key={index}>
                    <span className="lad-scope-lead">{index === 0 ? 'Scope is' : 'and'}</span>
                    <Dropdown
                      className="lad-scope-dropdown"
                      options={availableFields(index)}
                      value={condition.fieldId ? String(condition.fieldId) : undefined}
                      placeholder="Select field"
                      onChange={(value) =>
                        updateCondition(index, { fieldId: Number(value), values: [] })
                      }
                    />
                    <span className="lad-scope-operator">is any of</span>
                    <Dropdown
                      className="lad-scope-dropdown"
                      options={(field?.options ?? []).map((o) => ({ value: o, label: o }))}
                      multiple
                      values={condition.values}
                      onChangeValues={(values) => updateCondition(index, { values })}
                      placeholder="Select field"
                      summaryLabel="Selected"
                      readOnly={!field}
                    />
                    {scope.conditions.length > 1 && (
                      <button
                        type="button"
                        className="lad-scope-remove"
                        onClick={() => removeCondition(index)}
                        aria-label="Remove field"
                      >
                        <Trash size={20} color="currentColor" variant="Linear" />
                      </button>
                    )}
                  </div>
                )
              })}

              {availableFields(-1).length > 0 && (
                <Button
                  className="lad-add-field"
                  variant="text"
                  size="md"
                  icon={<Add size={20} color="currentColor" />}
                  onClick={addCondition}
                >
                  Add Field
                </Button>
              )}
            </>
          )}
        </div>

        <div className="lad-footer">
          <div className="lad-divider" />
          <div className="lad-footer__row">
            <Button
              variant="filled"
              disabled={!canSave}
              onClick={() => canSave && onSave(scope)}
            >
              {saveLabel}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default LimitedAdminDrawer
