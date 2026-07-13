// 5Mins certificate illustrations — Figma "Illustrations/Certificate" (frame 9120:9301,
// downloaded 2026-07-13). Four distinct sizes of the certificate artwork; pick by
// context, render at native size, don't scale one into another.

import certificateXl from './certificate-xl.svg'
import certificateL from './certificate-l.svg'
import certificateM from './certificate-m.svg'
import certificateS from './certificate-s.svg'

export type CertificateIllustrationSize = 'xl' | 'l' | 'm' | 's'

/** xl = 240px (hero/celebration), l = 80px (cards/rows), m = 56px (mobile rows), s = 20px (inline). */
export const certificateIllustrations: Record<CertificateIllustrationSize, string> = {
  xl: certificateXl,
  l: certificateL,
  m: certificateM,
  s: certificateS,
}

export function getCertificateIllustration(size: CertificateIllustrationSize): string {
  return certificateIllustrations[size]
}
