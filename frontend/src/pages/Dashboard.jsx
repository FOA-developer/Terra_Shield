import { useMemo, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useData } from '../data/DataContext'
import RiskBadge, { RiskDot } from '../components/RiskBadge'
import PageHeader from '../components/PageHeader'
import DataState from '../components/DataState'

const AGOS = ['10 min ago', '25 min ago', '1 hr ago', '2 hrs ago', '4 hrs ago']

// Format a Date in West Africa Time (UTC+1) as e.g. "Sat, 12 Sep 2026 · 07:42 WAT".
// Formatting via the Africa/Lagos timezone is robust regardless of the viewer's
// machine timezone; Lagos has no DST, so the WAT label is always correct.
function formatWAT(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Lagos',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const p = (t) => parts.find((x) => x.type === t)?.value
  return `${p('weekday')}, ${p('day')} ${p('month')} ${p('year')} · ${p('hour')}:${p('minute')} WAT`
}

// Live-ticking clock for the dashboard header. Updates every second and clears
// its interval on unmount so it doesn't leak.
function LiveClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 font-mono text-[13px] text-gray-700">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-600" />
      {formatWAT(now)}
    </div>
  )
}

export default function Dashboard() {
  const { dashboard, alerts, bySegId, pipes, loading, coldStart, error, reload } = useData()
  const navigate = useNavigate()

  const { total, highCount, medCount, lowCount, hp, mp, statCards, topRisk, recentAlerts } = useMemo(() => {
    const breakdown = Object.fromEntries((dashboard?.risk_level_breakdown || []).map((b) => [b.risk_level, b.count]))
    const highCount = breakdown.High || 0
    const medCount = breakdown.Medium || 0
    const lowCount = breakdown.Low || 0
    const total = dashboard?.segment_count ?? (highCount + medCount + lowCount)
    const pctOf = (n) => (total ? ((n / total) * 100).toFixed(1) : '0.0') + '% of total'
    const hp = total ? (highCount / total) * 100 : 0
    const mp = total ? (medCount / total) * 100 : 0

    const statCards = [
      { label: 'Total Segments', value: String(total), sub: `Across ${dashboard?.pipeline_count ?? pipes.length} pipelines`, icon: '≡', color: '#1f5138', bg: '#ecfdf5' },
      { label: 'High Risk', value: String(highCount), sub: pctOf(highCount), icon: '△', color: '#dc2626', bg: '#fee2e2' },
      { label: 'Medium Risk', value: String(medCount), sub: pctOf(medCount), icon: '◐', color: '#d97706', bg: '#fef3c7' },
      { label: 'Low Risk', value: String(lowCount), sub: pctOf(lowCount), icon: '✓', color: '#16a34a', bg: '#dcfce7' },
    ]

    // Top high-risk segments from the dashboard's latest assessments; pull the
    // pipeline name from the segment list where available.
    const topRisk = (dashboard?.latest_assessments || [])
      .slice()
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 5)
      .map((a) => ({
        id: a.segment_id,
        score: a.risk_score,
        level: a.risk_level,
        pipeline: bySegId.get(a.segment_id)?.pipeline || '—',
      }))

    const recentAlerts = alerts.slice(0, 4)
    return { total, highCount, medCount, lowCount, hp, mp, statCards, topRisk, recentAlerts }
  }, [dashboard, alerts, bySegId, pipes])

  if ((loading && !dashboard) || error) {
    return (
      <div className="p-4 pb-7 lg:px-7.5 lg:py-7">
        <DataState loading={loading} coldStart={coldStart} error={error} onRetry={reload} />
      </div>
    )
  }

  const donut = `conic-gradient(#dc2626 0 ${hp}%,#d97706 ${hp}% ${hp + mp}%,#16a34a ${hp + mp}% 100%)`
  const legend = [
    { label: 'High Risk', level: 'High', value: `${highCount} (${hp.toFixed(1)}%)` },
    { label: 'Medium Risk', level: 'Medium', value: `${medCount} (${mp.toFixed(1)}%)` },
    { label: 'Low Risk', level: 'Low', value: `${lowCount} (${(100 - hp - mp).toFixed(1)}%)` },
  ]

  return (
    <div className="p-4 pb-7 lg:px-7.5 lg:py-7">
      <PageHeader
        title="Welcome back, Emeka"
        subtitle="Here's what's happening across your pipeline network today."
        right={<LiveClock />}
      />

      {/* Stat cards */}
      <div className="mt-5.5 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {statCards.map((c) => (
          <div key={c.label} className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4.5">
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-gray-500">{c.label}</div>
              <div className="mt-2 text-[34px] font-bold leading-none tracking-tight text-forest-800">{c.value}</div>
              <div className="mt-2 font-mono text-xs text-gray-500">{c.sub}</div>
            </div>
            <div
              className="flex flex-none items-center justify-center rounded-xl text-[17px]"
              style={{ width: 42, height: 42, background: c.bg, color: c.color }}
            >
              {c.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Three-column row */}
      <div className="mt-3.5 grid items-start gap-3.5 xl:grid-cols-3">
        {/* Risk distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-4.5">
          <div className="text-[15px] font-bold text-forest-800">Risk Distribution</div>
          <div className="mt-4.5 flex flex-wrap items-center gap-5.5">
            <div className="relative flex-none" style={{ width: 150, height: 150 }}>
              <div className="absolute inset-0 rounded-full" style={{ background: donut }} />
              <div className="absolute inset-[34px] flex flex-col items-center justify-center rounded-full bg-white">
                <div className="text-[23px] font-bold leading-none text-forest-800">{total}</div>
                <div className="font-mono text-[10px] text-gray-500">SEGMENTS</div>
              </div>
            </div>
            <div className="grid min-w-[150px] gap-3">
              {legend.map((l) => (
                <div key={l.label} className="flex items-center gap-2.5 text-sm">
                  <RiskDot level={l.level} size={11} className="!mt-0" />
                  <span className="flex-1 text-gray-700">{l.label}</span>
                  <span className="font-mono font-semibold text-forest-800">{l.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent alerts */}
        <div className="rounded-xl border border-gray-200 bg-white p-4.5">
          <div className="flex items-center justify-between">
            <div className="text-[15px] font-bold text-forest-800">Recent Alerts</div>
            <Link to="/alerts" className="text-[13px] font-semibold">View all</Link>
          </div>
          <div className="mt-1.5 grid">
            {recentAlerts.map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={() => navigate(`/segments/${a.segRef}`)}
                className="flex cursor-pointer items-start gap-3 border-b border-gray-100 py-3.5 text-left last:border-b-0"
              >
                <RiskDot level={a.sev} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900">{a.message}</div>
                  <div className="mt-1 font-mono text-xs text-gray-500">Segment {a.seg}</div>
                </div>
                <div className="whitespace-nowrap text-xs text-gray-400">{AGOS[i % AGOS.length]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Top 5 high risk */}
        <div className="rounded-xl border border-gray-200 bg-white p-4.5">
          <div className="text-[15px] font-bold text-forest-800">Top 5 High-Risk Segments</div>
          <div className="mt-1.5 grid">
            {topRisk.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => navigate(`/segments/${t.id}`)}
                className="flex cursor-pointer items-center gap-3 border-b border-gray-100 py-3 text-left last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[13px] font-semibold text-gray-900">{t.id}</div>
                  <div className="mt-0.5 text-xs text-gray-500">{t.pipeline}</div>
                </div>
                <RiskBadge level={t.level}>{t.score}</RiskBadge>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate('/segments')}
            className="mt-3.5 h-11 w-full rounded-lg border border-gray-300 bg-white text-sm font-semibold text-forest-800"
          >
            View all high-risk segments
          </button>
        </div>
      </div>
    </div>
  )
}
