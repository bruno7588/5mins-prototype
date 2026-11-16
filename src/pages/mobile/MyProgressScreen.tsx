import BottomSheet from '@/components/BottomSheet/BottomSheet'
import { MyProgressContent } from '@/pages/my-progress/MyProgress'
import type { ProgressStat } from '@/pages/my-progress/myProgressData'
import './MyProgressScreen.css'

/* Native app "My Progress" screen (Progress tab, My Progress chip). The same content as
   the web page (src/pages/my-progress), in one column: stat tiles, 5Mins Courses, Skill
   Development, External Training and the Leaderboard.
   Prefix: m-mp- */
function MyProgressScreen({ onInfo }: { onInfo: (stat: ProgressStat) => void }) {
  return (
    <div className="m-mp">
      <MyProgressContent native onInfo={onInfo} />
    </div>
  )
}

/* What a stat tile's info icon opens in the app: the explanation the web shows in a
   tooltip, in a bottom sheet. Rendered in the phone's overlay layer by MobileApp. */
export function ProgressInfoSheet({ stat, onClose }: { stat: ProgressStat; onClose: () => void }) {
  const { title, lines } = stat.info
  return (
    <BottomSheet onClose={onClose} ariaLabel={title ?? stat.label}>
      <div className="m-mp-info">
        <h2 className="m-mp-info__title">{title ?? stat.label}</h2>
        {title ? (
          <ul className="m-mp-info__list">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="m-mp-info__text">{lines[0]}</p>
        )}
      </div>
    </BottomSheet>
  )
}

export default MyProgressScreen
