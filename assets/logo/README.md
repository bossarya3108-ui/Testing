# Official Manveon logo

The reel is set up to use the official logo asset exactly as supplied.

Drop the official artwork here as:

```
assets/logo/manveon-logo.png
```

Guidelines for the export:

- PNG with a transparent background.
- At least 1280 px wide (it is drawn at ~640 px wide in the 1080 × 1920 frame).
- Do not crop, recolour or add effects — the renderer draws the image unchanged
  and preserves its aspect ratio.

Until this file exists, `src/brand.js` renders the wordmark “MANVEON”
typographically in Barlow Black with wide tracking. That fallback is intentionally
plain: it does not attempt to recreate or approximate a logo mark.
