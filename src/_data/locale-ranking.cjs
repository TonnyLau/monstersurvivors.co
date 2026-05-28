const DEFAULT_LOCALE = "en-US";

const localeRankings = {
  "en-US": {
    pinnedGames: [
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
    ],
    tagWeights: [
      "shooting",
      "sports",
      "racing",
      "drift",
      "driving",
      "car",
      "puzzle",
      "strategy",
      "io-games"
    ]
  },
  "zh-CN": {
    pinnedGames: [
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
    ],
    tagWeights: [
      "puzzle",
      "action",
      "racing",
      "drift",
      "simulator",
      "clicker",
      "survival",
      "strategy",
      "io-games",
      "minecraft"
    ]
  }
};

function normalizeLocale(locale) {
  const value = String(locale || DEFAULT_LOCALE);
  if (value.toLowerCase().startsWith("zh")) return "zh-CN";
  return localeRankings[value] ? value : DEFAULT_LOCALE;
}

function buildIndex(values) {
  return new Map(values.map((value, index) => [value, index]));
}

function timeFor(game) {
  const time = Date.parse(game?.publishedAt ?? "");
  return Number.isFinite(time) ? time : 0;
}

function recencyScore(game, latestTime) {
  if (!latestTime) return 0;
  const daysOld = (latestTime - timeFor(game)) / 86400000;
  if (!Number.isFinite(daysOld) || daysOld < 0 || daysOld > 30) return 0;
  return ((30 - daysOld) / 30) * 5;
}

function tagScore(game, tagWeights) {
  const tags = Array.isArray(game?.tags) ? game.tags : [];
  return tags.reduce((total, tag) => {
    const index = tagWeights.get(tag);
    if (index === undefined) return total;
    return total + (tagWeights.size - index) * 10;
  }, 0);
}

function rankGamesForLocale(games, locale = DEFAULT_LOCALE) {
  const list = Array.isArray(games) ? games : [];
  const config = localeRankings[normalizeLocale(locale)];
  const pinned = buildIndex(config.pinnedGames);
  const weights = buildIndex(config.tagWeights);
  const latestTime = list.reduce((latest, game) => Math.max(latest, timeFor(game)), 0);

  return list
    .map((game, index) => ({
      game,
      index,
      pinnedIndex: pinned.has(game?.slug) ? pinned.get(game.slug) : undefined,
      score: tagScore(game, weights) + recencyScore(game, latestTime)
    }))
    .sort((a, b) => {
      if (a.pinnedIndex !== undefined || b.pinnedIndex !== undefined) {
        if (a.pinnedIndex === undefined) return 1;
        if (b.pinnedIndex === undefined) return -1;
        return a.pinnedIndex - b.pinnedIndex;
      }
      return b.score - a.score || a.index - b.index;
    })
    .map((item) => item.game);
}

module.exports = {
  DEFAULT_LOCALE,
  localeRankings,
  normalizeLocale,
  rankGamesForLocale
};
