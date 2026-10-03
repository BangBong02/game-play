# Demo media provenance

2026-10-03, Lingoplay local MVP.

- `public/images/vocabulary/*.svg`:20 original project illustrations from the existing demo, retained at stable URLs for saved rounds.
- `public/media/images/vocabulary/{book,pen,bag,bed,chair,table,door,house,car,bus}.webp`:10 original Lingoplay illustrations, authored as vector primitives in `scripts/create-demo-images.mjs`, rasterized with existing sharp. No third-party reference artwork is used.
- `public/media/audio/vocabulary/*-us.mp3`:52 offline synthetic demo pronunciations generated with the installed Microsoft Zira Desktop English US voice through Windows SAPI, converted by ffmpeg to mono22.05kHz/48kbps MP3. These are synthetic demo recordings, not Oxford recordings or human-reviewed dictionary audio. Scripts require an installed licensed Windows voice; no redistribution of the voice software/model is included. Replace recordings with reviewed production audio when appropriate.
- Meanings/examples are independently authored for Lingoplay. Oxford3000 is a membership reference only; no dictionary definitions, examples or pronunciation assets are copied. `duck` and `rabbit` remain supplemental compatibility words outside the verified Oxford subset.

New media must have explicit source/provenance. A URL alone is not evidence of permission. Do not bulk download another game's artwork/audio.
