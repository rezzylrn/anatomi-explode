# Anatomy Explode

A 3D anatomy education website: 10 body systems you can explode apart, click any organ to see its name (English + Latin) and description.

Live demo: https://anatomi-explode-zzc55etq3-rezzylrns-projects.vercel.app

## Features

- 2,234 organ meshes from the BodyParts3D dataset
- Explode slider: separates each system into a neat grid
- Click an organ → panel with name (English/Latin) + description
- Search organs, quiz mode, orbit/zoom/rotate
- Bilingual UI: Indonesian and English (ID/EN toggle)
- Static site, no build step, works on desktop and mobile

## Run locally

Needs an HTTP server (browsers block fetching local files):

```sh
python3 -m http.server 8000
```

Open http://localhost:8000

## Structure

- `index.html`, `app.js`, `styles.css` — the app
- `models/` — 13 GLB files, one per system, + manifest
- `data/anatomy.json` — organ names & descriptions (Indonesian + English)
- `vendor/` — local Three.js (works offline)
- `tools/` — dataset-to-GLB conversion scripts

## Data source

3D meshes from [BodyParts3D 4.0](https://lifesciencedb.jp/bp3d/) © Database Center for Life Science (DBCLS), CC BY 4.0.
