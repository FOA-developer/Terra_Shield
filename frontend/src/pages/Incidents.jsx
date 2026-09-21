import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../data/DataContext'
import RiskBadge from '../components/RiskBadge'
import Select from '../components/Select'

const STATUS_OPTIONS = ['All statuses', 'Open', 'Under Investigation', 'Resolved']
const SEV_OPTIONS = ['All severities', 'High', 'Medium', 'Low']

function statusStyle(s) {
  const color = s === 'Open' ? '#dc2626' : s === 'Under Investigation' ? '#d97706' : '#16a34a'
  const bg = s === 'Open' ? '#fee2e2' : s === 'Under Investigation' ? '#fef3c7' : '#dcfce7'
  return { color, background: bg }
}

function StatusBadge({ status }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold" style={statusStyle(status)}>
      {status}
    </span>
  )
}

const HEADERS = ['INCIDENT', 'TYPE', 'SEGMENT', 'REPORTED', 'SEVERITY', 'STATUS']

export default function Incidents() {
  const { incidents, pipes } = useData()
  const navigate = useNavigate()
  const [status, setStatus] = useState('All statuses')
  const [sev, setSev] = useState('All severities')
  const [pipe, setPipe] = useState('All pipelines')

  const pipeOptions = useMemo(() => ['All pipelines', ...pipes], [pipes])
  const filtered = incidents.filter((i) =>
    (status === 'All statuses' || i.status === status) &&
    (sev === 'All severities' || i.sev === sev) &&
    (pipe === 'All pipelines' || i.pipeline === pipe)
  )

  const open = (segRef) => navigate(`/segments/${segRef}`)

  return (
    <div className="p-4 pb-7 lg:px-7.5 lg:py-7">
      <div className="text-2xl font-bold tracking-tight text-forest-800 lg:text-[31px]">Incidents</div>
      <div className="mt-1.5 text-[15px] text-gray-500">{filtered.length} of {incidents.length} recorded incidents</div>

      <div className="mt-4 grid gap-2.5 lg:grid-cols-[1.4fr_1fr_1fr]">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-12">
          {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
        <Select value={sev} onChange={(e) => setSev(e.target.value)} className="h-12">
          {SEV_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </Select>
        <Select value={pipe} onChange={(e) => setPipe(e.target.value)} className="h-12">
          {pipeOptions.map((p) => <option key={p} value={p}>{p}</option>)}
        </Select>
      </div>

      {/* Desktop table */}
      <div className="mt-3.5 hidden overflow-x-auto rounded-xl border border-gray-200 bg-white lg:block">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {HEADERS.map((h) => (
                <th key={h} className="px-4 py-3 text-left font-mono text-[11px] font-semibold tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.ref} onClick={() => open(r.segRef)} className="cursor-pointer border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-4 font-mono text-[13px] font-semibold text-gray-900">{r.ref}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{r.type}</td>
                <td className="px-4 py-4 font-mono text-[13px] text-gray-700">{r.seg} · {r.pipeline}</td>
                <td className="px-4 py-4 font-mono text-[13px] text-gray-500">{r.date}</td>
                <td className="px-4 py-4"><RiskBadge level={r.sev} /></td>
                <td className="px-4 py-4"><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-3.5 grid gap-2.5 lg:hidden">
        {filtered.map((r) => (
          <button key={r.ref} type="button" onClick={() => open(r.segRef)} className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 text-left">
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-[13px] font-semibold text-gray-500">{r.ref}</div>
              <RiskBadge level={r.sev} />
            </div>
            <div className="mt-2 text-base font-semibold text-gray-900">{r.type}</div>
            <div className="mt-1.5 font-mono text-sm text-gray-700">{r.seg} · {r.pipeline}</div>
            <div className="mt-3.5 flex items-center justify-between gap-3">
              <StatusBadge status={r.status} />
              <div className="font-mono text-[13px] text-gray-500">{r.date}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
