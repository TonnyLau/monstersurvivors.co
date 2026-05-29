import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { buildCatalog } = require("./src/_data/catalog-utils.cjs");
const { DEFAULT_LOCALE, rankGamesForLocale } = require("./src/_data/locale-ranking.cjs");

function loadCatalog() {
  const embed = JSON.parse(readFileSync(join(process.cwd(), "src/_data/embed.json"), "utf8"));
  return buildCatalog(embed);
}

function validateCatalog(catalog) {
  const slugs = new Set(catalog.games.map((game) => game.slug));
  const failures = [];

  for (const slug of catalog.featuredGames) {
    if (!slugs.has(slug)) failures.push(`featuredGames slug does not exist: ${slug}`);
  }

  for (const game of catalog.games) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(game.publishedAt ?? "")) failures.push(`${game.slug} needs ISO publishedAt`);
    if (!Array.isArray(game.tags)) failures.push(`${game.slug} needs tags`);
    if (!Array.isArray(game.rawTags)) failures.push(`${game.slug} needs rawTags`);
    if (!game.primaryTag) failures.push(`${game.slug} needs primaryTag`);
    if (!Array.isArray(game.relatedGames)) failures.push(`${game.slug} needs relatedGames`);
    if (!game.seo?.title) failures.push(`${game.slug} needs seo.title`);
    if (!game.seo?.description) failures.push(`${game.slug} needs seo.description`);
    if (!game.thumbnail?.src) failures.push(`${game.slug} needs thumbnail.src`);
    if (!game.thumbnail?.width) failures.push(`${game.slug} needs thumbnail.width`);
    if (!game.thumbnail?.height) failures.push(`${game.slug} needs thumbnail.height`);
    if (!game.thumbnail?.alt) failures.push(`${game.slug} needs thumbnail.alt`);
    if (game.status === "live" && !game.iframe?.src) failures.push(`${game.slug} live games need iframe.src`);

    for (const relatedSlug of game.relatedGames ?? []) {
      if (!slugs.has(relatedSlug)) failures.push(`${game.slug} relatedGames slug does not exist: ${relatedSlug}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Invalid game catalog:\n${failures.join("\n")}`);
  }
}

function byNewest(a, b) {
  return b.publishedAt.localeCompare(a.publishedAt);
}

function assetUrl(assetPath) {
  const normalizedPath = assetPath.replace(/^\/+/, "");
  const sourcePath = join(process.cwd(), "src", normalizedPath);
  const hash = createHash("sha256").update(readFileSync(sourcePath)).digest("hex").slice(0, 12);
  return `${assetPath}?v=${hash}`;
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.on("eleventy.before", () => {
    validateCatalog(loadCatalog());
  });

  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));

  eleventyConfig.addFilter("assetUrl", assetUrl);

  eleventyConfig.addFilter("featuredGameRecords", (featuredSlugs, games) => {
    const bySlug = new Map(games.map((game) => [game.slug, game]));
    return featuredSlugs.map((slug) => bySlug.get(slug));
  });

  eleventyConfig.addFilter("rankGamesForLocale", (games, locale = DEFAULT_LOCALE) => {
    return rankGamesForLocale(games, locale);
  });

  eleventyConfig.addFilter("gamesByCategory", (games, categorySlug, locale = DEFAULT_LOCALE) => {
    return rankGamesForLocale(
      games.filter((game) => game.category === categorySlug || game.tags.includes(categorySlug)),
      locale
    );
  });

  eleventyConfig.addFilter("newestGames", (games) => {
    return [...games].sort(byNewest);
  });

  eleventyConfig.addFilter("gameBySlug", (games, slug) => {
    return games.find((game) => game.slug === slug);
  });

  eleventyConfig.addFilter("categoryBySlug", (categories, slug) => {
    return categories.find((category) => category.slug === slug);
  });

  eleventyConfig.addFilter("tagBySlug", (tags, slug) => {
    return tags.find((tag) => tag.slug === slug);
  });

  eleventyConfig.addFilter("gamesByTag", (games, tagSlug, locale = DEFAULT_LOCALE) => {
    return rankGamesForLocale(games.filter((game) => game.tags.includes(tagSlug)), locale);
  });

  eleventyConfig.addFilter("relatedGameRecords", (relatedSlugs, games, locale = DEFAULT_LOCALE) => {
    const bySlug = new Map(games.map((game) => [game.slug, game]));
    const relatedGames = (relatedSlugs ?? []).map((slug) => bySlug.get(slug)).filter(Boolean);
    return rankGamesForLocale(relatedGames, locale);
  });

  eleventyConfig.addFilter("searchIndexRecords", (games, locale = DEFAULT_LOCALE) => {
    return rankGamesForLocale(games, locale).map((game, index) => ({
      title: game.title,
      slug: game.slug,
      url: `/games/${game.slug}/`,
      thumbnail: game.thumbnail.src,
      primaryTag: game.primaryTag,
      tags: game.tags,
      shortDescription: game.shortDescription,
      localeRank: index
    }));
  });

  eleventyConfig.addFilter("maxPublishedAt", (games) => {
    return [...games].sort(byNewest)[0]?.publishedAt ?? "";
  });
}
