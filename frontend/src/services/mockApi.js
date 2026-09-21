// Real HTTP client for the TerraShield backend.
//
// Kept at the path src/services/mockApi.js for continuity with the original
// scaffold, but every function here now hits the live API described in
// API_CONTRACT.md. Function signatures match what the pages will call:
//   login(username, password) · getDashboard() · getSegments()
//   getSegment(id) · runAssessment(segment)
// Each also accepts an optional trailing options arg ({ onSlow }) used only
// for the cold-start UX — existing arg-free call sites keep working.

const BASE_URL = import.meta.env.VITE_API_BASE_URL

// Render's free tier sleeps after ~15 min; the first request can take
// 30-50s to wake. If a call is still pending after this long, we notify the
// caller via onSlow(true) so the UI can show a "waking up" message instead of
// looking broken.
const COLD_START_MS = 5000

// --- Auth token ----------------------------------------------------------
// The source of truth for the token lives in React state (see AuthContext).
// AuthContext mirrors it here via setApiToken so the arg-free service
// functions can attach `Authorization: Token <token>` without every caller
// threading the token through. It is never written to localStorage.
let authToken = null
let onUnauthorized = null

export function setApiToken(token) {
  authToken = token || null
}

// AuthContext registers a handler here so that any 401 / authentication_failed
// clears the token and redirects to /login from one place.
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

// --- Shared error type + handler -----------------------------------------
// Every non-2xx body follows the standard shape:
//   { "error": { "code": ..., "message": ..., "details": {...} } }
export class ApiError extends Error {
  constructor({ code, message, details }, status) {
    super(message || 'Something went wrong.')
    this.name = 'ApiError'
    this.code = code
    this.details = details
    this.status = status
  }
}

// The ONE error handler: turns any failed Response into a thrown ApiError,
// reading error.message/error.code from the standard shape, and triggers the
// login redirect on auth failure. Every call below funnels through this.
async function toApiError(res) {
  let body
  try {
    body = await res.json()
  } catch {
    body = null
  }
  const err = (body && body.error) || {}
  const apiError = new ApiError(
    {
      code: err.code,
      message: err.message || `Request failed (${res.status}).`,
      details: err.details,
    },
    res.status,
  )
  if (res.status === 401 || apiError.code === 'authentication_failed') {
    setApiToken(null)
    if (onUnauthorized) onUnauthorized(apiError)
  }
  return apiError
}

// --- Core request --------------------------------------------------------
async function request(path, { method = 'GET', body, auth = true, onSlow } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (auth) {
    if (!authToken) {
      // Endpoint needs a token but we don't have one — treat as auth failure
      // so the caller is redirected rather than hitting the server blindly.
      const apiError = new ApiError(
        { code: 'authentication_failed', message: 'Not authenticated.' },
        401,
      )
      if (onUnauthorized) onUnauthorized(apiError)
      throw apiError
    }
    headers.Authorization = `Token ${authToken}`
  }

  // Fire onSlow(true) only if we cross the cold-start threshold, and the
  // matching onSlow(false) only if we actually signaled — so callers can keep
  // a balanced counter across several concurrent requests.
  let slowTimer
  let signaledSlow = false
  if (onSlow) {
    slowTimer = setTimeout(() => {
      signaledSlow = true
      onSlow(true)
    }, COLD_START_MS)
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    // Network / CORS / DNS failure — normalize to one shape for callers.
    throw new ApiError(
      { code: 'network_error', message: 'Could not reach the server. Check your connection and try again.' },
      0,
    )
  } finally {
    if (slowTimer) clearTimeout(slowTimer)
    if (onSlow && signaledSlow) onSlow(false)
  }

  if (!res.ok) throw await toApiError(res)
  if (res.status === 204) return null
  return res.json()
}

// --- Endpoints -----------------------------------------------------------

// POST /login — returns the token and mirrors it for subsequent authed calls.
export async function login(username, password, { onSlow } = {}) {
  const data = await request('/login', {
    method: 'POST',
    body: { username, password },
    auth: false,
    onSlow,
  })
  setApiToken(data.token)
  return data.token
}

// GET /dashboard — summary stats.
export function getDashboard({ onSlow } = {}) {
  return request('/dashboard', { onSlow })
}

// GET /segments — list all pipeline segments.
export function getSegments({ onSlow } = {}) {
  return request('/segments', { onSlow })
}

// GET /segments/{id} — full detail on one segment.
export function getSegment(id, { onSlow } = {}) {
  return request(`/segments/${id}`, { onSlow })
}

// POST /risk-assess — submit a segment, get back a risk assessment.
// `segment` is the request body; only { segment_code } is strictly required.
export function runAssessment(segment, { onSlow } = {}) {
  return request('/risk-assess', { method: 'POST', body: segment, onSlow })
}
