const SIDEBAR_TAGS = [
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

const BROAD_RELATED_TAGS = new Set(["free", "html5", "unity", "mobile", "1-player", "2d", "3d"]);
const ATTRIBUTE_PRIMARY_TAGS = new Set(["1-player", "2-player", "2d", "3d", "mobile"]);
const IMPORT_BASE_DATE = Date.UTC(2026, 4, 27);

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function labelForTag(tag) {
  if (tag === "2d" || tag === "3d") return tag.toUpperCase();
  if (tag === "io-games") return ".io Games";
  return tag
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function cleanTags(tags) {
  return [...new Set(
    String(tags)
      .split(",")
      .map((tag) => slugify(tag.trim()))
      .filter(Boolean)
  )];
}

function choosePrimaryTag(tags) {
  return (
    tags.find((tag) => SIDEBAR_TAGS.includes(tag) && !ATTRIBUTE_PRIMARY_TAGS.has(tag)) ??
    tags.find((tag) => SIDEBAR_TAGS.includes(tag)) ??
    "arcade"
  );
}

function dateForIndex(index) {
  const date = new Date(IMPORT_BASE_DATE - index * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function shortDescription(description) {
  const text = String(description).replace(/\s+/g, " ").trim();
  if (text.length <= 150) return text;
  return `${text.slice(0, 147).trim()}...`;
}

function buildTagStats(games) {
  const counts = new Map();
  for (const game of games) {
    for (const tag of game.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([slug, count]) => ({
      slug,
      label: labelForTag(slug),
      count,
      href: `/t/${slug}/`,
      isSidebar: SIDEBAR_TAGS.includes(slug)
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function relatedFor(game, games) {
  const tags = new Set(game.tags.filter((tag) => !BROAD_RELATED_TAGS.has(tag)));
  return games
    .filter((candidate) => candidate.slug !== game.slug)
    .map((candidate) => {
      const score = candidate.tags.reduce((total, tag) => total + (tags.has(tag) ? 1 : 0), 0);
      return { slug: candidate.slug, score, title: candidate.title };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 6)
    .map((candidate) => candidate.slug);
}

function normalizeGame(record, index) {
  const tags = cleanTags(record.tags);
  const primaryTag = choosePrimaryTag(tags);
  const title = String(record.title).trim();
  const description = String(record.description).replace(/\s+/g, " ").trim();
  const slug = slugify(title);

  return {
    slug,
    title,
    category: primaryTag,
    primaryTag,
    tags,
    rawTags: tags,
    status: "live",
    publishedAt: dateForIndex(index),
    description,
    shortDescription: shortDescription(description),
    seo: {
      title: `${title} - Play Free Online`,
      description: shortDescription(description)
    },
    iframe: {
      src: record.embed,
      sandbox: "allow-scripts allow-same-origin allow-pointer-lock",
      allow: "fullscreen; gamepad; autoplay; pointer-lock"
    },
    thumbnail: {
      src: record.image,
      width: 512,
      height: 512,
      alt: `${title} Online`
    },
    features: [
      "Instant browser play",
      `${labelForTag(primaryTag)} game category`,
      "Free online gameplay",
      "No download required"
    ],
    instructions: [
      `Press play to load ${title} in your browser.`,
      "Use the controls shown inside the game.",
      "Keep practicing to improve your score and progress."
    ],
    faq: [
      {
        question: `Can I play ${title} for free?`,
        answer: `Yes. ${title} is available as a free browser game on ArcadeNest.`
      },
      {
        question: `Do I need to install ${title}?`,
        answer: "No installation is required. The game runs inside the browser iframe."
      }
    ],
    relatedGames: []
  };
}

function buildCatalog(source) {
  const seen = new Set();
  const games = source
    .filter((record) => record.title && record.embed && record.image && record.tags && record.description)
    .map((record, index) => normalizeGame(record, index))
    .filter((game) => {
      if (seen.has(game.slug)) return false;
      seen.add(game.slug);
      return true;
    });

  for (const game of games) {
    game.relatedGames = relatedFor(game, games);
  }

  const allTags = buildTagStats(games);
  const allBySlug = new Map(allTags.map((tag) => [tag.slug, tag]));
  const sidebarTags = SIDEBAR_TAGS.map((slug) => ({
    slug,
    label: labelForTag(slug),
    count: allBySlug.get(slug)?.count ?? 0,
    href: `/t/${slug}/`,
    isSidebar: true
  }));

  return {
    featuredGames: games.slice(0, 12).map((game) => game.slug),
    categories: [
      {
        slug: "survival",
        title: "Survival Games",
        description: "Play survival games where quick movement, smart upgrades, and sharp reactions help you stay alive."
      },
      {
        slug: "action",
        title: "Action Games",
        description: "Explore fast action games built for instant browser play."
      },
      {
        slug: "arcade",
        title: "Arcade Games",
        description: "Jump into simple, replayable arcade games with quick sessions and easy controls."
      }
    ],
    sidebarTags,
    allTags,
    games
  };
}

module.exports = {
  SIDEBAR_TAGS,
  buildCatalog,
  cleanTags,
  labelForTag,
  slugify
};
