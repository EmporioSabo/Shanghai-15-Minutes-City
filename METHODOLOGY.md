# Methodology — The 15-Minute Shanghai Project (Track C: Affordability)

This document records the methodological choices behind the pipeline
(`01_data_collection.ipynb` → `02_grid_isochrones.ipynb` → `03_scoring_h3.ipynb`)
and the web app. It is the reference for the report and defense.

## Anchor literature

| Paper | Used for |
|---|---|
| **Mouratidis (2026)** — *The 15-minute city revisited* | Measurement method: cumulative-opportunity **levels**, inclusive 3.39 km/h walk, facility disaggregation |
| **Bruno et al. (2024)** — *A universal framework for inclusive 15-minute cities* | Amenity basket + global benchmark (Shanghai ≈30% walk / ≈55% bike) |
| **Vale & Lopes (2023)** — *Accessibility inequality across Europe* | Equity critique → Track C (accessibility vs rent, sweet spots) |
| **Zhang et al. (2022)** — *Towards a 15-minute city* | Network routing over straight-line buffers |
| **Moreno et al. (2021)** — *Introducing the '15-minute city'* | The concept; walk + bike define it |
| **Barthelemy (2026)** — *Why urban heterogeneity limits the 15-minute city* | Firm-size limit → transit read as service-access proxy, not commuting |
| **Knap et al. (2022)** — *A composite X-minute city cycling accessibility metric* | Composite-index aggregation (normalize each need → weight) |
| **OECD (2008)** — *Handbook on Constructing Composite Indicators* | Percentile-rank normalization (Track C sub-scores) |
| **Bohannon & Williams Andrews (2011)** — *Normal walking speed* | The 3.39 km/h inclusive walking speed |
| **Schuhmacher et al. (2025)** — *Cycling Speeds in Urban Traffic* (*Findings*) | Urban cycling speed range (bike = 15 km/h, conservative end) |

## Notebook 01 — Data collection

- **POI source:** 2023 AMap SHP (not the 2024 CSV — its school records were wrong; supervisor's call).
- **Daily-use whitelist:** strict midType filter → 536k of 1.49M raw POIs kept (drops parking, specialist retail, public toilets, address points, etc.).
- **Six baseline needs:** food · healthcare · education · recreation · transit · daily services.
- **Education = schools (学校) only;** private tutoring (培训机构) excluded from the baseline (Mouratidis: don't aggregate dissimilar facilities), but retained in the dataset for the Track C public-vs-private school ratio.
- **Rent:** Anjuke sale-price listings (445k), median per hex.
- **Social housing:** 114 affordable-housing communities (talent apartments, public rental, resettlement) name-matched from the 商务住宅 category of the same 2023 SHP.
- **District income/rent:** 2024 figures (Shanghai statistical communiqués + E-house/CRIC), AI-compiled, cross-checked against official anchors.

## Notebook 02 — Grid & isochrones

- **Grid:** 500 m cells, 31,445, clipped to the 16 districts — the **full administrative area** (rural Chongming / estuary kept; no inhabited-hex filter, so genuine rural gaps show honestly).
- **Routing:** graph-tool Dijkstra on the OSM road network (not straight-line buffers; Zhang et al. 2022).
- **Modes & speeds:** walk 3.39 km/h (inclusive; Mouratidis / Bohannon & Williams Andrews) · bike 15 km/h (conservative end; Schuhmacher et al. 2025) · transit 25 km/h (calibrated car-network proxy ≈ bus/BRT commercial speed) · car 30 km/h (off-peak; comparison only). Only walk + bike feed the baseline.
- **Threshold:** 15 min (900 s). Travel time = cell-snap + network + POI-snap (final leg walked).
- **Measure (Mouratidis):** cumulative opportunities — the **count** of POIs reachable within 15 min (`n_*`), per cell/mode/need. The nearest-facility time (`pt_*`) is recorded for the §4d validation only.
- **Employment:** 公司企业 added as a transit-mode Track-C input (not a baseline need).

## Notebook 03 — Scoring & H3 aggregation

**Per-need accessibility score — Mouratidis cumulative-opportunity levels** (absolute, mode-independent):

```
POIs reachable in 15 min  ->  score
        0                     0.00  (none)
        1                     0.25  (low)
        2 – 4                 0.50  (medium)
        5 – 10                0.75  (high)
        11+                   1.00  (very high)
```

Absolute thresholds keep scores comparable across modes (verified gradient:
walk 0.15 < bike 0.40 < transit 0.51 < car 0.54), give any reachable facility ≥ 0.25,
0 for none, and are graded (not a binary reachable/not).

- **Mode composite** = mean of the 6 need-levels (equal weights — no Shanghai trip-frequency data; the OECD default).
- **Baseline** = (walk + bike) / 2 (non-car; Moreno et al. 2021). Transit/car composites are shown for comparison only.
- **H3 aggregation:** resolution 8 (~0.56 km², 14,227 hexes) — finer than r7.

### Track C — Affordability (weighted index; 7 of 8 brief indicators)

```
track_c = 0.25 baseline + 0.20 rent + 0.15 income/rent + 0.12 employment
        + 0.10 social_housing + 0.08 free_amenity + 0.05 clinic + 0.05 school
```

| Sub-score | Normalization |
|---|---|
| rent | inverted percentile rank (sale price/m²) |
| income/rent | min–max across the 16 districts |
| social_housing | inverted distance-percentile to nearest affordable community |
| employment | transit cumulative-opportunity level |
| free_amenity / clinic / school | percentile rank |

Percentile-rank / min–max normalization follows the composite-indicator
convention (OECD 2008; Knap et al. 2022). **Food-basket cost** (8th brief
indicator) is excluded — Shanghai food prices vary <10% across districts, so
there is no hex-level signal.

## Web app

React + deck.gl `H3HexagonLayer`; **5-class classified choropleth** (Mouratidis-style
display: very low / low / medium / high / very high). Features: mode toggle ·
baseline vs Track C · hex detail panel · "where to live" recommender ·
data-transparency modal. Labels: accessibility = "cumulative-opportunity levels";
Track C = "percentile-ranked".

## Deliberate stances (where this project diverges from a binary-style approach — on purpose)

| Choice | Rationale |
|---|---|
| **Graded levels** (not binary "≥1 = full credit") | More discriminating; harder to game |
| **Full administrative coverage** (no inhabited-hex filter) | Shows genuine rural access gaps honestly |
| **Strict daily-use POI whitelist** (not broad regex) | Bruno's "daily / frequent use" principle |
| **H3 r8** (not r7) | Finer spatial detail |
| **Inclusive 3.39 km/h walk** (not 4.8) | Age-inclusive (Mouratidis) |

Net effect: a deliberately **conservative, honest** map (redder, especially rural)
rather than an optimistic one.

## Known limitations

- Transit and car speeds are documented approximations (calibrated proxy / off-peak), but neither feeds the baseline.
- Anjuke listings are sale prices, not rental; inner-district coverage is denser than the periphery.
- Income/rent ratio is district-level (16 values) assigned to hexes by point-in-polygon.
- Social-housing is a name-matched proximity proxy (undercounts neutral-named developments; skews to 人才公寓).
- POI data is a 2023 snapshot; the road network omits some pedestrian paths.

---
*Pipeline: `01_data_collection.ipynb` → `02_grid_isochrones.ipynb` → `03_scoring_h3.ipynb` → `cache/scored_h3.geojson` → `webapp/`*
