/**
 * Course catalogue for the automations builder — what the course search offers and
 * what each row in an automation's course table draws.
 *
 * Modelled on `src/pages/programs/coursesCatalog.ts`: same thumbnail pool, same
 * cycling idiom. Kept separate because the two mock catalogues share no course
 * names, so merging them would mean rewriting every automation seed list. They are
 * worth consolidating one day — see the note in `Automations.tsx`.
 */

import thumb1 from '../../assets/programs/course-thumbs/course-thumb-1.jpg'
import thumb2 from '../../assets/programs/course-thumbs/course-thumb-2.jpg'
import thumb3 from '../../assets/programs/course-thumbs/course-thumb-3.jpg'
import thumb4 from '../../assets/programs/course-thumbs/course-thumb-4.jpg'
import thumb5 from '../../assets/programs/course-thumbs/course-thumb-5.jpg'
import thumb6 from '../../assets/programs/course-thumbs/course-thumb-6.jpg'
import thumb7 from '../../assets/programs/course-thumbs/course-thumb-7.jpg'
import thumb8 from '../../assets/programs/course-thumbs/course-thumb-8.jpg'
import thumb9 from '../../assets/programs/course-thumbs/course-thumb-9.jpg'

const THUMBS = [thumb1, thumb2, thumb3, thumb4, thumb5, thumb6, thumb7, thumb8, thumb9]

/** Who authored the content. Same two-way split the role picker already uses. */
export type ContentSource = '5mins' | 'tenant'

/** Stands in for the customer's own name until the prototype has a tenant context. */
export const TENANT_NAME = 'Acme Inc.'

export interface AutomationCatalogCourse {
  id: string
  name: string
  /** Photorealistic course artwork, cycled across the shared pool. */
  thumb: string
  source: ContentSource
}

const RAW_COURSES: Omit<AutomationCatalogCourse, 'thumb'>[] = [
  { id: 'allergen-awareness', name: 'Allergen Awareness', source: '5mins' },
  { id: 'allyship-in-practice', name: 'Allyship in Practice', source: '5mins' },
  { id: 'anti-harassment-foundations', name: 'Anti-Harassment Foundations', source: '5mins' },
  { id: 'asynchronous-communication', name: 'Asynchronous Communication', source: '5mins' },
  { id: 'bystander-intervention', name: 'Bystander Intervention', source: '5mins' },
  { id: 'cleaning-and-sanitisation-protocols', name: 'Cleaning & Sanitisation Protocols', source: '5mins' },
  { id: 'closing-techniques', name: 'Closing Techniques', source: '5mins' },
  { id: 'cloud-storage-hygiene', name: 'Cloud Storage Hygiene', source: '5mins' },
  { id: 'coaching-fundamentals', name: 'Coaching Fundamentals', source: '5mins' },
  { id: 'code-of-conduct-2024-update', name: 'Code of Conduct 2024 Update', source: 'tenant' },
  { id: 'code-of-conduct-essentials', name: 'Code of Conduct Essentials', source: 'tenant' },
  { id: 'cold-chain-management', name: 'Cold Chain Management', source: '5mins' },
  { id: 'competitive-landscape', name: 'Competitive Landscape', source: 'tenant' },
  { id: 'crm-hygiene', name: 'CRM Hygiene', source: '5mins' },
  { id: 'cross-border-data-transfers', name: 'Cross-Border Data Transfers', source: '5mins' },
  { id: 'cross-contamination-prevention', name: 'Cross-Contamination Prevention', source: '5mins' },
  { id: 'customer-personas', name: 'Customer Personas', source: '5mins' },
  { id: 'data-privacy-and-gdpr-basics', name: 'Data Privacy & GDPR Basics', source: '5mins' },
  { id: 'data-subject-rights', name: 'Data Subject Rights', source: '5mins' },
  { id: 'device-security', name: 'Device Security', source: '5mins' },
  { id: 'discovery-calls', name: 'Discovery Calls', source: '5mins' },
  { id: 'diversity-equity-and-inclusion', name: 'Diversity, Equity & Inclusion', source: '5mins' },
  { id: 'emergency-evacuation-procedures', name: 'Emergency Evacuation Procedures', source: '5mins' },
  { id: 'escalation-procedures', name: 'Escalation Procedures', source: '5mins' },
  { id: 'executive-communication', name: 'Executive Communication', source: '5mins' },
  { id: 'extinguisher-use', name: 'Extinguisher Use', source: '5mins' },
  { id: 'feature-deep-dives', name: 'Feature Deep Dives', source: '5mins' },
  { id: 'federal-anti-harassment-standards', name: 'Federal Anti-Harassment Standards', source: '5mins' },
  { id: 'financial-acumen-for-directors', name: 'Financial Acumen for Directors', source: '5mins' },
  { id: 'fire-drill-procedures', name: 'Fire Drill Procedures', source: '5mins' },
  { id: 'first-aid-essentials', name: 'First Aid Essentials', source: '5mins' },
  { id: 'food-storage-and-labelling', name: 'Food Storage & Labelling', source: '5mins' },
  { id: 'gdpr-fundamentals', name: 'GDPR Fundamentals', source: '5mins' },
  { id: 'giving-effective-feedback', name: 'Giving Effective Feedback', source: '5mins' },
  { id: 'haccp-refresher', name: 'HACCP Refresher', source: '5mins' },
  { id: 'handling-difficult-customers', name: 'Handling Difficult Customers', source: '5mins' },
  { id: 'handling-personal-data', name: 'Handling Personal Data', source: '5mins' },
  { id: 'health-and-safety-the-workplace-uk', name: 'Health & Safety: The Workplace (UK)', source: '5mins' },
  { id: 'health-and-safety-working-from-home-uk', name: 'Health & Safety: Working From Home (UK)', source: '5mins' },
  { id: 'home-office-ergonomics', name: 'Home Office Ergonomics', source: '5mins' },
  { id: 'incident-response-basics', name: 'Incident Response Basics', source: '5mins' },
  { id: 'inclusive-language', name: 'Inclusive Language', source: '5mins' },
  { id: 'information-security-101', name: 'Information Security 101', source: '5mins' },
  { id: 'leadership-foundations', name: 'Leadership Foundations', source: '5mins' },
  { id: 'objection-handling', name: 'Objection Handling', source: '5mins' },
  { id: 'password-and-mfa-best-practices', name: 'Password & MFA Best Practices', source: '5mins' },
  { id: 'personal-hygiene-standards', name: 'Personal Hygiene Standards', source: '5mins' },
  { id: 'phishing-and-social-engineering', name: 'Phishing & Social Engineering', source: '5mins' },
  { id: 'pricing-and-plans', name: 'Pricing & Plans', source: 'tenant' },
  { id: 'product-lineup', name: 'Product Lineup', source: 'tenant' },
  { id: 'product-overview', name: 'Product Overview', source: 'tenant' },
  { id: 'recognising-harassment', name: 'Recognising Harassment', source: '5mins' },
  { id: 'reporting-incidents', name: 'Reporting Incidents', source: '5mins' },
  { id: 'reporting-procedures', name: 'Reporting Procedures', source: '5mins' },
  { id: 'roadmap-highlights', name: 'Roadmap Highlights', source: 'tenant' },
  { id: 'secure-remote-work', name: 'Secure Remote Work', source: '5mins' },
  { id: 'service-mindset', name: 'Service Mindset', source: '5mins' },
  { id: 'setting-30-60-90-goals', name: 'Setting 30/60/90 Goals', source: '5mins' },
  { id: 'strategic-decision-making', name: 'Strategic Decision Making', source: '5mins' },
  { id: 'time-management-at-home', name: 'Time Management at Home', source: '5mins' },
  { id: 'tone-and-empathy', name: 'Tone & Empathy', source: '5mins' },
  { id: 'us-workplace-compliance-overview', name: 'US Workplace Compliance Overview', source: 'tenant' },
  { id: 'unconscious-bias', name: 'Unconscious Bias', source: '5mins' },
  { id: 'welcome-to-the-company', name: 'Welcome to the Company', source: 'tenant' },
  { id: 'workplace-health-and-safety', name: 'Workplace Health & Safety', source: '5mins' },
]

export const MOCK_COURSE_CATALOG: AutomationCatalogCourse[] = RAW_COURSES.map((c, i) => ({
  ...c,
  thumb: THUMBS[i % THUMBS.length],
}))

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** Courses are stored on an automation by name, which is what the seeds carry. */
export function findCatalogCourseByName(name: string): AutomationCatalogCourse | undefined {
  return MOCK_COURSE_CATALOG.find((c) => c.name === name)
}

/** Artwork for a course the catalogue does not know, kept stable per name. */
export function courseThumbFor(key: string): string {
  let hash = 0
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return THUMBS[hash % THUMBS.length]
}

/** The supporting line under a course in the search results. */
export function courseSourceLabel(source: ContentSource): string {
  return source === '5mins' ? '5Mins course' : `${TENANT_NAME} course`
}
