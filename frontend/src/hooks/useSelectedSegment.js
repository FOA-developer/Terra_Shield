import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useData } from '../data/DataContext'

// Resolves the segment for detail/assessment routes: the :id param if present,
// otherwise falls back to the highest-scoring high-risk segment (matches the
// prototype's default selection).
export function useSelectedSegment() {
  const { id } = useParams()
  const { segments, bySegId } = useData()
  return useMemo(() => {
    if (id && bySegId.has(id)) return bySegId.get(id)
    const high = segments.filter((s) => s.level === 'High').sort((a, b) => b.score - a.score)
    return high[0] || segments[0]
  }, [id, segments, bySegId])
}
