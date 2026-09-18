import { ArrowDown2 } from 'iconsax-react'
import MobileFeedHero from '@/components/mobile/FeedHero/FeedHero'
import SkillCard from '@/components/SkillCard/SkillCard'
import LessonGridCard from '@/components/LessonGridCard/LessonGridCard'
import { heroSlides, skillCards, jumpBackIn } from '@/pages/for-you/mockItems'
import './ForYouScreen.css'

/** Section heading with a "View All" text button, as on the Workspace screen. */
function SectionHeader({ title, action }: { title: string; action: string }) {
  return (
    <header className="m-fy-section__header">
      <h2 className="m-fy-section__title">{title}</h2>
      <button type="button" className="m-fy-section__action ui-disabled" disabled>
        {action}
      </button>
    </header>
  )
}

/**
 * "For You" home screen for the mobile prototype (Figma Your Content 6571:52755):
 * the Top Picks hero, then the skills to level up, then what to jump back into.
 * Cards are the shared DS components at the screen's 154px width; the hero is
 * the one piece the Library has no component for.
 */
function ForYouScreen({ onOpenLesson }: { onOpenLesson?: (index: number) => void }) {
  return (
    <div className="m-fy">
      <section className="m-fy-section m-fy-section--hero">
        {/* Figma draws this as a "Dropdown": a Bold-14 label with a chevron, not
            a bordered select — the picker itself is out of scope here. */}
        <button type="button" className="m-fy-picker ui-disabled" disabled>
          Today’s Top Picks
          <ArrowDown2 size={20} color="var(--text-primary)" variant="Linear" />
        </button>
        <MobileFeedHero slides={heroSlides} onOpen={onOpenLesson} />
      </section>

      <section className="m-fy-section">
        <SectionHeader title="Level up your skills" action="View All" />
        <div className="m-fy-row" role="region" aria-label="Skills to level up">
          {skillCards.map((skill) => (
            <SkillCard key={skill.skillName} {...skill} />
          ))}
        </div>
      </section>

      <section className="m-fy-section">
        <SectionHeader title="Jump back in" action="View History" />
        <div className="m-fy-row" role="region" aria-label="Recently watched lessons">
          {jumpBackIn.map((lesson, i) => (
            <LessonGridCard
              key={lesson.title}
              {...lesson}
              onOpen={onOpenLesson ? () => onOpenLesson(i) : undefined}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default ForYouScreen
