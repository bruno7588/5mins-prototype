/* Cards lab research: Mobbin screens where a record with many fields is shown as a
   card or row on a phone, and how the rest of the fields are reached. Collected
   2026-11-16 for the native "View all external training" page. */

export type Pattern = 'card' | 'row' | 'detail' | 'expand'

export const PATTERNS: { key: Pattern; label: string; summary: string }[] = [
  { key: 'card', label: 'Cards', summary: 'One bordered card per record: title and status on top, two or three fields below.' },
  { key: 'row', label: 'Compact rows', summary: 'One line or two per record inside a single list; more records fit on a screen.' },
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
  mobbinId: string
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
]

/* What the 18 screens have in common. */
export const FINDINGS: { title: string; body: string }[] = [
  { title: 'Three or four fields on the card', body: 'A name, a status and one or two dates or numbers. No list screen shows more than five fields per record.' },
  { title: 'Status is a badge, top right', body: 'It is the one field people scan for, so it gets the only colour on the card.' },
  { title: 'Labels are dropped', body: 'Position and wording carry the meaning ("Verified on 3 May 2023"). Only the detail view uses label and value pairs.' },
  { title: 'The whole card is the button', body: 'A chevron or arrow hints at it. Per-card buttons appear only when there is a second action, such as Reorder.' },
  { title: 'The rest goes to a detail view', body: 'A full screen or a bottom sheet with grouped label and value rows, and the document action (Download PDF) at the bottom.' },
  { title: 'Expand in place is rare for records', body: 'It shows up for FAQs and terms, not for lists of records: open rows push the list around and break scanning.' },
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
