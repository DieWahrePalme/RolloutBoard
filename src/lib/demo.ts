import type { BoardEvent, EventState } from '../types'

const MINUTE_MS = 60 * 1000
const DEMO_PC_COUNT = 30
const STEPS = [
  'Windows Updates',
  'Installing TeamViewer',
  'Edge update',
  'Installing Office',
  'Installing 7-Zip',
  'Driver package',
]

/** Open the board with ?demo to see made-up PCs instead of live data. */
export function isDemoMode(): boolean {
  return new URLSearchParams(window.location.search).has('demo')
}

interface DemoPlan {
  steps: number
  lastState: EventState
  minutesSinceLast: number
}

// Fixed pattern (no randomness) so the demo looks the same on every reload.
function planFor(index: number): DemoPlan {
  if (index >= 15 && index <= 17) return { steps: 3, lastState: 'error', minutesSinceLast: index - 12 }
  if (index >= 18 && index <= 21) return { steps: 5, lastState: 'finished', minutesSinceLast: 3 }
  if (index >= 22 && index <= 24) return { steps: 2, lastState: 'running', minutesSinceLast: 40 + index }
  return {
    steps: 1 + (index % 5),
    lastState: index % 2 === 0 ? 'running' : 'done',
    minutesSinceLast: (index * 7) % 28,
  }
}

/** Fake events for PC-01 … PC-30 in every state, oldest first. */
export function createDemoEvents(now: number): BoardEvent[] {
  const events: BoardEvent[] = []
  for (let index = 1; index <= DEMO_PC_COUNT; index += 1) {
    const plan = planFor(index)
    for (let step = 0; step < plan.steps; step += 1) {
      const stepsAfter = plan.steps - 1 - step
      const isLast = stepsAfter === 0
      events.push({
        id: events.length + 1,
        client: `PC-${String(index).padStart(2, '0')}`,
        text: isLast && plan.lastState === 'finished' ? 'finished' : STEPS[step % STEPS.length],
        state: isLast ? plan.lastState : 'done',
        created_at: new Date(now - (plan.minutesSinceLast + stepsAfter * 4) * MINUTE_MS).toISOString(),
      })
    }
  }
  return events.sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
    .map((event, position) => ({ ...event, id: position + 1 }))
}
