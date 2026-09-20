import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { generateData, levelOf, HIGH_RISK_THRESHOLD } from './generate'
import { getSegments, getSegment, getDashboard } from '../services/mockApi'
import { useAuth } from '../auth/AuthContext'

const DataContext = createContext(null)

// Incidents and Alerts have no backend endpoint yet, so they stay on the
// deterministic mock data. Segments and the dashboard summary come from the API.
const mock = generateData()

// Map the backend's thin segment shape onto what the pages render. Fields the
// API doesn't provide fall back to '—' so the UI degrades gracefully rather
// than showing "undefined". Risk score/level come from the segment's latest
// risk assessment (fetched via the detail endpoint).
function mapSegment(listItem, detail) {
  const latest = detail?.risk_assessments?.[0]
  const score = latest?.risk_score ?? 0
  const level = latest?.risk_level || levelOf(score)
  return {
    id: listItem.segment_code, // display + routing identifier
    pk: listItem.id,           // numeric backend id (for detail/refetch)
    code: listItem.segment_code,
    pipeline: detail?.pipeline?.name || listItem.pipeline_name || '—',
    score,
    level,
    assessed: !!latest,        // false = no risk assessment yet (render neutral)
    status: detail?.pipeline?.status || '—',
    location: detail?.pipeline?.location || '—',
    latitude: listItem.latitude,
    longitude: listItem.longitude,
    explanation: latest?.explanation || '',
    recommendation: latest?.recommendation || '',
    // FUTURE: detail.incidents is a per-segment incidents array from the API.
    // Not wired into the Incidents page yet (still on mock data) — revisit
    // after the deadline to replace or augment the mock incidents feed.
    // Fields with no backend source yet.
    last: '—',
    lengthKm: '—',
    diameter: '—',
    installDate: '—',
    coating: '—',
    depth: '—',
    // Deterministic seed derived from the score so the simulated trend/gauge
    // visuals still render consistently (there is no risk-history endpoint).
    fseed: ((score * 9301 + 49297) % 233280) / 233280,
  }
}

export function DataProvider({ children }) {
  const { token } = useAuth()
  const [segments, setSegments] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(false)
  const [coldStart, setColdStart] = useState(false)
  const [error, setError] = useState(null)

  // Count concurrent slow requests so the cold-start banner stays on while any
  // one of them is still waking the server.
  const slowCount = useRef(0)
  const onSlow = useCallback((slow) => {
    slowCount.current += slow ? 1 : -1
    setColdStart(slowCount.current > 0)
  }, [])

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const [dash, list] = await Promise.all([
        getDashboard({ onSlow }),
        getSegments({ onSlow }),
      ])
      // Enrich each segment with its detail (for risk score/level/status).
      const details = await Promise.all(
        list.map((s) => getSegment(s.id, { onSlow }).catch(() => null)),
      )
      setDashboard(dash)
      setSegments(list.map((s, i) => mapSegment(s, details[i])))
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [token, onSlow])

  // Fetch on login / reset on logout. The synchronous setState here is the
  // standard data-fetch-in-effect pattern, so the strict rule is disabled.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (token) {
      load()
    } else {
      // Logged out: drop any backend data so nothing stale lingers.
      setSegments([])
      setDashboard(null)
      setError(null)
    }
  }, [token, load])
  /* eslint-enable react-hooks/set-state-in-effect */

  const value = useMemo(() => {
    const withLevel = segments // already carries `level` from mapSegment
    const bySegId = new Map(withLevel.map((s) => [s.id, s]))
    const pipes = [...new Set(withLevel.map((s) => s.pipeline))].filter((p) => p && p !== '—')
    return {
      segments: withLevel,
      dashboard,
      pipes: pipes.length ? pipes : mock.pipes,
      incidents: mock.incidents,
      alerts: mock.alerts,
      bySegId,
      threshold: HIGH_RISK_THRESHOLD,
      loading,
      coldStart,
      error,
      reload: load,
    }
  }, [segments, dashboard, loading, coldStart, error, load])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
