import { TILE_EVENT_COUNT, formatCountdown, formatTime, msUntilStale } from '../lib/board'
import type { PcSummary } from '../types'
import { EventIcon } from './EventIcon'

interface TileProps {
  pc: PcSummary
  now: number
  onOpen: (client: string) => void
}

export function Tile({ pc, now, onOpen }: TileProps) {
  const remaining = msUntilStale(pc, now)
  const latest = pc.events.slice(-TILE_EVENT_COUNT).reverse()
  return (
    <button className={`tile tile-${pc.status}`} onClick={() => onOpen(pc.client)}>
      <div className="tile-name">{pc.client}</div>
      <ul className="tile-events">
        {latest.map((event, index) => (
          <li key={event.id}>
            <EventIcon state={event.state} />
            <span className="event-text">{event.text}</span>
            <time>{formatTime(event.created_at)}</time>
            {index === 0 && remaining !== null && (
              <span className="countdown" title="Zeit bis die Kachel inaktiv wird">
                ⏱ {formatCountdown(remaining)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </button>
  )
}
