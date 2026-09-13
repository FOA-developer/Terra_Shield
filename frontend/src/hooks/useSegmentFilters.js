import { useMemo, useState } from 'react'
import { useData } from '../data/DataContext'

export function useSegmentFilters() {
  const { segments, pipes } = useData()
  const [q, setQ] = useState('')
  const [pipe, setPipe] = useState('All pipelines')
  const [level, setLevel] = useState('All levels')

  const pipeOptions = useMemo(() => ['All pipelines', ...pipes], [pipes])
  const levelOptions = ['All levels', 'High', 'Medium', 'Low']

  const filtered = useMemo(() => {
    return segments
      .filter((s) =>
        (pipe === 'All pipelines' || s.pipeline === pipe) &&
        (level === 'All levels' || s.level === level) &&
        (!q || s.id.toLowerCase().includes(q.toLowerCase()))
      )
      .sort((a, b) => b.score - a.score)
  }, [segments, q, pipe, level])

  return {
    q, setQ, pipe, setPipe, level, setLevel,
    pipeOptions, levelOptions, filtered, total: segments.length,
  }
}
