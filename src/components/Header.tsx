import type { PcStatus } from '../types'
import { Pager } from './Pager'
import { StatusDot } from './StatusDot'

interface HeaderProps {
  counts: Record<PcStatus, number>
  showFinished: boolean
  connected: boolean
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  onToggleFinished: (value: boolean) => void
  onClear: () => void
}

const COUNTERS: { status: PcStatus; label: string }[] = [
  { status: 'working', label: 'arbeiten' },
  { status: 'error', label: 'Fehler' },
  { status: 'finished', label: 'fertig' },
  { status: 'stale', label: 'ruhig' },
]

export function Header({
  counts,
  showFinished,
  connected,
  page,
  pageCount,
  onPageChange,
  onToggleFinished,
  onClear,
}: HeaderProps) {
  return (
    <header className="header">
      <h1>RolloutBoard</h1>
      <div className="counters">
        {COUNTERS.map(({ status, label }) => (
          <span key={status} className="counter">
            <StatusDot status={status} />
            <strong>{counts[status]}</strong> {label}
          </span>
        ))}
      </div>
      <Pager page={page} pageCount={pageCount} onChange={onPageChange} />
      <span className={connected ? 'live live-on' : 'live live-off'}>
        {connected ? '● live' : '○ getrennt'}
      </span>
      <label className="toggle">
        <input
          type="checkbox"
          checked={showFinished}
          onChange={(event) => onToggleFinished(event.target.checked)}
        />
        Fertige zeigen
      </label>
      <button onClick={onClear}>Board leeren</button>
    </header>
  )
}
