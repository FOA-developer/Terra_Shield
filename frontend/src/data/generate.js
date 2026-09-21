// Deterministic seeded fake data, ported 1:1 from the Claude Design prototype
// so the simulated network looks the same across reloads.

export const HIGH_RISK_THRESHOLD = 80

function makeRng(seed) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

export function generateData() {
  const rng = makeRng(20260912)
  const pipes = ['Trans-Niger Line', 'Bomu–Bonny Line', 'Ogale Spur', 'Kolo Creek Line', 'Nembe Trunk']
  const locs = ['Bayelsa State', 'Rivers State', 'Delta State', 'Akwa Ibom State', 'Imo State']
  const coats = ['Fusion Bonded Epoxy', 'Coal Tar Enamel', '3-Layer Polyethylene']
  const statuses = ['Active', 'Active', 'Active', 'Active', 'Monitoring', 'Under Repair']
  const mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const raw = []
  for (let i = 0; i < 128; i++) {
    let score
    if (i < 18) score = 80 + Math.floor(rng() * 18)
    else if (i < 55) score = 50 + Math.floor(rng() * 29)
    else score = 12 + Math.floor(rng() * 37)
    raw.push(score)
  }
  for (let i = raw.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const t = raw[i]; raw[i] = raw[j]; raw[j] = t
  }

  const counts = [0, 0, 0, 0, 0]
  const segments = raw.map((score, i) => {
    const p = i % 5
    counts[p]++
    const y = 2025 + Math.floor(rng() * 2)
    const m = Math.floor(rng() * 12)
    return {
      id: 'PL-0' + (p + 1) + '-SG-' + String(counts[p]).padStart(2, '0'),
      pipeline: pipes[p],
      score,
      status: pick(rng, statuses),
      location: locs[p],
      lengthKm: (4 + rng() * 16).toFixed(1) + ' km',
      diameter: pick(rng, ['12 in', '16 in', '20 in', '24 in']),
      installDate: mo[Math.floor(rng() * 12)] + ' ' + (1978 + Math.floor(rng() * 34)),
      coating: pick(rng, coats),
      depth: (0.9 + rng() * 1.6).toFixed(1) + ' m',
      last: String(1 + Math.floor(rng() * 28)).padStart(2, '0') + ' ' + mo[m] + ' ' + y,
      fseed: rng(),
    }
  })

  const itypes = ['Vandalism', 'Crude Theft', 'Corrosion Leak', 'Third-Party Interference', 'Equipment Failure', 'Illegal Tapping', 'Flood Exposure']
  const istat = ['Open', 'Under Investigation', 'Resolved']
  const incidents = []
  for (let i = 0; i < 28; i++) {
    const sg = pick(rng, segments)
    const sev = sg.score >= 80 ? (rng() > 0.3 ? 'High' : 'Medium')
      : sg.score >= 50 ? (rng() > 0.5 ? 'Medium' : 'Low')
      : (rng() > 0.8 ? 'Medium' : 'Low')
    incidents.push({
      ref: 'INC-' + (2451 + i * 7),
      type: pick(rng, itypes),
      seg: sg.id,
      pipeline: sg.pipeline,
      segRef: sg.id,
      date: String(1 + Math.floor(rng() * 28)).padStart(2, '0') + ' ' + mo[Math.floor(rng() * 9)] + ' 2026',
      sev,
      status: pick(rng, istat),
    })
  }

  const amsg = [
    'Risk score increased above high threshold',
    'Pressure drop anomaly detected on segment',
    'Scheduled inspection overdue by 14 days',
    'CCTV motion detected inside right-of-way',
    'Flow imbalance suggests possible tapping',
    'Flood exposure forecast for low-elevation run',
    'Coating degradation reported by field crew',
    'Third-party excavation logged near route',
  ]
  const alerts = []
  for (let i = 0; i < 32; i++) {
    const sg = pick(rng, segments)
    const sev = sg.score >= 80 ? 'High' : sg.score >= 50 ? 'Medium' : 'Low'
    const att = rng() > 0.42 ? 'Attended' : (rng() > 0.5 ? 'Unattended' : 'Pending')
    alerts.push({
      message: pick(rng, amsg),
      seg: sg.id,
      segRef: sg.id,
      ts: String(1 + Math.floor(rng() * 12)).padStart(2, '0') + ' Sep 2026 · ' + String(Math.floor(rng() * 24)).padStart(2, '0') + ':' + String(Math.floor(rng() * 60)).padStart(2, '0'),
      sev,
      att,
      rating: att === 'Attended' ? 2 + Math.floor(rng() * 4) : 0,
    })
  }

  return { pipes, locs, segments, incidents, alerts }
}

export function levelOf(score, threshold = HIGH_RISK_THRESHOLD) {
  return score >= threshold ? 'High' : score >= 50 ? 'Medium' : 'Low'
}

export function trendFor(seg) {
  const drift = seg.fseed * 18 - 9
  const vals = [0, 1, 2, 3, 4, 5].map((i) => {
    const v = Math.max(8, Math.min(98, Math.round(
      seg.score - (5 - i) * (4 + seg.fseed * 4) + Math.sin(i * 1.7 + seg.fseed * 6) * 5 + drift * 0.2
    )))
    return i === 5 ? seg.score : v
  })
  const labels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
  const xs = vals.map((_, i) => 70 + i * 100)
  const ys = vals.map((v) => Math.round(190 - (v / 100) * 170))
  return { vals, labels, xs, ys }
}
