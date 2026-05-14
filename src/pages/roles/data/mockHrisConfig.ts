export type HrisSyncStatus = 'dry-run' | 'active'

export interface HrisConfig {
  provider: string
  syncStatus: HrisSyncStatus
}

export const mockHrisConfig: HrisConfig = {
  provider: 'HiBob',
  syncStatus: 'active',
}
