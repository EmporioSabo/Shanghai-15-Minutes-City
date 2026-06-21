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
            <tr><td>Road network — 156k edges (undirected)</td><td>OpenStreetMap via UTSEUS</td><td>2023</td></tr>
            <tr><td>Education — kindergarten + K-12 census</td><td>EDU 2026 (AMap API)</td><td>2026</td></tr>
            <tr><td>Real estate prices — 445k listings</td><td>Anjuke.com via UTSEUS</td><td>pre-2024</td></tr>
            <tr><td>Social housing — 203 communities</td><td>上海市房屋管理局 公示 + AMap (2023 SHP)</td><td>2024</td></tr>
            <tr><td>Public/private schools · community health · food-basket prices</td><td>上海市教委 · 卫健委 · 区发改委 价格监测</td><td>2024–26</td></tr>
            <tr><td>District income (9 official 公报 + 7 city-proxy) · rent</td><td>区统计公报 · tjj.sh.gov.cn · E-house/CRIC</td><td>2024</td></tr>
            <tr><td>Admin boundaries (neighbourhoods &amp; districts)</td><td>UTSEUS / OpenStreetMap</td><td>2023</td></tr>
          </tbody>
        </table>

        <h3>Methodology</h3>
        <p><strong>Grid:</strong> 500 m square cells (31,445 total) clipped to Shanghai boundary.</p>
        <p><strong>Accessibility — cumulative opportunities</strong> (Mouratidis, 2026): for each cell and mode we count the POIs of each indicator reachable within a 15-minute catchment, computed via Dijkstra on the (undirected) OSM road graph. Walk uses an inclusive 3.39 km/h speed (850 m/15 min); bike 15 km/h; transit is routed on the <strong>real metro network</strong> (OSM lines + stations, 35 km/h, ½-headway wait, 5-min transfer — all literature-sourced). <strong>Transit and car remain comparison layers</strong> — the 15-minute city is defined by active travel, and at a 15-min budget even real metro adds little over walking (~5 stops once access + waiting are deducted), so neither feeds the baseline.</p>
        <p><strong>Accessibility score:</strong> the reachable count is mapped to Mouratidis's accessibility <em>levels</em> with fixed thresholds — 0 → 0.00 (none), 1 → 0.25 (low), 2–4 → 0.50 (medium), 5–10 → 0.75 (high), 11+ → 1.00 (very high). Thresholds are absolute, so faster modes (which reach more) score genuinely higher; any reachable facility scores ≥0.25, and none scores 0.</p>
        <p><strong>Baseline composite:</strong> Average of walk and bike scores across 6 indicators (food, healthcare, education, recreation, transit stops, daily services). Education uses the EDU 2026 kindergarten + K-12 census, not private tutoring. Note: the <em>transit-stops</em> indicator measures whether you can <em>walk/bike to</em> a stop (network access) — distinct from travelling <em>by</em> transit, which is comparison-only.</p>
        <p><strong>Track C (Affordability):</strong> An 8-indicator composite —
          <code>0.25 × baseline + 0.20 × rent + 0.15 × income/rent + 0.10 × jobs-by-transit + 0.10 × social-housing + 0.05 × (free-amenities + food-basket + clinics + public-schools)</code>.
          Housing cost (the <em>rent proxy</em>) is the inverted percentile of median Anjuke <strong>sale</strong> price/m² — distinct from <em>income/rent</em>, which uses district disposable income ÷ monthly <strong>rental</strong>; social-housing is proximity to the nearest affordable-housing community; food-basket is the cheapest grocery channel reachable on foot or by bike; clinics &amp; schools are real public-vs-private ratios (官方 registries). Sub-scores are <strong>percentile rank</strong> across hexes, except income/rent and clinics which are min–max across the 16 districts.</p>
        <p><strong>Map colours:</strong> hexes are shown in 5 classes — very low / low / medium / high / very high (0–20 / 20–40 / 40–60 / 60–80 / 80–100%); the tooltip shows the exact value.</p>
        <p><strong>H3 aggregation:</strong> Grid cell scores are averaged to Uber H3 resolution 8 hexagons (~0.56 km² each, 14,227 hexes cover Shanghai).</p>
        <p><strong>Sweet spots:</strong> Hexes with above-median baseline accessibility AND below-regression-predicted rent.</p>

        <h3>Limitations</h3>
        <ul>
          <li>POI data is a 2023 snapshot; openings and closures since are not reflected.</li>
          <li>Anjuke listings are sale prices (not rental); inner-district coverage is denser than periphery.</li>
          <li>Income/rent ratio and community-health access are district-level (16 districts) assigned to hexes.</li>
          <li>Food-basket cost is modelled as the cheapest grocery channel reachable on foot/bike (官方 发改委 channel prices), not a per-district price — within-city staple prices are near-uniform.</li>
          <li>Social housing merges 官方 2024 project lists with name-matched POI communities — a proximity proxy that still undercounts some developments.</li>
          <li><strong>Transit and car are comparison layers only</strong> — 15MC is defined by walk + cycling access. Transit <em>is</em> modelled with a real metro router (OSM network; 35 km/h, ½-headway wait, 5-min transfer), but we keep it out of the baseline on principle: at a 15-min budget the literature shows transit job/opportunity access is dominated by walking and standard cutoffs are 30–60 min (Goliszek 2020; Kapatsila 2023; Deboosere &amp; El-Geneidy 2018). Employment-by-transit (#4) is implemented per the brief with this documented caveat.</li>
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
