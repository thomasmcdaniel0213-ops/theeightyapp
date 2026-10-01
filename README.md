# THE EIGHTY V2.2

This corrects the hero to match the approved direction:

- Uses the exact approved THE EIGHTY logo.
- Removes the white square/background from the logo and keeps only the real logo artwork.
- Places the logo as a translucent watermark in the upper-right of the green hero.
- Restores a clearly visible layered mountain range across the lower hero.
- Keeps `DO THE NEXT RIGHT THING.` and the 80% goal-line treatment.
- Hero artwork is embedded into `index.html`; there is no mountain asset path that can break.
- Service-worker cache bumped to `the-eighty-v2-2`.

## Upload/replace at the GitHub repo root
1. index.html
2. manifest.webmanifest
3. service-worker.js
4. apple-touch-icon.png
5. icon-192.png
6. icon-512.png

`the-eighty-logo-transparent.png` is included for reference/future design work, but the hero already embeds it directly, so it is not required for the page to render.

After GitHub Pages deploys, fully close the Home Screen app and reopen it. If iOS still holds the old service worker, remove and re-add the Home Screen app once.
