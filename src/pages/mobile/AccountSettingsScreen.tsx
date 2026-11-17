import { useLayoutEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight2, Camera, Logout } from 'iconsax-react'
import Avatar from '@/components/Avatar/Avatar'
import Button from '@/components/Button/Button'
import { ARRIVE, arriveTransition } from '@/components/AIWorkingCard/arrive'
import { COMPANY } from '@/data/people'
import avatarAnthonny from '@/assets/avatars/avatar-1.jpg'
import './AccountSettingsScreen.css'

/* Each row: a label, an optional value, and a chevron when it leads somewhere. */
interface Row {
  label: string
  value?: string
  chevron?: boolean
}

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: 'Personal Info',
    rows: [
      { label: 'Email', value: 'anthonny@example.com' },
      { label: 'Name', value: 'Anthonny', chevron: true },
      { label: 'Last Name', value: 'Wallace', chevron: true },
    ],
  },
  { title: 'Company Profile', rows: [{ label: COMPANY }] },
  {
    title: 'Preferences',
    rows: [
      { label: 'Role', value: 'Customer Support', chevron: true },
      { label: 'Your Skills', chevron: true },
      { label: 'Update Interests', chevron: true },
      { label: 'Weekly Goal', value: 'Casual', chevron: true },
    ],
  },
  { title: 'Notifications', rows: [{ label: 'Notification Settings', chevron: true }] },
  {
    title: 'Privacy',
    rows: [
      { label: 'Privacy Policy', chevron: true },
      { label: 'Manage your data', chevron: true },
    ],
  },
  {
    title: 'Feedback',
    rows: [
      { label: 'Help us improve', chevron: true },
      { label: 'Report an issue', chevron: true },
    ],
  },
]

/* Native app "Settings" screen (DES-368): what Account Settings in the settings menu
   opens. Mirrors the production app's Settings screen: photo, then grouped rows, then
   Log Out. The rows' own screens are not built, so the rows are display only.
   Prefix: m-acct- */
function AccountSettingsScreen({ onLogOut }: { onLogOut: () => void }) {
  const reduce = useReducedMotion()
  /* The phone's content area keeps the previous screen's scroll position. Start at the top. */
  const rootRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    rootRef.current?.closest('.m-phone__content')?.scrollTo(0, 0)
  }, [])

  return (
    <motion.div ref={rootRef} className="m-acct" {...ARRIVE(reduce)} transition={arriveTransition(reduce)}>
      <div className="m-acct__photo">
        <Avatar name="Anthonny Wallace" size={72} src={avatarAnthonny} />
        {/* Changing the photo is not built in the prototype: the badge is inert but not dimmed. */}
        <button type="button" className="m-acct__camera" aria-label="Change photo" disabled>
          <Camera size={16} color="var(--text-primary)" variant="Linear" />
        </button>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.title} className="m-acct__section">
          <h2 className="m-acct__heading">{section.title}</h2>
          <ul className="m-acct__rows">
            {section.rows.map((row) => (
              <li key={row.label} className="m-acct__row">
                <span className="m-acct__label">{row.label}</span>
                {row.value ? <span className="m-acct__value">{row.value}</span> : null}
                {row.chevron ? <ArrowRight2 size={20} color="var(--text-primary)" variant="Linear" /> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <Button
        variant="outlined"
        size="lg"
        className="m-acct__logout"
        trailingIcon={<Logout size={20} color="currentColor" variant="Linear" />}
        onClick={onLogOut}
      >
        Log Out
      </Button>
      <p className="m-acct__version">version 24.194.0 (24163034)</p>
    </motion.div>
  )
}

export default AccountSettingsScreen
