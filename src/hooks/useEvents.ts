import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { HISTORY_HOURS } from '../lib/board'
import { createDemoEvents, isDemoMode } from '../lib/demo'
import type { BoardEvent } from '../types'

const MAX_LOADED_EVENTS = 1000

export interface EventsState {
  events: readonly BoardEvent[]
  error: string | null
  connected: boolean
}

function mergeEvents(current: readonly BoardEvent[], incoming: readonly BoardEvent[]) {
  const byId = new Map(current.map((event) => [event.id, event]))
  for (const event of incoming) byId.set(event.id, event)
  return [...byId.values()].sort((a, b) => a.id - b.id)
}

export function useEvents(): EventsState {
  const demo = isDemoMode()
  const [events, setEvents] = useState<readonly BoardEvent[]>(() =>
    demo ? createDemoEvents(Date.now()) : [],
  )
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)

  const loadRecent = useCallback(async () => {
    if (!supabase) return
    const since = new Date(Date.now() - HISTORY_HOURS * 3600 * 1000).toISOString()
    const { data, error: loadError } = await supabase
      .from('events')
      .select('*')
      .gte('created_at', since)
      .order('id', { ascending: false })
      .limit(MAX_LOADED_EVENTS)
    if (loadError) {
      setError(`Laden fehlgeschlagen: ${loadError.message}`)
      return
    }
    setError(null)
    setEvents((current) => mergeEvents(current, data as BoardEvent[]))
  }, [])

  useEffect(() => {
    if (!supabase || demo) return
    const channel = supabase
      .channel('events-insert')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'events' },
        (payload) => setEvents((current) => mergeEvents(current, [payload.new as BoardEvent])),
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
        // (Re)connected: fetch again so nothing sent in the meantime is missing.
        if (status === 'SUBSCRIBED') void loadRecent()
      })
    return () => {
      void supabase?.removeChannel(channel)
    }
  }, [loadRecent, demo])

  return { events, error, connected: demo || connected }
}
