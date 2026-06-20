import { useMemo } from 'react'
import DeckGL from '@deck.gl/react'
import { H3HexagonLayer } from '@deck.gl/geo-layers'
import Map from 'react-map-gl/maplibre'
import { scoreToClassColor, scoreToClassRgb } from '../lib/colors.js'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

const SWEET_COLOR = [255, 214,   0, 230]
const TOP_COLOR   = [255, 107,  53, 255]
const NO_DATA     = [200, 200, 200,  60]

export default function MapView({ hexData, activeField, topHexes, showSweetSpots, viewState, onViewStateChange, onHexClick }) {
  const recommenderActive = topHexes.size > 0

  const layer = useMemo(() => new H3HexagonLayer({
    id: 'h3-hex',
    data: hexData,
    getHexagon: d => d.id,
    getFillColor: d => {
      // Top-10 hex: bright orange, full opacity
      if (topHexes.has(d.id)) return TOP_COLOR

      // When recommender is active, dim everything else dramatically
      if (recommenderActive) {
        if (showSweetSpots && d.ss) return [255, 214, 0, 50]
        const v = d[activeField]
        if (v === null) return [200, 200, 200, 15]
        return [...scoreToClassRgb(v), 28]
      }

      // Normal rendering — 5-class classified choropleth (Mouratidis-style)
      if (showSweetSpots && d.ss) return SWEET_COLOR
      const v = d[activeField]
      return v === null ? NO_DATA : scoreToClassColor(v)
    },
    getLineColor: d => recommenderActive && !topHexes.has(d.id)
      ? [0, 0, 0, 0]
      : [255, 255, 255, 35],
    lineWidthMinPixels: 0.4,
    pickable: true,
    autoHighlight: true,
    highlightColor: [255, 255, 255, 80],
    onClick: ({ object }) => onHexClick(object ?? null),
    transitions: { getFillColor: { duration: 400 } },
    updateTriggers: {
      getFillColor: [activeField, topHexes, showSweetSpots, recommenderActive],
      getLineColor: [topHexes, recommenderActive],
    },
  }), [hexData, activeField, topHexes, showSweetSpots, recommenderActive, onHexClick])

  return (
    <DeckGL
      viewState={viewState}
      onViewStateChange={({ viewState: vs }) => onViewStateChange(vs)}
      controller={{ doubleClickZoom: false }}
      layers={[layer]}
      getTooltip={({ object }) =>
        object && {
          html: `<div style="padding:6px 10px;font-size:12px;line-height:1.5">
            <b style="color:#ff6b35">${topHexes.has(object.id) ? '★ Top pick' : ''}</b>
            ${topHexes.has(object.id) ? '<br/>' : ''}
            Score: <b>${((object[activeField] ?? 0) * 100).toFixed(1)}%</b>
            ${object.rent ? `<br/>Rent: ¥${(object.rent / 1000).toFixed(0)}k/m²` : ''}
            ${object.ss ? '<br/>✨ Sweet spot' : ''}
          </div>`,
          style: {
            background: 'rgba(15,15,15,0.85)',
            color: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          },
        }
      }
    >
      <Map mapStyle={MAP_STYLE} reuseMaps />
    </DeckGL>
  )
}
