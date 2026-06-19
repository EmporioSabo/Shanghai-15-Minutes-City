# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Note: A stale, unrelated `CLAUDE.md` (an STM32 embedded project) currently lives at
> `~/CLAUDE.md` and is auto-loaded as a parent instruction file. It does **not** apply to
> this project. This file takes precedence; ignore the STM32 content.

## Project Overview

**The 15-Minute Shanghai Project** — a 5-week graduate urban data-analysis project assessing
livability across Shanghai through the 15-minute city (15MC) framework. The work is a
reproducible geospatial pipeline plus a public web app; there is **no written report**.

The analytical goal:
1. Build a **500 m grid** over Shanghai (~25,000 cells).
2. Compute **15-minute isochrones** for **4 travel modes** — walk, bike, transit, car.
3. Score every cell against **6 universal baseline indicators**, then against one **chosen track**.
4. Aggregate cell scores to **Uber H3 hexagons at resolution r8**.
5. Ship a **public interactive web app** rendering the H3 choropleth.

### The Baseline Layer (all tracks)

15MC is fundamentally about **walkability and cycling, NOT the car**. Every cell is scored on
whether **six universal urban needs** are reachable within 15 minutes **on foot or by bike**.
Car isochrones are computed **for comparison only** and must **not** feed the baseline score.

### Tracks (pick exactly one — adds a second scoring layer)

- **Track A — Healthy Lifestyle & Sport**: gyms, parks w/ exercise equipment, sports fields,
  pools, cycling-lane length, fresh markets, NDVI greenery, AQI. Question: are healthy-lifestyle
  amenities concentrated in wealthy inner districts? Map the "sport deserts".
- **Track B — Entertainment & Nightlife**: restaurant density/variety, bars, live music, cinemas,
  theatres/museums, KTV, 24h convenience stores, late-night transit, Dianping ratings. Question:
  is nightlife genuinely walkable, or destination-only? Map the transit–nightlife gap.
- **Track C — Affordability**: rent per m², food-basket cost, free public amenities, jobs reachable
  by 15-min transit, income/rent ratio, public vs. private clinics/schools, social housing.
  Question: does 15MC = rich city, or are there high-amenity + low-cost corridors?

## Deliverables

| # | Deliverable | Weight | Notes |
|---|-------------|--------|-------|
| 1 | **3 Python notebooks** (GitHub repo) | 35% | reproducible, raw data → H3-scored GeoJSON |
| 2 | **Web application** (deployed URL) | 35% | public, loads <4 s, mobile-ready |
| 3 | **Trello board** (shared link) | 15% | active 5-sprint agile board, not backfilled |
| — | **Literature review** | 15% | ≥4 papers, in notebook 01's top markdown cell (~800 words) |

### Required notebooks (build end-to-end, raw data → H3 GeoJSON)

- `01_data_collection.ipynb` — sourcing, APIs, cleaning, validation; lit-review markdown header.
- `02_grid_isochrones.ipynb` — 500 m grid, 4-mode isochrones, spatial joins, caching.
- `03_scoring_h3.ipynb` — baseline + track scoring, weighting rationale, H3 aggregation, GeoJSON export.

### Web app (recommended stack)

React + Mapbox GL JS + **deck.gl `H3HexagonLayer`**, deployed on Vercel. Required features:
H3 choropleth (res 8) coloured by composite score; mode toggle (walk/bike/transit/car) with
real-time update; baseline vs. track layer toggle; hex-click detail panel (top amenities, metro
distance, rent band); a "where to live" recommender (priority sliders → top-10 hexes highlighted);
and a data-transparency panel (sources, collection date, limitations).

## Data on Disk

This repo currently holds **raw input data and a reference notebook only** — none of the
deliverable notebooks exist yet.

| Path | Contents |
|------|----------|
| `POI 2024/csv格式/合集/上海市-1754933-utf8.csv` | **611 MB** full Shanghai POI dump (AMap/高德), UTF-8 |
| `POI 2024/csv格式/已分类/*.csv` | Same POIs split into **21 AMap category files** (餐饮=dining, 购物=shopping, 医疗保健=healthcare, 体育休闲=sport/leisure, etc.) |
| `POI 2024/shp格式/上海市-POI.{shp,dbf,shx,prj,cpg}` | Shapefile POI; note the `.dbf` is **~2.5 GB** |
| `shanghai-roads-simplified.parquet` | **11.7 MB** simplified Shanghai road network (for isochrone routing) |
| `H3 example urban_analytics.ipynb` | **Reference only** — Camelia Ciolac's Uber H3 demo on Toulouse. Template for KNN/point-in-polygon, H3 aggregation, pydeck 3D viz. Pins **`h3==3.6.4` (H3 v3 API)**. |

### POI CSV schema

Columns: `id, pname, pcode, cityname, citycode, adname, adcode, name, address, location, tel,
business_area, bigType, midType, smallType, typecode, timestamp, tag, biz_ext, biz_type,
gcjLng, gcjLat, wgs84Lng, wgs84Lat, geometry`.

Coordinate caveat: AMap data is in **GCJ-02** (`gcjLng/gcjLat`); use the provided **`wgs84Lng/wgs84Lat`**
columns for any mapping, H3 indexing, or joins with OSM/GTFS data. `location` is GCJ-02.

## Working With This Codebase

There is no build/lint/test tooling — this is a **Jupyter + geospatial-data** project. Core stack:
`h3`, `geopandas`, `shapely`, `pandas`, plus `pydeck`/`folium` for viz (see the reference
notebook's `requirements_demo.txt` cell). The project's Python env is **not currently installed**
in this directory (e.g. `geopandas` is absent system-wide) — set up a virtualenv before running.

```bash
# Launch Jupyter
jupyter notebook        # or: jupyter lab

# Read the road network (geopandas)
python3 -c "import geopandas as gpd; print(gpd.read_parquet('shanghai-roads-simplified.parquet').head())"
```

### Performance / gotchas

- **Do not naively load** the 611 MB combined CSV or the ~2.5 GB `.dbf`. Prefer the pre-split
  per-category CSVs, read in chunks (`pandas.read_csv(..., chunksize=...)`), or select columns.
- **H3 API version**: the reference notebook uses **h3 v3** (`geo_to_h3`, `h3_to_geo_boundary`).
  H3 v4 renamed everything (`latlng_to_cell`, `cell_to_boundary`). Confirm which version is
  installed before copying reference code — the function names are not interchangeable.
- Filenames and POI category labels are in **Chinese**; keep UTF-8 encoding when reading/writing.

## Data Sources (indicative, justify your own)

OSM/Geofabrik (streets, POIs, bike lanes, transit stops), Gaode/AMap API (routing + isochrones
for walk/bike/transit/car, POI search), Shanghai Open Data (`data.sh.gov.cn`), housing platforms
(Lianjia/Anjuke), Dianping (ratings/hours/reviews), Shanghai Metro GTFS, Google Earth Engine
Sentinel-2 (NDVI, built-up density), AQICN/CNEMC (AQI/PM2.5). Use **≥4 distinct datasets** and
**log all provenance** in notebook 01.

### Academic integrity

Comply with each platform's ToS during collection. **Never commit API keys** to the public repo.
Where AI tools assist with code, document it. Analysis, interpretation, and design decisions must
be your own.
