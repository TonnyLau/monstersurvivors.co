# Task: Build Eleventy Multi-Page Games Site

## Goal

Implement the v1 architecture from `docs/multipage-games-design.md` as a static Eleventy site.

## Scope

- Scaffold a Node/Eleventy project in the current directory.
- Add `_data/site.json`, `_data/navigation.json`, and `_data/games.json`.
- Generate `/`, `/survival/`, `/action/`, `/arcade/`, `/new-games/`, `/games/monster-survivors/`, `/sitemap.xml`, and `/robots.txt`.
- Add data validation for featured slugs, related slugs, categories, live iframe URLs, thumbnails, SEO fields, tags, and `publishedAt`.
- Implement secure iframe defaults, JSON-LD, canonical URLs, sitemap rules, responsive UI states, loading state, and mobile breadcrumb behavior.
- Keep generated output static and deployable from `dist/`.

## Test Strategy

- Use Node's built-in test runner for data and generated-output assertions.
- Run tests before implementation to confirm required behavior is missing.
- Run `npm test` and `npm run build` before completion.

## Out Of Scope

- Login, comments, ratings, database, search, ads, multilingual routing, complex filters, and dark mode.
