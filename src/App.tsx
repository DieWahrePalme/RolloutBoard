import { useMemo, useState } from 'react'
import { DetailModal } from './components/DetailModal'
import { Header } from './components/Header'
import { Tile } from './components/Tile'
import { useClearedAt } from './hooks/useClearedAt'
import { useEvents } from './hooks/useEvents'
import { useNow } from './hooks/useNow'
import { countByStatus, isVisible, summarize } from './lib/board'
import { isDemoMode } from './lib/demo'
import { isConfigured } from './lib/supabase'

export default function App() {
  const { events, error, connected } = useEvents()
  const [clearedAt, clearBoard] = useClearedAt()
  const [showFinished, setShowFinished] = useState(false)
  const [openClient, setOpenClient] = useState<string | null>(null)
  const now = useNow()
  const demo = isDemoMode()

  const pcs = useMemo(
    () => summarize(events.filter((event) => Date.parse(event.created_at) > (demo ? 0 : clearedAt)), now),
    [events, clearedAt, demo, now],
  )
  const visible = pcs.filter((pc) => isVisible(pc, showFinished, now))
  const openPc = pcs.find((pc) => pc.client === openClient)

  if (!isConfigured && !demo) {
    return (
      <main className="message">
        VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY fehlen (siehe .env.example).
      </main>
    )
  }

  return (
    <>
      <Header
        counts={countByStatus(pcs)}
        showFinished={showFinished}
        connected={connected}
        onToggleFinished={setShowFinished}
        onClear={clearBoard}
      />
      {demo && <div className="demo-banner">Demo-Modus: ausgedachte PCs, keine echten Daten</div>}
      {error && <div className="error-banner">{error}</div>}
      {visible.length === 0 ? (
        <main className="message">Warte auf Meldungen der PCs …</main>
      ) : (
        <main className="grid">
          {visible.map((pc) => (
            <Tile key={pc.client} pc={pc} now={now} onOpen={setOpenClient} />
          ))}
        </main>
      )}
      {openPc && <DetailModal pc={openPc} onClose={() => setOpenClient(null)} />}
    </>
  )
}
