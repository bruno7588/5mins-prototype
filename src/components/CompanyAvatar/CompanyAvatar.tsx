import Avatar, { type AvatarSize } from '@/components/Avatar/Avatar'
import { COMPANY } from '@/data/people'
import { useCompanyImage } from '@/data/companyImage'

interface Props {
  size?: AvatarSize
  className?: string
}

/** The tenant's company image as a square Avatar (avatars.md). */
function CompanyAvatar({ size = 40, className }: Props) {
  const { src } = useCompanyImage()
  return <Avatar src={src} size={size} alt={COMPANY} shape="square" className={className} />
}

export default CompanyAvatar
