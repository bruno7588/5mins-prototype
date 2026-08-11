/* Mock AI generation for situational tests (DES-276 phase 2). Mirrors
   simulateAISuggestion in src/pages/roles/data/mockRoles.ts: keyword-match the input,
   wait long enough to feel like work, return a fixed pack.

   Every generated brief follows the four-part structure the drawer's own Step 1 callout
   teaches — position, situation, complication, question and goal — and every option is an
   action the learner could take rather than the outcome of one, per Step 2's guidance. The
   generator demonstrating the rules the form preaches is the point, not a coincidence. */

const DELAY_MS = 2000

export interface GeneratedQuestion {
  text: string
  options: string[]
  correctIndex: number
}

export interface GeneratedTest {
  brief: string
  questions: GeneratedQuestion[]
}

interface Pack {
  brief: string
  questions: GeneratedQuestion[]
  /** Held back for "Generate More Questions" on step 2. */
  extras: GeneratedQuestion[]
}

const hospitality: Pack = {
  brief: `You are the duty manager on a Friday evening shift at a 120-room city hotel. The restaurant is fully booked and two of your four servers have called in sick.

A guest who checked in an hour ago comes to the desk. Her room was not cleaned before arrival, her 8pm dinner reservation has been given away, and she leaves for a conference dinner in forty minutes. She is calm but firm, and she mentions she books this hotel eleven nights a month.

You have one unoccupied suite on the fourth floor, a restaurant that cannot seat her, and a housekeeping team already an hour behind.

Decide what you do in the next five minutes. A good answer protects the guest's evening, is honest about what you can and cannot fix, and does not commit the hotel to something you have no authority to give.`,
  questions: [
    {
      text: 'The guest is at the desk waiting for an answer. What do you do first?',
      options: [
        'Apologise for both failures, tell her exactly what you can fix in the next five minutes, and be clear about what you cannot',
        'Call housekeeping to prioritise her room before you say anything to her',
        'Offer a free night on a future stay to close the conversation quickly',
        'Explain that the restaurant is overbooked because two servers called in sick',
      ],
      correctIndex: 0,
    },
    {
      text: 'She asks for the 8pm table back. The restaurant genuinely cannot seat her. What do you say?',
      options: [
        'Tell her the table is gone, and offer either room service or a table you book at a nearby restaurant now',
        'Tell her you will see what you can do and check back with the restaurant manager later',
        'Seat her at the bar and hope a table frees up before 8pm',
        'Explain that the booking system released her table automatically',
      ],
      correctIndex: 0,
    },
    {
      text: 'You have one unoccupied suite. Do you move her, and how do you frame it?',
      options: [
        'Move her now, carry the bags yourself, and frame it as fixing tonight rather than as a reward',
        'Move her and present the suite as a complimentary upgrade worth £180',
        'Keep her in the original room so the suite stays free for a late walk-in',
        "Offer her the choice of the suite or a refund on tonight's rate",
      ],
      correctIndex: 0,
    },
    {
      text: 'Your shift ends. What do you hand over?',
      options: [
        'A written note of what went wrong, what you promised her, and who owes her a follow-up tomorrow',
        'Nothing — the issue was resolved on your shift',
        'A verbal heads-up to the incoming manager if you see them before you leave',
        "An email to the general manager about housekeeping's staffing problem",
      ],
      correctIndex: 0,
    },
  ],
  extras: [
    {
      text: 'She posts a one-star review before she leaves. Who responds, and when?',
      options: [
        'You do, the same day, referencing what was actually promised her at the desk',
        'The general manager, once the full incident has been investigated',
        'Nobody — responding to reviews invites further argument',
        'The marketing team, using the standard apology template',
      ],
      correctIndex: 0,
    },
    {
      text: 'Housekeeping says the room was marked clean in the system. What do you do with that?',
      options: [
        'Log the discrepancy and raise it as a process problem, separately from the guest recovery',
        'Tell the guest the room was recorded as clean so the error was not yours',
        'Ask the supervisor to correct the record before anyone else sees it',
        'Drop it — the guest has been moved, so the record no longer matters',
      ],
      correctIndex: 0,
    },
  ],
}

const finance: Pack = {
  brief: `You are a relationship manager at a mid-sized commercial bank, covering twenty business accounts.

A long-standing customer — a family-run import business you have handled for six years — asks you to process three transfers totalling £180,000 to a supplier in a jurisdiction your bank treats as higher risk. They say the supplier is new, the deal closes Friday, and their finance director is on leave.

The three transfers sit just under the threshold that would trigger an automatic enhanced due-diligence review. The caller is warm, apologetic about the rush, and mentions twice that they have never had a problem with the bank before.

Decide how you handle the request today. A good answer meets the bank's obligations without accusing anyone of anything, and leaves a record that would stand up to an audit.`,
  questions: [
    {
      text: 'They are on the phone asking you to release the first transfer this afternoon. What do you do?',
      options: [
        'Tell them you need to complete standard checks on a new supplier before any transfer moves, and give a realistic timeline',
        'Release the first transfer and start the checks on the remaining two',
        'Release all three, then file a note explaining the commercial urgency',
        'Tell them compliance has blocked it and you cannot discuss why',
      ],
      correctIndex: 0,
    },
    {
      text: 'The three transfers sit just under the enhanced due-diligence threshold. How do you treat that?',
      options: [
        'Treat the three as one £180,000 payment and apply enhanced due diligence to the whole amount',
        'Apply standard checks to each, since each is individually under the threshold',
        'Ask them to combine the transfers so the threshold applies cleanly',
        'Escalate only if they refuse to explain why the payments are split',
      ],
      correctIndex: 0,
    },
    {
      text: "They offer to send the supplier's invoice as proof. What do you ask for?",
      options: [
        'The invoice plus evidence of who owns and controls the supplier, and how they found them',
        'The invoice, since it evidences the commercial purpose of the payment',
        'A signed letter confirming the supplier is legitimate',
        'Nothing further — six years of history is sufficient comfort',
      ],
      correctIndex: 0,
    },
    {
      text: 'You are not satisfied with the explanation. What do you do next?',
      options: [
        'Raise an internal report through your MLRO, and do not tell the customer you have done so',
        'Tell the customer you are reporting it so they can withdraw the request',
        'Decline the transfers and close the conversation without escalating internally',
        'Hold the transfers and wait to see whether they raise it again',
      ],
      correctIndex: 0,
    },
  ],
  extras: [
    {
      text: 'Your line manager asks you to "just get it done" before quarter end. How do you respond?',
      options: [
        'Put your concern and the outstanding checks in writing to them, and hold the transfers',
        'Proceed, since your manager carries the accountability once they have instructed you',
        'Proceed but note your disagreement privately in case it is queried later',
        'Refuse verbally and move the relationship to another manager',
      ],
      correctIndex: 0,
    },
    {
      text: 'The customer threatens to move their accounts to another bank. What do you do?',
      options: [
        'Acknowledge the frustration, keep the checks running, and escalate the retention risk separately',
        'Complete the checks faster by accepting the invoice alone as evidence',
        'Offer to waive the transfer fees to keep the relationship',
        'Tell them the checks are a legal requirement and end the call',
      ],
      correctIndex: 0,
    },
  ],
}

const sales: Pack = {
  brief: `You are an account executive at a B2B software company, three weeks from the end of the quarter and £40,000 short of your number.

A prospect you have worked for two months — a 400-person logistics firm — is ready to sign. On the final call their new CFO joins and asks for a 35% discount, framing it as the only way the deal gets approved this quarter. Your approval ceiling is 15%.

Afterwards your champion, the Head of Operations, messages you privately to say the CFO "always does this" and that the budget is real.

Decide how you respond on the follow-up call. A good answer protects a price you can defend, keeps the champion's trust, and does not depend on a discount you have no authority to approve.`,
  questions: [
    {
      text: 'The CFO asks for 35% on the call. What is your immediate response?',
      options: [
        'Say you cannot commit to that number, and ask what has to be true for the deal to be approved',
        'Say you will take it to your manager and come back with your best offer',
        'Counter at 20% straight away to show you are moving',
        'Point out that the Head of Operations already agreed the price',
      ],
      correctIndex: 0,
    },
    {
      text: 'You can approve 15%. How do you use it?',
      options: [
        'Trade it — offer 15% in exchange for a two-year term or a reference commitment',
        'Offer 15% as a quarter-end concession with a Friday deadline',
        'Hold at list price and keep the 15% in reserve for a second round',
        'Split the difference and ask your manager to sign off 25%',
      ],
      correctIndex: 0,
    },
    {
      text: 'Your champion tells you privately that the CFO "always does this". What do you do with it?',
      options: [
        'Ask the champion who else has to approve, and what the CFO signed off last time',
        'Repeat it to the CFO to show you understand how they negotiate',
        'Ignore it — a private message from a champion is not reliable',
        'Use it to justify holding at list price on the next call',
      ],
      correctIndex: 0,
    },
    {
      text: 'You are £40,000 short with three weeks left. How does that affect the deal?',
      options: [
        "It does not — run the deal on the buyer's timeline and flag the risk to your manager early",
        'Offer a larger discount for signature before quarter end',
        'Warn them the discount expires on the 31st to pull the deal forward',
        'Forecast it as committed so your manager helps you protect the price',
      ],
      correctIndex: 0,
    },
  ],
  extras: [
    {
      text: 'The CFO goes quiet for a week. What is your next move?',
      options: [
        'Go back through the champion to find out what changed internally',
        'Send the CFO a final-offer email with an expiry date',
        'Escalate to the CFO\'s manager to unblock the decision',
        'Wait — chasing signals that you need the deal more than they do',
      ],
      correctIndex: 0,
    },
    {
      text: 'They accept 15% but ask to pay annually in arrears. What do you do?',
      options: [
        'Treat payment terms as a second concession and trade them, rather than adding them free',
        'Accept — the discount is what mattered and the terms are finance\'s problem',
        'Refuse outright, since the discount was already agreed',
        'Accept in exchange for dropping the two-year term you asked for',
      ],
      correctIndex: 0,
    },
  ],
}

/* Nothing in the prompt matched a domain, so fall back to the situation almost every
   admin recognises: an escalation with an unhappy customer and a manager watching. */
const escalation: Pack = {
  brief: `You are a team leader with six direct reports in a customer support centre.

One of your team has been handling a complaint for nine days. This morning the customer emailed your director directly, copying you, describing the service as "the worst I have experienced" and asking for a refund your team cannot authorise.

Your team member is upset, insists they followed the process exactly, and you can see from the record that they did. The process itself is what failed. Your director wants an answer before the end of the day.

Decide how you handle the next two hours. A good answer resolves the customer's problem, is honest with your director about the cause, and does not leave your team member carrying blame for a process they followed correctly.`,
  questions: [
    {
      text: 'What do you do first?',
      options: [
        'Read the full case record yourself before you speak to anyone about it',
        'Reply to your director immediately so they know it is being handled',
        'Speak to your team member first to hear their side',
        'Call the customer straight away to apologise',
      ],
      correctIndex: 0,
    },
    {
      text: 'Your team member followed the process and the process failed. What do you tell your director?',
      options: [
        'That the process failed, with the specific step that caused it, and what you propose to change',
        'That the case was mishandled and you are addressing it with the individual',
        'That the customer is being unreasonable given the circumstances',
        'That you need more time before you can explain what happened',
      ],
      correctIndex: 0,
    },
    {
      text: 'The refund is above your authority. How do you handle the customer?',
      options: [
        'Call them, own the delay, and tell them exactly who is deciding the refund and by when',
        'Wait until the refund is approved so you can give them a definite answer',
        'Email them a summary of the process that was followed',
        'Offer a goodwill credit you can authorise instead of the refund they asked for',
      ],
      correctIndex: 0,
    },
    {
      text: 'What do you say to your team member?',
      options: [
        'That they followed the process correctly, that you have said so to the director, and what you are changing',
        'That mistakes happen and not to worry about it',
        'That they should have escalated sooner regardless of what the process said',
        'Nothing until the complaint is closed, to avoid adding pressure',
      ],
      correctIndex: 0,
    },
  ],
  extras: [
    {
      text: 'Your director asks who is accountable. What do you say?',
      options: [
        'That you are, as the team leader who owns the process your team runs',
        'That the process owner in operations is, since they designed it',
        'That the team member is, since they held the case for nine days',
        'That accountability is shared and hard to assign in this case',
      ],
      correctIndex: 0,
    },
    {
      text: 'Two other cases are sitting at day seven. What do you do?',
      options: [
        'Review both today and apply the same fix before they escalate',
        'Wait until the process change is formally approved',
        'Ask the team to flag any case that passes ten days from now on',
        'Handle them normally — one complaint does not prove a pattern',
      ],
      correctIndex: 0,
    },
  ],
}

/* Ordered: finance is tested before sales because words like "deal", "renewal" and
   "risk" pull in both directions and the finance framing is the more specific one.
   Ambiguous tokens ("account", "client") are deliberately in neither list — mockRoles.ts
   puts "account" in both its sales and finance chains, so the finance branch there is
   unreachable for an Account Manager. */
const PACKS: { keywords: string[]; pack: Pack }[] = [
  {
    keywords: [
      'hotel', 'guest', 'front desk', 'restaurant', 'bar', 'server', 'waiter', 'check-in',
      'checkin', 'housekeep', 'concierge', 'hospitality', 'kitchen', 'allerg', 'food safety',
    ],
    pack: hospitality,
  },
  {
    keywords: [
      'financ', 'bank', 'compliance', 'aml', 'kyc', 'audit', 'regulat', 'fraud',
      'invoice', 'credit', 'insur', 'fca', 'due diligence', 'launder', 'transfer',
    ],
    pack: finance,
  },
  {
    keywords: [
      'sales', 'pipeline', 'prospect', 'deal', 'quota', 'objection', 'negotiat',
      'discount', 'renewal', 'churn', 'sdr', 'close', 'buyer', 'pricing',
    ],
    pack: sales,
  },
]

/** Everything the admin gave us, flattened into one haystack. */
function match(prompt: string, sources: string[]): Pack {
  const haystack = [prompt, ...sources].join(' ').toLowerCase()
  const hit = PACKS.find(({ keywords }) => keywords.some((k) => haystack.includes(k)))
  return hit ? hit.pack : escalation
}

const wait = <T,>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), DELAY_MS))

/**
 * Generate a whole situational test — brief and questions — from the admin's rough
 * prompt and any context sources they attached.
 *
 * Questions come back without ids: the drawer owns id generation so there stays exactly
 * one counter.
 */
export function generateSituationalTest(
  prompt: string,
  sources: string[],
): Promise<GeneratedTest> {
  const pack = match(prompt, sources)
  return wait({ brief: pack.brief, questions: pack.questions })
}

/** Step 2's "Generate More Questions" — the two the pack held back. */
export function generateMoreSituationalQuestions(
  prompt: string,
  sources: string[],
): Promise<GeneratedQuestion[]> {
  return wait(match(prompt, sources).extras)
}
