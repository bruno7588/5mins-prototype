import { useEffect, useState } from 'react'
import Button from '@/components/Button/Button'
import ConfirmModal from '@/components/ConfirmModal/ConfirmModal'
import InputField from '@/components/InputField/InputField'
import SectionHeader from '@/pages/your-courses/components/SectionHeader/SectionHeader'
import { duplicateProvider, newId, saveProvider, type ExternalProvider } from '@/data/externalTraining'

interface Props {
  open: boolean
  /** null = Add Provider. */
  provider: ExternalProvider | null
  onClose: () => void
  onSaved: (provider: ExternalProvider, isNew: boolean) => void
}

/* Add / Edit Provider (PRD 1.6): a small closable modal with one field. */
function ProviderModal({ open, provider, onClose, onSaved }: Props) {
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open) {
      setName(provider?.name ?? '')
      setSubmitted(false)
    }
  }, [open, provider])

  const dupe = name.trim() ? duplicateProvider(name, provider?.id) : undefined
  const error = !name.trim() ? 'Add a provider name' : dupe ? `There's already a provider called ${dupe.name}.` : ''

  const save = () => {
    setSubmitted(true)
    if (error) return
    const next: ExternalProvider = { id: provider?.id ?? newId('p'), name: name.trim(), archived: provider?.archived ?? false }
    saveProvider(next)
    onSaved(next, !provider)
  }

  return (
    <ConfirmModal open={open} onClose={onClose} closable className="aet-modal" ariaLabel={provider ? 'Edit provider' : 'Add provider'}>
      <SectionHeader title={provider ? 'Edit provider' : 'Add provider'} />
      <form
        className="aet-modal__form"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <InputField
          label="Provider name"
          placeholder="For example, St John Ambulance"
          value={name}
          onChange={(e) => setName(e.target.value)}
          validation={submitted && error ? 'error' : 'none'}
          helperText={submitted && error ? error : undefined}
        />
        <div className="aet-modal__actions">
          <Button variant="outlined-2" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{provider ? 'Save Changes' : 'Save Provider'}</Button>
        </div>
      </form>
    </ConfirmModal>
  )
}

export default ProviderModal
