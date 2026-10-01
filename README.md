# The Eighty V2.4

## Data Management Update

Added safe controls for test data without touching unrelated GitHub Pages apps.

### Goals > Data & Reset
- **View Legacy Mileage**
  - Shows mileage entries created by older versions of The Eighty.
  - Each entry can be deleted individually.
- **Clear Legacy Mileage**
  - Removes all old/manual mileage entries.
  - Does not delete Workout Log entries.
- **Reset 100-Mile Challenge Data**
  - Clears legacy/manual mileage only.
  - Saved walking/running workouts remain and continue contributing their qualifying distance.
- **Reset The Eighty Test Data**
  - Clears:
    - Daily check-ins
    - WHY entries
    - Weekly reviews
    - Workout Log
    - Mileage
  - Keeps your goal definitions.

## Upload To GitHub Root
Replace:
1. `index.html`
2. `manifest.webmanifest`
3. `service-worker.js`
4. `apple-touch-icon.png`
5. `icon-192.png`
6. `icon-512.png`

Service-worker cache is now `the-eighty-v2-4`.

After GitHub Pages deploys, fully close The Eighty and reopen it.
