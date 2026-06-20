export default function InfoModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Data &amp; Methodology</h2>

        <h3>Data sources</h3>
        <table className="info-table">
          <thead>
            <tr><th>Dataset</th><th>Source</th><th>Date</th></tr>
          </thead>
          <tbody>
            <tr><td>POI — 536k records, 6 categories</td><td>AMap (高德) SHP export via UTSEUS</td><td>2023</td></tr>
            <tr><td>Road network — 156k directed edges</td><td>OpenStreetMap via UTSEUS</td><td>2023</td></tr>
            <tr><td>Real estate prices — 445k listings</td><td>Anjuke.com via UTSEUS</td><td>pre-2024</td></tr>
            <tr><td>Social housing — 114 communities</td><td>Name-matched from AMap 商务住宅 (2023 SHP)</td><td>2023</td></tr>
            <tr><td>District income &amp; rent (16 districts)</td><td>Shanghai stats bureau · E-house/CRIC</td><td>2024</td></tr>
            <tr><td>Admin boundaries (neighbourhoods &amp; districts)</td><td>UTSEUS / OpenStreetMap</td><td>2023</td></tr>
          </tbody>
        </table>

        <h3>Methodology</h3>
        <p><strong>Grid:</strong> 500 m square cells (31,445 total) clipped to Shanghai boundary.</p>
        <p><strong>Accessibility — cumulative opportunities</strong> (Mouratidis, 2026): for each cell and mode we count the POIs of each indicator reachable within a 15-minute catchment, computed via Dijkstra on the OSM road graph. Walk uses an inclusive 3.39 km/h speed (850 m/15 min); bike, transit and car are also computed.</p>
        <p><strong>Accessibility score:</strong> the reachable count is mapped to Mouratidis's accessibility <em>levels</em> with fixed thresholds — 0 → 0.00 (none), 1 → 0.25 (low), 2–4 → 0.50 (medium), 5–10 → 0.75 (high), 11+ → 1.00 (very high). Thresholds are absolute, so faster modes (which reach more) score genuinely higher; any reachable facility scores ≥0.25, and none scores 0.</p>
        <p><strong>Baseline composite:</strong> Average of walk and bike scores across 6 indicators (food, healthcare, education, recreation, transit stops, daily services). Education counts schools, not private tutoring. Car is shown for comparison only and does not feed the baseline.</p>
        <p><strong>Track C (Affordability):</strong> A 7-indicator composite —
          <code>0.25 × baseline + 0.20 × rent + 0.15 × income/rent + 0.12 × jobs-by-transit + 0.10 × social-housing + 0.08 × free-amenities + 0.05 × clinics + 0.05 × public-schools</code>.
          Rent is the inverted percentile of median Anjuke price/m²; income/rent is the district disposable-income-to-rent ratio; social-housing is proximity to the nearest affordable-housing community. Each affordability sub-score is a <strong>percentile rank</strong> across hexes (0–100%), except income/rent which is min–max across the 16 districts.</p>
        <p><strong>Map colours:</strong> hexes are shown in 5 classes — very low / low / medium / high / very high (0–20 / 20–40 / 40–60 / 60–80 / 80–100%); the tooltip shows the exact value.</p>
        <p><strong>H3 aggregation:</strong> Grid cell scores are averaged to Uber H3 resolution 8 hexagons (~0.56 km² each, 14,227 hexes cover Shanghai).</p>
        <p><strong>Sweet spots:</strong> Hexes with above-median baseline accessibility AND below-regression-predicted rent.</p>

        <h3>Limitations</h3>
        <ul>
          <li>POI data is a 2023 snapshot; openings and closures since are not reflected.</li>
          <li>Anjuke listings are sale prices (not rental); inner-district coverage is denser than periphery.</li>
          <li>Income/rent ratio is district-level (16 districts) assigned to hexes; food-basket cost was excluded (near-uniform across the city).</li>
          <li>Social-housing communities are name-matched from POI data — a proximity proxy that undercounts neutral-named developments.</li>
          <li>Road network omits some pedestrian paths and cycling infrastructure.</li>
          <li>Car mode is shown for comparison only — 15MC is defined by walk and cycling access.</li>
        </ul>

        <h3>References</h3>
        <p>Mouratidis, K. (2026). The 15-minute city revisited: a GIS approach to measuring accessibility by proximity and by public transport supply. <em>Travel Behaviour and Society</em>, 42, 101151.</p>
        <p>Bruno et al. (2024). A universal framework for inclusive 15-minute cities. <em>Nature Cities</em>, 1, 633–641.</p>
        <p>Vale &amp; Lopes (2023). Accessibility inequality across Europe. <em>npj Urban Sustainability</em>, 3, 55.</p>
        <p>Zhang et al. (2022). Towards a 15-minute city: a network-based evaluation framework. <em>Environment and Planning B</em>, 50, 500–514.</p>
      </div>
    </div>
  )
}
