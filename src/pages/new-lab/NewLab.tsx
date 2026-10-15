import EmptyState from '@/components/EmptyState/EmptyState'
import './new-lab.css'

/**
 * New Lab - an empty playground, reserved for the next exploration.
 * Listed under Playground in the demo switcher (src/prototype/DemoSwitcher).
 */
function NewLab() {
  return (
    <div className="nlab-page">
      <EmptyState title="Nothing here yet" description="This lab is reserved for the next exploration." />
    </div>
  )
}

export default NewLab
