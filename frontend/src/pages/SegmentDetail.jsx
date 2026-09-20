import { Link, useNavigate } from 'react-router-dom'
import { riskColor, riskSoft } from '../lib/risk'
import { trendFor } from '../data/generate'
import RiskBadge from '../components/RiskBadge'
import { useSelectedSegment } from '../hooks/useSelectedSegment'
import { useData } from '../data/DataContext'
import DataState from '../components/DataState'

export default function SegmentDetail() {
  const seg = useSelectedSegment()
  const navigate = useNavigate()
  const { loading, coldStart, error, reload } = useData()

  if (!seg) {
    return (
      <div className="p-4 pb-7 lg:px-7.5 lg:py-7">
        <Link to="/segments" className="text-sm font-semibold">‹ Back to segments</Link>
        <div className="mt-4">
          {loading || error ? (
            <DataState loading={loading} coldStart={coldStart} error={error} onRetry={reload} />
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              Segment not found.
            </div>
          )}
        </div>
      </div>
    )
  }

  const color = riskColor(seg.level)
  const soft = riskSoft(seg.level)
  const dash = `${Math.round((seg.score / 100) * 327)} 327`

  const { labels, xs, ys } = trendFor(seg)
  const trend = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
  const trendArea = `70,190 ${trend} ${xs[xs.length - 1]},190`

  const fields = [
    { k: 'Pipeline', v: seg.pipeline }, { k: 'Location', v: seg.location },
    { k: 'Length', v: seg.lengthKm }, { k: 'Diameter', v: seg.diameter },
    { k: 'Install date', v: seg.installDate }, { k: 'Coating type', v: seg.coating },
    { k: 'Depth of cover', v: seg.depth }, { k: 'Status', v: seg.status },
  ]

  return (
    <div className="p-4 pb-7 lg:px-7.5 lg:py-7">
      <Link to="/segments" className="text-sm font-semibold">‹ Back to segments</Link>
      <div className="mt-3 flex flex-wrap items-center gap-3.5">
        <div className="font-mono text-2xl font-semibold tracking-tight text-forest-800 lg:text-[31px]">{seg.id}</div>
        <RiskBadge level={seg.level}>{seg.level} Risk</RiskBadge>
      </div>
      <div className="mt-1.5 text-[15px] text-gray-500">{seg.pipeline} · {seg.location}</div>

      <div className="mt-4.5 grid items-start gap-3.5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Gauge — order first on mobile, second column on desktop */}
        <div className="order-first lg:order-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5.5 text-center">
            <div className="text-sm font-bold text-forest-800">Current Risk Score</div>
            <div className="relative mx-auto mt-5" style={{ width: 168, height: 168 }}>
              <svg viewBox="0 0 120 120" className="block h-full w-full" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="13" />
                <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="13" strokeLinecap="round" strokeDasharray={dash} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[44px] font-bold leading-none tracking-tight" style={{ color }}>{seg.score}</div>
                <div className="font-mono text-[11px] text-gray-500">/ 100</div>
              </div>
            </div>
            <div className="mt-4 font-mono text-xs text-gray-500">LAST SCORED 11 SEP 2026 · 23:10</div>
            <button
              type="button"
              onClick={() => navigate(`/segments/${seg.id}/assessment`)}
              className="mt-4.5 h-13 w-full rounded-xl border border-forest-600 bg-forest-600 text-[15px] font-bold text-white"
            >
              Run AI Assessment
            </button>
            <button
              type="button"
              onClick={() => navigate('/map')}
              className="mt-2.5 h-12 w-full rounded-xl border border-gray-300 bg-white text-sm font-semibold text-forest-800"
            >
              Locate on map
            </button>
          </div>
        </div>

        {/* Main column */}
        <div className="grid min-w-0 gap-3.5">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="text-[15px] font-bold text-forest-800">Segment Overview</div>
            <div className="mt-4 grid gap-x-6 md:grid-cols-2">
              {fields.map((f) => (
                <div key={f.k} className="flex justify-between gap-4 border-b border-gray-100 py-3.5">
                  <div className="text-[13px] text-gray-500">{f.k}</div>
                  <div className="text-right text-sm font-semibold text-gray-900">{f.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2.5">
              <div className="text-[15px] font-bold text-forest-800">Risk Trend</div>
              <div className="font-mono text-xs text-gray-500">LAST 6 MONTHS</div>
            </div>
            <svg viewBox="0 0 600 220" className="mt-3.5 block h-auto w-full">
              <g stroke="#f3f4f6" strokeWidth="1">
                <line x1="46" y1="20" x2="590" y2="20" />
                <line x1="46" y1="65" x2="590" y2="65" />
                <line x1="46" y1="110" x2="590" y2="110" />
                <line x1="46" y1="155" x2="590" y2="155" />
                <line x1="46" y1="190" x2="590" y2="190" />
              </g>
              <text x="10" y="25" fill="#9ca3af" fontFamily="IBM Plex Mono, monospace" fontSize="11">100</text>
              <text x="16" y="70" fill="#9ca3af" fontFamily="IBM Plex Mono, monospace" fontSize="11">75</text>
              <text x="16" y="115" fill="#9ca3af" fontFamily="IBM Plex Mono, monospace" fontSize="11">50</text>
              <text x="16" y="160" fill="#9ca3af" fontFamily="IBM Plex Mono, monospace" fontSize="11">25</text>
              <text x="22" y="195" fill="#9ca3af" fontFamily="IBM Plex Mono, monospace" fontSize="11">0</text>
              <polyline points={trendArea} fill={soft} stroke="none" />
              <polyline points={trend} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
              {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r="5" fill={color} />)}
              {xs.map((x, i) => (
                <text key={i} x={x} y="214" fill="#6b7280" fontFamily="IBM Plex Mono, monospace" fontSize="11" textAnchor="middle">{labels[i]}</text>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
