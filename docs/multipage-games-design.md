# monstersurvivors.co Multi-Page Games Site Design

## 1. Project Goal

Build a multi-page online games portal for `https://monstersurvivors.co/`.

The homepage is a discovery and navigation hub, not a single-game landing page. It should guide users into game categories, highlight four recommended games, and route playable games to reusable detail pages. Each playable game page uses an iframe-based template with original SEO content, game information, gameplay instructions, FAQs, and related game links.

Version 1 should support:

- A polished homepage at `/`
- Category pages at `/survival/`, `/action/`, and `/arcade/`
- A data-driven new games page at `/new-games/`
- A playable game page at `/games/monster-survivors/`
- An Eleventy static build that outputs deployable HTML, `sitemap.xml`, and `robots.txt`
- A structured game catalog in `_data/games.json`
- Separate navigation data in `_data/navigation.json`
- Shared site metadata in `_data/site.json`
- Shared global navigation and footer across all pages
- Responsive layouts for desktop, tablet, and mobile

## 2. Core Positioning

`monstersurvivors.co` should feel like a clean browser-game portal focused on survival, action, arcade, and casual games. The visual direction should be modern, simple, and Apple-inspired rather than noisy or overly decorative.

Primary site value:

- Help users discover free online games quickly.
- Let users play games directly in the browser through secure iframe embeds.
- Keep pages SEO-friendly with structured headings, descriptions, internal links, canonical URLs, original page content, JSON-LD, and sitemap support.

Third-party iframe content is not indexed as local page content. Every game page must include original About, How to Play, Features, and FAQ sections outside the iframe.

## 3. Site Information Architecture

```text
monstersurvivors.co
|
+-- /                         Homepage: navigation hub + featured games
|
+-- /survival/                Survival category page
+-- /action/                  Action category page
+-- /arcade/                  Arcade category page
+-- /new-games/               New games collection sorted by publishedAt
|
+-- /games/
    +-- /monster-survivors/   Live playable game page
    +-- /survival-arena/      Future game page or coming-soon entry
    +-- /zombie-rush/         Future game page or coming-soon entry
    +-- /battle-heroes/       Future game page or coming-soon entry
```

Recommended first build behavior:

- `/` renders the homepage.
- `/games/monster-survivors/` renders the live iframe game page.
- Other featured games can appear as `Coming Soon` cards until iframe URLs are available.
- Category pages can show live games plus coming-soon cards if the data includes them.
- `/new-games/` is generated from game data and sorted by `publishedAt` descending.

## 4. Global Navigation

All pages should use the same header navigation from `_data/navigation.json`.

Desktop layout:

```text
+----------------------------------------------------------------+
| Monster Survivors       Home  Survival  Action  Arcade  New    |
+----------------------------------------------------------------+
```

Mobile layout:

```text
+------------------------------+
| Monster Survivors        Menu |
+------------------------------+
| Home                         |
| Survival                     |
| Action                       |
| Arcade                       |
| New Games                    |
+------------------------------+
```

Navigation requirements:

- The site name links to `/`.
- `Home` links to `/`.
- `Survival` links to `/survival/`.
- `Action` links to `/action/`.
- `Arcade` links to `/arcade/`.
- `New Games` links to `/new-games/`.
- The current page's nav item should be visually highlighted.
- The mobile menu can be a simple stacked section or a compact menu button.
- Header should remain clean and lightweight; no account system, search, or filters are required in v1.

## 5. Homepage Design

The homepage is the main discovery page. It should make the site feel like a complete game portal while keeping the layout simple enough for a static first version.

### Desktop Homepage Wireframe

```text
+----------------------------------------------------------------+
| Global Navigation                                              |
+----------------------------------------------------------------+
| Hero                                                           |
| H1: Play Free Online Survival Games                            |
| Intro: Discover fast browser games you can play instantly.     |
| CTA: Browse Featured Games                                     |
+----------------------------------------------------------------+
| H2: Featured Games                                             |
| +------------+ +------------+ +------------+ +------------+     |
| | Monster    | | Survival   | | Zombie     | | Battle     |     |
| | Survivors  | | Arena      | | Rush       | | Heroes     |     |
| | Survival   | | Survival   | | Action     | | Arcade     |     |
| | Play Now   | | Coming Soon| | Coming Soon| | Coming Soon|     |
| +------------+ +------------+ +------------+ +------------+     |
+----------------------------------------------------------------+
| H2: Browse by Category                                         |
| +----------------+ +----------------+ +----------------+        |
| | Survival Games| | Action Games   | | Arcade Games   |        |
| +----------------+ +----------------+ +----------------+        |
+----------------------------------------------------------------+
| H2: Why Play on monstersurvivors.co                             |
| Short SEO content about instant browser games, no install,      |
| survival/action focus, and regular new game additions.          |
+----------------------------------------------------------------+
| Footer                                                         |
+----------------------------------------------------------------+
```

### Mobile Homepage Wireframe

```text
+------------------------------+
| Global Navigation            |
+------------------------------+
| H1: Play Free Online         |
| Survival Games               |
| Intro text                   |
| CTA                          |
+------------------------------+
| H2: Featured Games           |
| [Monster Survivors Card]     |
| [Survival Arena Card]        |
| [Zombie Rush Card]           |
| [Battle Heroes Card]         |
+------------------------------+
| H2: Browse by Category       |
| [Survival Games]             |
| [Action Games]               |
| [Arcade Games]               |
+------------------------------+
| H2: Why Play Here            |
| SEO content block            |
+------------------------------+
| Footer                       |
+------------------------------+
```

Homepage requirements:

- Exactly one `<h1>`.
- Multiple `<h2>` sections.
- Four featured game cards sourced from `_data/games.json.featuredGames`.
- `Monster Survivors` should be the first featured game and link to `/games/monster-survivors/`.
- Coming-soon cards should look intentional, not broken.
- The homepage should not embed the iframe; iframe gameplay belongs on game detail pages.
- Homepage JSON-LD should use `WebSite`.

## 6. Game Detail Page Template

Every playable game page should share one reusable Eleventy template.

### Desktop Game Page Wireframe

```text
+----------------------------------------------------------------+
| Global Navigation                                              |
+----------------------------------------------------------------+
| Breadcrumb: Home / Survival / Monster Survivors                |
+----------------------------------------------------------------+
| H1: Monster Survivors                                          |
| One-line intro: Survive waves, collect upgrades, stay alive.   |
+----------------------------------------------------------------+
| H2: Play Monster Survivors Online                              |
| +------------------------------------------------------------+ |
| | Loading game...                                            | |
| | Game iframe replaces the loading state when ready           | |
| +------------------------------------------------------------+ |
+----------------------------------------------------------------+
| H2: About Monster Survivors                                    |
| Game overview and SEO-friendly description.                    |
+----------------------------------------------------------------+
| H2: How to Play                                                |
| Controls, movement, survival tips, and progression notes.      |
+----------------------------------------------------------------+
| H2: Game Features                                              |
| Feature list or compact feature cards.                         |
+----------------------------------------------------------------+
| H2: Frequently Asked Questions                                 |
| FAQ items for SEO and user clarity.                            |
+----------------------------------------------------------------+
| H2: More Survival Games                                        |
| Related game cards                                             |
+----------------------------------------------------------------+
| Footer                                                         |
+----------------------------------------------------------------+
```

### Mobile Game Page Wireframe

```text
+------------------------------+
| Global Navigation            |
+------------------------------+
| Breadcrumb: ... / Monster    |
| Survivors                    |
| H1: Monster Survivors        |
| Intro                        |
+------------------------------+
| H2: Play Online              |
| +--------------------------+ |
| | Loading game...          | |
| | Game Iframe              | |
| +--------------------------+ |
+------------------------------+
| H2: About                   |
| Paragraph content           |
+------------------------------+
| H2: How to Play             |
| Tips and controls           |
+------------------------------+
| H2: Features                |
| Feature cards/list          |
+------------------------------+
| H2: FAQ                     |
| FAQ accordion or list       |
+------------------------------+
| Related Games               |
+------------------------------+
```

Game page requirements:

- Exactly one `<h1>`, using the game title.
- Multiple `<h2>` sections.
- The iframe should be prominent and responsive.
- The iframe must preserve aspect ratio while loading and must not overflow on mobile.
- Show a skeleton or centered `Loading game...` placeholder behind the iframe until the iframe is ready.
- Breadcrumbs should support internal linking and user orientation.
- Desktop breadcrumbs show the full path, such as `Home / Survival / Monster Survivors`.
- Mobile breadcrumbs collapse middle levels, such as `... / Monster Survivors`, or show previous + current only.
- Related games should come from `relatedGames` data when available.
- Game page JSON-LD should use `VideoGame`.
- FAQ sections should also emit `FAQPage` JSON-LD when FAQ content exists.

Default live-game iframe:

```html
<iframe
  src="https://cloud.onlinegames.io/games/2025/unity/monster-survivors/index-og.html"
  title="Play Monster Survivors Online"
  loading="lazy"
  sandbox="allow-scripts allow-same-origin allow-pointer-lock"
  allow="fullscreen; gamepad; autoplay; pointer-lock"
  allowfullscreen>
</iframe>
```

The default iframe policy is:

- `sandbox="allow-scripts allow-same-origin allow-pointer-lock"`
- `allow="fullscreen; gamepad; autoplay; pointer-lock"`

Per-game iframe policy overrides are allowed only when a specific embed requires them and the reason is documented in the game record.

## 7. Category And New Games Pages

Category pages group games by theme.

Example: `/survival/`

```text
+----------------------------------------------------------------+
| Global Navigation                                              |
+----------------------------------------------------------------+
| H1: Survival Games                                             |
| Short intro about survival games.                              |
+----------------------------------------------------------------+
| H2: Featured Survival Games                                    |
| Game cards filtered by category = survival                     |
+----------------------------------------------------------------+
| H2: More Game Categories                                       |
| Links to Action, Arcade, New Games                             |
+----------------------------------------------------------------+
| Footer                                                         |
+----------------------------------------------------------------+
```

Category page requirements:

- Exactly one `<h1>`.
- Include short SEO copy for the category.
- Show game cards filtered from `_data/games.json.games` by primary `category`.
- Link to live pages when `status` is `live`.
- Show intentional coming-soon UI for unavailable games.
- Emit `CollectionPage` JSON-LD.

`/new-games/` requirements:

- Generated by Eleventy from `_data/games.json.games`.
- Sort games by `publishedAt` descending.
- Include both live and coming-soon games when they have valid publication dates.
- Use each game's `publishedAt` value for sitemap `<lastmod>`.
- Emit `CollectionPage` JSON-LD.

## 8. Data Model

Use `_data/games.json` as the game catalog source of truth. Use `_data/navigation.json` for nav links and `_data/site.json` for global site metadata. Do not duplicate navigation inside the game catalog.

`_data/site.json`:

```json
{
  "name": "Monster Survivors",
  "domain": "https://monstersurvivors.co"
}
```

`_data/navigation.json`:

```json
[
  { "label": "Home", "href": "/" },
  { "label": "Survival", "href": "/survival/" },
  { "label": "Action", "href": "/action/" },
  { "label": "Arcade", "href": "/arcade/" },
  { "label": "New Games", "href": "/new-games/" }
]
```

`site.defaultLocale` is out of scope for v1 and should not be included unless multilingual routing is added later.

Recommended `_data/games.json` structure:

```json
{
  "featuredGames": [
    "monster-survivors",
    "survival-arena",
    "zombie-rush",
    "battle-heroes"
  ],
  "categories": [
    {
      "slug": "survival",
      "title": "Survival Games",
      "description": "Play survival games where quick movement, smart upgrades, and sharp reactions help you stay alive."
    },
    {
      "slug": "action",
      "title": "Action Games",
      "description": "Explore fast action games built for instant browser play."
    },
    {
      "slug": "arcade",
      "title": "Arcade Games",
      "description": "Jump into simple, replayable arcade games with quick sessions and easy controls."
    }
  ],
  "games": [
    {
      "slug": "monster-survivors",
      "title": "Monster Survivors",
      "category": "survival",
      "tags": ["survival", "action", "monster"],
      "status": "live",
      "publishedAt": "2026-05-27",
      "description": "Survive endless monster waves, collect upgrades, and fight to stay alive.",
      "shortDescription": "Battle monster waves and survive as long as you can.",
      "seo": {
        "title": "Monster Survivors - Play Free Online",
        "description": "Play Monster Survivors online for free. Survive monster waves, collect upgrades, and stay alive in this browser survival game."
      },
      "iframe": {
        "src": "https://cloud.onlinegames.io/games/2025/unity/monster-survivors/index-og.html",
        "sandbox": "allow-scripts allow-same-origin allow-pointer-lock",
        "allow": "fullscreen; gamepad; autoplay; pointer-lock"
      },
      "thumbnail": {
        "src": "/assets/images/monster-survivors-card.jpg",
        "width": 640,
        "height": 360,
        "alt": "Monster Survivors gameplay card art"
      },
      "features": [
        "Fast survival gameplay",
        "Wave-based monster pressure",
        "Upgrade-focused progression",
        "Instant browser play"
      ],
      "instructions": [
        "Move constantly to avoid monster waves.",
        "Collect upgrades whenever they appear.",
        "Keep distance from dense enemy groups.",
        "Survive as long as possible to improve your score."
      ],
      "faq": [
        {
          "question": "Can I play Monster Survivors online for free?",
          "answer": "Yes. Monster Survivors can be played online in your browser without installing a separate app."
        },
        {
          "question": "Does Monster Survivors work on mobile?",
          "answer": "The page is designed to adapt to mobile screens, though gameplay controls may depend on the embedded game."
        }
      ],
      "relatedGames": [
        "survival-arena",
        "zombie-rush",
        "battle-heroes"
      ]
    },
    {
      "slug": "survival-arena",
      "title": "Survival Arena",
      "category": "survival",
      "tags": ["survival", "arena"],
      "status": "coming-soon",
      "publishedAt": "2026-05-20",
      "description": "A future survival challenge planned for the Monster Survivors game collection.",
      "shortDescription": "A survival arena game coming soon.",
      "seo": {
        "title": "Survival Arena - Coming Soon",
        "description": "Survival Arena is a planned browser survival game for the Monster Survivors collection."
      },
      "thumbnail": {
        "src": "/assets/images/survival-arena-card.jpg",
        "width": 640,
        "height": 360,
        "alt": "Survival Arena coming soon card art"
      },
      "relatedGames": []
    },
    {
      "slug": "zombie-rush",
      "title": "Zombie Rush",
      "category": "action",
      "tags": ["action", "survival", "zombie"],
      "status": "coming-soon",
      "publishedAt": "2026-05-13",
      "description": "A future action game planned for the Monster Survivors game collection.",
      "shortDescription": "An action survival game coming soon.",
      "seo": {
        "title": "Zombie Rush - Coming Soon",
        "description": "Zombie Rush is a planned action game for the Monster Survivors browser game collection."
      },
      "thumbnail": {
        "src": "/assets/images/zombie-rush-card.jpg",
        "width": 640,
        "height": 360,
        "alt": "Zombie Rush coming soon card art"
      },
      "relatedGames": []
    },
    {
      "slug": "battle-heroes",
      "title": "Battle Heroes",
      "category": "arcade",
      "tags": ["arcade", "battle"],
      "status": "coming-soon",
      "publishedAt": "2026-05-06",
      "description": "A future arcade battle game planned for the Monster Survivors game collection.",
      "shortDescription": "An arcade battle game coming soon.",
      "seo": {
        "title": "Battle Heroes - Coming Soon",
        "description": "Battle Heroes is a planned arcade battle game for the Monster Survivors browser game collection."
      },
      "thumbnail": {
        "src": "/assets/images/battle-heroes-card.jpg",
        "width": 640,
        "height": 360,
        "alt": "Battle Heroes coming soon card art"
      },
      "relatedGames": []
    }
  ]
}
```

Data rules:

- `featuredGames` contains only slugs.
- The full game data lives in `games`.
- `categories` owns the primary category list.
- `category` is the primary category used for URLs and category pages.
- `tags` supports future cross-category grouping and filtering.
- `status: "live"` means the card can link to a playable page.
- `status: "coming-soon"` means the card should show a disabled or non-primary call to action.
- A live game must include `iframe.src`.
- A coming-soon game does not need `iframe`.
- `relatedGames` defaults to `[]`.
- Every game must include `publishedAt`, `tags`, `relatedGames`, `seo.title`, `seo.description`, and a complete `thumbnail` object with `src`, `width`, `height`, and `alt`.

Validation rules:

- Every `featuredGames` slug must exist in `games`.
- Every `relatedGames` slug must exist in `games`.
- Every `games[].category` must exist in `categories`.
- Every live game must include `iframe.src`.
- Every thumbnail must include `src`, `width`, `height`, and `alt`.
- Every `publishedAt` value must be a valid ISO date string.
- Build validation should fail loudly on invalid data rather than generating broken pages.

## 9. Eleventy Template Strategy

Use Eleventy as the v1 static site generator. Avoid a custom `build.js` generator.

Recommended static build structure:

```text
project/
|
+-- package.json
+-- .eleventy.js
+-- game.md
+-- src/
|   +-- _data/
|   |   +-- site.json
|   |   +-- navigation.json
|   |   +-- games.json
|   +-- _includes/
|   |   +-- layouts/
|   |   |   +-- base.njk
|   |   |   +-- page.njk
|   |   +-- components/
|   |       +-- game-card.njk
|   |       +-- breadcrumbs.njk
|   |       +-- json-ld.njk
|   +-- index.njk
|   +-- categories.njk
|   +-- new-games.njk
|   +-- games.njk
|   +-- sitemap.njk
|   +-- robots.njk
|   +-- assets/
|       +-- css/
|       |   +-- styles.css
|       +-- images/
|
+-- _site/ or dist/
    +-- index.html
    +-- survival/index.html
    +-- action/index.html
    +-- arcade/index.html
    +-- new-games/index.html
    +-- games/monster-survivors/index.html
    +-- sitemap.xml
    +-- robots.txt
```

Template responsibilities:

- `base.njk`: shared `<head>`, canonical tags, metadata slots, header, footer, and global CSS/JS links.
- `index.njk`: hero, featured games, category blocks, homepage SEO copy, `WebSite` JSON-LD.
- `categories.njk`: paginated/category-generated pages filtered by `category`.
- `new-games.njk`: newest games collection sorted by `publishedAt`.
- `games.njk`: game detail pages generated from live games.
- `sitemap.njk`: sitemap entries for homepage, categories, `/new-games/`, and live game pages.
- `robots.njk`: robots output with lowercase sitemap URL.
- Component templates: reusable game cards, breadcrumbs, iframe wrapper, and JSON-LD helpers.

Eleventy should generate:

- `/`
- `/survival/`
- `/action/`
- `/arcade/`
- `/new-games/`
- `/games/monster-survivors/`
- `/sitemap.xml`
- `/robots.txt`

Output remains static and deployable from `_site/` or `dist/`.

## 10. SEO Rules

Canonical domain:

```text
https://monstersurvivors.co
```

Canonical examples:

```text
Homepage:  https://monstersurvivors.co/
Category:  https://monstersurvivors.co/survival/
Game page: https://monstersurvivors.co/games/monster-survivors/
```

Deployment must enforce a 301 redirect from uppercase or mixed-case host variants to the lowercase host `monstersurvivors.co`.

Every generated page should include:

- One canonical URL.
- One `<h1>`.
- Multiple meaningful `<h2>` sections where appropriate.
- Page-specific `<title>` from data or front matter.
- Page-specific `<meta name="description">` from data or front matter.
- Open Graph tags:
  - `og:title`
  - `og:description`
  - `og:url`
  - `og:type`
- Twitter card tags.
- JSON-LD structured data.

Required structured data:

- Homepage: `WebSite`
- Category pages: `CollectionPage`
- `/new-games/`: `CollectionPage`
- Game pages: `VideoGame` with `name`, `description`, `url`, `genre`, `operatingSystem`, and `applicationCategory`
- FAQ sections: `FAQPage` when FAQ content exists

Also generate:

- `sitemap.xml`
- `robots.txt`

Sitemap rules:

- Homepage: `priority` `1.0`, `changefreq` `weekly`
- Game pages: `priority` `0.8`, `changefreq` `monthly`, `lastmod` from `publishedAt`
- Category pages: `priority` `0.6`, `changefreq` `weekly`
- `/new-games/`: `priority` `0.6`, `changefreq` `weekly`, `lastmod` from the newest `publishedAt` in the game catalog
- All sitemap URLs must use lowercase `https://monstersurvivors.co`.

`robots.txt` should reference the lowercase sitemap:

```text
User-agent: *
Allow: /

Sitemap: https://monstersurvivors.co/sitemap.xml
```

## 11. UI Visual Direction

Use an Apple-inspired visual system.

Semantic CSS variables:

```css
:root {
  --color-bg: #f5f5f7;
  --color-surface: #ffffff;
  --color-text-primary: #1d1d1f;
  --color-text-secondary: #6e6e73;
  --color-accent: #007aff;
  --color-border: #d2d2d7;
}
```

Core colors:

```text
Background:          #f5f5f7
Surface/Card:        #ffffff
Primary Text:        #1d1d1f
Secondary Text:      #6e6e73
Primary CTA:         #007aff
Live/playable state: #34c759
Featured accent:     #ff9500
Coming-soon state:   #6e6e73
Danger/Error:        #ff3b30
Border:              #d2d2d7
```

Visual semantics:

- Use `#007aff` for primary CTAs.
- Use `#34c759` for live or playable status.
- Use `#ff9500` for featured accents.
- Use `#6e6e73` for coming-soon state.
- Do not use orange for coming-soon status; it is reserved for featured emphasis.

Layout style:

- Clean, spacious, and modern.
- Cards should use subtle borders or shadows.
- Border radius should generally be `8px`.
- Avoid noisy game-portal clutter.
- Avoid huge decorative gradients.
- Text must not overlap cards, buttons, or iframe content.
- Dark mode is out of scope for v1, but the semantic CSS variables should make future dark mode easier.

Responsive behavior:

- Desktop featured games: 4 columns.
- Tablet featured games: 2 columns.
- Mobile featured games: 1 column.
- Category cards follow the same responsive grid pattern.
- Game iframe uses a responsive aspect-ratio container.
- Breadcrumbs collapse on mobile.

## 12. Card And Iframe UI States

Homepage and category cards must separate featured, live, and coming-soon visual states.

Live card behavior:

- Normal opacity.
- Playable status badge using `#34c759`.
- Primary `Play Now` CTA using `#007aff`.
- Live game cards link to `/games/{slug}/`.

Featured card behavior:

- May use a small featured accent or label using `#ff9500`.
- Featured styling should not override live or coming-soon state clarity.

Coming-soon card behavior:

- Content area at 70% opacity.
- Thumbnail overlay to signal unavailable status.
- Neutral `Coming Soon` badge using `#6e6e73`.
- Disabled outline-style action button.
- No primary CTA color.
- No link to a playable detail page unless the page intentionally exists as a teaser.

Iframe loading behavior:

- Wrap the iframe in a stable aspect-ratio container.
- Render a skeleton or centered `Loading game...` placeholder behind the iframe.
- Preserve the iframe dimensions before, during, and after load.
- Avoid layout shift when the iframe loads.

## 13. Homepage Featured Games Behavior

The homepage must read exactly four featured game slugs from `_data/games.json.featuredGames`.

Rendering rules:

- If slug exists and `status` is `live`, show a primary `Play Now` link.
- If slug exists and `status` is `coming-soon`, show a neutral `Coming Soon` badge and disabled outline-style button.
- If slug is missing from `games`, the build should fail.
- Featured order must match the order in `featuredGames`.

Initial featured list:

1. `monster-survivors`
2. `survival-arena`
3. `zombie-rush`
4. `battle-heroes`

## 14. Monster Survivors Page Content Requirements

The Monster Survivors page should include:

- H1: `Monster Survivors`
- Intro: one concise sentence about survival gameplay.
- H2: `Play Monster Survivors Online`
- H2: `About Monster Survivors`
- H2: `How to Play`
- H2: `Game Features`
- H2: `Frequently Asked Questions`
- H2: `More Survival Games`

Suggested one-line intro:

```text
Survive endless monster waves, collect upgrades, and fight to stay alive in Monster Survivors.
```

Suggested iframe source:

```text
https://cloud.onlinegames.io/games/2025/unity/monster-survivors/index-og.html
```

## 15. Acceptance Criteria

The implementation is complete when:

- Eleventy builds the static site without a custom `build.js` generator.
- `_data/site.json` exists and uses `https://monstersurvivors.co`.
- `_data/navigation.json` exists and owns global nav links.
- `_data/games.json` exists and includes `featuredGames`, `categories`, and `games`.
- Every game record includes `publishedAt`, `tags`, `relatedGames`, `seo.title`, `seo.description`, and complete thumbnail metadata.
- Homepage renders four featured game cards from `featuredGames`.
- `Monster Survivors` is live and links to `/games/monster-survivors/`.
- `Survival Arena`, `Zombie Rush`, and `Battle Heroes` render as coming-soon cards unless iframe URLs are later added.
- Category pages render games filtered by primary `category`.
- `/new-games/` sorts games by `publishedAt` descending.
- The Monster Survivors game page embeds the iframe with default `sandbox` and `allow` attributes.
- The iframe loading state preserves aspect ratio and avoids layout shift.
- All pages share global navigation and footer.
- All pages are responsive on desktop and mobile.
- Mobile breadcrumbs collapse middle levels or show previous + current only.
- Every page has exactly one `<h1>`.
- Important content sections use `<h2>`.
- Canonical URLs use lowercase `https://monstersurvivors.co`.
- Uppercase and mixed-case host variants 301 redirect to the lowercase host.
- `sitemap.xml` uses the required URL, `lastmod`, `priority`, and `changefreq` rules.
- `robots.txt` references `https://monstersurvivors.co/sitemap.xml`.
- Homepage, category pages, game pages, and FAQ sections emit the required JSON-LD.
- Adding a new game requires data changes only, not template rewrites.

## 16. Test Plan

Build and validation checks:

- Validate Eleventy builds `/`, `/survival/`, `/action/`, `/arcade/`, `/new-games/`, `/games/monster-survivors/`, `/sitemap.xml`, and `/robots.txt`.
- Validate bad data fails the build for missing featured slugs.
- Validate bad data fails the build for invalid categories.
- Validate bad data fails the build for missing live iframe URLs.
- Validate bad data fails the build for missing thumbnail `alt`.
- Validate bad data fails the build for missing thumbnail dimensions.
- Confirm all canonical URLs use lowercase `https://monstersurvivors.co`.
- Confirm `/new-games/` sorts by `publishedAt` descending.
- Confirm sitemap uses correct URL, `lastmod`, `priority`, and `changefreq`.
- Confirm live iframes include `sandbox` and `allow` attributes.
- Confirm desktop and mobile layouts preserve the documented homepage, category, and game-page structures.

## 17. Out of Scope for Version 1

The first version should not include:

- User login
- Comments
- Ratings
- Backend database
- Search
- Ads integration
- Multi-language routing
- Complex filtering or sorting
- Dark mode

These can be added after the static multi-page foundation is working. The v1 data model should not block those additions.

## 18. embed.json Compatibility And Tag Navigation

Version 1.1 should support importing the OnlineGames-style `embed.json` data shape while preserving the internal game model used by templates.

External source shape:

```json
[
  {
    "title": "Golf Bit",
    "embed": "https://cloud.onlinegames.io/games/2026/construct/328/golf-bit/game.html",
    "image": "https://www.onlinegames.io/media/posts/1289/responsive/golf-bit-xs.webp",
    "tags": "1-player,2d,arcade,avoid,ball,crazy,free,fun,html5,mobile,mouse,physics,skill,sports",
    "description": "Golf Bit is an online golf game..."
  }
]
```

Import rules:

- Treat `embed.json` as an external input format, not the template-facing model.
- Normalize `title`, `embed`, `image`, `tags`, and `description` into the internal game record shape.
- Generate `slug` from `title`.
- Map `embed` to `iframe.src`.
- Map `image` to `thumbnail.src`.
- Map `description` to `description`, `shortDescription`, and `seo.description`.
- Convert comma-separated `tags` into lowercase, trimmed, deduplicated `tags`.
- Preserve the original cleaned tag list as `rawTags`.
- Generate `seo.title` as `{title} - Play Free Online`.
- Set imported games to `status: "live"`.
- Generate default `features`, `instructions`, `faq`, and `relatedGames` when the external source does not provide them.

Curated sidebar tag navigation should follow the OnlineGames-style left menu, excluding `Recently Played` and `Random` for v1.1:

```text
2-player
2d
3d
action
adventure
arcade
car
clicker
crazy
drift
driving
girl
io-games
kids
minecraft
mobile
multiplayer
pixel
puzzle
racing
shooting
simulator
sniper
sports
strategy
```

Tag rules:

- `primaryTag` is the first imported tag that matches the curated sidebar list.
- If no curated tag matches, default `primaryTag` to `arcade`.
- Cards show only the `primaryTag` to avoid visual clutter.
- Detail pages may show the full tag list.
- The sidebar shows only curated tags plus `Home`, `New Games`, and `All Tags`.
- `All Tags` lists every tag found in imported data, including tags not shown in the sidebar.
- Every tag should have a generated page at `/t/{tag}/`.
- Existing compatibility routes `/survival/`, `/action/`, and `/arcade/` may remain, but tag pages are the primary collection pages for imported data.

Related-game scoring:

- Prefer games sharing meaningful tags.
- Ignore or heavily down-rank broad tags such as `free`, `html5`, `unity`, `mobile`, `1-player`, `2d`, and `3d`.
- Use deterministic ordering so builds are stable.

Additional acceptance criteria:

- `embed.json` imports all valid source records.
- The internal normalized catalog exposes complete game records for templates.
- The homepage uses a left sidebar and dense game grid inspired by onlinegames.io, while retaining Monster Survivors branding.
- Sidebar navigation contains only the curated tag list and does not include all raw tags.
- `/all-tags/` lists all discovered tags with game counts.
- `/t/{tag}/` pages are generated for both curated and non-curated tags.
- All imported live games generate playable detail pages under `/games/{slug}/`.
