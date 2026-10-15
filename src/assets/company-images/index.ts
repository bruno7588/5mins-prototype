/* Default company images (square 512 x 512 JPEG). Placeholders until Design supplies
   the final set: replace a file, or add an import + one line in the list. */
import default01 from './default-01.jpg'
import default02 from './default-02.jpg'
import default03 from './default-03.jpg'
import default04 from './default-04.jpg'
import default05 from './default-05.jpg'
import default06 from './default-06.jpg'
import default07 from './default-07.jpg'
import default08 from './default-08.jpg'
import default09 from './default-09.jpg'
import default10 from './default-10.jpg'
import default11 from './default-11.jpg'
import default12 from './default-12.jpg'
import default13 from './default-13.jpg'
import default14 from './default-14.jpg'

export interface DefaultCompanyImage {
  id: string
  src: string
}

export const DEFAULT_COMPANY_IMAGES: DefaultCompanyImage[] = [
  { id: 'default-01', src: default01 },
  { id: 'default-02', src: default02 },
  { id: 'default-03', src: default03 },
  { id: 'default-04', src: default04 },
  { id: 'default-05', src: default05 },
  { id: 'default-06', src: default06 },
  { id: 'default-07', src: default07 },
  { id: 'default-08', src: default08 },
  { id: 'default-09', src: default09 },
  { id: 'default-10', src: default10 },
  { id: 'default-11', src: default11 },
  { id: 'default-12', src: default12 },
  { id: 'default-13', src: default13 },
  { id: 'default-14', src: default14 },
]
