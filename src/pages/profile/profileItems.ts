import type { LessonGridCardProps } from '@/components/LessonGridCard/LessonGridCard'
import type { InstructorCardProps } from '@/components/InstructorCard/InstructorCard'
import { getSkillIllustrationByName } from '@/assets/skill-icons'
import { workspaceCourses, type WorkspaceCourse } from '@/pages/workspace/mockItems'
import { COMPANY } from '@/data/people'

import thumb1 from '@/assets/programs/course-thumbs/course-thumb-1.jpg'
import thumb2 from '@/assets/programs/course-thumbs/course-thumb-2.jpg'
import thumb3 from '@/assets/programs/course-thumbs/course-thumb-3.jpg'
import thumb4 from '@/assets/programs/course-thumbs/course-thumb-4.jpg'
import thumb5 from '@/assets/programs/course-thumbs/course-thumb-5.jpg'
import thumb6 from '@/assets/programs/course-thumbs/course-thumb-6.jpg'
import thumb7 from '@/assets/programs/course-thumbs/course-thumb-7.jpg'
import thumb8 from '@/assets/programs/course-thumbs/course-thumb-8.jpg'
import thumb9 from '@/assets/programs/course-thumbs/course-thumb-9.jpg'
import avatar1 from '@/assets/avatars/avatar-1.jpg'
import avatar2 from '@/assets/avatars/avatar-2.jpg'
import avatar3 from '@/assets/avatars/avatar-3.jpg'
import avatar4 from '@/assets/avatars/avatar-4.jpg'

/* The signed-in learner's saved content (learner Profile page). Lessons without a
   thumbnail are the company's own and fall back to the company image. */

export const bookmarkedLessons: LessonGridCardProps[] = [
  { title: 'Prototyping Tips for Product Teams', instructor: COMPANY, durationLabel: '2m 30s', filled: 8, completed: true },
  { title: 'Running a Design Critique That Helps', instructor: COMPANY, durationLabel: '3m 30s', filled: 8, completed: true },
  { title: 'Six Ways Hunger Changes How You Decide', instructor: 'Priya Nair', thumbnail: thumb1, durationLabel: '11m 51s', filled: 3 },
  { title: 'How to Decide on the Best Idea in a Design Sprint', instructor: 'Marco Rossi', thumbnail: thumb2, durationLabel: '7m 37s', filled: 5 },
  { title: 'Learning Activity', instructor: COMPANY, durationLabel: '2m 45s', filled: 8, completed: true },
  { title: 'Eight Tips for Getting the Most Out of AI Image Tools', instructor: 'Liam Walsh', thumbnail: thumb3, durationLabel: '3m 15s', filled: 2 },
]

/* Bookmarked courses reuse the Workspace course mock, so the cards match. */
export const bookmarkedCourses: WorkspaceCourse[] = workspaceCourses.slice(1, 3)

export const likedLessons: LessonGridCardProps[] = [
  { title: 'Running a Health and Safety Meeting People Remember', instructor: 'Noor Haddad', thumbnail: thumb4, durationLabel: '3m 46s', filled: 8, completed: true },
  { title: 'Six Ways Hunger Changes How You Decide', instructor: 'Priya Nair', thumbnail: thumb1, durationLabel: '11m 51s', filled: 3 },
  { title: 'How Do Innovators Frame Problems?', instructor: 'Ana Ferreira', thumbnail: thumb5, durationLabel: '2m 26s', filled: 8, completed: true },
  { title: 'Making Fewer Decisions Based on Emotion', instructor: 'Sofia Costa', thumbnail: thumb6, durationLabel: '1m 37s', filled: 4 },
  { title: 'Using Research Tools Outside the UX Team', instructor: 'Marco Rossi', thumbnail: thumb7, durationLabel: '9m 6s', filled: 1 },
  { title: 'What Panic Attacks Are and How They Affect Work', instructor: 'Noor Haddad', thumbnail: thumb8, durationLabel: '5m 59s', filled: 6 },
  { title: 'What Is Self-Actualisation and How Do You Get There?', instructor: 'Noor Haddad', thumbnail: thumb9, durationLabel: '7m 43s', filled: 2 },
  { title: 'Mastering the Art of Critical Communication', instructor: COMPANY, durationLabel: '1m 43s', filled: 8, completed: true },
  { title: 'Habits to Improve Critical Thinking', instructor: COMPANY, durationLabel: '1m 37s', filled: 5 },
  { title: 'Using Emotional Intelligence as a Product Manager', instructor: 'Liam Walsh', thumbnail: thumb2, durationLabel: '8m 33s', filled: 0 },
  { title: 'How to Facilitate Debates as a Product Manager', instructor: 'Liam Walsh', thumbnail: thumb3, durationLabel: '9m 14s', filled: 7 },
  { title: 'How to Build a Delivery Tracker Your Team Uses', instructor: 'Ana Ferreira', thumbnail: thumb4, durationLabel: '4m 56s', filled: 3 },
]

const skills = (...labels: string[]) => labels.map((label) => ({ label, icon: getSkillIllustrationByName(label) }))

export const followedInstructors: InstructorCardProps[] = [
  { name: 'Priya Nair', bio: 'Helps teams turn raw numbers into decisions people act on.', photo: avatar2, skills: skills('Data Analysis & Reporting', 'Commercial Acumen') },
  { name: 'Marco Rossi', bio: 'Design sprint facilitator who has run workshops for over 200 product teams.', photo: avatar4, skills: skills('Product Strategy', 'Entrepreneurial Thinking') },
  { name: 'Noor Haddad', bio: 'Occupational psychologist writing about stress, focus and wellbeing at work.', photo: avatar3, skills: skills('People Management', 'Storytelling') },
  { name: 'Liam Walsh', bio: 'Product leader sharing what works when you manage without authority.', photo: avatar1, skills: skills('Product Strategy', 'People Management') },
  { name: 'Ana Ferreira', bio: 'Service designer helping operations teams fix the moments customers notice.', photo: thumb5, skills: skills('Software Design', 'Commercial Acumen') },
  { name: 'Sofia Costa', bio: 'Behavioural scientist on habits, energy and how high performers plan their week.', photo: thumb6, skills: skills('Entrepreneurial Thinking', 'Storytelling') },
]
