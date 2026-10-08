import InputField from '@/components/InputField/InputField'

/* Enrol people, step 3 (optional): the person sponsoring the course. Kept as typed;
   no separate Add button, Continue carries it to Review. */

export interface Sponsor {
  name: string
  role: string
}

interface Props {
  sponsor: Sponsor
  onChange: (s: Sponsor) => void
}

function EnrolSponsorStep({ sponsor, onChange }: Props) {
  return (
    <div className="ecm-sponsor">
      <InputField
        label="Name the person who will be sponsoring the course"
        placeholder="Sponsor name"
        value={sponsor.name}
        onChange={(e) => onChange({ ...sponsor, name: e.target.value })}
      />
      <InputField
        label="What is their role at the company?"
        placeholder="CEO/CXO/VP"
        value={sponsor.role}
        onChange={(e) => onChange({ ...sponsor, role: e.target.value })}
      />
    </div>
  )
}

export default EnrolSponsorStep
