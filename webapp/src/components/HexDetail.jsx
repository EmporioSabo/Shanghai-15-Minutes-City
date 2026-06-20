import { scoreToHex, getRentBand } from '../lib/colors.js'
import { getIndicatorScore } from '../lib/modes.js'

const INDICATORS = [
  { key: 'food',   label: 'Food & dining' },
  { key: 'health', label: 'Healthcare' },
  { key: 'edu',    label: 'Education' },
  { key: 'rec',    label: 'Recreation' },
  { key: 'tran',   label: 'Transit stops' },
  { key: 'daily',  label: 'Daily services' },
]

const SUBSCORE_LABEL = {
  baseline: 'Walk + bike avg',
  walk:     '🚶 Walk',
  bike:     '🚲 Bike',
  transit:  '🚇 Transit',
  car:      '🚗 Car',
}

// Track C affordability & equity sub-scores (direct hex fields, 0–1, mode-independent)
const TRACK_C_SUBS = [
  { key: 'raf', label: 'Low rent' },
  { key: 'ir',  label: 'Income vs rent' },
  { key: 'sh',  label: 'Social housing' },
  { key: 'et',  label: 'Jobs by transit' },
  { key: 'fa',  label: 'Free amenities' },
  { key: 'cr',  label: 'Clinics' },
  { key: 'sp',  label: 'Public schools' },
]

export default function HexDetail({ hex, effectiveMode, viewKey, onClose }) {
  const pct = v => ((v ?? 0) * 100).toFixed(0)

  return (
    <section className="hex-detail">
      <div className="hex-detail-header">
        <h3>Selected hex</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <p className="detail-mode-label">
        Subscores: <strong>{SUBSCORE_LABEL[effectiveMode]}</strong>
        {viewKey === 'track_c' && <span className="detail-mode-note"> (baseline component)</span>}
      </p>

      <div className="detail-indicators">
        {INDICATORS.map(ind => {
          const score = getIndicatorScore(hex, ind.key, effectiveMode)
          return (
            <div key={ind.key} className="ind-row">
              <span className="ind-label">{ind.label}</span>
              <div className="ind-track">
                <div
                  className="ind-fill"
                  style={{
                    width: `${pct(score)}%`,
                    background: scoreToHex(score ?? 0),
                  }}
                />
              </div>
              <span className="ind-val">{pct(score)}%</span>
            </div>
          )
        })}
      </div>

      <p className="detail-mode-label detail-section-head">
        Affordability &amp; equity <span className="detail-mode-note">(Track C · mode-independent)</span>
      </p>
      <div className="detail-indicators">
        {TRACK_C_SUBS.map(sub => {
          const score = hex[sub.key]
          return (
            <div key={sub.key} className="ind-row">
              <span className="ind-label">{sub.label}</span>
              <div className="ind-track">
                <div
                  className="ind-fill"
                  style={{
                    width: `${pct(score)}%`,
                    background: scoreToHex(score ?? 0),
                  }}
                />
              </div>
              <span className="ind-val">{pct(score)}%</span>
            </div>
          )
        })}
      </div>

      <div className="detail-meta">
        <div className="meta-row">
          <span>Baseline (walk+bike avg)</span>
          <strong>{pct(hex.base)}%</strong>
        </div>
        <div className="meta-row">
          <span>Track C composite</span>
          <strong>{pct(hex.tc)}%</strong>
        </div>
        <div className="meta-row">
          <span>Rent band</span>
          <strong>{getRentBand(hex.rent)}</strong>
        </div>
      </div>

      {hex.ss === 1 && (
        <div className="sweet-badge">✨ Sweet spot — high baseline access, below-predicted rent</div>
      )}
    </section>
  )
}
