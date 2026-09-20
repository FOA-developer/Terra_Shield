import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { riskColor } from '../lib/risk'
import RiskBadge from '../components/RiskBadge'
import { useSegmentFilters } from '../hooks/useSegmentFilters'
import { useData } from '../data/DataContext'
import DataState from '../components/DataState'
import Select from '../components/Select'

const HEADERS = ['SEGMENT ID', 'PIPELINE', 'RISK', 'SCORE', 'STATUS', 'LAST INSPECTED']

export default function Segments() {
  const navigate = useNavigate()
  const { threshold, loading, coldStart, error, reload, segments } = useData()
  const { q, setQ, pipe, setPipe, level, setLevel, pipeOptions, levelOptions, filtered, total } = useSegmentFilters()
  const [page, setPage] = useState(1)

  const per = 12
  const pages = Math.max(1, Math.ceil(filtered.length / per))
  const currentPage = Math.min(page, pages)
  const rows = filtered.slice((currentPage - 1) * per, currentPage * per)

  const open = (id) => navigate(`/segments/${id}`)

  if ((loading && !segments.length) || error) {
    return (
      <div className="p-4 pb-7 lg:px-7.5 lg:py-7">
        <div className="text-2xl font-bold tracking-tight text-forest-800 lg:text-[31px]">Segments</div>
        <div className="mt-4">
          <DataState loading={loading} coldStart={coldStart} error={error} onRetry={reload} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-7 lg:px-7.5 lg:py-7">
      <div className="text-2xl font-bold tracking-tight text-forest-800 lg:text-[31px]">Segments</div>
      <div className="mt-1.5 text-[15px] text-gray-500">
        {filtered.length} of {total} segments · high-risk threshold {threshold}
      </div>

      {/* Filters */}
      <div className="mt-4 grid gap-2.5 lg:grid-cols-[1.4fr_1fr_1fr]">
        <input
          type="text"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1) }}
          placeholder="Search segment ID…"
          className="h-12 rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-forest-600"
        />
        <Select value={pipe} onChange={(e) => { setPipe(e.target.value); setPage(1) }} className="h-12">
          {pipeOptions.map((p) => <option key={p} value={p}>{p}</option>)}
        </Select>
        <Select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1) }} className="h-12">
          {levelOptions.map((l) => <option key={l} value={l}>{l}</option>)}
        </Select>
      </div>

      {/* Desktop table */}
      <div className="mt-3.5 hidden overflow-x-auto rounded-xl border border-gray-200 bg-white lg:block">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {HEADERS.map((h) => (
                <th key={h} className="px-4 py-3 text-left font-mono text-[11px] font-semibold tracking-wider text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} onClick={() => open(r.id)} className="cursor-pointer border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-4 font-mono text-[13px] font-semibold text-gray-900">{r.id}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{r.pipeline}</td>
                <td className="px-4 py-4"><RiskBadge level={r.level} /></td>
                <td className="px-4 py-4 font-mono text-sm font-semibold" style={{ color: riskColor(r.level) }}>{r.score}</td>
                <td className="px-4 py-4 text-sm text-gray-700">{r.status}</td>
                <td className="px-4 py-4 font-mono text-[13px] text-gray-500">{r.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-3.5 grid gap-2.5 lg:hidden">
        {rows.map((r) => (
          <button key={r.id} type="button" onClick={() => open(r.id)} className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 text-left">
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-[15px] font-semibold text-gray-900">{r.id}</div>
              <RiskBadge level={r.level} />
            </div>
            <div className="mt-2 text-sm text-gray-700">{r.pipeline}</div>
            <div className="mt-3.5 grid grid-cols-2 gap-3">
              <div>
                <div className="font-mono text-[11px] tracking-wide text-gray-400">RISK SCORE</div>
                <div className="mt-0.5 font-mono text-[17px] font-semibold" style={{ color: riskColor(r.level) }}>{r.score}</div>
              </div>
              <div>
                <div className="font-mono text-[11px] tracking-wide text-gray-400">STATUS</div>
                <div className="mt-0.5 text-sm text-gray-700">{r.status}</div>
              </div>
              <div className="col-span-2">
                <div className="font-mono text-[11px] tracking-wide text-gray-400">LAST INSPECTED</div>
                <div className="mt-0.5 font-mono text-sm text-gray-700">{r.last}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-[13px] text-gray-500">PAGE {currentPage} OF {pages}</div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-11.5 min-w-[92px] rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-forest-800"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="h-11.5 min-w-[92px] rounded-lg border border-forest-600 bg-forest-600 px-4 text-sm font-semibold text-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
