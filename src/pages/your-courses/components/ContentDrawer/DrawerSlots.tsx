import { createContext, useContext, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/* The course builder's content bodies own the state their title and footer depend on
   (a wizard step, a disabled Save), but the chrome belongs to the shared SideDrawer that
   ContentDrawer renders. ContentDrawer hands SideDrawer an empty element for each slot
   and shares them here; the bodies portal their title and buttons into them. */
interface Slots {
  header: HTMLElement | null
  footer: HTMLElement | null
}

export const DrawerSlotsContext = createContext<Slots>({ header: null, footer: null })

interface DrawerHeaderProps {
  title: ReactNode
  description?: ReactNode
  /** A control before the title, e.g. a back button on a stepped drawer. */
  leading?: ReactNode
}

/* Title block beside SideDrawer's close button. Uses the drawer's own title classes so
   it reads exactly like a plain `title` / `subtitle`. */
export function DrawerHeader({ title, description, leading }: DrawerHeaderProps) {
  const { header } = useContext(DrawerSlotsContext)
  if (!header) return null
  return createPortal(
    <div className="content-drawer__headline">
      {leading}
      <div className="ds-drawer__titles">
        <h2 className="ds-drawer__title">{title}</h2>
        {description && <p className="ds-drawer__subtitle">{description}</p>}
      </div>
    </div>,
    header,
  )
}

/* Buttons for SideDrawer's pinned footer, which draws the divider above them. */
export function DrawerFooter({ children }: { children: ReactNode }) {
  const { footer } = useContext(DrawerSlotsContext)
  if (!footer) return null
  return createPortal(children, footer)
}
