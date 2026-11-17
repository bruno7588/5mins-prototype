import { Save2, User } from 'iconsax-react'
import BottomSheet from '@/components/BottomSheet/BottomSheet'
import './SettingsSheet.css'

/* Native app settings menu (DES-368): what the gear on the My Learning header opens. A bottom sheet
   (overlays.md) holding Listbox list items (listbox.md): 20px leading icon in
   --text-primary, label, hover fill. Account Settings opens the Settings screen,
   where the profile is edited and Log Out lives. No Dark Mode row: the app is dark-only.
   Rendered in the phone's overlay layer by MobileApp. Prefix: m-settings- */
function SettingsSheet({
  onClose,
  onOpenSaved,
  onOpenAccount,
}: {
  onClose: () => void
  onOpenSaved: () => void
  onOpenAccount: () => void
}) {
  return (
    <BottomSheet onClose={onClose} ariaLabel="Settings">
      <div className="m-settings" role="menu">
        <button type="button" role="menuitem" className="m-settings__item" onClick={onOpenSaved}>
          <Save2 size={20} color="var(--text-primary)" variant="Linear" />
          <span>Saved</span>
        </button>
        <button type="button" role="menuitem" className="m-settings__item" onClick={onOpenAccount}>
          <User size={20} color="var(--text-primary)" variant="Linear" />
          <span>Account Settings</span>
        </button>
      </div>
    </BottomSheet>
  )
}

export default SettingsSheet
