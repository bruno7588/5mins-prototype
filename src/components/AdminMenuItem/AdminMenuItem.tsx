import { useNavigate } from 'react-router-dom'
import { ShieldSecurity } from 'iconsax-react'
import ImpersonationLock from '@/impersonation/ImpersonationLock'
import './AdminMenuItem.css'

/**
 * The "Admin" entry at the foot of the learner side menu. While an impersonation
 * session is live it is locked through ImpersonationLock — the reference for every
 * action that isn't allowed while impersonating: visible, disabled, a tooltip on
 * hover and focus, and blocked attempts logged.
 */
function AdminMenuItem() {
  const navigate = useNavigate()

  return (
    <ImpersonationLock action="open Admin" position="Right" className="admin-menu-item__tip">
      {(locked) => (
        <button
          type="button"
          className={`mt-side__item${locked ? ' admin-menu-item--disabled' : ''}`}
          aria-disabled={locked || undefined}
          onClick={() => navigate('/content-library')}
        >
          <ShieldSecurity size={24} color={locked ? 'var(--text-disabled)' : 'var(--text-secondary)'} variant="Bold" />
          <span>Admin</span>
        </button>
      )}
    </ImpersonationLock>
  )
}

export default AdminMenuItem
