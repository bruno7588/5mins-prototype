import { useMemo, useState } from 'react'
import { ArrowDown } from 'iconsax-react'
import Table, { type Column } from '@/components/Table/Table'
import Tooltip from '@/components/Tooltip/Tooltip'
import { getSkillIllustrationByName } from '@/assets/skill-icons'
import '@/pages/my-progress/MyProgress.css'
import './SkillsTab.css'

/* Skills tab of the person profile / My Learning (DES-369), built from the production
   Skills tab: a card-row table of the person's skills with each one's level out of 5,
   sortable by level, 10 per page. Read only for everyone: the rows are not pressable and
   there are no actions. Prefix: ups- */

interface Skill {
  name: string
  description: string
  level: number
}

const MAX_LEVEL = 5
const PAGE_SIZE = 10

const SKILLS: Skill[] = [
  { name: 'Ability to Motivate', description: 'Encouraging others to do their best work and stay committed to shared goals.', level: 3 },
  { name: 'Negotiation', description: 'Reaching agreements that work for both sides.', level: 2 },
  { name: 'Commercial Acumen', description: 'Understanding how the business makes money and what drives commercial decisions.', level: 4 },
  { name: 'Sales Strategy', description: 'Planning how to reach, win and keep customers.', level: 1 },
  { name: 'Decision Making', description: 'Weighing the options and choosing a course of action with confidence.', level: 3 },
  { name: 'Revenue Operations', description: 'Aligning sales, marketing and customer success around revenue.', level: 0 },
  { name: 'Communication', description: 'Sharing ideas clearly and listening well, in writing and in person.', level: 5 },
  { name: 'Strategic Thinking', description: 'Seeing the bigger picture and planning for the long term.', level: 2 },
  { name: 'Stakeholder Management', description: 'Building trust with the people who have an interest in your work.', level: 4 },
  { name: 'Market & Customer Research', description: 'Learning what customers need and how the market is moving.', level: 1 },
  { name: 'Leadership', description: 'Guiding and supporting a team towards its goals.', level: 3 },
  { name: 'Data Analysis', description: 'Turning data into findings people can act on.', level: 0 },
]

function SkillsTab() {
  const [sortDesc, setSortDesc] = useState(false)
  const [page, setPage] = useState(0)

  const sorted = useMemo(
    () => [...SKILLS].sort((a, b) => (sortDesc ? b.level - a.level : a.level - b.level)),
    [sortDesc],
  )
  const from = page * PAGE_SIZE
  const rows = sorted.slice(from, from + PAGE_SIZE)

  const columns: Column<Skill>[] = [
    {
      key: 'name',
      header: 'Skill name',
      cellClassName: 'is-overflow',
      render: (skill) => (
        <span className="ups-skill">
          <img src={getSkillIllustrationByName(skill.name)} alt="" width={32} height={32} />
          <span className="ups-skill__name">{skill.name}</span>
          <Tooltip position="Top" text={skill.description} />
        </span>
      ),
    },
    {
      key: 'level',
      header: (
        <span className="up-th-sort">
          Skill level
          <Tooltip position="Top" text="Each skill has a level from 0 to 5." />
          <ArrowDown
            size={16}
            color="currentColor"
            variant="Linear"
            className={`up-sort up-sort--active${sortDesc ? ' up-sort--desc' : ''}`}
          />
        </span>
      ),
      sortable: true,
      width: '0 0 360px',
      align: 'right',
      render: (skill) => (
        <span className="ups-level">
          <span
            className="mp-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={MAX_LEVEL}
            aria-valuenow={skill.level}
            aria-label={`${skill.name} level`}
          >
            <span className="mp-bar__fill" style={{ width: `${(skill.level / MAX_LEVEL) * 100}%` }} />
          </span>
          <span className="ups-level__value">{skill.level}/{MAX_LEVEL}</span>
        </span>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      rows={rows}
      getRowKey={(skill) => skill.name}
      onSort={() => {
        setSortDesc((d) => !d)
        setPage(0)
      }}
      pagination={{
        from: from + 1,
        to: from + rows.length,
        total: sorted.length,
        onPrev: page > 0 ? () => setPage((p) => p - 1) : undefined,
        onNext: from + PAGE_SIZE < sorted.length ? () => setPage((p) => p + 1) : undefined,
      }}
    />
  )
}

export default SkillsTab
