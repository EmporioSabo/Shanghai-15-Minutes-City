import { SCORE_CLASSES } from '../lib/colors.js'

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
        {FIELD_LABELS[activeField] ?? 'Score'} · 5 classes
      </span>
      <div className="legend-classes">
        {SCORE_CLASSES.map(c => (
          <div key={c.label} className="legend-extra-item">
            <div className="legend-swatch" style={{ background: `rgb(${c.rgb.join(',')})` }} />
            <span>{c.label} <span className="hint-text">({c.range})</span></span>
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
