import { useState } from 'react'

const STORAGE_KEY = 'rolloutboard.clearedAt'

function readStored(): number {
  const value = Number(localStorage.getItem(STORAGE_KEY))
  return Number.isFinite(value) ? value : 0
}

/** "Clear board" only hides older events in this browser; nothing is deleted in the DB. */
export function useClearedAt(): [number, () => void] {
  const [clearedAt, setClearedAt] = useState(readStored)
  const clearNow = () => {
    const now = Date.now()
    localStorage.setItem(STORAGE_KEY, String(now))
    setClearedAt(now)
  }
  return [clearedAt, clearNow]
}
