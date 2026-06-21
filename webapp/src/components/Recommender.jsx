import { getIndicatorScore, MODE_LABELS } from '../lib/modes.js'

const PRIORITIES = [
  { key: 'food',          label: 'Food & dining',  ind: 'food'   },
  { key: 'health',        label: 'Healthcare',     ind: 'health' },
  { key: 'edu',           label: 'Education',      ind: 'edu'    },
  { key: 'rec',           label: 'Recreation',     ind: 'rec'    },
  { key: 'transit',       label: 'Transit stops',  ind: 'tran'   },
  { key: 'affordability', label: 'Affordability',  ind: null     },  // always uses raf
]

const VIEW_METHOD = {
  baseline: 'Walk + bike avg per indicator',
  track_c:  'Walk + bike avg (baseline component)',
  walk:     'Walk-mode subscores',
  bike:     'Bike-mode subscores',
  transit:  'Transit-mode subscores (comparison)',
  car:      'Car-mode subscores (comparison)',
}

function RentLabel({ rent }) {
  if (!rent) return <span className="rent-na">rent n/a</span>
  return <span>¥{(rent / 1000).toFixed(0)}k/m²</span>
}

export default function Recommender({ sliders, setSliders, onRecommend, onClear, onFlyTo, topHexList, active, effectiveMode, viewKey }) {
  const total = Object.values(sliders).reduce((a, b) => a + b, 0) || 1

  return (
    <section className="recommender">
      <h3>Where to live?</h3>

      <div className="rec-method-box">
        <p className="rec-method-title">{MODE_LABELS[effectiveMode]}</p>
        <p className="rec-method-body">{VIEW_METHOD[viewKey]} · affordability blends rent, income/rent &amp; social housing (mode-independent).</p>
      </div>

      <p className="rec-hint">Adjust weights, then find your top 10 hexes.</p>

      {PRIORITIES.map(p => {
        const w = sliders[p.key]
        const pct = total > 0 ? ((w / total) * 100).toFixed(0) : 0
        return (
          <div key={p.key} className="slider-row">
            <span className="slider-label">{p.label}</span>
            <input
              type="range" min={0} max={100}
              value={w}
              onChange={e => setSliders(prev => ({ ...prev, [p.key]: +e.target.value }))}
            />
            <span className="slider-val">{pct}%</span>
          </div>
        )
      })}

      <div className="rec-actions">
        <button className="btn-primary" onClick={onRecommend}>
          {active ? 'Recalculate →' : 'Find top 10 hexes →'}
        </button>
        {active && (
          <button className="btn-ghost" onClick={onClear}>Clear</button>
        )}
      </div>

      {topHexList.length > 0 && (
        <div className="top-hex-list">
          <p className="top-list-header">Top 10 · {MODE_LABELS[effectiveMode]} · click ↗ to fly</p>
          {topHexList.map(hex => (
            <div key={hex.id} className="top-hex-item">
              <span className="top-rank">#{hex.rank}</span>
              <div className="top-scores">
                <span className="top-score-pct">{(hex.recScore * 100).toFixed(0)}%</span>
                <span className="top-score-rent">
                  <RentLabel rent={hex.rent} />
                  {hex.ss === 1 && <span className="top-sweet">✨</span>}
                </span>
              </div>
              <button className="fly-btn" onClick={() => onFlyTo(hex.lat, hex.lng)} title="Fly to this location">↗</button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
