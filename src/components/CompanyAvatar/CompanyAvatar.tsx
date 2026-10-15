import Avatar, { type AvatarSize } from '@/components/Avatar/Avatar'
import CompanyImageMotion from '@/components/CompanyImageMotion/CompanyImageMotion'
import { COMPANY } from '@/data/people'
import { useCompanyImage } from '@/data/companyImage'

interface Props {
  size?: AvatarSize
  className?: string
}

/** The tenant's company image as a square Avatar (avatars.md), playing when it has a shader. */
function CompanyAvatar({ size = 40, className }: Props) {
  const { src } = useCompanyImage()
  return (
    <Avatar src={src} size={size} alt={COMPANY} shape="square" className={className}>
      <CompanyImageMotion />
    </Avatar>
  )
}

export default CompanyAvatar
