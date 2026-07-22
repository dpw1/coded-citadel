#!/usr/bin/env python3
"""
YouTube Filter Pro — engagement analysis (vs vanity metrics).

Uses the same Supabase table as admin/index.html: `yt_filter_pro_data`.
Each row ≈ one search event with a `fingerprint` and `created_at`.

Usage:
  python admin/yt_engagement_analysis.py
  python admin/yt_engagement_analysis.py --csv path/to/export.csv
  python admin/yt_engagement_analysis.py --out admin/engagement_output

Requires: pandas, matplotlib, numpy, requests (only for live fetch)
  pip install pandas matplotlib numpy requests
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from urllib.parse import quote

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# Same project as admin/admin.js (anon SELECT on yt_filter_pro_data).
SUPABASE_URL = "https://pinypmgcawshibcmyxqp.supabase.co"
SUPABASE_ANON_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpbnlwbWdjYXdzaGliY215eHFwIiwicm9sZSI6ImFub24i"
    "LCJpYXQiOjE3NzgxOTA2OTMsImV4cCI6MjA5Mzc2NjY5M30."
    "Oabrt3eiLuYA-Lr5uH4w9VPh_CWqQJ2uo-hE07WQsFM"
)
TABLE = "yt_filter_pro_data"
PAGE_SIZE = 1000


# ---------------------------------------------------------------------------
# Data load
# ---------------------------------------------------------------------------

def fetch_supabase_rows() -> list[dict]:
    try:
        import requests
    except ImportError as exc:
        raise SystemExit(
            "Install requests to fetch live data, or pass --csv.\n"
            "  pip install requests"
        ) from exc

    base = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{quote(TABLE, safe='')}"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Accept": "application/json",
    }
    rows: list[dict] = []
    from_ = 0
    while True:
        to = from_ + PAGE_SIZE - 1
        params = {"select": "*", "order": "created_at.desc.nullslast"}
        res = requests.get(
            base,
            params=params,
            headers={**headers, "Range": f"{from_}-{to}"},
            timeout=120,
        )
        if not res.ok:
            raise SystemExit(f"Supabase fetch failed ({res.status_code}): {res.text[:500]}")
        batch = res.json()
        if not isinstance(batch, list) or not batch:
            break
        rows.extend(batch)
        if len(batch) < PAGE_SIZE:
            break
        from_ += PAGE_SIZE
        print(f"  fetched {len(rows):,} rows...", flush=True)
    return rows


def load_frame(csv_path: str | None) -> pd.DataFrame:
    if csv_path:
        df = pd.read_csv(csv_path)
    else:
        print(f"Fetching {TABLE} from Supabase...")
        rows = fetch_supabase_rows()
        if not rows:
            raise SystemExit("No rows returned.")
        df = pd.DataFrame(rows)

    if "fingerprint" not in df.columns or "created_at" not in df.columns:
        raise SystemExit("Need columns: fingerprint, created_at")

    df = df.copy()
    df["fingerprint"] = df["fingerprint"].astype(str).str.strip()
    df = df[df["fingerprint"].ne("") & df["fingerprint"].ne("nan") & df["fingerprint"].ne("None")]
    df["created_at"] = pd.to_datetime(df["created_at"], utc=True, errors="coerce")
    df = df.dropna(subset=["created_at"])
    df["day"] = df["created_at"].dt.floor("D")
    return df.sort_values("created_at").reset_index(drop=True)


# ---------------------------------------------------------------------------
# Metrics
# ---------------------------------------------------------------------------

def active_set(df: pd.DataFrame, start: pd.Timestamp, end: pd.Timestamp) -> set[str]:
    """Unique fingerprints with ≥1 event in [start, end)."""
    mask = (df["day"] >= start) & (df["day"] < end)
    return set(df.loc[mask, "fingerprint"].unique())


def compute_aum(df: pd.DataFrame) -> dict:
    """DAU / WAU / MAU as of the latest day in the dataset."""
    last_day = df["day"].max()
    dau = len(active_set(df, last_day, last_day + pd.Timedelta(days=1)))
    wau = len(active_set(df, last_day - pd.Timedelta(days=6), last_day + pd.Timedelta(days=1)))
    mau = len(active_set(df, last_day - pd.Timedelta(days=29), last_day + pd.Timedelta(days=1)))

    daily = (
        df.groupby("day")["fingerprint"]
        .nunique()
        .rename("dau")
        .reset_index()
        .sort_values("day")
    )
    return {
        "as_of": last_day,
        "dau": dau,
        "wau": wau,
        "mau": mau,
        "dau_mean": float(daily["dau"].mean()),
        "dau_median": float(daily["dau"].median()),
        "daily": daily,
        "stickiness_dau_mau": (dau / mau) if mau else 0.0,
        "stickiness_wau_mau": (wau / mau) if mau else 0.0,
    }


def searches_per_active_user_per_day(df: pd.DataFrame) -> pd.DataFrame:
    """
    Per calendar day: searches / unique active fingerprints that day.
    Returns day-level rates; caller takes mean & median across days.
    """
    g = df.groupby("day").agg(
        searches=("fingerprint", "size"),
        active_users=("fingerprint", "nunique"),
    )
    g["searches_per_active_user"] = g["searches"] / g["active_users"]
    return g.reset_index().sort_values("day")


def retention_curve(df: pd.DataFrame, horizons: tuple[int, ...] = (7, 30)) -> pd.DataFrame:
    """
    Classic D7 / D30 retention by cohort day:
      Of fingerprints active on day X, what % were active again on day X+N?

    Only includes cohort days where X+N is still inside the dataset window.
    """
    by_day = {
        day: set(group["fingerprint"].unique())
        for day, group in df.groupby("day")
    }
    days = sorted(by_day)
    max_day = days[-1]

    rows = []
    for day in days:
        cohort = by_day[day]
        if not cohort:
            continue
        row = {"cohort_day": day, "cohort_size": len(cohort)}
        for n in horizons:
            target = day + pd.Timedelta(days=n)
            if target > max_day:
                row[f"d{n}_pct"] = np.nan
                row[f"d{n}_returned"] = np.nan
                continue
            returned = by_day.get(target, set())
            hits = len(cohort & returned)
            row[f"d{n}_returned"] = hits
            row[f"d{n}_pct"] = 100.0 * hits / len(cohort)
        rows.append(row)

    out = pd.DataFrame(rows)
    # Keep only rows where at least one horizon is measurable
    measurable = out[[f"d{n}_pct" for n in horizons]].notna().any(axis=1)
    return out.loc[measurable].reset_index(drop=True)


def searches_per_fingerprint(df: pd.DataFrame) -> pd.Series:
    return df.groupby("fingerprint").size().rename("total_searches")


def growth_and_dau_series(df: pd.DataFrame) -> pd.DataFrame:
    """Cumulative unique users (first seen) + daily active users, aligned by day."""
    first_seen = df.groupby("fingerprint")["day"].min()
    new_by_day = first_seen.value_counts().sort_index()
    dau_by_day = df.groupby("day")["fingerprint"].nunique().sort_index()

    all_days = pd.date_range(df["day"].min(), df["day"].max(), freq="D")
    frame = pd.DataFrame({"day": all_days})
    frame["new_users"] = frame["day"].map(new_by_day).fillna(0).astype(int)
    frame["total_users"] = frame["new_users"].cumsum()
    frame["dau"] = frame["day"].map(dau_by_day).fillna(0).astype(int)
    return frame


# ---------------------------------------------------------------------------
# Charts
# ---------------------------------------------------------------------------

def style_axes(ax, title: str, ylabel: str | None = None):
    ax.set_title(title, fontsize=12, pad=10)
    if ylabel:
        ax.set_ylabel(ylabel)
    ax.grid(True, alpha=0.25)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)


def save_fig(fig, out_dir: Path, name: str):
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / name
    fig.tight_layout()
    fig.savefig(path, dpi=140, bbox_inches="tight")
    print(f"  wrote {path}")
    plt.close(fig)


def plot_all(
    aum: dict,
    spa: pd.DataFrame,
    retention: pd.DataFrame,
    searches_fp: pd.Series,
    growth: pd.DataFrame,
    out_dir: Path,
):
    # 1) DAU time series
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.plot(aum["daily"]["day"], aum["daily"]["dau"], color="#ff9900", lw=2)
    ax.fill_between(aum["daily"]["day"], aum["daily"]["dau"], color="#ff9900", alpha=0.15)
    style_axes(ax, "Daily active users (unique fingerprints / day)", "DAU")
    save_fig(fig, out_dir, "01_dau_over_time.png")

    # 2) Searches per active user per day
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.plot(spa["day"], spa["searches_per_active_user"], color="#3b82f6", lw=2)
    ax.axhline(spa["searches_per_active_user"].mean(), color="#94a3b8", ls="--", lw=1, label="mean")
    ax.axhline(spa["searches_per_active_user"].median(), color="#22c55e", ls=":", lw=1.5, label="median")
    ax.legend()
    style_axes(ax, "Searches per active user per day", "Searches / DAU")
    save_fig(fig, out_dir, "02_searches_per_active_user.png")

    # 3) Retention curve (cohort day → D7 / D30 %)
    fig, ax = plt.subplots(figsize=(10, 4))
    if "d7_pct" in retention.columns:
        ax.plot(retention["cohort_day"], retention["d7_pct"], color="#22c55e", lw=2, label="D7 return %")
    if "d30_pct" in retention.columns:
        ax.plot(retention["cohort_day"], retention["d30_pct"], color="#a855f7", lw=2, label="D30 return %")
    ax.set_ylim(0, 100)
    ax.legend()
    style_axes(ax, "Retention: % of day-X actives seen again on X+7 / X+30", "% retained")
    save_fig(fig, out_dir, "03_retention_d7_d30.png")

    # Average retention bars
    fig, ax = plt.subplots(figsize=(5, 4))
    labels, vals = [], []
    for n, color in ((7, "#22c55e"), (30, "#a855f7")):
        col = f"d{n}_pct"
        if col in retention.columns and retention[col].notna().any():
            labels.append(f"D{n}")
            vals.append(float(retention[col].mean(skipna=True)))
    ax.bar(labels, vals, color=["#22c55e", "#a855f7"][: len(vals)])
    ax.set_ylim(0, 100)
    for i, v in enumerate(vals):
        ax.text(i, v + 1.5, f"{v:.1f}%", ha="center", fontsize=10)
    style_axes(ax, "Average retention (mean across cohorts)", "%")
    save_fig(fig, out_dir, "03b_retention_avg_bars.png")

    # 4) Histogram: total searches per fingerprint
    fig, ax = plt.subplots(figsize=(10, 4))
    counts = searches_fp.values
    # Cap x visually if a few whales distort the bins
    p99 = float(np.percentile(counts, 99)) if len(counts) else 1
    bins = min(60, max(10, int(np.sqrt(len(counts)))))
    ax.hist(counts, bins=bins, color="#ff9900", edgecolor="#090b10", alpha=0.9)
    ax.axvline(np.mean(counts), color="#3b82f6", ls="--", label=f"mean={np.mean(counts):.1f}")
    ax.axvline(np.median(counts), color="#22c55e", ls=":", label=f"median={np.median(counts):.1f}")
    ax.legend()
    style_axes(ax, "Distribution of total searches per fingerprint", "Fingerprints")
    ax.set_xlabel("Total searches (lifetime in dataset)")
    if p99 > 0:
        ax.set_xlim(0, max(p99 * 1.05, 5))
    save_fig(fig, out_dir, "04_searches_per_fingerprint_hist.png")

    # 5) User growth: cumulative total + DAU
    fig, ax = plt.subplots(figsize=(10, 4.5))
    ax.plot(growth["day"], growth["total_users"], color="#ff9900", lw=2.5, label="Total users (cumulative)")
    ax.plot(growth["day"], growth["dau"], color="#3b82f6", lw=2, label="Daily active users")
    ax.fill_between(growth["day"], growth["dau"], color="#3b82f6", alpha=0.12)
    ax.legend()
    style_axes(ax, "User growth: cumulative unique vs daily active", "Users")
    save_fig(fig, out_dir, "05_growth_total_vs_dau.png")


# ---------------------------------------------------------------------------
# Narrative
# ---------------------------------------------------------------------------

EXPLAIN = """
What these charts tell you (engagement vs vanity)
=================================================

1) DAU / WAU / MAU (unique fingerprints)
   - Real signal: how many distinct people actually used the extension recently.
   - Vanity trap: "total users" / lifetime unique fingerprints only go up. DAU/WAU/MAU
     can fall even while cumulative users rise -- that's churn or one-and-done installs.
   - Stickiness (DAU/MAU): closer to ~20%+ is healthy for consumer tools; very low
     means a large graveyard of fingerprints who tried once.

2) Searches per active user per day (mean & median)
   - Real signal: intensity among people who showed up. High median = habit / depth.
   - Vanity trap: total search count. A few power users can inflate totals while most
     actives do 1 search. Prefer median; if mean >> median, usage is skewed.

3) Retention (D7 / D30)
   - Real signal: of people active on day X, what % came back 7 and 30 days later.
     This is the clearest "do they get value?" metric in this dataset.
   - Vanity trap: new-user spikes. Growth without D7/D30 is a leaky bucket.
   - Note: this is same-calendar-day return (active on X+N), not "anytime in next N days".

4) Histogram of total searches per fingerprint
   - Real signal: shape of the user base -- one-shotters vs repeat users vs whales.
   - Vanity trap: celebrating total searches when the mass is piled on 1 search.
     A right-skewed spike at 1 = curiosity installs; a thicker right tail = product-market fit.

5) Cumulative users + DAU on one chart
   - Real signal: when the blue DAU line tracks orange cumulative growth, new users
     stick. When orange climbs and blue stays flat/falls, you're collecting IDs, not habits.
   - Vanity trap: reading only the cumulative line -- it never decreases.

Rule of thumb for this product
------------------------------
Prefer: DAU trend, D7 retention, median searches/active/day, histogram shape.
Treat carefully: lifetime uniques, raw search totals, feature "% of users who ever...".
"""


def print_report(
    df: pd.DataFrame,
    aum: dict,
    spa: pd.DataFrame,
    retention: pd.DataFrame,
    searches_fp: pd.Series,
):
    as_of = aum["as_of"].date() if hasattr(aum["as_of"], "date") else aum["as_of"]
    spa_rate = spa["searches_per_active_user"]

    print("\n=== Snapshot ===")
    print(f"Rows (searches):     {len(df):,}")
    print(f"Unique fingerprints: {df['fingerprint'].nunique():,}")
    print(f"Date span:           {df['day'].min().date()} -> {df['day'].max().date()}")
    print(f"As of:               {as_of}")
    print(f"DAU (latest day):    {aum['dau']:,}")
    print(f"WAU (last 7d):       {aum['wau']:,}")
    print(f"MAU (last 30d):      {aum['mau']:,}")
    print(f"Mean DAU (all days): {aum['dau_mean']:.1f}")
    print(f"Median DAU:          {aum['dau_median']:.1f}")
    print(f"Stickiness DAU/MAU:  {100 * aum['stickiness_dau_mau']:.1f}%")
    print(f"Stickiness WAU/MAU:  {100 * aum['stickiness_wau_mau']:.1f}%")

    print("\n=== Searches / active user / day ===")
    print(f"Mean:   {spa_rate.mean():.2f}")
    print(f"Median: {spa_rate.median():.2f}")

    print("\n=== Retention (mean % across measurable cohorts) ===")
    for n in (7, 30):
        col = f"d{n}_pct"
        if col in retention.columns and retention[col].notna().any():
            print(f"D{n}: {retention[col].mean(skipna=True):.1f}%")
        else:
            print(f"D{n}: n/a (not enough history)")

    print("\n=== Searches per fingerprint (lifetime) ===")
    print(f"Mean:   {searches_fp.mean():.2f}")
    print(f"Median: {searches_fp.median():.2f}")
    print(f"P90:    {searches_fp.quantile(0.9):.0f}")
    print(f"Max:    {searches_fp.max():.0f}")
    ones = int((searches_fp == 1).sum())
    print(f"Exactly 1 search: {ones:,} ({100 * ones / len(searches_fp):.1f}% of users)")

    print(EXPLAIN)


def main():
    parser = argparse.ArgumentParser(description="YT Filter Pro engagement analysis")
    parser.add_argument("--csv", help="Optional CSV export instead of live Supabase fetch")
    parser.add_argument(
        "--out",
        default=str(Path(__file__).resolve().parent / "engagement_output"),
        help="Directory for PNG charts",
    )
    parser.add_argument("--show", action="store_true", help="plt.show() after save (interactive)")
    args = parser.parse_args()

    df = load_frame(args.csv)
    print(f"Loaded {len(df):,} events / {df['fingerprint'].nunique():,} fingerprints")

    aum = compute_aum(df)
    spa = searches_per_active_user_per_day(df)
    retention = retention_curve(df, horizons=(7, 30))
    searches_fp = searches_per_fingerprint(df)
    growth = growth_and_dau_series(df)

    out_dir = Path(args.out)
    plot_all(aum, spa, retention, searches_fp, growth, out_dir)

    # Also dump summary JSON for later
    summary = {
        "as_of": str(aum["as_of"]),
        "dau": aum["dau"],
        "wau": aum["wau"],
        "mau": aum["mau"],
        "dau_mean": aum["dau_mean"],
        "dau_median": aum["dau_median"],
        "stickiness_dau_mau": aum["stickiness_dau_mau"],
        "searches_per_active_user_mean": float(spa["searches_per_active_user"].mean()),
        "searches_per_active_user_median": float(spa["searches_per_active_user"].median()),
        "retention_d7_mean_pct": float(retention["d7_pct"].mean(skipna=True))
        if "d7_pct" in retention and retention["d7_pct"].notna().any()
        else None,
        "retention_d30_mean_pct": float(retention["d30_pct"].mean(skipna=True))
        if "d30_pct" in retention and retention["d30_pct"].notna().any()
        else None,
        "searches_per_fp_mean": float(searches_fp.mean()),
        "searches_per_fp_median": float(searches_fp.median()),
        "rows": int(len(df)),
        "unique_fingerprints": int(df["fingerprint"].nunique()),
    }
    summary_path = out_dir / "summary.json"
    out_dir.mkdir(parents=True, exist_ok=True)
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"  wrote {summary_path}")

    print_report(df, aum, spa, retention, searches_fp)

    if args.show:
        # Re-open last figures only if user wants interactive; charts already saved.
        print("(Charts already saved under --out; open the PNGs to review.)")


if __name__ == "__main__":
    main()
