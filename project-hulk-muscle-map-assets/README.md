# Project Hulk female muscle map assets

These SVGs are vector traces reconstructed from the approved generated raster reference, so Claude Code should use their geometry as the visual source of truth rather than redraw the figures.

Files:
- female-muscle-map-front.svg
- female-muscle-map-back.svg
- front-reference.png
- back-reference.png

Important: automatic raster tracing can recover visible geometry, but it cannot reliably infer semantic anatomy IDs from pixels. Before using per-muscle dynamic coloring, open the SVGs in Figma/Illustrator/Inkscape and assign/refine semantic IDs to the exact paths you approve. Do not ask Claude to invent new anatomy. Once IDs are assigned, Claude should only map app data to those fixed paths.
