/* Same numbers as the live Enrolments tab: 3 active people completed the course,
   plus 2 since deactivated (never listed in Enrolments). */
export const CERTS_ACTIVE = 3
export const DEACTIVATED_CERTS = 2
export const CERTS_ALL = CERTS_ACTIVE + DEACTIVATED_CERTS
export const certCount = (n: number) => `${n} certificate${n === 1 ? '' : 's'}`

export interface VariantProps {
  onDownload: (count: number) => void
}
