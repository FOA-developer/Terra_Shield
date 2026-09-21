import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../data/DataContext'
import RiskBadge, { RiskDot } from '../components/RiskBadge'
import Select from '../components/Select'

const ATT_OPTIONS = ['All alerts', 'Attended', 'Unattended', 'Pending']
const SEV_OPTIONS = ['All severities', 'High', 'Medium', 'Low']

function attStyle(a) {
  const color = a === 'Attended' ? '#16a34a' : a === 'Pending' ? '#d97706' : '#6b7280'
  const bg = a === 'Attended' ? '#dcfce7' : a === 'Pending' ? '#fef3c7' : '#f3f4f6'
  return { color, background: bg }
}

function AttBadge({ att }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold" style={attStyle(att)}>
      {att}
    </span>
  )
}

function stars(rating) {
  return rating ? '★★★★★'.slice(0, rating) + '☆☆☆☆☆'.slice(0, 5 - rating) : '— not rated'
}

const HEADERS = ['ALERT', 'SEGMENT', 'TIMESTAMP', 'SEVERITY', 'ATTENDED', 'RATING']

export default function Alerts() {
  const { alerts } = useData()
  const navigate = useNavigate()
  const [att, setAtt] = useState('All alerts')
  const [sev, setSev] = useState('All severities')

  const filtered = alerts.filter((a) =>
    (att === 'All alerts' || a.att === att) &&
    (sev === 'All severities' || a.sev === sev)
  )

  const open = (segRef) => navigate(`/segments/${segRef}`)

  return (
    <div className="p-4 pb-7 lg:px-7.5 lg:py-7">
      <div className="text-2xl font-bold tracking-tight text-forest-800 lg:text-[31px]">Alerts</div>
      <div className="mt-1.5 text-[15px] text-gray-500">{filtered.length} of {alerts.length} alerts surfaced</div>

      <div className="mt-4 grid gap-2.5 lg:grid-cols-2">
        <Select value={att} onChange={(e) => setAtt(e.target.value)} className="h-12">
          {ATT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
        <Select value={sev} onChange={(e) => setSev(e.target.value)} className="h-12">
          {SEV_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
      </div>

      {/* Desktop table */}
      <div className="mt-3.5 hidden overflow-x-auto rounded-xl border border-gray-200 bg-white lg:block">
        <table className="w-full min-w-[880px] border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {HEADERS.map((h) => (
                <th key={h} className="px-4 py-3 text-left font-mono text-[11px] font-semibold tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} onClick={() => open(r.segRef)} className="cursor-pointer border-t border-gray-100 hover:bg-gray-50">
                <td className="max-w-[340px] px-4 py-4 text-sm text-gray-900">{r.message}</td>
                <td className="px-4 py-4 font-mono text-[13px] font-semibold text-gray-700">{r.seg}</td>
                <td className="px-4 py-4 font-mono text-[13px] text-gray-500">{r.ts}</td>
                <td className="px-4 py-4"><RiskBadge level={r.sev} /></td>
                <td className="px-4 py-4"><AttBadge att={r.att} /></td>
                <td className="px-4 py-4 font-mono text-[13px] tracking-wider" style={{ color: r.rating ? '#d97706' : '#9ca3af' }}>{stars(r.rating)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-3.5 grid gap-2.5 lg:hidden">
        {filtered.map((r, i) => (
          <button key={i} type="button" onClick={() => open(r.segRef)} className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 text-left">
            <div className="flex items-start gap-3">
              <RiskDot level={r.sev} />
              <div className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-gray-900">{r.message}</div>
            </div>
            <div className="mt-2.5 font-mono text-[13px] text-gray-700">{r.seg} · {r.ts}</div>
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
              <RiskBadge level={r.sev} />
              <AttBadge att={r.att} />
              <div className="flex-1" />
              <div className="font-mono text-sm tracking-wider" style={{ color: r.rating ? '#d97706' : '#9ca3af' }}>{stars(r.rating)}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
