import { useState, useEffect, useCallback, useMemo } from 'react'
import { FlyToInterpolator } from '@deck.gl/core'
import { cellToLatLng } from 'h3-js'
import MapView from './components/MapView.jsx'
import HexDetail from './components/HexDetail.jsx'
import Recommender from './components/Recommender.jsx'
import InfoModal from './components/InfoModal.jsx'
import Legend from './components/Legend.jsx'
import { getIndicatorScore } from './lib/modes.js'

// One flat list of views. Selecting any of them drives the map colour,
// detail-panel subscores, and recommender scoring consistently.
// 'mode' is the effectiveMode passed to subfield/getIndicatorScore helpers.
const VIEWS = [
  {
    key: 'baseline', label: 'Baseline', field: 'base', mode: 'baseline',
    hint: 'Walk + bike avg · 6 indicators · core 15MC metric',
  },
  {
    key: 'track_c', label: 'Track C', field: 'tc', mode: 'baseline',
    hint: '0.5 × baseline + 0.3 × affordability + 0.2 × transit',
  },
  {
    key: 'walk', label: '🚶 Walk', field: 'wk', mode: 'walk',
    hint: 'Walk-mode composite across 6 indicators',
  },
  {
    key: 'bike', label: '🚲 Bike', field: 'bk', mode: 'bike',
    hint: 'Bike-mode composite across 6 indicators',
  },
  {
    key: 'transit', label: '🚇 Transit', field: 'tr', mode: 'transit',
    hint: 'Transit composite across 6 indicators',
  },
  {
    key: 'car', label: '🚗 Car', field: 'car', mode: 'car',
    hint: 'Car composite · for comparison only · not part of 15MC',
  },
]

const INITIAL_VIEW = {
  longitude: 121.47,
  latitude: 31.23,
  zoom: 10,
  minZoom: 8,
  maxZoom: 15,
  pitch: 0,
  bearing: 0,
}

const DEFAULT_SLIDERS = {
  food: 50, health: 50, edu: 50, rec: 50, transit: 50, affordability: 50,
}

export default function App() {
  const [hexData,        setHexData]        = useState([])
  const [loading,        setLoading]        = useState(true)
  const [viewState,      setViewState]      = useState(INITIAL_VIEW)
  const [viewKey,        setViewKey]        = useState('baseline')
  const [selectedHex,    setSelectedHex]    = useState(null)
  const [showInfo,       setShowInfo]       = useState(false)
  const [showSweetSpots, setShowSweetSpots] = useState(false)
  const [sliders,        setSliders]        = useState(DEFAULT_SLIDERS)
  const [topHexes,       setTopHexes]       = useState(new Set())
  const [topHexList,     setTopHexList]     = useState([])

  useEffect(() => {
    fetch('/data/h3_scores.json')
      .then(r => r.json())
      .then(data => { setHexData(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Clear recommender results when view changes — scores are view-dependent
  useEffect(() => {
    setTopHexes(new Set())
    setTopHexList([])
  }, [viewKey])

  const activeView   = VIEWS.find(v => v.key === viewKey) ?? VIEWS[0]
  const activeField  = activeView.field
  const effectiveMode = activeView.mode  // passed to helpers + child components

  const handleRecommend = useCallback(() => {
    if (!hexData.length) return
    const total = Object.values(sliders).reduce((a, b) => a + b, 0) || 1
    const mode = VIEWS.find(v => v.key === viewKey)?.mode ?? 'baseline'
    const ranked = hexData
      .map(h => ({
        ...h,
        recScore: (
          getIndicatorScore(h, 'food',   mode) * sliders.food +
          getIndicatorScore(h, 'health', mode) * sliders.health +
          getIndicatorScore(h, 'edu',    mode) * sliders.edu +
          getIndicatorScore(h, 'rec',    mode) * sliders.rec +
          getIndicatorScore(h, 'tran',   mode) * sliders.transit +
          (h.raf ?? 0.5) * sliders.affordability
        ) / total,
      }))
      .sort((a, b) => b.recScore - a.recScore)

    const top10 = ranked.slice(0, 10)
    setTopHexes(new Set(top10.map(h => h.id)))

    const enriched = top10.map((h, i) => {
      const [lat, lng] = cellToLatLng(h.id)
      return { ...h, rank: i + 1, lat, lng }
    })
    setTopHexList(enriched)

    const lats = enriched.map(h => h.lat)
    const lngs = enriched.map(h => h.lng)
    const midLat = (Math.min(...lats) + Math.max(...lats)) / 2
    const midLng = (Math.min(...lngs) + Math.max(...lngs)) / 2
    const spread = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs))
    const zoom = spread < 0.04 ? 14 : spread < 0.12 ? 12.5 : spread < 0.25 ? 11.5 : 10.5

    setViewState(prev => ({
      ...prev, longitude: midLng, latitude: midLat, zoom,
      transitionDuration: 1200,
      transitionInterpolator: new FlyToInterpolator({ speed: 1.2 }),
    }))
  }, [hexData, sliders, viewKey])

  const handleFlyTo = useCallback((lat, lng) => {
    setViewState(prev => ({
      ...prev, longitude: lng, latitude: lat, zoom: 13.5,
      transitionDuration: 800,
      transitionInterpolator: new FlyToInterpolator({ speed: 1.5 }),
    }))
  }, [])

  const handleClearTop = useCallback(() => { setTopHexes(new Set()); setTopHexList([]) }, [])

  return (
    <div className="app">
      {loading && (
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Loading Shanghai data…</p>
        </div>
      )}

      <aside className="sidebar">
        <div className="sidebar-header">
          <div>
            <h1 className="app-title">Shanghai 15MC</h1>
            <p className="app-subtitle">Track C · Affordability</p>
          </div>
          <button className="icon-btn" onClick={() => setShowInfo(true)} title="Methodology">ⓘ</button>
        </div>

        {/* Single unified view selector */}
        <div className="control-block">
          <span className="control-label">Score</span>
          <div className="score-pills">
            {VIEWS.map(v => (
              <button
                key={v.key}
                className={`pill ${viewKey === v.key ? 'pill-active' : ''}`}
                onClick={() => setViewKey(v.key)}
                title={v.hint}
              >{v.label}</button>
            ))}
          </div>
          <p className="control-hint">
            {activeView.hint}
            {viewKey === 'car' && <span className="car-warning"> — not 15MC</span>}
          </p>
        </div>

        {/* Sweet spots */}
        <div className="control-block">
          <label className="checkbox-label">
            <input type="checkbox" checked={showSweetSpots} onChange={e => setShowSweetSpots(e.target.checked)} />
            <span className="sweet-dot" />
            Highlight sweet spots
            <span className="hint-text"> · baseline: high access + low rent</span>
          </label>
        </div>

        <div className="divider" />

        <Recommender
          sliders={sliders}
          setSliders={setSliders}
          onRecommend={handleRecommend}
          onClear={handleClearTop}
          onFlyTo={handleFlyTo}
          topHexList={topHexList}
          active={topHexes.size > 0}
          effectiveMode={effectiveMode}
          viewKey={viewKey}
        />

        <div className="divider" />

        {selectedHex
          ? <HexDetail hex={selectedHex} effectiveMode={effectiveMode} viewKey={viewKey} onClose={() => setSelectedHex(null)} />
          : <p className="map-hint">Click a hex on the map to see details</p>
        }

        <div className="divider" />
        <Legend activeField={activeField} />

        <div className="sidebar-footer">
          <span>Data: AMap 2023 · Anjuke · OSM</span>
        </div>
      </aside>

      <div className="map-container">
        <MapView
          hexData={hexData}
          activeField={activeField}
          topHexes={topHexes}
          showSweetSpots={showSweetSpots}
          viewState={viewState}
          onViewStateChange={setViewState}
          onHexClick={setSelectedHex}
        />
      </div>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  )
}
