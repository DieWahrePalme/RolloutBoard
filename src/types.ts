export type EventState = 'running' | 'done' | 'error' | 'finished'

export interface BoardEvent {
  id: number
  client: string
  text: string
  state: EventState
  created_at: string
}

export type PcStatus = 'working' | 'error' | 'finished' | 'stale'

export interface PcSummary {
  client: string
  status: PcStatus
  /** All events of this PC, oldest first. */
  events: readonly BoardEvent[]
  lastEventAt: number
}
