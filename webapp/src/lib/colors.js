// RdYlGn 5-stop ColorBrewer scale — colorblind-safe for scoring maps
const STOPS = [
  [215,  25,  28],  // 0.00 — red
  [253, 174,  97],  // 0.25 — orange
  [255, 255, 191],  // 0.50 — yellow
  [166, 217, 106],  // 0.75 — light green
  [ 26, 150,  65],  // 1.00 — green
]

function lerp(a, b, t) { return a + (b - a) * t }

export function scoreToRgb(score) {
  if (score === null || score === undefined) return [180, 180, 180]
  const t = Math.max(0, Math.min(1, score))
  const segment = t * (STOPS.length - 1)
  const lo = Math.floor(segment)
  const hi = Math.min(lo + 1, STOPS.length - 1)
  const u = segment - lo
  return STOPS[lo].map((c, i) => Math.round(lerp(c, STOPS[hi][i], u)))
}

export function scoreToColor(score, alpha = 210) {
  return [...scoreToRgb(score), alpha]
}

export function scoreToHex(score) {
  const [r, g, b] = scoreToRgb(score)
  return `rgb(${r},${g},${b})`
}

// ── Mouratidis-style 5-class classification of a 0–1 score ───────────────────
// Snaps a continuous composite to one of 5 discrete accessibility classes, each
// coloured by the matching RdYlGn stop (classified choropleth, like Mouratidis).
export const SCORE_CLASSES = [
  { label: 'Very low',  range: '0–20%',   rgb: STOPS[0] },
  { label: 'Low',       range: '20–40%',  rgb: STOPS[1] },
  { label: 'Medium',    range: '40–60%',  rgb: STOPS[2] },
  { label: 'High',      range: '60–80%',  rgb: STOPS[3] },
  { label: 'Very high', range: '80–100%', rgb: STOPS[4] },
]

function classIndex(score) {
  if (score === null || score === undefined) return -1
  const t = Math.max(0, Math.min(1, score))
  return Math.min(Math.floor(t * 5), 4)   // [0,.2)->0 … [.8,1]->4
}

export function scoreToClassRgb(score) {
  const i = classIndex(score)
  return i < 0 ? [180, 180, 180] : SCORE_CLASSES[i].rgb
}

export function scoreToClassColor(score, alpha = 210) {
  const i = classIndex(score)
  return i < 0 ? [200, 200, 200, 60] : [...SCORE_CLASSES[i].rgb, alpha]
}

export function getRentBand(rent) {
  if (rent === null || rent === undefined) return 'No listing data'
  if (rent < 30000)  return 'Affordable  (<¥30k/m²)'
  if (rent < 60000)  return 'Mid-range  (¥30–60k/m²)'
  if (rent < 100000) return 'Premium  (¥60–100k/m²)'
  return 'Luxury  (>¥100k/m²)'
}
