# Reference Extraction: Bruno et al. (2024)

**Full citation:**
Bruno, M., Melo, H. P. M., Campanelli, B., & Loreto, V. (2024). A universal framework for inclusive
15-minute cities. *Nature Cities, 1*, 633–641. https://doi.org/10.1038/s44284-024-00119-4

**arXiv preprint:** 2408.03794v1 (the version in this folder)

---

## Why this paper anchors the project

The paper provides a **globally validated, reproducible methodology** for measuring 15-minute city
accessibility. It was applied to ~10,000 cities worldwide including **Shanghai**, which means you can
directly compare your results against their Shanghai baseline — giving you an external validity check
rather than having to defend your methodology from scratch.

---

## The 9 POI Categories (their "basket")

They classify all OSM POIs into **9 service types**:

| Category | Examples |
|----------|---------|
| **outdoor activities** | parks, green spaces |
| **learning** | schools, libraries, universities |
| **supplies** | supermarkets, markets, pharmacies |
| **eating** | restaurants, cafés, food services |
| **moving** | transit stops, bike stations |
| **cultural activities** | museums, theatres, cinemas |
| **physical exercise** | gyms, sports facilities, pools |
| **services** | banks, post offices, admin |
| **healthcare** | clinics, hospitals, doctors |

→ **How to cite this in your notebook:** "Following Bruno et al. (2024), we adopt the 9-category
POI basket covering outdoor, learning, supplies, eating, moving, cultural, physical exercise,
services, and healthcare functions as the definition of essential urban services."

→ **Mapping to your 6 baseline indicators:** The project brief lists 6 universal baseline needs —
you can collapse Bruno's 9 into 6 by merging (e.g. eating+supplies = food access;
outdoor+physical = green/sport; cultural = optional track layer). Cite Bruno to justify each merger.

---

## AMap → Bruno Category Mapping (our implementation)

Bruno et al. use OSM tags; we use AMap (高德) `bigType`/`midType`. The table below shows the
exact translation and which `midType` values are kept. Categories marked **"all"** keep every
sub-type; others apply a **daily-use whitelist** to exclude destination-only facilities
(universities, stadiums, parking, tourist attractions, etc.) — a deliberate extension of Bruno
et al.'s principle that POIs should be of "daily or frequent use".

| Bruno category | AMap `bigType` (CN → EN) | Kept `midType` (CN → EN) | Dropped (reason) |
|---|---|---|---|
| **outdoor activities** | 风景名胜 → Scenic spots | 公园广场 → Parks & plazas | 风景名胜 → Tourist attractions (not daily-local) |
| **physical exercise** | 体育休闲服务 → Sport & leisure | 运动场馆 → Sports courts/gyms · 体育休闲服务场所 → Leisure facilities · 休闲场所 → Recreational spaces | 娱乐场所 → Entertainment venues (→ Track B) · 影剧院 → Cinemas/theatres (→ Track B) · 度假疗养场所 → Resorts · 高尔夫相关 → Golf (destination) |
| **learning** | 科教文化服务 → Education & culture | 学校 → Schools · 图书馆 → Libraries · 文化宫 → Community cultural centres · 培训机构 → Tutoring/training centres | 高等院校 → Universities (not daily-local) · 科研机构 → Research institutes · 博物馆/美术馆 → Museums/galleries (destination) |
| **supplies** | 购物服务 → Shopping services | 便民商店/便利店 → Convenience stores · 超级市场 → Supermarkets · 综合市场 → Fresh produce/general markets | 家居建材市场 → Home furnishing stores (~37k) · 商场 → Malls (destination) · 专卖店 → Brand stores |
| **eating** | 餐饮服务 → Dining & food | **all** | — |
| **moving** | 交通设施服务 → Transit facilities | 公交车站 → Bus stops · 地铁站 → Metro stations · 轮渡站 → Ferry stops | Parking (~64k) · Toll booths · Road-service facilities |
| **cultural activities** | *(not mapped)* | — | Merged into learning/recreation; cinemas/theatres → Track B |
| **services** | 生活服务 → Daily life services · 公共设施 → Public facilities · 政府机构及社会团体 → Government & civic orgs | 生活服务场所 → General daily services · 美容美发店 → Hair salons · 维修站点 → Repair shops · 洗衣店 → Laundry · 邮局 → Post offices · 公共设施 → Community public facilities · 政府机关 → Government offices · 社会团体 → Community organisations | 物流速递 → Couriers · 旅行社 → Travel agencies · 公共厕所 → Public toilets (~14k) · 公检法机构 → Courts/police |
| **healthcare** | 医疗保健服务 → Healthcare | 诊所 → GP clinics · 医药保健销售店 → Pharmacies · 医疗保健服务场所 → Community health centres · 综合医院 → General hospitals · 急救中心 → Emergency centres | 动物医疗场所 → Veterinary · 专科医院 → Specialist hospitals (destination) · 疾病预防机构 → Disease control centres |
| *(Track C only)* | 公司企业 → Companies & enterprises | **all** | — (employment access indicator, not a baseline category) |

**Net effect:** total POI count drops from ~832k to roughly 300–400k, eliminating noise from
parking lots, tourist destinations, home furnishing stores, and public toilets — categories that
inflated counts but contributed nothing to daily neighbourhood livability scores.

---

## The Core Metric: Proximity Time (PT)

**How they measure accessibility for one hexagon k, one category c:**

```
⟨t⟩_{c,k} = (1/n) * Σ t_i^{c,k}    where n = 20 (the 20 nearest POIs)
```

Average time to reach the **20 nearest POIs** of category c from hexagon k, via OSRM walking/biking routes.

**Hexagon-level score (across all m categories):**
```
PT_k = (1/m) * Σ ⟨t⟩_{c,k}
```

**City-level score (population-weighted):**
```
PT_city = Σ(PT_k * p_k) / Σ(p_k)
```

**F_15 — the headline metric:**
```
F_15 = (population with PT ≤ 15 min) / (total population) × 100
```

→ **How to cite this in your notebook:** "We adopt the Proximity Time (PT) metric from Bruno et al.
(2024), computing the average network travel time to the 20 nearest POIs in each category per grid
cell, then aggregating to H3 hexagons weighted by population."

---

## Grid Design

- They use **200m hexagon side length** (smaller than your 500m)
- Hexagons with no nearby POIs are excluded from analysis
- Your project uses **500m grid cells** then aggregates to **H3 r8 hexagons** — cite Bruno for the
  hexagonal grid rationale, note the difference in resolution as a deliberate trade-off for
  city-scale computation

---

## Data Sources They Used

| Data | Source |
|------|--------|
| POIs (amenities) | OpenStreetMap |
| Routing (walk/bike times) | OSRM (Open Source Routing Machine) |
| Population density | WorldPop (100m grid, UN-adjusted) |
| City boundaries | OECD functional urban areas / GHS |

→ You use AMap POIs instead of OSM for Shanghai (much better coverage in China) — cite Bruno for
methodology but note you substituted AMap data for China-specific accuracy.

---

## Inequality Measurement (key for Track C)

They compute a **Gini index** G over individual proximity times to measure within-city inequality:

```
G = 1 - (2 * Σ_p Σ_{p'≤p} PT_{p'}) / (N_pop * Σ_p PT_p)
```

Key finding: **cities with worse average accessibility also tend to be more unequal** — the
core-periphery gradient is a near-universal pattern, with city centres overserved and
peripheries underserved.

→ **This is your Track C theoretical anchor:** "Bruno et al. (2024) demonstrate that accessibility
inequality — measured via Gini index — tends to concentrate in peripheral, lower-income areas.
We test whether this pattern holds in Shanghai and whether high-amenity, low-rent corridors exist."

---

## Shanghai-Specific Data Points (from their study)

From Fig. A1 (city rankings by proximity time):

- **Shanghai walking PT:** ~12.12 min average (mid-range globally)
- **Shanghai F_15 by foot:** ~28–34% (only ~1/3 of residents within 15-min access on foot)
- **Shanghai F_15 by bike:** ~51–61% (significantly better by bike)
- Shanghai needs **~7.2% of POIs relocated** for equal per-capita distribution (relatively low —
  the city is fairly dense but unevenly distributed)

→ **Use this as your opening context:** "According to Bruno et al. (2024), only ~30% of Shanghai
residents currently live within a 15-minute walk of essential services, rising to ~55% by bike.
This study investigates which neighbourhoods drive that gap and whether low-cost areas are
systematically excluded."

---

## Key Quotes to Use

> "The heterogeneity of accessibility within cities is one of the sources of inequality."

> "Cities that are known for their car-centric designs, such as Atlanta and other North American
> cities, need to relocate a high percentage of POIs, over 70% in some cases; conversely, certain
> European cities... already demonstrate a well-optimised, homogeneous distribution of services."

> "Socio-economic and cultural factors should be included to shift from time-based to value-based
> cities." ← directly motivates your Track C affordability layer

---

## Limitations They Acknowledge (use to frame your methodology)

1. OSM data completeness varies by city (→ justifies using AMap for Shanghai)
2. All 9 categories treated equally regardless of actual usage frequency (→ you can argue for
   differential weighting in your scoring rationale)
3. 20 nearest POIs is an arbitrary choice (→ you may use a different threshold; cite this)

---

## One-Paragraph Literature Review Draft (notebook 01 header)

> Bruno et al. (2024) provide the methodological backbone of this study. Using a hexagonal grid,
> OSRM-based network routing, and a 9-category POI basket sourced from OpenStreetMap, they compute
> Proximity Time (PT) scores for ~10,000 cities worldwide and show that F_15 — the fraction of
> residents within 15-minute walking access of essential services — is highly heterogeneous both
> within and across cities. Critically, they demonstrate that within-city accessibility inequality
> (measured via Gini index) follows a near-universal core-periphery gradient, with better-served
> centres and underserved peripheries. Their global dataset places Shanghai at roughly 30% F_15
> by foot and 55% by bike, establishing the baseline against which our neighbourhood-level
> analysis is benchmarked. We adopt their PT metric and POI categorisation directly, substituting
> AMap for OSM data to address known OpenStreetMap incompleteness in Chinese cities.
