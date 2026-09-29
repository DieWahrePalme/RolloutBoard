import { TILE_EVENT_COUNT, formatTime } from '../lib/board'
import type { PcSummary } from '../types'
import { EventIcon } from './EventIcon'

interface TileProps {
  pc: PcSummary
  onOpen: (client: string) => void
}

export function Tile({ pc, onOpen }: TileProps) {
  const latest = pc.events.slice(-TILE_EVENT_COUNT).reverse()
  return (
    <button className={`tile tile-${pc.status}`} onClick={() => onOpen(pc.client)}>
      <div className="tile-name">{pc.client}</div>
      <ul className="tile-events">
        {latest.map((event) => (
          <li key={event.id}>
            <EventIcon state={event.state} />
            <span className="event-text">{event.text}</span>
            <time>{formatTime(event.created_at)}</time>
          </li>
        ))}
      </ul>
    </button>
  )
}
