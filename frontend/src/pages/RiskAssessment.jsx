import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import RiskBadge from '../components/RiskBadge'
import DataState from '../components/DataState'
import { useSelectedSegment } from '../hooks/useSelectedSegment'
import { useData } from '../data/DataContext'
import { getSegment, runAssessment } from '../services/mockApi'

// contributing_factors is a flat array of human-readable phrases
// (e.g. "elevated flood risk"); just tidy the first letter for display.
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
  const [attempt, setAttempt] = useState(0)

  const pk = seg?.pk

  // The Segment Details page prepares the /risk-assess payload from the segment's
  // detail record: pipeline_id + segment_code are SEPARATE SHORT codes (never the
  // combined "PL-05-SG-12" id), plus environmental_data and incident_history.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (pk == null) return
    let alive = true
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const detail = await getSegment(pk, { onSlow: setColdStart })
        const pipelineCode = detail.pipeline?.code || ''
        const combined = detail.segment_code || ''
        // Combined id === `${pipeline.code}-${segment.code}`; strip the pipeline
        // prefix to recover the short segment code the request expects.
        const shortCode = pipelineCode && combined.startsWith(`${pipelineCode}-`)
          ? combined.slice(pipelineCode.length + 1)
          : combined
        const body = {
          pipeline_id: pipelineCode,
          segment_code: shortCode,
          latitude: detail.latitude,
          longitude: detail.longitude,
          environmental_data: detail.environmental_data || {},
          incident_history: (detail.incidents || []).map((i) => ({ type: i.incident_type, date: i.date })),
        }
        const r = await runAssessment(body, { onSlow: setColdStart })
        if (alive) setResult(r)
      } catch (e) {
        if (alive) setError(e)
      } finally {
        if (alive) { setLoading(false); setColdStart(false) }
      }
    })()
    return () => { alive = false }
  }, [pk, attempt])
  /* eslint-enable react-hooks/set-state-in-effect */

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
          <DataState loading={loading} coldStart={coldStart} error={error} onRetry={() => setAttempt((n) => n + 1)} />
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
        {/* Contributing factors — a flat list of what the model flagged. */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-[15px] font-bold text-forest-800">Contributing Factors</div>
          <div className="mt-1 text-[13px] text-gray-500">Factors the model flagged for this segment.</div>
          <div className="mt-4 grid">
            {factors.length === 0 && (
              <div className="text-sm text-gray-500">No contributing factors returned.</div>
            )}
            {factors.map((name, i) => (
              <div key={name + i} className="flex items-start gap-3 border-b border-gray-100 py-3 last:border-b-0">
                <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md border border-green-200 bg-green-50 text-[11px] text-forest-600">✓</span>
                <div className="text-[15px] leading-relaxed text-gray-700">{name}</div>
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
