import { useState } from 'react'
import { ArrowDown2, Diagram } from 'iconsax-react'
import Checkbox from '../../components/Checkbox/Checkbox'
import Tooltip from '../../components/Tooltip/Tooltip'
import { getSkillIllustrationByName } from '../../assets/skill-icons'
import avatar1 from './assets/m1.jpg'
import avatar2 from './assets/m2.jpg'
import avatar3 from './assets/m3.jpg'
import avatar4 from './assets/m4.jpg'
import './EngagementTab.css'

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M9.6875 2.5C5.71836 2.5 2.5 5.71836 2.5 9.6875C2.5 13.6566 5.71836 16.875 9.6875 16.875C13.6566 16.875 16.875 13.6566 16.875 9.6875C16.875 5.71836 13.6566 2.5 9.6875 2.5Z" stroke="var(--text-secondary)" strokeWidth="0.833333" strokeMiterlimit="10"/>
      <path d="M8.59375 8.59375H9.84375V13.125" stroke="var(--text-secondary)" strokeWidth="0.833333" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.125 13.2812H11.5625" stroke="var(--text-secondary)" strokeWidth="0.833333" strokeMiterlimit="10" strokeLinecap="round"/>
      <path d="M9.6875 5.07812C9.48663 5.07812 9.29027 5.13769 9.12325 5.24929C8.95623 5.36089 8.82606 5.51951 8.74918 5.70509C8.67231 5.89067 8.6522 6.09488 8.69139 6.29189C8.73058 6.4889 8.82731 6.66987 8.96934 6.81191C9.11138 6.95394 9.29235 7.05067 9.48936 7.08986C9.68637 7.12905 9.89058 7.10894 10.0762 7.03207C10.2617 6.9552 10.4204 6.82502 10.532 6.658C10.6436 6.49098 10.7031 6.29462 10.7031 6.09375C10.7031 5.82439 10.5961 5.56606 10.4057 5.37559C10.2152 5.18513 9.95686 5.07812 9.6875 5.07812Z" fill="var(--text-secondary)"/>
    </svg>
  )
}

/* ── Mock data ── */

interface Skill {
  name: string
  icon: string
  description: string
  level: number
  maxLevel: number
}

const hardSkills: Skill[] = [
  { name: 'Product Discovery & Development', icon: '🛒', description: 'Ability to identify market needs, validate ideas, and bring products from concept to launch.', level: 5, maxLevel: 5 },
  { name: 'Software Development', icon: '📄', description: 'Proficiency in writing, testing, and maintaining code across various programming languages and frameworks.', level: 4, maxLevel: 5 },
  { name: 'Agile Methodologies', icon: '🔄', description: 'Understanding of Scrum, Kanban, and iterative delivery practices for cross-functional teams.', level: 3, maxLevel: 5 },
  { name: 'Commercial Acumen', icon: '💼', description: 'Awareness of business strategy, revenue models, and market dynamics that drive commercial decisions.', level: 2, maxLevel: 5 },
  { name: 'Learning Program Design & Delivery', icon: '📖', description: 'Skill in designing, structuring, and facilitating effective learning experiences for teams.', level: 1, maxLevel: 5 },
]

const softSkills: Skill[] = [
  { name: 'Communication', icon: '💬', description: 'Ability to convey ideas clearly and listen actively across written and verbal channels.', level: 4, maxLevel: 5 },
  { name: 'Leadership', icon: '⭐', description: 'Capacity to guide, motivate, and empower team members toward shared goals.', level: 3, maxLevel: 5 },
  { name: 'Teamwork', icon: '🤝', description: 'Effectiveness in collaborating with others, sharing responsibility, and resolving group challenges.', level: 5, maxLevel: 5 },
  { name: 'Problem Solving', icon: '🧩', description: 'Aptitude for analysing complex situations and developing practical, creative solutions.', level: 3, maxLevel: 5 },
  { name: 'Time Management', icon: '⏰', description: 'Ability to prioritise tasks, manage deadlines, and maintain productivity under pressure.', level: 2, maxLevel: 5 },
]

interface LeaderboardEntry {
  rank: number
  name: string
  role: string
  avatarSrc?: string
  initials: string
  points: number
  trend: 'up' | 'down' | 'same'
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: 'Amina Al-Farsi', role: 'Client Relationship Manager', avatarSrc: avatar1, initials: 'AA', points: 1204, trend: 'up' },
  { rank: 2, name: "Liam O'Sullivan", role: 'Customer Engagement Specialist', avatarSrc: avatar2, initials: 'LO', points: 1134, trend: 'down' },
  { rank: 3, name: 'Sofia Gonzalez', role: 'User Experience Advocate', avatarSrc: avatar3, initials: 'SG', points: 1078, trend: 'same' },
  { rank: 4, name: 'Akira Tanaka', role: 'Client Retention Strategist', avatarSrc: avatar4, initials: 'AT', points: 956, trend: 'up' },
  { rank: 5, name: 'Nia Nkosi', role: 'Customer Insights Analyst', initials: 'NN', points: 944, trend: 'up' },
  { rank: 6, name: 'Oliver Schmidt', role: 'Account Management Executive', initials: 'OS', points: 867, trend: 'down' },
  { rank: 7, name: 'Fatima El-Mansour', role: 'Customer Success Consultant', initials: 'FE', points: 789, trend: 'down' },
  { rank: 8, name: 'Raj Patel', role: 'Client Onboarding Specialist', initials: 'RP', points: 611, trend: 'down' },
  { rank: 9, name: 'Chloe Dubois', role: 'Customer Support Coordinator', initials: 'CD', points: 595, trend: 'up' },
  { rank: 10, name: 'Carlos Silva', role: 'Account Development Manager', initials: 'CS', points: 544, trend: 'up' },
  { rank: 11, name: 'Yuki Sato', role: 'Customer Loyalty Director', initials: 'YS', points: 471, trend: 'down' },
  { rank: 12, name: 'Zara Khan', role: 'Client Success Officer', initials: 'ZK', points: 329, trend: 'down' },
]

const chartBars = [
  { lessons: 47, quizzes: 59 },
  { lessons: 70, quizzes: 96 },
  { lessons: 61, quizzes: 49 },
  { lessons: 47, quizzes: 35 },
  { lessons: 47, quizzes: 58 },
  { lessons: 57, quizzes: 75 },
]

const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
const yLabels = ['2500', '2000', '1500', '1000', '500', '0']

/* ── Rank badge for top 3 ── */

const goldBadge = 'data:image/svg+xml,' + encodeURIComponent(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#FFB800"/><circle cx="12" cy="12" r="9.5" fill="#FFCF74"/><circle cx="12" cy="12" r="9.5" fill="url(#g)" fill-opacity="0.3"/><defs><radialGradient id="g" cx="12" cy="4" r="16"><stop stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient></defs></svg>`)
const silverBadge = 'data:image/svg+xml,' + encodeURIComponent(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#9EA4B3"/><circle cx="12" cy="12" r="9.5" fill="#BFC2CC"/><circle cx="12" cy="12" r="9.5" fill="url(#g)" fill-opacity="0.3"/><defs><radialGradient id="g" cx="12" cy="4" r="16"><stop stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient></defs></svg>`)
const bronzeBadge = 'data:image/svg+xml,' + encodeURIComponent(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#C3771D"/><circle cx="12" cy="12" r="9.5" fill="#D4944A"/><circle cx="12" cy="12" r="9.5" fill="url(#g)" fill-opacity="0.3"/><defs><radialGradient id="g" cx="12" cy="4" r="16"><stop stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient></defs></svg>`)

const rankBadges = [goldBadge, silverBadge, bronzeBadge]

function ArrowUpIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path d="M4 1.5L7 5.5H1L4 1.5Z" fill="white" />
    </svg>
  )
}

function ArrowDownIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path d="M4 6.5L1 2.5H7L4 6.5Z" fill="white" />
    </svg>
  )
}

function DashIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <rect x="1" y="3.5" width="6" height="1" rx="0.5" fill="white" />
    </svg>
  )
}

/* ── Skills competency card ── */

function SkillsCompetency() {
  const [skillType, setSkillType] = useState<'hard' | 'soft'>('hard')
  const skills = skillType === 'hard' ? hardSkills : softSkills
  const totalSegments = 8

  return (
    <div className="eng-card">
      <div className="eng-card__headline">
        <h3 className="eng-card__title">Skills competency</h3>
        <div className="eng-switcher">
          <button
            type="button"
            className={`eng-switcher__item${skillType === 'hard' ? ' eng-switcher__item--active' : ''}`}
            onClick={() => setSkillType('hard')}
          >
            Hard Skills
          </button>
          <button
            type="button"
            className={`eng-switcher__item${skillType === 'soft' ? ' eng-switcher__item--active' : ''}`}
            onClick={() => setSkillType('soft')}
          >
            Soft Skills
          </button>
        </div>
      </div>

      <div className="eng-skills__table">
        <div className="eng-skills__header">
          <span className="eng-skills__header-name">Skill name</span>
          <div className="eng-skills__header-level">
            <span>Skill level</span>
            <Tooltip text="Top 5 skills of your team, rated from Level 1 to 5" position="Top" alignment="Center" icon={false}>
              <InfoIcon />
            </Tooltip>
          </div>
        </div>

        <div className="eng-skills__divider" />

        {skills.map((skill) => {
          const filled = Math.round((skill.level / skill.maxLevel) * totalSegments)
          return (
            <div className="eng-skills__row" key={skill.name}>
              <div className="eng-skills__row-name">
                <img className="eng-skills__icon" src={getSkillIllustrationByName(skill.name)} alt="" />
                <span>{skill.name}</span>
                <Tooltip text={skill.description} position="Top" alignment="Center" icon={false}>
                  <InfoIcon />
                </Tooltip>
              </div>
              <div className="eng-skills__row-level">
                <div className="eng-skills__bar">
                  {Array.from({ length: totalSegments }).map((_, i) => (
                    <span
                      key={i}
                      className={`eng-skills__bar-seg${i < filled ? ' eng-skills__bar-seg--filled' : ''}`}
                    />
                  ))}
                </div>
                <span className="eng-skills__score">{skill.level}/{skill.maxLevel}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Engagement chart card ── */

function EngagementChart() {
  const maxBar = 96
  /* Toggles only — the chart data is not yet cumulative. */
  const [cumulative, setCumulative] = useState(false)

  return (
    <div className="eng-card">
      <div className="eng-chart__subheader">
        <div className="eng-chart__headline">
          <h3>Engagement</h3>
          <p>Team learning activity over time</p>
        </div>
        <button type="button" className="eng-dropdown">
          <span>Last 6 months</span>
          <ArrowDown2 size={20} color="var(--text-secondary)" variant="Linear" />
        </button>
      </div>

      <div className="eng-chart__body">
        <div className="eng-chart__legend">
          <div className="eng-chart__legend-left">
            <div className="eng-chart__legend-item">
              <Diagram size={16} color="var(--secondary-500)" variant="Linear" />
              <span>Total learning moments</span>
            </div>
            <div className="eng-chart__legend-item">
              <span className="eng-chart__legend-swatch eng-chart__legend-swatch--lessons" />
              <span>Lessons completed</span>
            </div>
            <div className="eng-chart__legend-item">
              <span className="eng-chart__legend-swatch eng-chart__legend-swatch--quizzes" />
              <span>Quizzes &amp; Polls</span>
            </div>
          </div>
          <label className="eng-chart__legend-item">
            <Checkbox checked={cumulative} onChange={() => setCumulative((c) => !c)} />
            <span>Cumulative</span>
          </label>
        </div>

        <div className="eng-chart__area">
          {/* Y axis labels */}
          <div className="eng-chart__y-axis">
            {yLabels.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>

          {/* Grid lines */}
          <div className="eng-chart__grid">
            {yLabels.slice(0, -1).map((l) => (
              <div key={l} className="eng-chart__grid-line" />
            ))}
            <div className="eng-chart__grid-line eng-chart__grid-line--solid" />
          </div>

          {/* Bars */}
          <div className="eng-chart__bars">
            {chartBars.map((bar, i) => (
              <div className="eng-chart__bar-group" key={months[i]}>
                <div
                  className="eng-chart__bar eng-chart__bar--lessons"
                  style={{ height: `${(bar.lessons / maxBar) * 100}%` }}
                />
                <div
                  className="eng-chart__bar eng-chart__bar--quizzes"
                  style={{ height: `${(bar.quizzes / maxBar) * 100}%` }}
                />
              </div>
            ))}
          </div>

          {/* X ticks */}
          <div className="eng-chart__x-ticks">
            {months.map((m) => (
              <div key={m} className="eng-chart__x-tick" />
            ))}
          </div>

          {/* X axis labels */}
          <div className="eng-chart__x-axis">
            <div className="eng-chart__x-labels">
              {months.map((m) => (
                <span key={m} className="eng-chart__x-label">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Leaderboard card ── */

function Leaderboard() {
  const [scope, setScope] = useState<'team' | 'company'>('team')

  return (
    <div className="eng-card eng-leaderboard">
      <div className="eng-card__headline">
        <h3 className="eng-card__title">Leaderboard</h3>
        <button type="button" className="eng-dropdown">
          <span>This month</span>
          <ArrowDown2 size={20} color="var(--text-secondary)" variant="Linear" />
        </button>
      </div>

      <div className="eng-switcher eng-switcher--full">
        <button
          type="button"
          className={`eng-switcher__item${scope === 'team' ? ' eng-switcher__item--active' : ''}`}
          onClick={() => setScope('team')}
        >
          Team
        </button>
        <button
          type="button"
          className={`eng-switcher__item${scope === 'company' ? ' eng-switcher__item--active' : ''}`}
          onClick={() => setScope('company')}
        >
          Company
        </button>
      </div>

      <div className="eng-lb__list">
        {leaderboardData.map((entry) => (
          <div className="eng-lb__item" key={entry.rank}>
            <div className="eng-lb__rank">
              {entry.rank <= 3 ? (
                <div className="eng-lb__rank-badge">
                  <img src={rankBadges[entry.rank - 1]} alt="" />
                  <span className="eng-lb__rank-num">{entry.rank}</span>
                </div>
              ) : (
                <span className="eng-lb__rank-plain">{entry.rank}</span>
              )}
            </div>

            {entry.avatarSrc ? (
              <img className="eng-lb__avatar" src={entry.avatarSrc} alt="" />
            ) : (
              <div className="eng-lb__avatar-placeholder">{entry.initials}</div>
            )}

            <div className="eng-lb__info">
              <p className="eng-lb__name">{entry.name}</p>
              <p className="eng-lb__role">{entry.role}</p>
            </div>

            <span className="eng-lb__points">{entry.points} pt</span>

            <div className={`eng-lb__arrow eng-lb__arrow--${entry.trend}`}>
              {entry.trend === 'up' && <ArrowUpIcon />}
              {entry.trend === 'down' && <ArrowDownIcon />}
              {entry.trend === 'same' && <DashIcon />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main engagement tab ── */

function EngagementTab() {
  return (
    <section className="eng" aria-label="Engagement">
      <div className="eng__left">
        <SkillsCompetency />
        <EngagementChart />
      </div>
      <Leaderboard />
    </section>
  )
}

export default EngagementTab
