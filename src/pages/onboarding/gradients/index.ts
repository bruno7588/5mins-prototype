import type { MeshConfig } from '../../../lib/meshGradient'
import screen1 from './screen-1.json'
import screen2 from './screen-2.json'
import screen3 from './screen-3.json'
import screen4 from './screen-4.json'
import screen5 from './screen-5.json'
import screen6 from './screen-6.json'

/** Dark mesh-gradient config for each onboarding screen, in order.
 *  Index 5 (screen-6) is the "Setting things up" loading screen. */
export const ONBOARDING_GRADIENTS: MeshConfig[] = [
  screen1,
  screen2,
  screen3,
  screen4,
  screen5,
  screen6,
] as unknown as MeshConfig[]
