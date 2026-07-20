import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Add, ArrowDown2, FlashCircle, Mobile, ShieldSecurity } from 'iconsax-react'
import { Logo, learnerSideItems } from '../my-team/MyTeam'
import ProfileMenu from '../../components/ProfileMenu/ProfileMenu'
import Carousel from '../../components/Carousel/Carousel'
import SkillCard from '../../components/SkillCard/SkillCard'
import LessonGridCard from '../../components/LessonGridCard/LessonGridCard'
import FeedHero from './components/FeedHero'
import LessonFeed from './components/LessonFeed'
import { heroSlides, skillCards, jumpBackIn } from './mockItems'
import { feedLessons } from './feedItems'
import '../my-team/MyTeam.css'
import './ForYou.css'

function ForYou() {
  const navigate = useNavigate()
  const location = useLocation()
  // Which lesson the feed player is opened on (null = closed).
  const [feedIndex, setFeedIndex] = useState<number | null>(null)

  return (
    <div className="mt-app">
      <header className="mt-topnav">
        <button type="button" className="mt-topnav__logo" aria-label="Home" onClick={() => navigate('/workspace')}>
          <Logo size={22} />
        </button>
        <div className="mt-topnav__right">
          <button type="button" className="mt-topnav__textbtn ui-disabled" disabled>
            <span>Get App</span>
            <Mobile size={20} color="var(--text-secondary)" variant="Linear" />
          </button>
          <button type="button" className="mt-topnav__outlinebtn ui-disabled" disabled>
            <span>Create</span>
            <Add size={20} color="var(--text-primary)" variant="Linear" />
          </button>
          <div className="mt-topnav__icons">
            <button type="button" className="mt-topnav__iconbtn ui-disabled" aria-label="Notifications (coming soon)" disabled>
              <FlashCircle size={24} color="var(--text-primary)" variant="Linear" />
            </button>
          </div>
        </div>
      </header>

      <div className="mt-main">
        <aside className="mt-side">
          <nav className="mt-side__menu">
            {learnerSideItems.map(({ label, icon: Icon, path }) => {
              const isActive = !!path && location.pathname === path
              return (
                <button
                  key={label}
                  type="button"
                  className={`mt-side__item${isActive ? ' mt-side__item--active' : ''}`}
                  onClick={path ? () => navigate(path) : undefined}
                >
                  <Icon size={24} color={isActive ? 'var(--secondary-500)' : 'var(--text-secondary)'} variant="Bold" />
                  <span>{label}</span>
                </button>
              )
            })}
            <button type="button" className="mt-side__item" onClick={() => navigate('/content-library')}>
              <ShieldSecurity size={24} color="var(--text-secondary)" variant="Bold" />
              <span>Admin</span>
            </button>
          </nav>

          <ProfileMenu />

          <div className="mt-side__powered">
            <span>Powered by</span>
            <Logo size={12} />
          </div>
        </aside>

        <section className="mt-body fy-body">
          <div className="fy-column">
            {/* Hero feed */}
            <section className="fy-section">
              <div className="fy-toppicks">
                <span>Today’s Top Picks</span>
                <ArrowDown2 size={20} color="var(--text-primary)" variant="Linear" />
              </div>
              <FeedHero slides={heroSlides} onOpen={(i) => setFeedIndex(i % feedLessons.length)} />
            </section>

            {/* Skills */}
            <section className="fy-section">
              <header className="fy-section__header">
                <h2 className="fy-section__title">Level up your skills</h2>
                <button type="button" className="fy-section__cta ui-disabled" disabled>View All</button>
              </header>
              <Carousel trackClassName="fy-cards-track" ariaLabel="Skills to level up">
                {skillCards.map((card) => (
                  <SkillCard key={card.skillName} {...card} />
                ))}
              </Carousel>
            </section>

            {/* Jump back in */}
            <section className="fy-section">
              <header className="fy-section__header">
                <h2 className="fy-section__title">Jump back in</h2>
                <button type="button" className="fy-section__cta ui-disabled" disabled>View History</button>
              </header>
              <Carousel trackClassName="fy-cards-track" ariaLabel="Recently watched lessons">
                {jumpBackIn.map((lesson, i) => (
                  <LessonGridCard
                    key={lesson.title}
                    {...lesson}
                    onOpen={() => setFeedIndex(i % feedLessons.length)}
                  />
                ))}
              </Carousel>
            </section>
          </div>
        </section>
      </div>

      {feedIndex !== null && (
        <LessonFeed
          lessons={feedLessons}
          startIndex={feedIndex}
          onClose={() => setFeedIndex(null)}
        />
      )}
    </div>
  )
}

export default ForYou
