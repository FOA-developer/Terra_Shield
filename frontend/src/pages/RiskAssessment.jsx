import { Link } from 'react-router-dom'
import { factorsFor, explanationFor, actionsFor } from '../data/generate'
import RiskBadge from '../components/RiskBadge'
import { useSelectedSegment } from '../hooks/useSelectedSegment'

const BAR_COLORS = ['#dc2626', '#d97706', '#d97706', '#16a34a', '#16a34a']

export default function RiskAssessment() {
  const seg = useSelectedSegment()

  const factors = factorsFor(seg)
  const fmax = factors[0].pct
  const explanation = explanationFor(seg, seg.level)
  const actions = actionsFor(seg.level)
  const priority = seg.level === 'High' ? 'HIGH' : seg.level === 'Medium' ? 'MEDIUM' : 'LOW'

  return (
    <div className="p-4 pb-7 lg:px-7.5 lg:py-7">
      <Link to={`/segments/${seg.id}`} className="text-sm font-semibold">‹ Back to segment</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3.5">
        <div className="text-2xl font-bold tracking-tight text-forest-800 lg:text-[31px]">Risk Assessment</div>
        <div className="font-mono text-[15px] text-gray-500">{seg.id}</div>
        <RiskBadge level={seg.level}>{seg.level} Risk · {seg.score}</RiskBadge>
      </div>

      <div className="mt-4.5 grid items-start gap-3.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Contributing factors */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-[15px] font-bold text-forest-800">Top Contributing Factors</div>
          <div className="mt-1 text-[13px] text-gray-500">Weighted contribution to the current score.</div>
          <div className="mt-4.5 grid gap-4">
            {factors.map((f, i) => (
              <div key={f.name}>
                <div className="flex justify-between gap-3 text-sm">
                  <div className="font-medium text-gray-700">{f.name}</div>
                  <div className="font-mono font-semibold text-gray-900">{f.pct}%</div>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-md bg-gray-100">
                  <div
                    className="h-full rounded-md"
                    style={{ width: `${Math.round((f.pct / fmax) * 100)}%`, background: BAR_COLORS[i] || '#16a34a' }}
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
              <span className="rounded-md border border-green-200 bg-green-50 px-2 py-1 font-mono text-[10px] tracking-wide text-forest-600">SIMULATED DATA</span>
            </div>
            <p className="mt-3.5 text-[15px] leading-relaxed text-gray-700">{explanation}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="text-[15px] font-bold text-forest-800">Recommended Action</div>
              <div className="flex items-center gap-2 font-mono text-xs text-gray-500">
                PRIORITY<RiskBadge level={seg.level}>{priority}</RiskBadge>
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
