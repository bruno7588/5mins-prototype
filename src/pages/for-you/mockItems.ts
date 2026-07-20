import type { HeroSlide } from './components/FeedHero'
import type { SkillCardProps } from '../../components/SkillCard/SkillCard'
import type { LessonGridCardProps } from '../../components/LessonGridCard/LessonGridCard'

import heroGif from '../../assets/for-you/v3-Hugo-FullCorrect-Anim.gif'
import course1 from '../../assets/workspace/course-1.png'
import course2 from '../../assets/workspace/course-2.png'
import course3 from '../../assets/workspace/course-3.png'
import course4 from '../../assets/workspace/course-4.png'

import thumb1 from '../../assets/programs/course-thumbs/course-thumb-1.jpg'
import thumb2 from '../../assets/programs/course-thumbs/course-thumb-2.jpg'
import thumb3 from '../../assets/programs/course-thumbs/course-thumb-3.jpg'
import thumb4 from '../../assets/programs/course-thumbs/course-thumb-4.jpg'
import thumb5 from '../../assets/programs/course-thumbs/course-thumb-5.jpg'

// The first slide is the "video playing" GIF; the rest are static placeholders.
export const heroSlides: HeroSlide[] = [
  { title: "Creating Culture: Tips From the World's Top CEOs and Leaders", skillName: 'Leadership', media: heroGif },
  { title: 'The Art of Giving Feedback That Actually Lands', skillName: 'Communication', media: course1 },
  { title: 'Negotiation Tactics for High-Stakes Conversations', skillName: 'Negotiation', media: course2 },
  { title: 'Building Habits That Compound Over Time', skillName: 'Productivity', media: course3 },
  { title: 'Data Storytelling: Turning Numbers Into Decisions', skillName: 'Data Analysis', media: course4 },
]

export const skillCards: SkillCardProps[] = [
  { skillName: 'Pricing Strategy', level: 'Master', bottom: { kind: 'pending' } },
  { skillName: 'Automation Testing & Deployment', level: 'Level 5', bottom: { kind: 'progress', filled: 3 } },
  { skillName: 'Buyer Psychology', level: 'Level 5', bottom: { kind: 'progress', filled: 3 } },
  { skillName: 'Financial Compliance', level: 'Level 3', bottom: { kind: 'progress', filled: 5 } },
  { skillName: 'Generative AI', level: 'Level 2', bottom: { kind: 'progress', filled: 6 } },
  { skillName: 'Workplace Compliance', level: 'Advanced', bottom: { kind: 'pending' } },
]

export const jumpBackIn: LessonGridCardProps[] = [
  { title: 'The importance of Authentic Stories and How to Tell', instructor: 'Priya Nair', thumbnail: thumb1, durationLabel: '3m 45s', filled: 4 },
  { title: 'Leading Remote Teams Without Losing Momentum', instructor: 'Marco Rossi', thumbnail: thumb2, durationLabel: '4m 12s', filled: 2 },
  { title: 'Turning Conflict Into Collaboration', instructor: 'Ana Ferreira', thumbnail: thumb3, durationLabel: '5m 03s', filled: 6 },
  { title: 'The Manager’s Guide to Delegation', instructor: 'Liam Walsh', thumbnail: thumb4, durationLabel: '2m 58s', filled: 8, completed: true },
  { title: 'How Top Performers Manage Their Energy', instructor: 'Sofia Costa', thumbnail: thumb5, durationLabel: '3m 30s', filled: 1 },
]
