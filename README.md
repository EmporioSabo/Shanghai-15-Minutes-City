# The 15-Minute Shanghai Project — Track C: Affordability

A reproducible geospatial pipeline and public web app assessing **livability across
Shanghai** through the *15-minute city* (15MC) lens, with an affordability focus
(Track C): **is the 15-minute city only for the rich, or are there high-amenity,
low-cost corridors?**

🌐 **Live app:** https://shanghai-15mc.vercel.app
📓 **Notebooks:** [`01_data_collection`](01_data_collection.ipynb) → [`02_grid_isochrones`](02_grid_isochrones.ipynb) → [`03_scoring_h3`](03_scoring_h3.ipynb)
📐 **Methodology + citations:** [`METHODOLOGY.md`](METHODOLOGY.md)

---

## What it does

1. Builds a **500 m grid** over the 16 districts (~31,445 cells).
2. Computes **15-minute reachability** for **4 modes** (walk, bike, transit, car) via
   Dijkstra on the OSM road network — transit is a **real metro router** (OSM lines +
   stations, 35 km/h, ½-headway wait, 5-min transfers).
3. Scores every cell on **6 universal needs** (food, healthcare, education, recreation,
   transit stops, daily services) using **cumulative-opportunity levels** (Mouratidis 2026).
4. Adds the **8 Track C affordability indicators** (rent, income/rent, jobs-by-transit,
   social housing, free amenities, food-basket, public clinics, public schools).
5. Aggregates to **Uber H3 r8** hexagons (14,227) and ships an interactive choropleth.

**The 15MC baseline is walk + bike only** — transit and car are computed for
**comparison**, never folded into the baseline (Moreno et al. 2021).

```
track_c = 0.25·baseline + 0.20·rent + 0.15·income/rent + 0.10·jobs-by-transit
        + 0.10·social-housing + 0.05·(free-amenities + food-basket + clinics + public-schools)
```

## Web app features
H3 choropleth coloured by score · mode toggle (walk/bike/transit/car) · baseline vs
Track C toggle · click-a-hex detail panel (top amenities, metro distance, price band,
all sub-scores) · a "where to live" recommender (priority sliders → top-10 hexes) ·
sweet-spot highlighter (high access + below-predicted rent) · data-transparency modal.

## Running it

**Notebooks** (Python geospatial stack — `h3`, `geopandas`, `graph-tool`, `shapely`,
`pandas`; H3 **v4** API):
```bash
micromamba activate 15mc          # or your env with the stack installed
jupyter lab                        # run 01 → 02 → 03 in order
```
Raw inputs (AMap POI SHP/CSV, OSM road parquet, Anjuke listings) are **not committed**
(size); the notebooks read them from the paths in `01_data_collection.ipynb`.

**Web app** (React + Vite + deck.gl + MapLibre):
```bash
cd webapp
npm install
npm run dev        # local dev
npm run build      # production build (deployed to Vercel)
```

## Data sources & integrity
OSM (roads, metro), AMap/高德 2023 POI, Anjuke (housing prices), EDU 2026 school census,
**official Shanghai government** registries — 区统计公报 / tjj.sh.gov.cn (income),
卫健委 (hospitals), 教委 (schools), 房屋管理局 (social housing), 发改委 (food prices),
shmetro.com (metro headways). Income (#5) and hospital counts (#6) were **verified
directly against the primary source**. Where Chinese LLMs (Doubao/DeepSeek) helped
*compile* official lists, they were finders only — every datum traces to the cited
government publication (see the AI-assistance disclosure in `METHODOLOGY.md`).
**No API keys are committed.**

## Repo layout
```
01/02/03_*.ipynb          the reproducible pipeline (raw data → H3-scored GeoJSON)
METHODOLOGY.md            methodological choices, anchor literature, every citation
webapp/                   React/deck.gl app (deployed on Vercel)
scripts/trello_5sprint.py Trello API helper (5-sprint agile board)
*.csv                     official-source registries used by the notebooks
```
