import { MyProgressContent } from '@/pages/my-progress/MyProgress'
import './MyProgressScreen.css'

/* Native app "My Progress" screen (Progress tab, My Progress chip). The same content as
   the web page (src/pages/my-progress), in one column: stat tiles, 5Mins Courses, Skill
   Development, External Training and the Leaderboard.
   Prefix: m-mp- */
function MyProgressScreen() {
  return (
    <div className="m-mp">
      <MyProgressContent native />
    </div>
  )
}

export default MyProgressScreen
