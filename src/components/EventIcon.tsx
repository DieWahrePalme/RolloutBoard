import type { EventState } from '../types'

const ICONS: Record<EventState, string> = {
  running: '⏳',
  done: '✓',
  error: '✗',
  finished: '🏁',
}

export function EventIcon({ state }: { state: EventState }) {
  return (
    <span className={`icon icon-${state}`} aria-label={state}>
      {ICONS[state]}
    </span>
  )
}
