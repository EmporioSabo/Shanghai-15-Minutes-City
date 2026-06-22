#!/usr/bin/env python3
"""
Restructure the 15MC Trello board into a clean 5-sprint agile layout.

- Moves every existing card into the sprint where that work actually happened
  (existing cards keep their real creation dates).
- Creates cards for real work that's missing from the board (metro routing,
  source verification, routing fixes, webapp audit, etc.).
- Archives the old messy lists (Ideas / Sprint / Done / Blocked) once emptied.

It does NOT fabricate fake activity history — new cards land at the real "now".

Usage
-----
  1. Get your Trello API key + token:  https://trello.com/power-ups/admin
     (create a Power-Up → API key → generate a Token).
  2. export TRELLO_KEY=...   TRELLO_TOKEN=...
     (optional) export TRELLO_BOARD=jSNASn1u      # board shortLink or id
  3. Preview (no changes):   python scripts/trello_5sprint.py
     Apply for real:         APPLY=1 python scripts/trello_5sprint.py
"""
import json
import os
import sys
import urllib.parse
import urllib.request

KEY = os.environ.get("TRELLO_KEY")
TOKEN = os.environ.get("TRELLO_TOKEN")
BOARD = os.environ.get("TRELLO_BOARD", "jSNASn1u")  # shortLink from the export filename
APPLY = os.environ.get("APPLY") == "1"

# ── Target structure ─────────────────────────────────────────────────────────
# Each sprint: (list name, due date, [(card name, description-or-None)]).
# A description is only set when the card is created new (existing cards are
# matched by exact name and just moved, so their content is preserved).
SPRINTS = [
    ("Sprint 1 · Scoping & data foundation", "2026-05-25", [
        ("Define project scope & deliverables", None),
        ("Environment setup", None),
        ("Literature review", None),
        ("Track C selection & research question", None),
        ("POI dataset exploration & indicator mapping", None),
        ("Coordinate system conversion (GCJ-02 → WGS-84)", None),
    ]),
    ("Sprint 2 · Data pipeline & provenance", "2026-06-01", [
        ("Rental data pipeline — Anjuke", None),
        ("Road network & data provenance", None),
        ("500 m grid construction over Shanghai", None),
        ("Caching & pipeline reproducibility", None),
        ("EDU 2026 education census switch",
         "Replaced the broad SHP 科教文化 set with the dedicated EDU 2026 "
         "kindergarten + K-12 census (~4,050 schools, GCJ-02→WGS-84) for a "
         "defensible daily-need education layer."),
    ]),
    ("Sprint 3 · Isochrones & baseline scoring", "2026-06-08", [
        ("4-mode isochrone computation", None),
        ("Routing fixes: undirected graph + component-aware snapping",
         "Fixed 3 routing bugs: directed→undirected graph (connectivity "
         "44%→95%), component-aware cell/POI snapping, and a ≥100-node "
         "component threshold so islands route on their own network. "
         "Embedded-zero hexes 37→0."),
        ("PT normalization → accessibility scores", None),
        ("Baseline composite score", None),
        ("H3 r8 aggregation — 14,227 hexagons", None),
    ]),
    ("Sprint 4 · Track C indicators & source verification", "2026-06-15", [
        ("Track C composite & sweet spot analysis", None),
        ("Real metro routing (transit mode)",
         "Replaced the 25 km/h road proxy with a frequency-based walk+metro "
         "router (OSM 18 lines / 390 stations; 35 km/h in-vehicle, ½-headway "
         "wait from official shmetro, 5-min transfers). Comparison layer only."),
        ("Income verification vs district 统计公报 (#5)",
         "Verified per-district disposable income against each 区 2024 统计公报 "
         "(9 official, fetched & confirmed); 7 central districts unpublished → "
         "official city proxy. Removed non-official 网络 figures."),
        ("Hospital / school / housing official sourcing (#6–#8)",
         "卫健委 hospital counts confirmed (246 centres / 115 private / 503 "
         "total); 民办 K-12 schools from 教委 公示; social housing 203 (114 SHP + "
         "89 官方 房管局, geocoded). AI-assistance disclosed."),
        ("Food-basket affordability indicator (#2)",
         "Cheapest grocery channel reachable walk-or-bike (supermarket < wet "
         "market < none), 发改委 价格监测."),
        ("Employment-by-transit indicator + critique (#4)",
         "Jobs reachable by 15-min metro; implemented per brief with a "
         "documented critique (literature uses 30–60 min; at 15 min transit "
         "access ≈ walking)."),
    ]),
    ("Sprint 5 · Webapp & delivery", "2026-06-22", [
        ("React + deck.gl + MapLibre architecture", None),
        ("H3 choropleth with score overlays", None),
        ("Unified score view selector", None),
        ("Hex detail panel & recommender", None),
        ("Webapp data-accuracy audit + label polish",
         "Audited every number/label vs the pipeline; added the missing food "
         "sub-score, disambiguated rent vs sale-price, fixed indicator "
         "counts/labels and the metro-routing wording."),
        ("Stale-reference cleanup",
         "Swept notebooks / docs / webapp for stale references (transit proxy, "
         "114→203 social housing, 7→8 indicators, directed→undirected graph)."),
        ("Vercel public deployment", None),
        ("Final submission checklist", None),
    ]),
    ("Backlog · future enhancements", None, [
        ("Mobile-first sidebar", None),
        ("District-level comparison panel", None),
        ("Time-series view", None),
    ]),
]

OLD_LISTS_TO_ARCHIVE = {"Ideas", "Sprint", "Done", "Blocked"}


def api(method, path, **params):
    """Call the Trello REST API. Params go in the query string (Trello-style)."""
    params["key"] = KEY
    params["token"] = TOKEN
    url = f"https://api.trello.com/1/{path}?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            body = r.read().decode()
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        sys.exit(f"  ✗ API {method} {path} failed: {e.code} {e.read().decode()[:200]}")


def main():
    if not KEY or not TOKEN:
        sys.exit("Set TRELLO_KEY and TRELLO_TOKEN env vars first "
                 "(get them at https://trello.com/power-ups/admin).")

    board = api("GET", f"boards/{BOARD}", fields="id,name")
    board_id = board["id"]
    print(f"Board: {board['name']} ({board_id})  —  {'APPLY' if APPLY else 'DRY-RUN (preview)'}\n")

    lists = api("GET", f"boards/{board_id}/lists", fields="id,name", filter="open")
    list_by_name = {l["name"]: l["id"] for l in lists}
    cards = api("GET", f"boards/{board_id}/cards", fields="id,name,idList,desc", filter="open")
    card_by_name = {c["name"]: c for c in cards}

    def ensure_list(name, pos):
        if name in list_by_name:
            return list_by_name[name]
        if not APPLY:
            print(f"  + CREATE list  '{name}'")
            return f"<new:{name}>"
        new = api("POST", "lists", name=name, idBoard=board_id, pos=pos)
        list_by_name[name] = new["id"]
        print(f"  + created list '{name}'")
        return new["id"]

    pos = 1000
    for list_name, due, cardlist in SPRINTS:
        print(f"\n── {list_name} ──")
        list_id = ensure_list(list_name, pos)
        pos += 1000
        cpos = 100
        due_iso = f"{due}T17:00:00.000Z" if due else None
        for name, desc in cardlist:
            existing = card_by_name.get(name)
            if existing:
                action = f"  → MOVE   '{name[:54]}'"
                if APPLY:
                    p = {"idList": list_id, "pos": cpos}
                    if due_iso:
                        p["due"] = due_iso
                    api("PUT", f"cards/{existing['id']}", **p)
                    if desc and not existing.get("desc"):
                        api("PUT", f"cards/{existing['id']}", desc=desc)
                print(action)
            else:
                action = f"  + CREATE '{name[:54]}'" + ("  [new card]" if desc else "")
                if APPLY:
                    p = {"idList": list_id, "name": name, "desc": desc or "", "pos": cpos}
                    if due_iso:
                        p["due"] = due_iso
                    api("POST", "cards", **p)
                print(action)
            cpos += 100

    # Archive the old, now-empty lists.
    print("\n── archive old lists ──")
    for l in lists:
        if l["name"] in OLD_LISTS_TO_ARCHIVE:
            print(f"  ⌫ ARCHIVE '{l['name']}'")
            if APPLY:
                api("PUT", f"lists/{l['id']}/closed", value="true")

    print("\nDone." if APPLY else "\nPreview only — re-run with APPLY=1 to push changes.")


if __name__ == "__main__":
    main()
