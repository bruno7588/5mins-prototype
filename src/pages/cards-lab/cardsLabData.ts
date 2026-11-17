/* Cards lab research: Mobbin screens where a record with many fields is shown as a
   card or row on a phone, and how the rest of the fields are reached. Collected
   2026-11-16 for the native "View all external training" page; a second round on
   2026-11-17 added screens closer to our data (certificates, licences, policies,
   anything with an expiry). A third round the same day added workplace training
   and credential apps, which Mobbin does not cover: those are the apps' own App
   Store screenshots (appstore/), so some carry a marketing headline. */

export type Pattern = 'card' | 'row' | 'group' | 'detail' | 'expand'

export const PATTERNS: { key: Pattern; label: string; summary: string }[] = [
  { key: 'card', label: 'Cards', summary: 'One bordered card per record: title and status on top, two or three fields below.' },
  { key: 'row', label: 'Compact rows', summary: 'One line or two per record inside a single list; more records fit on a screen.' },
  { key: 'group', label: 'Grouped by state', summary: 'The list is split under headings or tabs by state, so the state is read once per group, not once per record.' },
  { key: 'detail', label: 'Detail view', summary: 'Where the rest of the fields go: a label and value list on its own screen or sheet.' },
  { key: 'expand', label: 'Expand in place', summary: 'The row opens where it is, pushing the rows below down.' },
]

export interface Example {
  file: string
  app: string
  screen: string
  pattern: Pattern
  /** What the screen keeps on the card, and what it does with the rest. */
  note: string
  /** Where the screen comes from: a Mobbin screen id or an App Store app id. */
  mobbinId?: string
  appStoreId?: string
}

export const EXAMPLES: Example[] = [
  {
    file: '01-talabat-orders',
    app: 'talabat',
    screen: 'My orders',
    pattern: 'card',
    note: 'Name and status badge on the top line, date under it, two quiet fields on a footer line. Four fields, no labels.',
    mobbinId: '6e603b20-b68a-4906-8bbe-715b7adfaf87',
  },
  {
    file: '02-talabat-requests',
    app: 'talabat',
    screen: 'Track requests',
    pattern: 'card',
    note: 'Date and status sit above the title as metadata; a chevron says the card opens.',
    mobbinId: '2d1ee2a9-8c70-4868-be60-f4fcc3cd6bfc',
  },
  {
    file: '03-starlink-orders',
    app: 'Starlink',
    screen: 'Orders',
    pattern: 'card',
    note: 'Dark mode. Thumbnail, title and date on top; a divided footer holds status on the left and one more field on the right.',
    mobbinId: '22a2190d-dc60-400a-92f5-a6a9b5303594',
  },
  {
    file: '04-shopee-orders',
    app: 'Shopee',
    screen: 'My orders',
    pattern: 'card',
    note: 'Three bands: category and status, the item, then the total with one action. Dense, but each band has one job.',
    mobbinId: '85cece0e-a491-4c75-918b-dab00bc2d033',
  },
  {
    file: '05-gopuff-orders',
    app: 'Gopuff',
    screen: 'Orders',
    pattern: 'card',
    note: 'Title, status and date, then two buttons on every card. The Details button makes the way in explicit, at the cost of height.',
    mobbinId: '1c95cd8f-f041-4ebc-9798-9b0fd3e460ff',
  },
  {
    file: '06-ikea-purchases',
    app: 'IKEA',
    screen: 'Purchases',
    pattern: 'card',
    note: 'Leads with the date, not a name. Four stacked fields and one arrow button; nothing else.',
    mobbinId: '1d911bcc-2827-45aa-91a0-53654d653d4c',
  },
  {
    file: '07-delta-lounges',
    app: 'Fly Delta',
    screen: 'Lounges',
    pattern: 'card',
    note: 'Keeps the table inside the card: label and value pairs in two columns. Shows every field, reads slowly.',
    mobbinId: '84e65383-9480-48df-95d3-2a194bd6db5c',
  },
  {
    file: '08-neo-products',
    app: 'Neo Financial',
    screen: 'Card products',
    pattern: 'card',
    note: 'Title, provider line and one tag, then a divider and a single sentence. The tag carries the one fact that differs.',
    mobbinId: '60cbbef7-be18-4992-b3f1-9e44276c5d12',
  },
  {
    file: '09-wallet-expired',
    app: 'Apple Wallet',
    screen: 'Expired passes',
    pattern: 'row',
    note: 'Closest to our data: certificates and passes as rows with a thumbnail, name, type and date. Tap for the pass.',
    mobbinId: '4e2bd1e9-9a04-46ba-9bd9-db7093ace671',
  },
  {
    file: '10-airwallex-cards',
    app: 'Airwallex',
    screen: 'Cards',
    pattern: 'row',
    note: 'Two lines of text and a status badge on the right. Search and filter sit above the list.',
    mobbinId: '3420554f-b00c-433b-a634-d7f847c8c870',
  },
  {
    file: '11-revolut-requests',
    app: 'Revolut Business',
    screen: 'Card requests',
    pattern: 'row',
    note: 'Dark mode. All rows share one card; the number sits right-aligned, status is plain text under the date.',
    mobbinId: '92523bcc-943b-4b63-b82b-01106b6ea268',
  },
  {
    file: '12-airtasker-badges',
    app: 'Airtasker',
    screen: 'Profile badges',
    pattern: 'row',
    note: 'Verified credentials: icon, name and "Verified on" date. The date is written as a sentence, so it needs no label.',
    mobbinId: '020508dc-1558-4a51-9ff0-ac606bf21468',
  },
  {
    file: '13-bmw-services',
    app: 'My BMW',
    screen: 'Booked services',
    pattern: 'row',
    note: 'A tick for the state, the name, the term under it and a Details link on the right.',
    mobbinId: '541afc5c-f5e1-451e-8000-26f601cfe42e',
  },
  {
    file: '14-comet-certificate',
    app: 'Comet',
    screen: 'Certificate summary',
    pattern: 'detail',
    note: 'The detail as one grouped list: label left, value right, long values wrap. A last row leads to the full record.',
    mobbinId: 'c44e0d52-e8c1-4720-9703-38e80aad45e3',
  },
  {
    file: '15-brave-certificate',
    app: 'Brave',
    screen: 'Certificate details',
    pattern: 'detail',
    note: 'Status banner first, then the fields in titled groups. Grouping is what keeps a long field list readable.',
    mobbinId: 'd0c9697b-022f-41a0-8a90-fc62ab3fc7ae',
  },
  {
    file: '16-superpower-invoice',
    app: 'Superpower',
    screen: 'Invoice sheet',
    pattern: 'detail',
    note: 'The detail as a bottom sheet over the list: a few fields and Download PDF as the main action.',
    mobbinId: '25c71e50-390b-4d74-bc28-dc37286556f1',
  },
  {
    file: '17-agoda-details',
    app: 'Agoda',
    screen: 'Booking details',
    pattern: 'expand',
    note: 'Rows open in place with a chevron that flips. Works for text; several open rows make the list hard to scan.',
    mobbinId: '7f497875-b125-4508-9bf9-7a5ff2b491bd',
  },
  {
    file: '18-venmo-fees',
    app: 'Venmo',
    screen: 'Fees',
    pattern: 'expand',
    note: 'One row open at a time, label and value pairs inside. The plus becomes a close icon.',
    mobbinId: '2166d35d-2bd7-4518-8cf7-a670b1185764',
  },
  /* Second round, 2026-11-17. */
  {
    file: '19-coursera-achievements',
    app: 'Coursera',
    screen: 'Achievements',
    pattern: 'card',
    note: 'Closest to our record: course, provider, "Completed on" date and grade, each on its own line with a small icon. "No certificate offered" is a quiet footnote.',
    mobbinId: '93e25c8d-452c-4d67-9862-ac70429e28f9',
  },
  {
    file: '20-skillshare-certificates',
    app: 'Skillshare',
    screen: 'Certificates',
    pattern: 'card',
    note: 'Certificate seal as the thumbnail, then course, teacher and date. View and Share sit on the card as text buttons.',
    mobbinId: '43da2239-833e-40a6-bdfa-2685a68e64ea',
  },
  {
    file: '23-lloyds-policies',
    app: 'Lloyds',
    screen: 'Your policies',
    pattern: 'card',
    note: 'Title and provider on top, one detail line, then a divided footer that reads "Policy ends on 5 March 2027". The end date is a sentence, not a column.',
    mobbinId: '6e90ae8f-7d0a-4f22-88bd-a899df0c6d7c',
  },
  {
    file: '24-shopee-policies',
    app: 'Shopee',
    screen: 'My policies',
    pattern: 'card',
    note: 'Status as coloured text top right, two label and value rows under a divider. Tabs above split Purchased, Expired and Cancelled.',
    mobbinId: 'ab538d90-20fb-496a-a4e8-7d9b320855d4',
  },
  {
    file: '25-cred-policy',
    app: 'CRED',
    screen: 'Your policy',
    pattern: 'card',
    note: 'A whole record on one card: provider, name and Active tag on top, then four label and value rows led by "valid till". Works for one record, too tall for a list.',
    mobbinId: '7387ae18-551c-403a-90a5-2013b9bb417a',
  },
  {
    file: '26-bevel-biomarkers',
    app: 'Bevel',
    screen: 'Biomarkers to review',
    pattern: 'card',
    note: 'Three values side by side with the label under each: last measured, expected update, overdue. Only the overdue value takes colour.',
    mobbinId: '6fe7b78d-b8d6-49f9-9d27-8ef3e1a7f8d3',
  },
  {
    file: '27-grab-rewards',
    app: 'Grab',
    screen: 'Past rewards',
    pattern: 'card',
    note: 'Expired records: tags on top, title, then "Expired on 30 May 2026" with the state repeated on the right. Everything is greyed.',
    mobbinId: '9d3fd0d1-244f-491c-9ad7-3d967533f8df',
  },
  {
    file: '28-keeta-vouchers',
    app: 'Keeta',
    screen: 'Past vouchers',
    pattern: 'card',
    note: 'Used, Expired and Invalid as tabs. Expired cards keep their layout but lose all colour, and the button becomes a disabled "Expired".',
    mobbinId: '3736cc4b-3d9c-4988-80d5-707026404245',
  },
  {
    file: '29-gusto-documents',
    app: 'Gusto',
    screen: 'Documents',
    pattern: 'card',
    note: 'A web table turned into cards literally: every column becomes a stacked label and value, with a Columns menu kept. Shows why keeping the labels costs so much height.',
    mobbinId: '965f5cd0-b65e-4dbf-acc0-63cc48fc8643',
  },
  {
    file: '33-trip-bookings',
    app: 'Trip.com',
    screen: 'All bookings',
    pattern: 'card',
    note: 'Status leads each card as a coloured heading with the amount opposite. Cancelled cards are dimmed; actions appear only where there is one to take.',
    mobbinId: 'af915440-f5a4-4632-b003-6b125fc3e2ff',
  },
  {
    file: '21-linkedin-licences',
    app: 'LinkedIn',
    screen: 'Licences and certifications',
    pattern: 'row',
    note: 'Our exact fields as text rows: logo, name, issuer, "Issued Sep 2020" and a credential ID. Two shown, then "Show all 15 licences".',
    mobbinId: 'a26e38b8-aee7-41eb-a0b0-4f023d37ec08',
  },
  {
    file: '22-uxcel-certificates',
    app: 'Uxcel',
    screen: 'Certificates',
    pattern: 'row',
    note: 'Icon, name and a state mark on the right: a tick when earned, a ring while in progress. "View all" closes the group.',
    mobbinId: 'd3bc620c-1f90-4448-8f39-6156f78ea026',
  },
  {
    file: '31-alan-documents',
    app: 'Alan',
    screen: 'Documents',
    pattern: 'row',
    note: 'Name, date and a status badge under the text, with a preview of the document on the right. The red badge marks the one that needs action.',
    mobbinId: 'ae299d68-24f6-4daa-b083-719073ab8b21',
  },
  {
    file: '35-speak-history',
    app: 'Speak',
    screen: 'Lesson history',
    pattern: 'row',
    note: 'The result sits on the right as stars, with "Incomplete" written under it when the attempt did not pass.',
    mobbinId: 'bc2afcb3-8df0-4820-b1c1-1e54b6d561bb',
  },
  {
    file: '36-brainly-rounds',
    app: 'Brainly',
    screen: 'Test rounds',
    pattern: 'row',
    note: 'The score is a badge, "Score: 7 of 15", top right of the row; a round arrow button opens it.',
    mobbinId: '92017fa8-9625-4468-861a-538b901557c7',
  },
  {
    file: '30-alan-care-events',
    app: 'Alan',
    screen: 'Care events',
    pattern: 'group',
    note: '"Being processed" first, then one group per month. Each row has an icon, name, date and a status badge beside a chevron.',
    mobbinId: '2d6a5469-f0d4-490f-8315-d524556b534b',
  },
  {
    file: '32-deliveroo-orders',
    app: 'Deliveroo',
    screen: 'Orders',
    pattern: 'group',
    note: 'Pending and Completed headings with a count. Each record is two lines: name, then state, date and amount joined by dots.',
    mobbinId: '0f2c8c42-ceca-4dee-9d60-31144ace5eaa',
  },
  {
    file: '34-apple-maps-reports',
    app: 'Apple Maps',
    screen: 'Reports',
    pattern: 'group',
    note: 'In Review and Reviewed as headings, one card per group, a footnote under each explaining what the group holds.',
    mobbinId: '21918293-e48b-48ac-ba9c-eb79fa478271',
  },
  {
    file: '37-fresha-giftcard',
    app: 'Fresha',
    screen: 'Gift card details',
    pattern: 'detail',
    note: 'The artwork on top, then Details as stacked label over value: status, code with Copy, Expires, value. An activity log follows.',
    mobbinId: '393a89d6-bfe1-4edc-be59-9ddbed7129ad',
  },
  {
    file: '38-ebay-item',
    app: 'eBay',
    screen: 'About this item',
    pattern: 'detail',
    note: 'A bottom sheet with labels in a left column and values on the right; long values wrap in their own column.',
    mobbinId: '29f3fd1d-4cbd-4dff-b2b3-f5b702e7ba06',
  },
  {
    file: '39-thefork-trader',
    app: 'TheFork',
    screen: 'Trader information',
    pattern: 'detail',
    note: 'A bottom sheet with each label above its value and a divider between fields. Easier to read than two columns when values are long.',
    mobbinId: '79a1c7fa-56b7-4b54-a44f-53fbbcbf588e',
  },
  /* Third round, 2026-11-17: workplace training and credential apps (App Store). */
  {
    file: '40-absorb-transcript',
    app: 'Absorb Learn',
    screen: 'Transcript, certificates',
    pattern: 'card',
    note: 'An LMS doing our job: one card per certificate with the name, then "Issued" and "Expires" as two labelled lines. An Expired tag sits top right only when it applies, and "Expired: 3" above the list filters to them.',
    appStoreId: '1450653475',
  },
  {
    file: '41-skillko-certifications',
    app: 'Skillko',
    screen: 'Certifications',
    pattern: 'card',
    note: 'The smallest version: rosette, name, "Expiry: 11/11/2023" and a View Certificate button on each card. Search on top, Add New Certificate pinned to the bottom.',
    appStoreId: '1444930455',
  },
  {
    file: '43-cscs-cards',
    app: 'My CSCS',
    screen: 'My cards',
    pattern: 'card',
    note: 'Each credential drawn as the physical card: holder, registration number and "Expires end Jan 2023". Recognisable, but only two fit on a screen.',
    appStoreId: '1536605181',
  },
  {
    file: '46-cornerstone-learnings',
    app: 'Cornerstone',
    screen: 'My learnings',
    pattern: 'card',
    note: 'Type tag and duration above the title, then Status and Due Date as two small label and value columns. Download and a more menu sit bottom right.',
    appStoreId: '970204620',
  },
  {
    file: '44-credly-wallet',
    app: 'Credly',
    screen: 'Badge wallet',
    pattern: 'row',
    note: 'Each credential is a row with the badge artwork, its name and the issuer under it. No dates on the list; they wait in the detail.',
    appStoreId: '1630234370',
  },
  {
    file: '47-moodle-courses',
    app: 'Moodle Workplace',
    screen: 'My courses',
    pattern: 'row',
    note: 'Thumbnail, name and a red Overdue badge beside it, then the type and "12% completed". A count pill and chevron close the row.',
    appStoreId: '1470929705',
  },
  {
    file: '49-degreed-assignments',
    app: 'Degreed',
    screen: 'Assignments',
    pattern: 'row',
    note: 'To Do and Completed as a switch above the list. Rows carry a thumbnail and title, and a red Overdue pill only where it applies.',
    appStoreId: '1086998254',
  },
  {
    file: '50-thrive-explore',
    app: 'Thrive',
    screen: 'Explore',
    pattern: 'row',
    note: 'Thumbnail, title and one quiet line under it for the due date. Nothing else on the row.',
    appStoreId: '1539428355',
  },
  {
    file: '42-mgroup-training',
    app: 'M Group Training & Compliance',
    screen: 'Employee training',
    pattern: 'expand',
    note: 'A compliance record that expands in place: each card opens to its qualifications, each with a Valid or Expiring tag, the date and the days left. Complete, and heavy to scan.',
    appStoreId: '1533827520',
  },
  {
    file: '45-credly-badge',
    app: 'Credly',
    screen: 'Badge details',
    pattern: 'detail',
    note: 'Artwork on top, then Overview and Details tabs with stacked label and value rows. Share Badge is the one main action, pinned to the bottom.',
    appStoreId: '1630234370',
  },
  {
    file: '48-vector-activity',
    app: 'Vector Learn',
    screen: 'Activity details',
    pattern: 'detail',
    note: 'Four rows of icon, label and value (Due, Duration, Type, Status), a description, and the action as a full-width bar at the bottom.',
    appStoreId: '1169062105',
  },
  /* Fourth round, 2026-11-17: more of the cards and detail views Bruno picked, used in FLOWS. */
  {
    file: '51-booking-trips',
    app: 'Booking.com',
    screen: 'Trips',
    pattern: 'card',
    note: 'Thumbnail and title, dates and amount on one line, then the status as green text. The open card adds its actions as rows below.',
    mobbinId: 'c9316ffa-e267-4ee5-983f-25e09bb40c79',
  },
  {
    file: '52-alan-useful-documents',
    app: 'Alan',
    screen: 'Useful documents',
    pattern: 'card',
    note: 'One card per document: icon, name, one line of purpose and a chevron on the right. Nothing competes with the chevron.',
    mobbinId: 'fbffa606-5b2c-4f3d-9020-2d6cfff79f7a',
  },
  {
    file: '54-lloyds-report',
    app: 'Lloyds',
    screen: 'Credit report',
    pattern: 'card',
    note: 'Outlined cards with an icon, a bold title, a sentence and an arrow centred on the right edge. The arrow reads as "this opens".',
    mobbinId: 'c16d8bac-23bf-494f-9d2f-3d22feaa0a9e',
  },
  {
    file: '56-focusflight-history',
    app: 'FocusFlight',
    screen: 'History',
    pattern: 'card',
    note: 'Dark mode. Date and a status tag on top, the main line large, then three values in columns with the label above each. Dense and still readable.',
    mobbinId: '55486604-950f-4fce-95ec-f8020f37b1fe',
  },
  {
    file: '57-blablacar-rides',
    app: 'BlaBlaCar',
    screen: 'Archived rides',
    pattern: 'card',
    note: 'Dark mode. Status with an icon on the first line, the date as the title, then the details with room around them. Two cards fill the screen.',
    mobbinId: '02ec41a3-9748-40c4-83f3-853a78f57a1e',
  },
  {
    file: '53-polarsteps-details',
    app: 'Polarsteps',
    screen: 'Place details',
    pattern: 'detail',
    note: 'Label above value, the label small and in capitals, a divider between fields. Two actions sit under the list.',
    mobbinId: 'd9c5f608-c0a6-484b-8dd4-136932b566a2',
  },
  {
    file: '55-public-margin',
    app: 'Public',
    screen: 'Margin requirements',
    pattern: 'detail',
    note: 'A bottom sheet with label left and value right, split into titled groups, and one main button pinned under the list.',
    mobbinId: '2da43aa2-b94d-4f84-833b-39b99eecba68',
  },
  {
    file: '58-shopee-account',
    app: 'Shopee',
    screen: 'My gold account',
    pattern: 'detail',
    note: 'A full screen of label above value rows with generous height. Short values can sit on the right of the label instead, as Provider does.',
    mobbinId: '58ccc8a8-baa8-4b9f-a3af-99e841e945c7',
  },
]

/* Five ways from the list to the detail, built from the screens Bruno picked
   (2026-11-17). Each flow is three Mobbin screens: the card he liked, the same
   idea in another app, and the detail view it would open. `file` points at EXAMPLES. */
export interface Flow {
  title: string
  idea: string
  detail: 'Label above value' | 'Label left, value right'
  steps: { file: string; role: string }[]
}

export const FLOWS: Flow[] = [
  {
    title: '1. Status first',
    idea: 'Name and result badge on the top line, provider under it, the expiry on a quiet footer line. The whole card opens a sheet with one field per row.',
    detail: 'Label above value',
    steps: [
      { file: '01-talabat-orders', role: 'The card' },
      { file: '51-booking-trips', role: 'Same idea elsewhere' },
      { file: '39-thefork-trader', role: 'The detail it opens' },
    ],
  },
  {
    title: '2. Date and status above the title',
    idea: 'The small facts lead as a metadata line, the course name gets the full width below, and a chevron says the card opens.',
    detail: 'Label above value',
    steps: [
      { file: '02-talabat-requests', role: 'The card' },
      { file: '52-alan-useful-documents', role: 'Same idea elsewhere' },
      { file: '53-polarsteps-details', role: 'The detail it opens' },
    ],
  },
  {
    title: '3. The arrow invites the sheet',
    idea: 'Fields stacked plainly and one arrow button on the right. The arrow is the only control, so it reads as the way into the bottom sheet.',
    detail: 'Label left, value right',
    steps: [
      { file: '06-ikea-purchases', role: 'The card' },
      { file: '54-lloyds-report', role: 'Same idea elsewhere' },
      { file: '55-public-margin', role: 'The detail it opens' },
    ],
  },
  {
    title: '4. Compact, three values in a row',
    idea: 'The name on top, then completion, expiry and result side by side with a small label each. Most of the record fits on the card, so the sheet is for the rest.',
    detail: 'Label left, value right',
    steps: [
      { file: '26-bevel-biomarkers', role: 'The card' },
      { file: '56-focusflight-history', role: 'Same idea elsewhere' },
      { file: '38-ebay-item', role: 'The detail it opens' },
    ],
  },
  {
    title: '5. Spacious, one field per line',
    idea: 'Every field keeps its label and its own line, with room around it. Easy to scan one record; fewer records per screen.',
    detail: 'Label above value',
    steps: [
      { file: '29-gusto-documents', role: 'The card' },
      { file: '57-blablacar-rides', role: 'Same idea elsewhere' },
      { file: '58-shopee-account', role: 'The detail it opens' },
    ],
  },
]

/* What the screens have in common. The last five come from the second and third rounds. */
export const FINDINGS: { title: string; body: string }[] = [
  { title: 'Three or four fields on the card', body: 'A name, a status and one or two dates or numbers. No list screen shows more than five fields per record.' },
  { title: 'Status is a badge, top right', body: 'It is the one field people scan for, so it gets the only colour on the card.' },
  { title: 'Labels are dropped', body: 'Position and wording carry the meaning ("Verified on 3 May 2023"). Only the detail view uses label and value pairs.' },
  { title: 'The whole card is the button', body: 'A chevron or arrow hints at it. Per-card buttons appear only when there is a second action, such as Reorder.' },
  { title: 'The rest goes to a detail view', body: 'A full screen or a bottom sheet with grouped label and value rows, and the document action (Download PDF) at the bottom.' },
  { title: 'Expand in place is rare for records', body: 'It shows up for FAQs and terms, not for lists of records: open rows push the list around and break scanning.' },
  { title: 'The expiry is a sentence', body: '"Policy ends on 5 March 2027", "Expired on 30 May 2026". It often gets its own footer line under a divider, so it is the last thing read on the card.' },
  { title: 'Expired records go quiet', body: 'They keep the same layout and lose their colour, or move to their own tab or group. Colour is kept for what still needs action.' },
  { title: 'Long lists are grouped by state', body: 'Headings or tabs such as Active and Expired carry the state once per group, which frees the card for the name and the date.' },
  { title: 'Training apps keep the date labels', body: 'Absorb, Skillko and Cornerstone write "Issued", "Expires" or "Due Date" beside the date. With two dates on a record, the label is what tells them apart.' },
  { title: 'The state tag appears only when it matters', body: 'Expired, Expiring and Overdue are tagged; a valid record usually carries no tag at all. Absorb also counts them above the list ("Expired: 3").' },
]

/* The web table's columns, split the way the examples split theirs. */
export const FIELD_SPLIT: { field: string; where: 'Card' | 'Detail'; why: string }[] = [
  { field: 'Course', where: 'Card', why: 'The title.' },
  { field: 'Result', where: 'Card', why: 'Passed or Not Passed badge, top right.' },
  { field: 'Provider', where: 'Card', why: 'Second line, as the web card already shows it.' },
  { field: 'Expiry', where: 'Card', why: 'The date a learner acts on; written as "Expires Dec 1, 2026".' },
  { field: 'Completion date', where: 'Detail', why: 'History, not a prompt to act.' },
  { field: 'Duration', where: 'Detail', why: 'Comes from the approved course.' },
  { field: 'Score', where: 'Detail', why: 'Optional and often empty.' },
  { field: 'Certificate', where: 'Detail', why: 'The action: Download, as the main button of the detail view.' },
]
