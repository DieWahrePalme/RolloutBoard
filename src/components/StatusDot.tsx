import type { PcStatus } from '../types'

export function StatusDot({ status }: { status: PcStatus }) {
  return <span className={`dot dot-${status}`} role="img" aria-label={status} />
}
