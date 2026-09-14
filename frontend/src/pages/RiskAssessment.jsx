import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import RiskBadge from '../components/RiskBadge'
import DataState from '../components/DataState'
import { useSelectedSegment } from '../hooks/useSelectedSegment'
import { useData } from '../data/DataContext'
import { runAssessment } from '../services/mockApi'

const BAR_COLORS = ['#dc2626', '#d97706', '#d97706', '#16a34a', '#16a34a']

// Backend returns contributing_factors as short codes (e.g. "soil_moisture");
// turn them into readable labels.
function prettify(factor) {
  return factor
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
}

export default function RiskAssessment() {
  const seg = useSelectedSegment()
  const { loading: dataLoading, coldStart: dataColdStart, error: dataError, reload } = useData()

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [coldStart, setColdStart] = useState(false)
  const [error, setError] = useState(null)

  const segmentCode = seg?.code || seg?.id

  useEffect(() => {
    if (!segmentCode) return
    let alive = true
    setLoading(true)
    setError(null)
    runAssessment({ segment_code: segmentCode }, { onSlow: setColdStart })
      .then((r) => { if (alive) setResult(r) })
      .catch((e) => { if (alive) setError(e) })
      .finally(() => { if (alive) { setLoading(false); setColdStart(false) } })
    return () => { alive = false }
  }, [segmentCode])

  // Segment list still loading, or segment not found.
  if (!seg) {
    return (
      <div className="p-4 pb-7 lg:px-7.5 lg:py-7">
        <Link to="/segments" className="text-sm font-semibold">‹ Back to segments</Link>
        <div className="mt-4">
          {dataLoading || dataError ? (
            <DataState loading={dataLoading} coldStart={dataColdStart} error={dataError} onRetry={reload} />
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              Segment not found.
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading || error || !result) {
    return (
      <div className="p-4 pb-7 lg:px-7.5 lg:py-7">
        <Link to={`/segments/${seg.id}`} className="text-sm font-semibold">‹ Back to segment</Link>
        <div className="mt-3 text-2xl font-bold tracking-tight text-forest-800 lg:text-[31px]">Risk Assessment</div>
        <div className="mt-4">
          <DataState loading={loading} coldStart={coldStart} error={error} onRetry={() => setResult(null) || setError(null) || setLoading(true)} />
        </div>
      </div>
    )
  }

  const level = result.risk_level
  const score = result.risk_score
  const factors = (result.contributing_factors || []).map((name) => prettify(name))
  const actions = result.recommendation ? [result.recommendation] : []
  const priority = level === 'High' ? 'HIGH' : level === 'Medium' ? 'MEDIUM' : 'LOW'

  return (
    <div className="p-4 pb-7 lg:px-7.5 lg:py-7">
      <Link to={`/segments/${seg.id}`} className="text-sm font-semibold">‹ Back to segment</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3.5">
        <div className="text-2xl font-bold tracking-tight text-forest-800 lg:text-[31px]">Risk Assessment</div>
        <div className="font-mono text-[15px] text-gray-500">{result.segment_id || seg.id}</div>
        <RiskBadge level={level}>{level} Risk · {score}</RiskBadge>
      </div>

      <div className="mt-4.5 grid items-start gap-3.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Contributing factors */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-[15px] font-bold text-forest-800">Top Contributing Factors</div>
          <div className="mt-1 text-[13px] text-gray-500">Factors the model flagged for this segment, in order.</div>
          <div className="mt-4.5 grid gap-4">
            {factors.length === 0 && (
              <div className="text-sm text-gray-500">No contributing factors returned.</div>
            )}
            {factors.map((name, i) => (
              <div key={name + i}>
                <div className="flex justify-between gap-3 text-sm">
                  <div className="font-medium text-gray-700">{name}</div>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-md bg-gray-100">
                  <div
                    className="h-full rounded-md"
                    style={{ width: `${Math.max(20, 100 - i * 18)}%`, background: BAR_COLORS[i] || '#16a34a' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explanation + action */}
        <div className="grid min-w-0 gap-3.5">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2.5">
              <div className="text-[15px] font-bold text-forest-800">AI Explanation</div>
            </div>
            <p className="mt-3.5 text-[15px] leading-relaxed text-gray-700">{result.explanation}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="text-[15px] font-bold text-forest-800">Recommended Action</div>
              <div className="flex items-center gap-2 font-mono text-xs text-gray-500">
                PRIORITY<RiskBadge level={level}>{priority}</RiskBadge>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {actions.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md border border-green-200 bg-green-50 text-[11px] text-forest-600">✓</span>
                  <div className="text-[15px] leading-relaxed text-gray-700">{a}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-2.5 lg:grid-cols-2">
              <button type="button" className="h-13 rounded-xl border border-forest-600 bg-forest-600 text-[15px] font-bold text-white">Create Work Order</button>
              <button type="button" className="h-13 rounded-xl border border-gray-300 bg-white text-[15px] font-semibold text-forest-800">Flag for review</button>
            </div>
            <div className="mt-3.5 border-t border-gray-100 pt-3.5 text-[13px] text-gray-500">
              The system recommends. Qualified personnel decide — this assessment requires sign-off before dispatch.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
