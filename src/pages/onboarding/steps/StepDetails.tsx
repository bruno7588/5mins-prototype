import Dropdown from '../../../components/Dropdown/Dropdown'
import type { StepProps } from '../types'

const toOptions = (values: string[]) => values.map((v) => ({ value: v, label: v }))

const REGIONS = toOptions([
  'Europe',
  'North America',
  'South America',
  'Asia Pacific',
  'Middle East & Africa',
])

const DEPARTMENTS = toOptions([
  'Sales',
  'Marketing',
  'Engineering',
  'Product',
  'Customer Success',
  'Human Resources',
  'Finance',
  'Operations',
  'Front Desk',
])

const OFFICES = toOptions([
  'London',
  'New York',
  'San Francisco',
  'Berlin',
  'Paris',
  'Singapore',
  'Sydney',
  'Dubai',
  'Remote',
])

/** Screen 3 — region, department and office location. */
export default function StepDetails({ data, update }: StepProps) {
  return (
    <>
      <div className="onboarding__field">
        <Dropdown
          menuClassName="onboarding-menu"
          label="Region"
          placeholder="Select region"
          options={REGIONS}
          value={data.region}
          onChange={(region) => update({ region })}
        />
      </div>
      <div className="onboarding__field">
        <Dropdown
          menuClassName="onboarding-menu"
          label="Department"
          placeholder="Select department"
          options={DEPARTMENTS}
          value={data.department}
          onChange={(department) => update({ department })}
        />
      </div>
      <div className="onboarding__field">
        <Dropdown
          menuClassName="onboarding-menu"
          label="Office location"
          placeholder="Select office location"
          options={OFFICES}
          value={data.office}
          onChange={(office) => update({ office })}
        />
      </div>
    </>
  )
}
