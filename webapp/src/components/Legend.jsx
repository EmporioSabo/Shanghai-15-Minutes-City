import { scoreToHex } from '../lib/colors.js'

const TICKS = [0, 0.25, 0.5, 0.75, 1.0]

const FIELD_LABELS = {
  base: 'Baseline (walk+bike avg)',
  wk:   'Walk composite',
  bk:   'Bike composite',
  tr:   'Transit composite',
  car:  'Car composite',
  tc:   'Track C score',
}

export default function Legend({ activeField }) {
  return (
    <div className="legend">
      <span className="legend-title">
        {FIELD_LABELS[activeField] ?? 'Score'}
      </span>
      <div className="legend-gradient">
        {TICKS.map(t => (
          <div key={t} className="legend-tick">
            <div className="legend-swatch" style={{ background: scoreToHex(t) }} />
            <span>{(t * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
      <div className="legend-extras">
        <div className="legend-extra-item">
          <div className="legend-swatch" style={{ background: '#ffd60a' }} />
          <span>Sweet spot</span>
        </div>
        <div className="legend-extra-item">
          <div className="legend-swatch" style={{ background: '#ff6b35' }} />
          <span>Top 10 recommended</span>
        </div>
      </div>
    </div>
  )
}
