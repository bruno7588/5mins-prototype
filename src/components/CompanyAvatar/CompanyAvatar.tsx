import { COMPANY } from '@/data/people'
import { useCompanyImage } from '@/data/companyImage'
import './CompanyAvatar.css'

interface Props {
  size?: 40 | 48
  className?: string
}

/**
 * The tenant's company image as a square avatar (avatars.md, "Company avatar").
 * Square on purpose, so a company never reads as a person.
 */
function CompanyAvatar({ size = 40, className }: Props) {
  const { src } = useCompanyImage()
  return (
    <img
      className={`company-avatar${className ? ` ${className}` : ''}`}
      src={src}
      alt={COMPANY}
      width={size}
      height={size}
    />
  )
}

export default CompanyAvatar
