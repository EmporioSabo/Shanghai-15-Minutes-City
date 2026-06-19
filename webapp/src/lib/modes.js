// Maps effectiveMode → short-key suffix in h3_scores.json
export const MODE_SUFFIX = {
  walk:    '',
  bike:    '_bk',
  transit: '_tr',
  car:     '_car',
}

// Returns the h3_scores.json field name for a given indicator + mode.
// effectiveMode: 'walk'|'bike'|'transit'|'car'  (not 'baseline')
export function subfield(indicator, effectiveMode) {
  return indicator + (MODE_SUFFIX[effectiveMode] ?? '')
}

// Returns the subscore for an indicator given the current view's effective mode.
// 'baseline' → average of walk + bike per indicator (mirrors how score_baseline is computed).
// Other modes → direct subscore lookup.
export function getIndicatorScore(hex, indicator, effectiveMode) {
  if (effectiveMode === 'baseline') {
    return ((hex[indicator] ?? 0) + (hex[`${indicator}_bk`] ?? 0)) / 2
  }
  return hex[subfield(indicator, effectiveMode)] ?? 0
}

export const MODE_LABELS = {
  baseline: 'Baseline (walk+bike)',
  walk:     '🚶 Walk',
  bike:     '🚲 Bike',
  transit:  '🚇 Transit',
  car:      '🚗 Car',
}
