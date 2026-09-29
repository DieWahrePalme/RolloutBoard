import { useEffect } from 'react'
import { formatDateTime } from '../lib/board'
import type { PcSummary } from '../types'
import { EventIcon } from './EventIcon'
import { StatusDot } from './StatusDot'

interface DetailModalProps {
  pc: PcSummary
  onClose: () => void
}

export function DetailModal({ pc, onClose }: DetailModalProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <header>
          <h2>
            <StatusDot status={pc.status} />
            {pc.client}
          </h2>
          <button onClick={onClose}>Schließen</button>
        </header>
        <ul className="modal-events">
          {[...pc.events].reverse().map((event) => (
            <li key={event.id}>
              <EventIcon state={event.state} />
              <span className="event-text">{event.text}</span>
              <time>{formatDateTime(event.created_at)}</time>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
