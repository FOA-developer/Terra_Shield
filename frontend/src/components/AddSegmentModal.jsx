import { useState } from 'react'
import Select from './Select'
import { runAssessment } from '../services/mockApi'

const FLOOD_OPTIONS = ['', 'Low', 'Medium', 'High']

const inputBase =
  'h-12 w-full rounded-lg border bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-forest-600'

// "Add Segment" — there's no POST /segments, so this posts to /risk-assess,
// which creates the pipeline/segment on the fly and returns its assessment.
// pipeline_id + segment_code are sent as SEPARATE short codes (not combined).
export default function AddSegmentModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    pipeline_id: '',
    segment_code: '',
    latitude: '',
    longitude: '',
    elevation: '',
    flood_risk: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [coldStart, setColdStart] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  // Client-side validation for the required fields before firing a request.
  function validate() {
    const errs = {}
    if (!form.pipeline_id.trim()) errs.pipeline_id = 'Pipeline ID is required.'
    if (!form.segment_code.trim()) errs.segment_code = 'Segment code is required.'

    const lat = Number(form.latitude)
    if (form.latitude.trim() === '') errs.latitude = 'Latitude is required.'
    else if (Number.isNaN(lat) || lat < -90 || lat > 90) errs.latitude = 'Enter a latitude between -90 and 90.'

    const lng = Number(form.longitude)
    if (form.longitude.trim() === '') errs.longitude = 'Longitude is required.'
    else if (Number.isNaN(lng) || lng < -180 || lng > 180) errs.longitude = 'Enter a longitude between -180 and 180.'

    if (form.elevation.trim() !== '' && Number.isNaN(Number(form.elevation))) {
      errs.elevation = 'Elevation must be a number.'
    }
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    setMessage('')
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length) return

    const environmental_data = {}
    if (form.elevation.trim() !== '') environmental_data.elevation = Number(form.elevation)
    if (form.flood_risk) environmental_data.flood_risk = form.flood_risk

    const body = {
      pipeline_id: form.pipeline_id.trim(),
      segment_code: form.segment_code.trim(),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      environmental_data,
      incident_history: [],
    }

    setLoading(true)
    try {
      const result = await runAssessment(body, { onSlow: setColdStart })
      onCreated(result) // parent refreshes the list and navigates to the result
    } catch (err) {
      // Shared error shape: map error.details to per-field messages, and show
      // error.message as a general banner. details[field] is an array.
      const details = err.details || {}
      const mapped = {}
      for (const [key, val] of Object.entries(details)) {
        mapped[key] = Array.isArray(val) ? val.join(' ') : String(val)
      }
      setFieldErrors(mapped)
      setMessage(err.message || 'Could not create the segment. Please try again.')
    } finally {
      setLoading(false)
      setColdStart(false)
    }
  }

  const field = (key, label, props = {}) => (
    <div>
      <div className="mb-1.5 text-[13px] font-semibold text-gray-700">{label}</div>
      <input
        {...props}
        value={form[key]}
        onChange={set(key)}
        className={`${inputBase} ${fieldErrors[key] ? 'border-red-400' : 'border-gray-300'}`}
      />
      {fieldErrors[key] && <div className="mt-1 text-xs text-red-600">{fieldErrors[key]}</div>}
    </div>
  )

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-forest-950/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-[520px] flex-col overflow-hidden rounded-t-2xl bg-white sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="text-[17px] font-bold text-forest-800">Add Segment</div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-base text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3.5 overflow-y-auto px-5 py-4">
          <div className="text-[13px] text-gray-500">
            Creates the segment and runs an initial AI risk assessment.
          </div>

          {message && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
              {message}
            </div>
          )}

          <div className="grid gap-3.5 sm:grid-cols-2">
            {field('pipeline_id', 'Pipeline ID', { placeholder: 'PL-05', autoFocus: true })}
            {field('segment_code', 'Segment Code', { placeholder: 'SG-12' })}
            {field('latitude', 'Latitude', { placeholder: '4.815', inputMode: 'decimal' })}
            {field('longitude', 'Longitude', { placeholder: '7.049', inputMode: 'decimal' })}
            {field('elevation', 'Elevation (optional)', { placeholder: '18', inputMode: 'decimal' })}
            <div>
              <div className="mb-1.5 text-[13px] font-semibold text-gray-700">Flood Risk (optional)</div>
              <Select value={form.flood_risk} onChange={set('flood_risk')} className="h-12 w-full">
                {FLOOD_OPTIONS.map((o) => (
                  <option key={o || 'none'} value={o}>{o || 'Not specified'}</option>
                ))}
              </Select>
            </div>
          </div>

          {loading && coldStart && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3.5 py-2.5 text-[13px] text-forest-700">
              Waking up the server, this can take up to a minute…
            </div>
          )}

          <div className="mt-1 grid gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              className="order-2 h-12 rounded-xl border border-gray-300 bg-white text-sm font-semibold text-forest-800 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="order-1 h-12 rounded-xl border border-forest-600 bg-forest-600 text-sm font-bold text-white disabled:opacity-60 sm:order-2"
            >
              {loading ? 'Assessing…' : 'Create & Assess'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
