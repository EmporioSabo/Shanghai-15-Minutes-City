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
| **Hosford et al. (2022)** — *Is the 15-minute city within reach?* | Measured urban cycling speeds 13.9–16.2 km/h (bike = 15, mid-range); inclusive-walk corroboration |
| **Schuhmacher et al. (2025)** — *Cycling Speeds in Urban Traffic* (*Findings*) | Urban cycling speed range (bike = 15 km/h within 14.3–21.3) |
| **Jiménez et al. (2021)** — *Instantaneous speed … Ocaña* | GPS-observed urban car operating speeds 13–29 km/h (car = 30, free-flow end; comparison only) |
| **O'Sullivan et al. (2000); Lima & Costa (2023)** — *PT isochrones / 15MC review* | No single transit speed → transit-mode is a disclosed road proxy; indicator = supply accessibility |

## Notebook 01 — Data collection

- **POI source:** 2023 AMap SHP for 5 baseline needs + Track C (not the 2024 CSV — its school records were wrong; supervisor's call). **Education baseline from the dedicated EDU 2026 AMap school census** (GCJ-02→WGS-84).
- **Daily-use whitelist:** strict midType filter → 536k of 1.49M raw POIs kept (drops parking, specialist retail, public toilets, address points, etc.).
- **Six baseline needs:** food · healthcare · education · recreation · transit · daily services.
- **Education = EDU 2026 kindergarten + K-12 census** (≈4,050 schools; typecodes 141204/141203/141202). The broad SHP `科教文化服务` set (universities/vocational/adult-ed/campus sub-points + libraries/cultural palaces) and private tutoring (培训机构) are excluded from the baseline (Mouratidis: don't aggregate dissimilar facilities) but retained in `poi_clean` for the Track C public-vs-private school ratio and free-amenity indicators. Schools are slow-changing infrastructure, so the 2026 vintage vs the 2023/24 base is acceptable (logged in provenance).
- **Rent:** Anjuke sale-price listings (445k), median per hex.
- **Social housing:** 114 affordable-housing communities (talent apartments, public rental, resettlement) name-matched from the 商务住宅 category of the same 2023 SHP.
- **District income/rent:** *income* = 居民人均可支配收入 (2024), **officially sourced & verified against each 区 统计公报 for 9 districts** (e.g. 浦东 95,176, 宝山 88,642 confirmed by direct fetch of the 公报 原文). The 7 central districts (黄浦/徐汇/长宁/静安/普陀/虹口/杨浦) **do not publish** per-district income, so they use the official city 城镇 figure (93,095, tjj.sh.gov.cn) as a documented proxy — this *understates* the wealthier central districts, but their affordability is rent-dominated so the ranking holds. *rent* = E-house/CRIC commercial rental (the one remaining non-official input). #5 is therefore the least-precise indicator.

## Notebook 02 — Grid & isochrones

- **Grid:** 500 m cells, 31,445, clipped to the 16 districts — the **full administrative area** (rural Chongming / estuary kept; no inhabited-hex filter, so genuine rural gaps show honestly).
- **Routing:** graph-tool Dijkstra on the OSM road network (not straight-line buffers; Zhang et al. 2022).
- **Modes & speeds:** walk 3.39 km/h (inclusive; Mouratidis / Bohannon & Williams Andrews) · bike 15 km/h (mid-range of measured 13.9–16.2; Hosford et al. 2022, cf. Schuhmacher et al. 2025) · **transit = a real metro router** (OSM network of 18 lines / 390 stations + walk access/egress; in-vehicle = OSM inter-station distance ÷ 35 km/h [Lin et al. 2024; Morlok & Nitzberg 2004], boarding wait = ½ headway [rule: Stewart & Byrd 2022; Esfeh et al. 2020] using **official shmetro.com off-peak headways**, 5-min transfers [Petruccelli & Racina 2021; Nielsen et al. 2021]) · car 30 km/h (free-flow end of GPS-observed urban speeds ≈29.3 main-road, Jiménez et al. 2021). Only walk + bike feed the baseline; transit + car are comparison layers.
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

### Track C — Affordability (weighted index; all 8 brief indicators)

```
track_c = 0.25 baseline + 0.20 rent + 0.15 income/rent + 0.10 employment
        + 0.10 social_housing + 0.05 (free_amenity + food + clinic + school)
```

| Sub-score | Normalization |
|---|---|
| rent | inverted percentile rank (sale price/m²) |
| income/rent | min–max across the 16 districts |
| social_housing | inverted distance-percentile to nearest affordable community |
| employment | transit cumulative-opportunity level |
| free_amenity | percentile rank (parks/libraries/cultural/public POIs) |
| clinic (community vs private hospital) | min–max across the 16 districts |
| school (public vs private) | percentile rank of public-school share |
| food (weekly basket cost) | inverted min–max of cheapest walk-or-bike-reachable channel cost |

Percentile-rank / min–max normalization follows the composite-indicator
convention (OECD 2008; Knap et al. 2022). **Food-basket cost** is included not as
a (non-existent) per-district price but as the **cost of the cheapest grocery
channel reachable within a 15-min walk or bike** — supermarket ≈115 < wet/general market
≈130 < none ≈170 元/week (上海市/区发改委 价格监测 2026; the 170 food-desert penalty =
wet × 1.3, a documented assumption). The spatial signal is *access to cheap food
channels*, not location-based price (within-city staple prices vary <10%).

**Track C equity data (public vs private — AMap carries no ownership flag, so
these come from official government registries, joined in NB03; sources cited in-cell).**
Primary sources are the official publications below; see the AI-assistance disclosure (†).

| Indicator | Primary source (official) | Coverage / caveat |
|---|---|---|
| #7 Public vs private **school** | **上海市教育委员会** (edu.sh.gov.cn) + 各区教育局 民办学校招生/认定公示 2024 (闵行 mhedu.sh.cn · 宝山 shbsq.gov.cn · 青浦 shqp.gov.cn) + 上海市教育考试院 (shmeea.edu.cn) — `上海市民办学校名单2024.csv` (300 民办) name-joined to EDU 2026 | HS ~100%, kindergarten ~68%, primary ~47%; name-match ~73% recall |
| #6 Community health vs **private hospital** | **上海市卫生健康委员会** (wsjkw.sh.gov.cn): 社区卫生服务中心 (官方 246, our 247; per district) + 社会办医疗机构 (115 民营 hospitals of 248 市级) — `上海社区卫生服务中心2024.csv`, `上海民营医院名单2024.csv` | private list is **市级-审批 only** (区级 excluded; est. citywide ~267–321) → lower bound |
| #8 Affordable / **social housing** | **上海市房屋管理局** (fgj.sh.gov.cn 市筹公租房/共有产权公示) + 各区房管局/政府官网 人才公寓/安置房公示 2024 — `上海保障性住房项目2024.csv` (112), **geocoded by name+address against the AMap 商务住宅 dump (89 of 112)** and merged with the 114 SHP-name-matched communities → **203 total** | 廉租 & 征收安置 lack public address lists; proximity proxy, not a census |

> **† AI-assistance disclosure.** The Track C equity registries above — and the
> district-level income/rent figures (#5) — were *aggregated/compiled* from the cited
> 上海市教委 / 卫健委 / 房管局 publications using Chinese LLMs (Doubao office-task mode) as a
> **research aid**, cross-checked across models (DeepSeek) and against official totals
> (e.g. 社区卫生服务中心 247 ≈ the 248 official figure; private high-school coverage ~100%).
> District **income** (#5) was further **verified directly against the source 公报** — the 9
> publishing districts' figures were confirmed by fetching the 公报 原文; the 7 central
> districts that don't publish it use the official city proxy. The LLMs were aggregation/finder
> tools, **not the source of record** — every datum traces to the cited government publication.

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

- Transit is a **real metro router** (OSM lines/stations + walk access; literature-sourced params; official shmetro.com off-peak headways, one representative trunk value per line where short-turned/branched). Car is an off-peak approximation. **Neither feeds the baseline** — at a 15-min budget even real metro adds little over walking.
- **Employment-by-transit (#4)** is implemented per the brief, but with a documented caveat: the literature shows 15-min transit job access is methodologically weak — standard cutoffs are **30–60 min**, and short thresholds are dominated by walking, not transit-network performance (Goliszek et al. 2020; Kapatsila et al. 2023; Deboosere & El-Geneidy 2018). We report it as specified while noting this limitation; the door-to-door definition (access + ½-headway wait + ride + transfer + egress) follows Torres & McArthur 2024.
- Anjuke listings are sale prices, not rental; inner-district coverage is denser than the periphery.
- Income/rent ratio is district-level (16 values) assigned to hexes by point-in-polygon.
- Social-housing is a name-matched proximity proxy (undercounts neutral-named developments; skews to 人才公寓).
- POI data is a 2023 snapshot; the road network omits some pedestrian paths.

---
*Pipeline: `01_data_collection.ipynb` → `02_grid_isochrones.ipynb` → `03_scoring_h3.ipynb` → `cache/scored_h3.geojson` → `webapp/`*
