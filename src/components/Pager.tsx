interface PagerProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

export function Pager({ page, pageCount, onChange }: PagerProps) {
  if (pageCount <= 1) return null
  return (
    <div className="pager">
      <button disabled={page === 0} onClick={() => onChange(page - 1)}>◀</button>
      <span>Seite {page + 1} / {pageCount}</span>
      <button disabled={page >= pageCount - 1} onClick={() => onChange(page + 1)}>▶</button>
    </div>
  )
}
