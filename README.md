# THE EIGHTY — V2

This is the updated iPhone-first PWA build.

## Changes in this version
- Uses the **actual THE EIGHTY logo asset** as a translucent watermark in the home hero.
- Keeps the green mountain / climbing visual direction behind the hero.
- Hero coaching language: **DO THE NEXT RIGHT THING.**
- Protect mode language: **PROGRESS. NOT PERFECTION.**
- More colorful card backgrounds and percentage-state colors.
- Target and Minimum appear on separate lines, with green Target and orange Minimum labels.
- WHY is attached to each individual commitment rather than the full day.
- Outside Control is an individual-goal WHY option and is excluded from that opportunity's denominator.
- Go Beyond can never project a lower consistency score than Show Me The Path.
- Installation instructions removed from Goals.
- Apple Fitness screenshot upload includes client-side OCR (when the OCR library is reachable), confirmation, and automatic walk/run mileage insertion.
- iPhone standalone/PWA metadata, safe areas, persistent Home navigation, service worker, and local saving.

## GitHub upload
Upload the **entire folder structure** to your repository root. The `assets` folder must remain a folder.

If replacing an existing build, overwrite:
- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `service-worker.js`
- `assets/...`

After GitHub Pages redeploys, fully close THE EIGHTY on iPhone and reopen it from the Home Screen. If iOS still shows the old cached version, delete the Home Screen app and add it again once.
