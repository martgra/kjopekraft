# Norwegian Parliament Compensation Data Sources for kjøpekraft.no Integration

**No official API exists for Stortingsrepresentant compensation data** — the parliament's data.stortinget.no API covers proceedings and voting but excludes salary information. However, structured HTML tables on stortinget.no provide reliable, scrapable historical data back to 2001, making web scraping the most viable integration approach.

## The primary data source: stortinget.no's compensation table

The most reliable machine-readable source is the official historical compensation table maintained by Stortinget:

**URL**: `https://www.stortinget.no/no/Stortinget-og-demokratiet/Representantene/Okonomiske-rettigheter/Lonnsutvikling/`

This HTML page contains a well-structured `<table>` element with consistent headers and formatting, covering all compensation rates from **October 2001 to present**. The table includes four categories: Stortingspresidenten, Stortingsrepresentanter, Statsministeren, and Regjeringsmedlemmer. The page was last updated June 19, 2025, and follows annual updates shortly after May 1st when new rates take effect.

**Technical assessment for scraping**:

- Clean HTML table structure with `<thead>` and `<tbody>` elements
- Consistent date format (dd.mm.yyyy) in first column
- Numeric values in Norwegian kroner without currency symbols in cells
- No JavaScript rendering required — static HTML
- Update frequency: Once annually (May–June)

## Current compensation amounts (effective May 1, 2025)

| Position                   | Annual Compensation (NOK) |
| -------------------------- | ------------------------- |
| Stortingsrepresentant      | **1,214,977**             |
| Stortingspresident         | 2,134,434                 |
| Statsminister              | 2,134,434                 |
| Regjeringsmedlem (Cabinet) | 1,734,020                 |

Additional supplements apply: First Vice President receives **+14%** of base representative rate; other Vice Presidents and Committee Chairs receive **+7%**.

## Secondary official sources worth integrating

**Regjeringen.no political leadership page**:
`https://www.regjeringen.no/no/om-regjeringa/arsgodtgjorelse-for-politisk-ledelse/id3053568/`

This provides current rates for Statsminister, Regjeringsmedlemmer, and SMK Stabssjef (1,508,605 kr). The format is simpler prose with embedded figures rather than a structured table.

**Lovdata legal references**:

- Current law: `https://lovdata.no/lov/2016-12-20-106` (Stortingsgodtgjørelsesloven)
- New law from Oct 2025: `https://lovdata.no/dokument/NL/lov/2025-06-20-57` (Representantytelsesloven)

Note: Lovdata's robots.txt restricts automated scraping, and the legal text defines the framework but not specific amounts — those are set by annual Stortinget decisions.

## Why APIs and open data portals don't help here

**data.stortinget.no** offers excellent XML/JSON APIs for parliamentary proceedings, representative biographies, voting records, and committee data. However, compensation information is explicitly **not included** in any endpoint. The `/representanter` and `/person` endpoints return names, parties, districts, and photos — no salary fields exist.

**data.norge.no** contains no datasets for parliament compensation. Related datasets cover speech corpora and electoral districts but not remuneration.

The R package `stortingscrape` on CRAN provides convenient API access but inherits the same limitation — no compensation data available through programmatic means.

## Historical data availability and structure

The Lønnsutvikling table provides complete time series from **October 1, 2001** through present, with typical annual adjustments. Key data points from recent years:

| Year | Stortingsrepresentant | Change |
| ---- | --------------------- | ------ |
| 2025 | 1,214,977 kr          | +3.8%  |
| 2024 | 1,171,000 kr          | +5.8%  |
| 2023 | 1,107,190 kr          | +4.0%  |
| 2022 | 1,064,318 kr          | +7.7%  |
| 2019 | 987,997 kr            | +3.3%  |

No adjustments occurred in 2020–2021 due to COVID-19. For data before 2001, Stortingsforhandlinger archives (1814–2005) contain historical records but require manual extraction from PDF/scanned documents.

## Recommended integration approach for kjøpekraft.no

**Option 1 — Direct HTML scraping (recommended)**:
Build a scraper targeting the Lønnsutvikling table. The consistent structure allows reliable CSS/XPath selectors. Implement annual refresh logic triggered after May 1st, with manual verification before publishing updates.

**Option 2 — Maintain a local JSON dataset**:
Create a structured JSON file with historical rates, manually updated annually from official sources. This avoids scraping fragility while maintaining data provenance.

```json
{
  "source": "stortinget.no/Lonnsutvikling",
  "last_updated": "2025-05-01",
  "rates": [
    {
      "effective_date": "2025-05-01",
      "stortingsrepresentant": 1214977,
      "stortingspresident": 2134434
    },
    {
      "effective_date": "2024-05-01",
      "stortingsrepresentant": 1171000,
      "stortingspresident": 2057177
    }
  ]
}
```

**Option 3 — Request official data export**:
Contact Stortinget directly (web@stortinget.no, +47 23 31 33 33) to request a structured data file or suggest adding compensation to their Open Data API. Given the portal's maturity, this could yield results.

## Technical implementation notes

- **URL stability concern**: The main compensation page URL changed from `/godtgjorelse/` to `/godtgjoring/` in 2025. Implement URL monitoring or fallback paths.
- **Caching strategy**: Given annual updates, cache aggressively with refresh logic tied to May 1st effective dates.
- **Data validation**: Cross-reference scraped values against annual Innstilling documents published at `https://www.stortinget.no/no/Saker-og-publikasjoner/Publikasjoner/Innstillinger/Stortinget/`

## Conclusion

For kjøpekraft.no integration, **scraping the Lønnsutvikling HTML table is the most practical approach** — it provides authoritative, historical, and consistently structured data that no API currently offers. The table's stability over time, annual update cadence, and official status make it a reliable foundation for reference salary comparisons. Consider maintaining a local structured cache updated annually to minimize scraping frequency while preserving data accuracy.
