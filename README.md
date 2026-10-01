# THE EIGHTY V2.1 — embedded-brand fix

This build fixes the exact issue seen in the screenshot:
- The mountain artwork is embedded directly into `index.html`.
- Your approved THE EIGHTY logo is embedded directly into `index.html` as the hero watermark.
- No `/assets` folder is required for the hero.
- PWA icons live at the repository root.
- Service worker cache version was bumped to `the-eighty-v2-1`.

## Upload these 6 files to the ROOT of the GitHub Pages repository
1. `index.html`
2. `manifest.webmanifest`
3. `service-worker.js`
4. `apple-touch-icon.png`
5. `icon-192.png`
6. `icon-512.png`

Replace the old files with these versions.

## After GitHub finishes deploying
1. Open the site in Safari.
2. Refresh once.
3. If an old cached build remains, close the Home Screen app completely and reopen it.
4. If needed, delete the old Home Screen icon and add the site to Home Screen again.

There is no `assets` folder to upload in this version.
