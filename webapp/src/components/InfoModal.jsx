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
        <p><strong>Proximity Time (PT):</strong> Network travel time to the <em>nearest</em> POI per indicator (k=1), capped at 900 s (15 min). Computed for walk, bike, transit and car modes via Dijkstra on the OSM road graph.</p>
        <p><strong>Accessibility score:</strong> <code>max(0, 1 − PT / 900)</code> — maps 0 s → 1.0, 900 s → 0.0.</p>
        <p><strong>Baseline composite:</strong> Average of walk and bike scores across 6 indicators (food, healthcare, education, recreation, transit stops, daily services). Car isochrones are included for comparison only and do not feed the baseline.</p>
        <p><strong>Track C (Affordability):</strong> A 7-indicator composite —
          <code>0.25 × baseline + 0.20 × rent + 0.15 × income/rent + 0.12 × jobs-by-transit + 0.10 × social-housing + 0.08 × free-amenities + 0.05 × clinics + 0.05 × public-schools</code>.
          Rent is the inverted percentile of median Anjuke price/m²; income/rent is the district disposable-income-to-rent ratio; social-housing is proximity to the nearest affordable-housing community.</p>
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
        <p>Bruno et al. (2024). A universal framework for inclusive 15-minute cities. <em>Nature Cities</em>, 1, 633–641.</p>
        <p>Vale &amp; Lopes (2023). Accessibility inequality across Europe. <em>npj Urban Sustainability</em>, 3, 55.</p>
        <p>Zhang et al. (2022). Towards a 15-minute city: a network-based evaluation framework. <em>Environment and Planning B</em>, 50, 500–514.</p>
      </div>
    </div>
  )
}
