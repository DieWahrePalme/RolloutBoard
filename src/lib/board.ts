import type { BoardEvent, PcStatus, PcSummary } from '../types'

export const STALE_AFTER_MS = 30 * 60 * 1000
export const FINISHED_VISIBLE_MS = 10 * 1000
export const HISTORY_HOURS = 24
export const TILE_EVENT_COUNT = 3

function statusOf(last: BoardEvent, lastEventAt: number, now: number): PcStatus {
  if (last.state === 'finished') return 'finished'
  if (last.state === 'error') return 'error'
  return now - lastEventAt > STALE_AFTER_MS ? 'stale' : 'working'
}

/** Groups events by PC. Events must be sorted oldest first. */
export function summarize(events: readonly BoardEvent[], now: number): PcSummary[] {
  const byClient = new Map<string, BoardEvent[]>()
  for (const event of events) {
    byClient.set(event.client, [...(byClient.get(event.client) ?? []), event])
  }
  return [...byClient.entries()]
    .map(([client, list]) => {
      const last = list[list.length - 1]
      const lastEventAt = Date.parse(last.created_at)
      return { client, events: list, lastEventAt, status: statusOf(last, lastEventAt, now) }
    })
    .sort((a, b) => a.client.localeCompare(b.client, undefined, { numeric: true }))
}

export function isVisible(pc: PcSummary, showFinished: boolean, now: number): boolean {
  if (pc.status !== 'finished' || showFinished) return true
  return now - pc.lastEventAt < FINISHED_VISIBLE_MS
}

export function countByStatus(pcs: readonly PcSummary[]): Record<PcStatus, number> {
  const counts: Record<PcStatus, number> = { working: 0, error: 0, finished: 0, stale: 0 }
  for (const pc of pcs) counts[pc.status] += 1
  return counts
}

/** Milliseconds until a working PC turns inactive, or null if it is not counting down. */
export function msUntilStale(pc: PcSummary, now: number): number | null {
  if (pc.status !== 'working') return null
  return Math.max(0, pc.lastEventAt + STALE_AFTER_MS - now)
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function formatTime(iso: string | number): string {
  return new Date(iso).toLocaleTimeString('de-DE')
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('de-DE')
}
