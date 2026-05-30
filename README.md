# EHA 2026 Conference Data Archive

Static GitHub Pages interface for `data/eha_2026_abstracts.json`, with a browser search index at `assets/data/presentations-index.json` and a plain-text Markdown export at `assets/data/eha_2026_abstracts.md`.

The site follows the same static archive pattern as the ECFS 2026 project, adapted for EHA Library colors, imagery, and record fields.

## Local preview

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Rebuild the browser index and Markdown export

```powershell
python scripts/build_site_data.py
```
