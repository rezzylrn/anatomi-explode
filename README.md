# Anatomi Explode

Web edukasi anatomi 3D: 10 sistem tubuh yang bisa di-explode, klik tiap organ buat lihat nama Indonesia + Latin dan penjelasannya.

Coba langsung: https://anatomi-explode-cqyylhb5y-rezzylrns-projects.vercel.app

## Fitur

- 2.234 mesh organ 3D dari dataset BodyParts3D
- Slider explode: misahin tiap sistem jadi grid rapi
- Klik organ → panel nama (Indonesia/Latin) + penjelasan
- Search organ, mode kuis, orbit/zoom/putar
- Situs statis, tanpa build step

## Jalanin lokal

Butuh HTTP server (browser nolak fetch file lokal):

```sh
python3 -m http.server 8000
```

Buka http://localhost:8000

## Struktur

- `index.html`, `app.js`, `styles.css` — aplikasinya
- `models/` — 13 file GLB per sistem + manifest
- `data/anatomy.json` — nama & penjelasan tiap organ
- `vendor/` — Three.js lokal (biar bisa offline)
- `tools/` — script konversi dataset ke GLB

## Sumber data

Mesh 3D dari [BodyParts3D 4.0](https://lifesciencedb.jp/bp3d/) © Database Center for Life Science (DBCLS), lisensi CC BY 4.0.
