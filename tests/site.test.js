import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";

const require = createRequire(import.meta.url);
const root = process.cwd();
const dist = join(root, "dist");
const domain = "https://arcadenest.online";
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const sidebarTags = [
  "2-player",
  "2d",
  "3d",
  "action",
  "adventure",
  "arcade",
  "car",
  "clicker",
  "crazy",
  "drift",
  "driving",
  "girl",
  "io-games",
  "kids",
  "minecraft",
  "mobile",
  "multiplayer",
  "pixel",
  "puzzle",
  "racing",
  "shooting",
  "simulator",
  "sniper",
  "sports",
  "strategy"
];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function readDist(path) {
  return readFileSync(join(dist, path), "utf8");
}

async function cleanDist() {
  if (!existsSync(dist)) return;
  for (const entry of await readdir(dist)) {
    await rm(join(dist, entry), { recursive: true, force: true });
  }
}

function assertIncludes(haystack, needle, message) {
  assert.ok(haystack.includes(needle), message ?? `Expected output to include ${needle}`);
}

function cssBlock(css, selector) {
  const marker = `${selector} {`;
  const start = css.indexOf(marker);
  assert.notEqual(start, -1, `Expected stylesheet to include ${selector}`);
  const bodyStart = start + marker.length;
  const end = css.indexOf("}", bodyStart);
  assert.notEqual(end, -1, `Expected stylesheet block for ${selector} to close`);
  return css.slice(bodyStart, end);
}

function loadNormalizedCatalog() {
  const { buildCatalog } = require("../src/_data/catalog-utils.cjs");
  return buildCatalog(JSON.parse(read("src/_data/embed.json")));
}

function gameSlugsFromHtml(html) {
  return [...html.matchAll(/href="\/games\/([a-z0-9-]+)\/"/g)].map((match) => match[1]);
}

function loadLocaleRanking() {
  return require("../src/_data/locale-ranking.cjs");
}

const enUsPinnedGames = [
  "cs-online",
  "drift-king",
  "highway-traffic",
  "basketball-io",
  "fps-strike",
  "madalin-stunt-cars-pro",
  "block-blast",
  "american-touchdown",
  "snaker-io",
  "golf-bit"
];

const zhCnPinnedGames = [
  "block-blast",
  "drift-king",
  "highway-traffic",
  "cube-worlds",
  "99-nights-in-the-forest",
  "capybara-clicker-pro",
  "real-flight-simulator",
  "snaker-io",
  "chess-freezenova",
  "cake-match-puzzle"
];

test("locale ranking pins US and CN game orders without dropping records", () => {
  const catalog = loadNormalizedCatalog();
  const { rankGamesForLocale } = loadLocaleRanking();

  const enUsGames = rankGamesForLocale(catalog.games, "en-US");
  const zhCnGames = rankGamesForLocale(catalog.games, "zh-CN");

  assert.deepEqual(enUsGames.slice(0, 10).map((game) => game.slug), enUsPinnedGames);
  assert.deepEqual(zhCnGames.slice(0, 10).map((game) => game.slug), zhCnPinnedGames);
  assert.deepEqual(new Set(enUsGames.map((game) => game.slug)), new Set(catalog.games.map((game) => game.slug)));
  assert.deepEqual(new Set(zhCnGames.map((game) => game.slug)), new Set(catalog.games.map((game) => game.slug)));
});

test("locale ranking falls back to original order for exact score ties", () => {
  const { rankGamesForLocale } = loadLocaleRanking();
  const games = [
    { slug: "alpha", title: "Alpha", tags: ["unknown"], publishedAt: "2026-01-01" },
    { slug: "bravo", title: "Bravo", tags: ["unknown"], publishedAt: "2026-01-01" },
    { slug: "charlie", title: "Charlie", tags: ["unknown"], publishedAt: "2026-01-01" }
  ];

  assert.deepEqual(rankGamesForLocale(games, "en-US").map((game) => game.slug), ["alpha", "bravo", "charlie"]);
});

test("embed.json imports into complete internal game records", () => {
  const source = JSON.parse(read("src/_data/embed.json"));
  const catalog = loadNormalizedCatalog();
  const slugs = new Set(catalog.games.map((game) => game.slug));

  assert.ok(source.length > 200, "embed.json should contain the imported game collection");
  assert.equal(catalog.games.length, source.length);
  assert.deepEqual(catalog.sidebarTags.map((tag) => tag.slug), sidebarTags);

  for (const game of catalog.games) {
    assert.ok(game.slug, "game should include slug");
    assert.ok(game.title, `${game.slug} should include title`);
    assert.ok(sidebarTags.includes(game.primaryTag) || game.primaryTag === "arcade");
    assert.ok(Array.isArray(game.tags), `${game.slug} should include tags`);
    assert.ok(Array.isArray(game.rawTags), `${game.slug} should include rawTags`);
    assert.ok(Array.isArray(game.relatedGames), `${game.slug} should include relatedGames`);
    assert.ok(game.seo?.title, `${game.slug} should include seo.title`);
    assert.ok(game.seo?.description, `${game.slug} should include seo.description`);
    assert.ok(game.thumbnail?.src, `${game.slug} should include thumbnail.src`);
    assert.ok(game.thumbnail?.alt, `${game.slug} should include thumbnail.alt`);
    assert.ok(game.iframe?.src, `${game.slug} live games should include iframe.src`);
    assert.ok(slugs.has(game.slug), `${game.slug} should be present in slug set`);
  }

  const monster = catalog.games.find((game) => game.slug === "monster-wave-arena");
  assert.equal(monster.primaryTag, "action");
  assert.ok(monster.tags.includes("survival"));
  assert.ok(monster.tags.includes("battle"));
});

test("Eleventy builds all required v1 routes", async () => {
  const catalog = loadNormalizedCatalog();
  await cleanDist();
  execFileSync(npmBin, ["run", "build"], { cwd: root, shell: true, stdio: "pipe" });

  for (const file of [
    "index.html",
    "new-games/index.html",
    "all-tags/index.html",
    "games/monster-wave-arena/index.html",
    "games/golf-bit/index.html",
    "t/action/index.html",
    "t/driving/index.html",
    "t/io-games/index.html",
    "search-index.json",
    "assets/js/site.js",
    "assets/images/favicon.svg",
    "sitemap.xml",
    "robots.txt"
  ]) {
    assert.ok(existsSync(join(dist, file)), `Expected ${file} to be generated`);
  }

  for (const game of catalog.games) {
    assert.ok(existsSync(join(dist, "games", game.slug, "index.html")), `Expected game page for ${game.slug}`);
  }
});

test("generated pages use lowercase canonical URLs and one h1", () => {
  for (const [file, canonical] of [
    ["index.html", `${domain}/`],
    ["new-games/index.html", `${domain}/new-games/`],
    ["all-tags/index.html", `${domain}/all-tags/`],
    ["t/action/index.html", `${domain}/t/action/`],
    ["games/monster-wave-arena/index.html", `${domain}/games/monster-wave-arena/`]
  ]) {
    const html = readDist(file);
    assertIncludes(html, `<link rel="canonical" href="${canonical}">`);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${file} should have exactly one h1`);
    assert.equal((html.match(/https:\/\/MonsterSurvivors\.co/g) ?? []).length, 0);
    assert.equal(html.includes("Monster Survivors"), false, `${file} should not expose old brand text`);
    assert.equal(html.includes("monstersurvivors.co"), false, `${file} should not expose old domain text`);
  }
});

test("generated pages include one Google tag immediately after head", () => {
  const googleTagStart = "<!-- Google tag (gtag.js) -->";

  for (const file of [
    "index.html",
    "new-games/index.html",
    "all-tags/index.html",
    "t/action/index.html",
    "games/monster-wave-arena/index.html"
  ]) {
    const html = readDist(file);
    const afterHead = html.slice(html.indexOf("<head>") + "<head>".length).trimStart();

    assert.ok(afterHead.startsWith(googleTagStart), `${file} should place Google tag immediately after <head>`);
    assert.equal((html.match(/https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-LGKQRXTBCK/g) ?? []).length, 1);
    assert.equal((html.match(/gtag\('config', 'G-LGKQRXTBCK'\);/g) ?? []).length, 1);
  }
});

test("homepage renders sidebar navigation and dense imported game grid", () => {
  const html = readDist("index.html");

  for (const title of ["Golf Bit", "Love Tester", "Stack Fire Ball", "Monster Wave Arena"]) {
    assertIncludes(html, title);
  }

  assertIncludes(html, "layout-shell");
  assertIncludes(html, "layout-shell--catalog");
  assertIncludes(html, "sidebar-nav");
  assertIncludes(html, "sidebar-nav__rail");
  assertIncludes(html, "dense-game-grid");
  assertIncludes(html, "dense-game-grid--home");
  assertIncludes(html, 'href="/all-tags/"');
  for (const tag of sidebarTags) {
    assertIncludes(html, `href="/t/${tag}/"`);
  }
  assertIncludes(html, 'href="/games/monster-wave-arena/"');
  assert.equal(html.includes('href="/t/brainrot/"'), false, "non-sidebar tags should not appear in sidebar");
});

test("homepage uses en-US locale ranking for the first games", () => {
  const html = readDist("index.html");

  assert.deepEqual(gameSlugsFromHtml(html).slice(0, 10), enUsPinnedGames);
});

test("tag and category pages use en-US locale ranking after filtering", () => {
  const catalog = loadNormalizedCatalog();
  const { rankGamesForLocale } = loadLocaleRanking();
  const actionTagExpected = rankGamesForLocale(
    catalog.games.filter((game) => game.tags.includes("action")),
    "en-US"
  ).slice(0, 10).map((game) => game.slug);
  const actionCategoryExpected = rankGamesForLocale(
    catalog.games.filter((game) => game.category === "action" || game.tags.includes("action")),
    "en-US"
  ).slice(0, 10).map((game) => game.slug);

  assert.deepEqual(gameSlugsFromHtml(readDist("t/action/index.html")).slice(0, 10), actionTagExpected);
  assert.deepEqual(gameSlugsFromHtml(readDist("action/index.html")).slice(0, 10), actionCategoryExpected);
});

test("game detail related games use en-US locale ranking within the related set", () => {
  const catalog = loadNormalizedCatalog();
  const { rankGamesForLocale } = loadLocaleRanking();
  const game = catalog.games.find((item) => item.slug === "monster-wave-arena");
  const bySlug = new Map(catalog.games.map((item) => [item.slug, item]));
  const expected = rankGamesForLocale(
    game.relatedGames.map((slug) => bySlug.get(slug)).filter(Boolean),
    "en-US"
  ).map((item) => item.slug);

  assert.deepEqual(gameSlugsFromHtml(readDist("games/monster-wave-arena/index.html")), expected);
});

test("catalog sidebar uses local SVG icons and working curated links only", () => {
  const sidebar = readDist("index.html").match(/<aside class="sidebar-nav sidebar-nav__rail"[\s\S]*?<\/aside>/)?.[0] ?? "";

  assert.ok(sidebar, "homepage should render the catalog sidebar");
  assertIncludes(sidebar, "<svg");
  assertIncludes(sidebar, 'class="sidebar-nav__icon"');
  assertIncludes(sidebar, 'aria-hidden="true"');
  assert.equal(sidebar.includes('<span class="sidebar-nav__icon">H</span>'), false, "Home should not use a letter placeholder");
  assert.equal(sidebar.includes('<span class="sidebar-nav__icon">N</span>'), false, "New should not use a letter placeholder");
  assert.equal(sidebar.includes('<span class="sidebar-nav__icon">#</span>'), false, "All Tags should not use a character placeholder");
  assert.equal(sidebar.includes("Recently Played"), false, "sidebar should only include working routes");

  assert.equal((sidebar.match(/href="\//g) ?? []).length, sidebarTags.length + 3);
  assertIncludes(sidebar, 'href="/"');
  assertIncludes(sidebar, 'href="/new-games/"');
  assertIncludes(sidebar, 'href="/all-tags/"');
  for (const tag of sidebarTags) {
    assertIncludes(sidebar, `href="/t/${tag}/"`);
  }
  assert.equal(sidebar.includes('href="/t/brainrot/"'), false, "non-curated tags should stay out of the sidebar");
});

test("home and tag catalog pages render the shared sidebar component", () => {
  const componentPath = "src/_includes/components/sidebar-nav.njk";
  assert.ok(existsSync(join(root, componentPath)), "sidebar component should exist");

  for (const sourcePath of ["src/index.njk", "src/tags.njk"]) {
    const source = read(sourcePath);
    assertIncludes(source, 'import "components/sidebar-nav.njk" as sidebar');
    assertIncludes(source, "sidebar.catalogSidebar");
    assert.equal(source.includes("<aside class=\"sidebar-nav"), false, `${sourcePath} should not duplicate sidebar markup`);
  }
});

test("global header includes static search controls and mobile menu", () => {
  const html = readDist("index.html");

  assertIncludes(html, 'class="mobile-menu-button"');
  assertIncludes(html, 'data-sidebar-toggle');
  assertIncludes(html, 'class="global-search"');
  assertIncludes(html, 'class="header-auth-slot"');
  assertIncludes(html, 'type="search"');
  assertIncludes(html, 'data-search-input');
  assertIncludes(html, 'data-search-results');
  assertIncludes(html, 'data-search-empty');
  assertIncludes(html, 'rel="icon" href="/assets/images/favicon.svg" type="image/svg+xml"');
  assertIncludes(html, ">ArcadeNest</a>");
  assertIncludes(html, 'src="/assets/js/site.js"');
});

test("stylesheet reserves desktop header auth space beside search", () => {
  const css = read("src/assets/css/styles.css");
  const authSlot = cssBlock(css, ".header-auth-slot");
  const search = cssBlock(css, ".global-search");

  assertIncludes(search, "margin-left: auto;");
  assertIncludes(authSlot, "flex: 0 0 clamp(132px, 14vw, 192px);");
  assertIncludes(authSlot, "min-height: 40px;");
  assertIncludes(css, ".header-auth-slot {\n    display: none;");
});

test("search index contains game detail records only", () => {
  const index = JSON.parse(readDist("search-index.json"));
  const bySlug = new Map(index.map((item) => [item.slug, item]));

  assert.ok(index.length > 200, "search index should contain the imported game collection");
  assert.deepEqual(index.slice(0, 10).map((item) => item.slug), enUsPinnedGames);
  assert.ok(bySlug.has("monster-wave-arena"));
  assert.ok(bySlug.has("golf-bit"));
  assert.equal(bySlug.has("action"), false, "tag pages should not be indexed as game records");

  for (const item of index) {
    assert.equal(Object.keys(item).sort().join(","), "localeRank,primaryTag,shortDescription,slug,tags,thumbnail,title,url");
    assert.equal(typeof item.localeRank, "number");
    assert.match(item.url, /^\/games\/[a-z0-9-]+\/$/);
    assert.ok(item.thumbnail);
    assert.ok(Array.isArray(item.tags));
    assert.ok(item.shortDescription);
  }
});

test("new games page sorts games by publishedAt descending", () => {
  const html = readDist("new-games/index.html");
  const titles = ["Golf Bit", "Love Tester", "Stack Fire Ball"];
  const positions = titles.map((title) => html.indexOf(title));

  for (const position of positions) {
    assert.notEqual(position, -1);
  }

  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
});

test("game page includes secure iframe, loading state, breadcrumbs, and JSON-LD", () => {
  const html = readDist("games/monster-wave-arena/index.html");

  assertIncludes(html, "Loading game...");
  assertIncludes(html, 'sandbox="allow-scripts allow-same-origin allow-pointer-lock"');
  assertIncludes(html, 'allow="fullscreen; gamepad; autoplay; pointer-lock"');
  assertIncludes(html, "breadcrumb");
  assertIncludes(html, "breadcrumb__mobile");
  assertIncludes(html, '<details class="content-accordion">');
  assertIncludes(html, "<summary>About Monster Wave Arena</summary>");
  assert.equal((html.match(/<details class="content-accordion" open/g) ?? []).length, 0);
  assertIncludes(html, '"@type":"VideoGame"');
  assertIncludes(html, '"@type":"FAQPage"');
});

test("tag pages, all-tags, and homepage include required content and JSON-LD", () => {
  assertIncludes(readDist("index.html"), '"@type":"WebSite"');
  assertIncludes(readDist("new-games/index.html"), '"@type":"CollectionPage"');
  assertIncludes(readDist("t/action/index.html"), '"@type":"CollectionPage"');
  assertIncludes(readDist("t/driving/index.html"), '"@type":"CollectionPage"');
  assertIncludes(readDist("all-tags/index.html"), "All Tags");
  assertIncludes(readDist("all-tags/index.html"), "brainrot");
});

test("homepage SEO uses ArcadeNest brand, fuller titles, headings, and natural category keywords", () => {
  const html = readDist("index.html");
  const title = html.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
  const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1] ?? "";

  assert.ok(title.length >= 40 && title.length <= 60, `homepage title length should be 40-60 characters, got ${title.length}`);
  assert.match(title, /ArcadeNest/);
  assert.match(title, /Free Online Games/);
  assert.match(description, /ArcadeNest/);
  assert.match(description, /racing/i);
  assert.match(description, /simulator/i);

  assert.ok((html.match(/<h2\b/g) ?? []).length >= 2, "homepage should include multiple h2 sections");
  assert.ok((html.match(/<h3\b/g) ?? []).length >= 3, "homepage should include h3 subsections for SEO structure");
  assert.match(html, /class="[^"]*\bhomepage-seo\b[^"]*"/);

  for (const phrase of [
    "ArcadeNest",
    "free online games",
    "racing games",
    "simulator games",
    "drift games",
    "car games",
    "clicker games",
    "sniper games",
    "survival games"
  ]) {
    assert.match(html.toLowerCase(), new RegExp(phrase.toLowerCase().replaceAll(" ", "\\s+")));
  }
});

test("homepage WebSite JSON-LD exposes the ArcadeNest site search action", () => {
  const html = readDist("index.html");

  assertIncludes(html, '"@type":"WebSite"');
  assertIncludes(html, '"name":"ArcadeNest"');
  assertIncludes(html, '"@type":"SearchAction"');
  assertIncludes(html, `${domain}/?q={search_term_string}`);
  assertIncludes(html, "required name=search_term_string");
});

test("sitemap and robots use required lowercase rules", () => {
  const sitemap = readDist("sitemap.xml");
  const robots = readDist("robots.txt");

  assertIncludes(sitemap, `<loc>${domain}/</loc>`);
  assertIncludes(sitemap, "<priority>1.0</priority>");
  assertIncludes(sitemap, "<changefreq>weekly</changefreq>");
  assertIncludes(sitemap, `<loc>${domain}/games/monster-wave-arena/</loc>`);
  assertIncludes(sitemap, `<loc>${domain}/games/golf-bit/</loc>`);
  assertIncludes(sitemap, `<loc>${domain}/t/action/</loc>`);
  assertIncludes(sitemap, `<loc>${domain}/all-tags/</loc>`);
  assertIncludes(sitemap, "<priority>0.8</priority>");
  assertIncludes(sitemap, "<changefreq>monthly</changefreq>");
  assertIncludes(sitemap, "<lastmod>2026-05-27</lastmod>");
  assertIncludes(robots, `Sitemap: ${domain}/sitemap.xml`);
  assert.equal(sitemap.includes("monstersurvivors.co"), false);
  assert.equal(robots.includes("monstersurvivors.co"), false);
});

test("stylesheet defines semantic variables and required UI states", () => {
  const css = read("src/assets/css/styles.css");

  for (const token of [
    "--color-bg",
    "--color-surface",
    "--color-text-primary",
    "--color-text-secondary",
    "--color-accent",
    "--color-border",
    "#ff9500",
    "#6e6e73",
    "#34c759",
    "#007aff",
    ".game-frame__loading",
    ".breadcrumb__mobile",
    ".layout-shell",
    ".layout-shell--catalog",
    ".sidebar-nav",
    ".sidebar-nav__rail",
    ".mobile-menu-button",
    ".global-search",
    ".search-panel",
    ".dense-game-grid",
    ".content-accordion",
    ".footer-nav"
  ]) {
    assertIncludes(css, token);
  }
});

test("stylesheet defines OnlineGames-style catalog density and hover polish", () => {
  const css = read("src/assets/css/styles.css");

  assertIncludes(css, "grid-template-columns: repeat(8, minmax(0, 1fr));");
  assertIncludes(css, "grid-template-columns: repeat(6, minmax(0, 1fr));");
  assertIncludes(css, "grid-template-columns: repeat(4, minmax(0, 1fr));");
  assertIncludes(css, "grid-template-columns: repeat(2, minmax(0, 1fr));");
  assertIncludes(css, ".dense-game-card:hover");
  assertIncludes(css, ".dense-game-card:hover img");
  assertIncludes(css, "transform: translateY(-6px) scale(1.02);");
  assertIncludes(css, "transform: scale(1.06);");
  assertIncludes(css, "transition: transform 220ms ease, box-shadow 220ms ease;");
});

test("stylesheet gives homepage game covers a five-column larger layout", () => {
  const css = read("src/assets/css/styles.css");
  const homeGrid = cssBlock(css, ".dense-game-grid--home");
  const homeLink = cssBlock(css, ".dense-game-grid--home .dense-game-card__link");

  assertIncludes(homeGrid, "gap: 22px;");
  assertIncludes(homeGrid, "grid-template-columns: repeat(5, minmax(0, 1fr));");
  assertIncludes(homeLink, "gap: 10px;");
  assertIncludes(homeLink, "padding: 10px;");
  assertIncludes(css, ".dense-game-grid--home {\n    grid-template-columns: repeat(4, minmax(0, 1fr));");
  assertIncludes(css, ".dense-game-grid--home {\n    grid-template-columns: repeat(3, minmax(0, 1fr));");
});

test("stylesheet gives homepage SEO copy readable section and card styling", () => {
  const css = read("src/assets/css/styles.css");
  const seoGrid = cssBlock(css, ".homepage-seo__grid");
  const seoCard = cssBlock(css, ".homepage-seo__card");
  const seoHeading = cssBlock(css, ".homepage-seo h3");

  assertIncludes(seoGrid, "grid-template-columns: repeat(3, minmax(0, 1fr));");
  assertIncludes(seoCard, "padding: 18px;");
  assertIncludes(seoHeading, "font-size: 1.05rem;");
  assertIncludes(css, ".homepage-seo__grid {\n    grid-template-columns: 1fr;");
});

test("stylesheet hides sidebar rail scrollbars without disabling scrolling", () => {
  const css = read("src/assets/css/styles.css");
  const rail = cssBlock(css, ".sidebar-nav__rail");
  const webkitScrollbar = cssBlock(css, ".sidebar-nav__rail::-webkit-scrollbar");

  assertIncludes(rail, "overflow-y: auto;");
  assertIncludes(rail, "overflow-x: hidden;");
  assertIncludes(rail, "scrollbar-width: none;");
  assertIncludes(webkitScrollbar, "width: 0;");
  assertIncludes(webkitScrollbar, "height: 0;");
});

test("stylesheet scales desktop sidebar rail icons and labels", () => {
  const css = read("src/assets/css/styles.css");
  const rail = cssBlock(css, ".sidebar-nav__rail");
  const icon = cssBlock(css, ".sidebar-nav__icon");
  const iconSvg = cssBlock(css, ".sidebar-nav__icon svg");
  const label = cssBlock(css, ".sidebar-nav__label");

  assertIncludes(css, "grid-template-columns: 104px minmax(0, 1fr);");
  assertIncludes(rail, "width: 92px;");
  assertIncludes(css, "width: 320px;");
  assertIncludes(css, "grid-template-columns: 58px 1fr auto;");
  assertIncludes(css, "min-height: 68px;");
  assertIncludes(css, "width: 302px;");
  assertIncludes(icon, "height: 56px;");
  assertIncludes(icon, "width: 56px;");
  assertIncludes(iconSvg, "height: 42px;");
  assertIncludes(iconSvg, "width: 42px;");
  assertIncludes(label, "font-size: 1.28rem;");
  assertIncludes(css, ".sidebar-nav__rail .sidebar-nav__label {\n  font-size: 1.28rem;");
  assertIncludes(css, ".sidebar-nav__count {\n  font-size: 0.9rem;");
});

test("sidebar script toggles mobile drawer and collapses desktop rail on hamburger click", () => {
  const js = read("src/assets/js/site.js");

  assertIncludes(js, 'sidebar.classList.toggle("sidebar-nav--open", open);');
  assertIncludes(js, 'document.body.classList.toggle("has-sidebar-open", open);');
  assertIncludes(js, 'window.matchMedia("(min-width: 901px)")');
  assertIncludes(js, "setSidebar(false);");
});

test("footer includes social, primary, and legal navigation", () => {
  const html = readDist("index.html");

  for (const label of ["Twitter", "Facebook", "ABOUT", "FAQ", "BLOG", "CONTACT US", "Directory", "Terms", "Privacy", "Cookies"]) {
    assertIncludes(html, label);
  }

  assertIncludes(html, "Copyright © 2026 arcadenest corp");
  assertIncludes(html, "footer-nav");
  assertIncludes(html, "footer-legal");
});

test("all thumbnail assets referenced by imported catalog are usable URLs", () => {
  const catalog = loadNormalizedCatalog();

  for (const game of catalog.games) {
    assert.match(game.thumbnail.src, /^https:\/\/www\.onlinegames\.io\//, `${game.slug} thumbnail should use imported remote image`);
  }
});
