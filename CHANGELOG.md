# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Fixed

- **Edge: 1px line artifact on transparent favicons** — two root causes addressed:
  - `resizeImage` computed sub-pixel coordinates (`x`, `y`, `scaledW`, `scaledH`) for
    non-square source images. With `imageSmoothingQuality: 'high'` the Canvas API
    interpolates across pixel boundaries, producing a faint semi-transparent fringe that
    Edge renders as a visible line against transparent areas. All four values are now
    rounded to integers via `Math.round()`.
  - The ICO `ICONDIRENTRY` had `wPlanes = 1` and `wBitCount = 32` for PNG-embedded
    images. Per the ICO specification both fields must be `0` when the stored image is
    PNG; non-zero values can lead parsers (including Edge) to attempt legacy BMP
    interpretation before checking the PNG magic bytes, risking further rendering
    artefacts. Both fields are now set to `0`.
