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

export function factorsFor(seg) {
  const base = [
    ['Previous vandalism incidents', 35],
    ['Proximity to access road', 25],
    ['Low elevation (flood prone)', 22],
    ['Historical spill activity', 12],
    ['Coating condition', 6],
  ]
  const k = seg.fseed
  return base
    .map(([name, weight], i) => ({ name, pct: Math.max(3, Math.round(weight * (0.75 + k * 0.5) - i)) }))
    .sort((a, b) => b.pct - a.pct)
}

export function explanationFor(seg, level) {
  if (level === 'High') {
    return `This segment scores ${seg.score}/100 because of a combination of past vandalism incidents along this run, close proximity to an access road, and low elevation that increases flood exposure. Historical spill activity in the surrounding area raises the likelihood that interference here goes unnoticed between inspections.`
  }
  if (level === 'Medium') {
    return `This segment scores ${seg.score}/100. Coating condition and elevation are within tolerance, but the interval since the last inspection and moderate third-party activity nearby keep it above the low-risk band. Routine monitoring is sufficient for now.`
  }
  return `This segment scores ${seg.score}/100. Coating condition, depth of cover and surrounding activity are all favourable, and no incidents have been recorded on this run in the current reporting period.`
}

export function actionsFor(level) {
  if (level === 'High') {
    return ['Schedule a physical inspection within 7 days.', 'Increase surveillance and patrol frequency on this run.', 'Monitor for abnormal pressure and flow readings.']
  }
  if (level === 'Medium') {
    return ['Add to the next scheduled inspection cycle.', 'Review CCTV coverage along the right-of-way.', 'Re-score after the next sensor upload.']
  }
  return ['No action required — keep on the standard inspection cycle.', 'Re-score automatically after the next data refresh.']
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
