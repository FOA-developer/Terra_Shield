import { useMemo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useData } from '../data/DataContext'
import { riskColor } from '../lib/risk'
import RiskBadge, { RiskDot } from '../components/RiskBadge'
import { useSegmentFilters } from '../hooks/useSegmentFilters'
import DataState from '../components/DataState'
import Select from '../components/Select'

const NEUTRAL = '#9ca3af' // not-yet-assessed segments
const LINE_COLOR = '#3fb27f'

function markerColor(seg) {
  return seg.assessed ? riskColor(seg.level) : NEUTRAL
}

// Only segments with real coordinates can be plotted.
function hasCoords(s) {
  return typeof s.latitude === 'number' && typeof s.longitude === 'number'
}

// Fit the map to all plotted segments whenever the set changes (i.e. on load).
function FitBounds({ points }) {
  const map = useMap()
  const key = points.map((p) => p.join(',')).join('|')
  useEffect(() => {
    if (!points.length) return
    if (points.length === 1) {
      map.setView(points[0], 13)
    } else {
      map.fitBounds(points, { padding: [40, 40] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return null
}

// Fly to / open the popup of the segment the user picked from the list.
function FocusController({ focus, segmentsById, markerRefs }) {
  const map = useMap()
  useEffect(() => {
    if (!focus) return
    const seg = segmentsById.get(focus.id)
    if (!seg || !hasCoords(seg)) return
    map.flyTo([seg.latitude, seg.longitude], Math.max(map.getZoom(), 13), { duration: 0.8 })
    const m = markerRefs.current[seg.id]
    if (m) m.openPopup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus])
  return null
}

// Leaflet mis-measures its container if it initializes while hidden
// (display:none behind the mobile "Map" tab), which lays tiles out wrong.
// A ResizeObserver on the map container re-measures on any size change —
// including 0 → real dimensions when the tab becomes visible. The tab-switch
// timeout is a belt-and-suspenders fallback for browsers that settle late.
function ResizeFix({ trigger }) {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(container)
    return () => ro.disconnect()
  }, [map])

  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150)
    return () => clearTimeout(t)
  }, [trigger, map])

  return null
}

export default function PipelineMap() {
  const { segments, loading, coldStart, error, reload } = useData()
  const navigate = useNavigate()
  const [mapTab, setMapTab] = useState('map')
  const [focus, setFocus] = useState(null) // { id, nonce }
  const markerRefs = useRef({})
  const { q, setQ, pipe, setPipe, level, setLevel, pipeOptions, levelOptions, filtered } = useSegmentFilters()

  const plotted = useMemo(() => segments.filter(hasCoords), [segments])
  const points = useMemo(() => plotted.map((s) => [s.latitude, s.longitude]), [plotted])
  const segmentsById = useMemo(() => new Map(segments.map((s) => [s.id, s])), [segments])

  // Group by pipeline, order by segment_code, and build a polyline per pipeline.
  const pipelines = useMemo(() => {
    const groups = new Map()
    for (const s of plotted) {
      if (!groups.has(s.pipeline)) groups.set(s.pipeline, [])
      groups.get(s.pipeline).push(s)
    }
    return [...groups.entries()].map(([name, segs]) => ({
      name,
      positions: segs
        .slice()
        .sort((a, b) => a.code.localeCompare(b.code))
        .map((s) => [s.latitude, s.longitude]),
    }))
  }, [plotted])

  // List click = locate on map (stay on this page). Also reveal the map on mobile.
  const locate = (id) => {
    setFocus({ id, nonce: (focus?.nonce || 0) + 1 })
    setMapTab('map')
  }

  const listRows = filtered.slice(0, 40)

  if ((loading && !segments.length) || error) {
    return (
      <div className="p-4 pb-7 lg:px-7.5 lg:py-7">
        <div className="text-2xl font-bold tracking-tight text-forest-800 lg:text-[31px]">Pipeline Map</div>
        <div className="mt-4">
          <DataState loading={loading} coldStart={coldStart} error={error} onRetry={reload} />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-7 lg:px-7.5 lg:py-7">
      <div className="text-2xl font-bold tracking-tight text-forest-800 lg:text-[31px]">Pipeline Map</div>
      <div className="mt-1.5 text-[15px] text-gray-500">{plotted.length} segments · colour-coded by current risk score.</div>

      {/* Mobile list/map toggle */}
      <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-xl bg-gray-200 p-1.5 lg:hidden">
        {['list', 'map'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMapTab(tab)}
            className={`h-11 rounded-lg text-sm font-semibold capitalize ${mapTab === tab ? 'bg-white text-forest-800' : 'bg-transparent text-gray-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-4 grid items-start gap-3.5 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* List panel */}
        <div className={`${mapTab === 'list' ? 'flex' : 'hidden'} flex-col overflow-hidden rounded-xl border border-gray-200 bg-white lg:flex`}>
          <div className="grid gap-2.5 border-b border-gray-200 p-3.5">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search segment ID…"
              className="h-11.5 w-full rounded-lg border border-gray-300 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-forest-600"
            />
            <div className="grid grid-cols-2 gap-2">
              <Select value={pipe} onChange={(e) => setPipe(e.target.value)} className="h-11.5">
                {pipeOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
              <Select value={level} onChange={(e) => setLevel(e.target.value)} className="h-11.5">
                {levelOptions.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </div>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {listRows.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">No segments match your filters.</div>
            )}
            {listRows.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => locate(r.id)}
                className={`flex w-full cursor-pointer items-center gap-3 border-b border-gray-100 p-3.5 text-left ${focus?.id === r.id ? 'bg-green-50' : ''}`}
              >
                <RiskDot level={r.level} className="!mt-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[13px] font-semibold text-gray-900">{r.id}</div>
                  <div className="mt-0.5 text-xs text-gray-500">{r.pipeline} · {r.status}</div>
                </div>
                <RiskBadge level={r.level} />
                <div className="w-6.5 text-right font-mono text-[13px] font-semibold text-gray-700">{r.score}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Map panel */}
        <div className={`${mapTab === 'map' ? 'block' : 'hidden'} isolate overflow-hidden rounded-xl border border-gray-200 lg:block`}>
          {plotted.length === 0 ? (
            <div className="flex h-[70vh] min-h-[420px] items-center justify-center bg-gray-50 p-8 text-center text-sm text-gray-500 lg:h-[640px]">
              No segments have coordinates to plot yet.
            </div>
          ) : (
            <MapContainer
              className="h-[70vh] min-h-[420px] w-full overflow-hidden rounded-xl lg:h-[640px]"
              center={points[0]}
              zoom={13}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {pipelines.map((p) => (
                p.positions.length > 1 && (
                  <Polyline key={p.name} positions={p.positions} pathOptions={{ color: LINE_COLOR, weight: 3, opacity: 0.6 }} />
                )
              ))}

              {plotted.map((s) => {
                const selected = focus?.id === s.id
                return (
                  <CircleMarker
                    key={s.id}
                    center={[s.latitude, s.longitude]}
                    radius={selected ? 11 : 8}
                    pathOptions={{
                      color: selected ? '#0b1f17' : '#ffffff',
                      weight: selected ? 3 : 2,
                      fillColor: markerColor(s),
                      fillOpacity: 1,
                    }}
                    ref={(el) => {
                      if (el) markerRefs.current[s.id] = el
                      else delete markerRefs.current[s.id]
                    }}
                    eventHandlers={{
                      // Pin click = go to the segment detail page.
                      click: () => navigate(`/segments/${s.id}`),
                    }}
                  >
                    <Popup>
                      <div className="font-mono text-[13px] font-semibold">{s.code}</div>
                      <div className="mt-0.5 text-xs">
                        {s.assessed ? `${s.level} risk · ${s.score}` : 'Not yet assessed'}
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}

              <FitBounds points={points} />
              <FocusController focus={focus} segmentsById={segmentsById} markerRefs={markerRefs} />
              <ResizeFix trigger={mapTab} />
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  )
}
