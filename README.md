# THE EIGHTY — V1

Mobile-first October 2026 accountability app built around the 80% consistency line.

## Included in V1
- THE EIGHTY green ombré brand system
- iPhone-first layout with safe-area-aware bottom navigation and persistent Home button
- Five editable life categories: Personal, Professional, Spiritual, Fitness, Mental
- Target / Minimum Win / Outside Control daily status choices
- 80/20 scoring bands and category rings
- 100-mile October walk + run tracker
- THE PATH coaching modes: Go Beyond, Show Me The Path, Protect the Habit
- WHY/context tracking and weekly review
- Consistency calendar
- Local device saving
- JSON backup export/import
- Simple mileage CSV import (`date,miles`)
- PWA manifest + service worker for Home Screen installation when hosted over HTTPS

## Run locally
You can open `index.html` directly for basic use. For PWA/service-worker testing, run a local web server from this folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages
1. Create or open a GitHub repository.
2. Upload every file/folder in this package to the repository root.
3. In GitHub: Settings → Pages.
4. Under Build and deployment choose `Deploy from a branch`.
5. Select the main branch and `/ (root)`, then Save.
6. Open the HTTPS GitHub Pages URL in Safari on iPhone.
7. Safari → Share → Add to Home Screen.

## Scoring
- 100% = Perfect
- 80–99% = Consistently Successful
- 65–79% = Close / identify the WHY
- 51–64% = Needs Attention
- 0–50% = Inconsistent / reset and return

A Target earns 100% for that scheduled opportunity. A Minimum Win earns 80%. `Outside Control` removes that scheduled opportunity from the denominator rather than counting it as a miss.

The 100-mile challenge is separate from the five-category THE EIGHTY Score. Only walking + running mileage counts toward 100 miles. Pickleball and other activities can satisfy the Fitness movement habit but do not add mileage.
