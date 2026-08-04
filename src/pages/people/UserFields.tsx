import { useState, useEffect } from 'react'
import { Setting3, Add, Edit2, Trash, Danger } from 'iconsax-react'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import UserFieldDrawer from './components/UserFieldDrawer/UserFieldDrawer'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import ToastContainer, { useToast } from '../../components/Toast/Toast'
import './UserFields.css'

interface UserField {
  id: number
  name: string
  options: string[]
  required: boolean
}

const STORAGE_KEY = '5mins-user-fields'

function loadFields(): UserField[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

let nextId = (loadFields().reduce((max, f) => Math.max(max, f.id), 0)) + 1

function UserFields() {
  const [fields, setFields] = useState<UserField[]>(loadFields)
  const [showDrawer, setShowDrawer] = useState(false)
  const [editingField, setEditingField] = useState<UserField | null>(null)
  const [deleteField, setDeleteField] = useState<UserField | null>(null)
  const [confirmInput, setConfirmInput] = useState('')
  const { toasts, show: showToast } = useToast()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fields))
  }, [fields])

  const handleOpenDrawer = () => {
    setEditingField(null)
    setShowDrawer(true)
  }

  const handleEdit = (field: UserField) => {
    setEditingField(field)
    setShowDrawer(true)
  }

  const handleSave = (data: { name: string; options: string[]; required: boolean }) => {
    if (editingField) {
      setFields(prev => prev.map(f =>
        f.id === editingField.id ? { ...f, ...data } : f
      ))
      showToast('success', 'Custom field updated!')
    } else {
      setFields(prev => [...prev, { id: nextId++, ...data }])
      showToast('success', 'New field created!')
    }
    setEditingField(null)
    setShowDrawer(false)
  }

  const handleDeleteConfirm = () => {
    if (!deleteField) return
    setFields(prev => prev.filter(f => f.id !== deleteField.id))
    setDeleteField(null)
    setConfirmInput('')
    showToast('success', 'Custom field deleted!')
  }

  return (
    <div className="people-layout">
      <LeftSidebar />
      <main className="people-main">
        <div className="user-fields-page">
          {/* Page Header */}
          <div className="user-fields-header">
            <div className="user-fields-header-text">
              <h2 className="user-fields-title">Custom Fields</h2>
              <p className="user-fields-subtitle">
                Define custom fields to capture organization-specific data for your users. These fields can be included in CSV uploads and API operations.{' '}
                <span className="user-fields-learn-more ui-disabled" aria-disabled="true">Learn more</span>
              </p>
            </div>
            <button className="btn-primary" onClick={handleOpenDrawer}>
              <Add size={20} color="currentColor" />
              Create New Field
            </button>
          </div>

          <div className="user-fields-divider" />

          {fields.length === 0 ? (
            /* Empty State */
            <div className="user-fields-empty">
              <div className="user-fields-empty-icon">
                <Setting3 size={40} color="var(--text-secondary)" variant="Linear" />
              </div>
              <div className="user-fields-empty-info">
                <h3 className="user-fields-empty-title">Create a new custom field to get started!</h3>
                <p className="user-fields-empty-desc">Customize user profiles with unique fields.</p>
              </div>
              <button className="btn-outlined" onClick={handleOpenDrawer}>
                New Custom Field
              </button>
            </div>
          ) : (
            /* Fields Table */
            <div className="uf-table">
              <div className="uf-table-header">
                <div className="uf-table-cell uf-table-cell--name">Field name</div>
                <div className="uf-table-cell uf-table-cell--required">Required</div>
                <div className="uf-table-cell uf-table-cell--action" />
                <div className="uf-table-cell uf-table-cell--action" />
              </div>

              {fields.map(field => (
                <div className="uf-table-row" key={field.id}>
                  <div className="uf-table-cell uf-table-cell--name">{field.name}</div>
                  <div className="uf-table-cell uf-table-cell--required">
                    {field.required ? (
                      <span className="uf-badge uf-badge--yes">Yes</span>
                    ) : (
                      <span className="uf-badge uf-badge--no">No</span>
                    )}
                  </div>
                  <div className="uf-table-cell uf-table-cell--action">
                    <button className="uf-table-icon-btn uf-table-icon-btn--tooltip" onClick={() => handleEdit(field)}>
                      <Edit2 size={20} color="var(--text-secondary)" />
                      <span className="uf-table-tooltip">Edit field</span>
                    </button>
                  </div>
                  <div className="uf-table-cell uf-table-cell--action">
                    <button className="uf-table-icon-btn uf-table-icon-btn--tooltip uf-table-icon-btn--danger" onClick={() => setDeleteField(field)}>
                      <Trash size={20} color="currentColor" />
                      <span className="uf-table-tooltip">Delete field</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showDrawer && (
          <UserFieldDrawer
            onClose={() => { setShowDrawer(false); setEditingField(null) }}
            onSave={handleSave}
            initialData={editingField ? { name: editingField.name, options: editingField.options, required: editingField.required } : undefined}
            existingNames={fields.map(f => f.name)}
          />
        )}

        {/* Delete confirmation */}
        <ConfirmModal open={!!deleteField} onClose={() => { setDeleteField(null); setConfirmInput('') }}>
          {deleteField && (
            <>
              <div className="confirm-modal-header confirm-modal-header--center">
                <Danger size={72} color="var(--danger-500)" variant="Linear" />
                <h3 className="confirm-modal-title">Delete custom field</h3>
                <p className="confirm-modal-body">
                  This field contains data for users. Delete anyway?
                </p>
              </div>
              <div className="confirm-modal-input-group">
                <label className="confirm-modal-label">
                  Type <span className="confirm-modal-label-danger">'Delete'</span> below, to confirm
                </label>
                <input
                  className="confirm-modal-input"
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                />
              </div>
              <div className="confirm-modal-actions confirm-modal-actions--center">
                <button
                  className="confirm-modal-btn confirm-modal-btn--outlined-neutral"
                  onClick={() => { setDeleteField(null); setConfirmInput('') }}
                >
                  Cancel
                </button>
                <button
                  className="confirm-modal-btn confirm-modal-btn--danger"
                  disabled={confirmInput !== 'Delete'}
                  onClick={handleDeleteConfirm}
                >
                  Delete Field
                </button>
              </div>
            </>
          )}
        </ConfirmModal>

        <ToastContainer toasts={toasts} />
      </main>
    </div>
  )
}

export default UserFields
