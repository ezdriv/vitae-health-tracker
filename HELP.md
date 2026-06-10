# Vitae Health Tracker — Help & Source References

## Overview

Vitae is a self-contained BMI health tracker. Open `index.html` in any modern browser — no server or installation required.

## How to Run

1. **Double-click** `bmi-health-tracker/index.html` in Finder/Explorer
2. **Drag and drop** the file into Chrome, Safari, Firefox, or Edge
3. **Terminal (macOS):** `open "/path/to/bmi-health-tracker/index.html"`
4. **Terminal (Linux):** `xdg-open bmi-health-tracker/index.html`

**Basic use:** No server required — double-click `index.html`.

**PWA install (offline app):**
```bash
cd bmi-health-tracker
./start-server.sh
# or: python3 -m http.server 8080
```
Open http://localhost:8080 → click **Install** in the header or browser menu.

## Insights, Goals & Doctor Report

### Insights & Goals tab
- Set **target weight** or **target BMI** with optional target date
- View 7-day / 30-day moving averages, weekly change, logging streak
- Progress bar shows distance to goal

### Doctor Visit Report
- Header **Report** button or Insights tab → Preview / Print / Download HTML
- Includes profile, goals, trends, recent entries, journal notes, sources

### Weekly CSV Backup
- App reminds you to export if no backup in 7+ days
- Toggle reminder in Insights tab → Backup & Install section

## Age-Based Life Stages

Set your **birth date** and **sex at birth** in the **Profile** panel (sidebar). The app calculates your age on each entry date and applies the correct BMI reference scale:

| Life Stage | Age Range | BMI Reference Scale |
|------------|-----------|-------------------|
| **Infant** | 0–23 months | WHO Child Growth Standards (weight-for-length; BMI charts begin at age 2) |
| **Child** | 2–12 years | CDC BMI-for-age sex-specific percentiles |
| **Adolescent** | 13–19 years | CDC BMI-for-age sex-specific percentiles |
| **Adult** | 20–64 years | WHO/CDC fixed BMI cutoffs |
| **Mature Adult** | 65+ years | WHO/CDC adult BMI + geriatric context |

### Pediatric Categories (ages 2–19)
- **Underweight:** BMI &lt; 5th percentile
- **Healthy Weight:** 5th to &lt; 85th percentile
- **Overweight:** 85th to &lt; 95th percentile
- **Obesity:** ≥ 95th percentile

Percentile thresholds are interpolated from **CDC 2000 Growth Charts** (`cdc-percentiles.js`) based on exact age in months and sex.

> **Important:** Age is calculated per entry date, not today. A user tracked from childhood through adulthood will automatically transition between scales as they age.

## BMI Calculation

**Formula (WHO standard):**

```
BMI = weight (kg) ÷ [height (m)]²
```

**Imperial conversion (NIST standard):**
- Weight: pounds × 0.45359237 → kilograms
- Height: (feet × 12 + inches) × 2.54 → centimeters

Toggle units via **kg / cm** or **lb / ft·in** in the header. Your choice is **saved automatically** and applies everywhere: calendar entry, bulk entry, goals (target weight in kg or lb), insights, and history. Reloading the page restores your preference — no need to re-select each time.

## BMI Categories (Adults ≥20 years — WHO/CDC)

| Category                    | BMI Range   |
|----------------------------|-------------|
| Underweight                | < 18.5      |
| Healthy Weight             | 18.5 – 24.9 |
| Overweight                 | 25.0 – 29.9 |
| Obesity Class I            | 30.0 – 34.9 |
| Obesity Class II           | 35.0 – 39.9 |
| Obesity Class III (Severe) | ≥ 40.0      |

> Pediatric BMI (ages 2–19) uses age- and sex-specific percentiles, not adult categories.

## Primary Sources — BMI

1. **WHO — Obesity and Overweight Fact Sheet (2024)**  
   https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight

2. **CDC — Adult BMI Categories**  
   https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html

3. **CDC — BMI Percentile Calculator for Children & Teens**  
   https://www.cdc.gov/bmi/child-teen-calculator/cdc-bmi-percentile-calculator.html

## Lifespan Reference Data

Figures displayed in the app are global population estimates.

### Male
- Life expectancy at birth: **71.3 years** (WHO, 2021)
- Healthy life expectancy (HALE): **17.5 years**
- Normal BMI range (18.5–24.9) associated with lowest all-cause mortality in meta-analyses

### Female
- Life expectancy at birth: **76.4 years** (WHO, 2021)
- Healthy life expectancy (HALE): **19.2 years**
- Global female advantage: ~5 years over males

### Infant
- Infant mortality: **28.2 per 1,000 live births** (UN IGME, 2023)
- Under-5 mortality: **37.7 per 1,000 live births**
- Survival to age 1 (global): **99.7%**
- Projected lifespan if born today: **73.4 years**

### Elderly (age 65+)
- Remaining life expectancy at 65: **17.8 years** (UN WPP 2023)
- Remaining at 80: **9.4 years**
- Global population aged 65+: **22.1%**
- Geriatric note: BMI 23–27 may be protective in some elderly populations (WHO ageing report)

## Primary Sources — Lifespan & Mortality

1. **WHO Global Health Observatory — Mortality & Life Expectancy**  
   https://www.who.int/data/gho/data/themes/mortality-and-global-health-estimates

2. **UN DESA — World Population Prospects 2024**  
   https://population.un.org/wpp/

3. **CDC NCHS — FastStats: Life Expectancy (United States)**  
   https://www.cdc.gov/nchs/fastats/life-expectancy.htm

4. **WHO — Under-Five Mortality Rate Indicator**  
   https://www.who.int/data/gho/data/indicators/indicator-details/GHO/under-five-mortality-rate-(probability-of-dying-by-age-5-per-1000-live-births)

5. **The Lancet (2016) — BMI and all-cause mortality meta-analysis**  
   Referenced in WHO obesity fact sheet for optimal BMI range associations

## Tabs

### Calendar Entry
Single-date BMI entry with calendar picker and **Journal** field for mood, activities, diet, sleep, stress, or other factors explaining weight changes.

### Trends & Graphs
Three chart formats, all using WHO zone colors:
- **Line** — BMI trend with colored zone bands
- **Bar** — Category-colored bars per entry
- **3D Ribbon** — Perspective ribbon trajectory through BMI zones

### Bulk Entry
Spreadsheet-style mass entry with selectable **Month**, **Day**, and **Year** per row. Table auto-adjusts to content. BMI calculates live. Notes column included.

## Data Storage & Persistence

### Auto-save (Between Sessions)
Every save writes simultaneously to:
- **localStorage** (primary, key: `vitae-bmi-health-tracker`)
- **localStorage backup** (redundant copy)
- **IndexedDB** (`VitaeHealthDB`) — recovered automatically if localStorage is cleared

**Your data persists when:**
- You close the browser tab
- The browser crashes or is force-quit
- You restart your computer
- You reopen `index.html` later in the **same browser**

**Draft auto-save:** Unsaved form input (weight, height, journal notes) is draft-saved every ~1.5 seconds while you type.

Data does **not** sync across browsers or devices automatically — use CSV export/import for that.

### Export / Offload Data
1. Click **⬇ Export CSV** in the header (or **Export CSV & Exit** when leaving)
2. File saved as **`vitae-bmi-health-log.csv`** to your Downloads folder
3. Open in Excel, Google Sheets, Numbers, or any text editor

### Import / Reload Data
1. Click **⬆ Import CSV** in the header
2. Select a previously exported `vitae-bmi-health-log.csv`
3. Entries merge into the app and save to localStorage
4. Duplicate dates are overwritten with imported values

### Transfer Between Devices
1. **Export** on computer A → copy CSV file to computer B (USB, email, cloud)
2. **Import** on computer B → data is loaded and persisted locally

### Backup Recommendation
Export weekly. Clearing browser data/cache will erase localStorage.

### CSV Format
- **Columns:** `date, weight_kg, height_cm, bmi, category, unit_system, notes, recorded_at`
- Legacy files without `notes` column are still supported

Example:
```csv
date,weight_kg,height_cm,bmi,category,unit_system,notes,recorded_at
2026-06-10,72.5,175,23.7,Normal,metric,"Morning run, felt energetic",2026-06-10T14:30:00.000Z
```

## Disclaimer

This tool is for personal health tracking and educational reference only. It does not constitute medical advice. BMI does not distinguish muscle mass from fat mass. Consult a healthcare provider for clinical assessment.