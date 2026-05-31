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

function compactDescription(description) {
  const text = String(description).replace(/\s+/g, " ").trim();
  const firstSentence = text.match(/[^.!?]+[.!?]+/)?.[0]?.trim();
  const compact = firstSentence || text;
  if (compact.length <= 96) return compact;
  return `${compact.slice(0, 93).trim()}...`;
}

function sentenceSummary(description, maxSentences = 2) {
  const text = String(description).replace(/\s+/g, " ").trim();
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [];
  const summary = sentences.slice(0, maxSentences).join(" ").trim();
  if (summary) return summary;
  return shortDescription(text);
}

function cleanDescriptionFromOverview(overview, title, primaryTag) {
  const text = overview
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (text) return text;
  return `${title} is a free online ${labelForTag(primaryTag).toLowerCase()} challenge you can play instantly in your browser.`;
}

function cleanSourceText(value) {
  return String(value)
    .replace(/\u00a0/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sectionizeSourceText(value) {
  return cleanSourceText(value)
    .replace(/\b(Controls|Instructions|Table of Contents)\b/g, "\n\n$1\n")
    .replace(/\b(How\s+To\s+Play\b[^.!?\n]{0,80})/g, "\n\n$1\n")
    .replace(/\b(How\s+to\s+Play\b[^.!?\n]{0,80})/g, "\n\n$1\n")
    .replace(/\b(Tips?\s*(?:&|and)?\s*Tricks\b[^.!?\n]{0,80})/g, "\n\n$1\n")
    .replace(/\b(Key\s+Features\b[^.!?\n]{0,80})/g, "\n\n$1\n")
    .replace(/\b([A-Z][A-Za-z0-9'’&!,-]*(?:\s+(?:-|[A-Za-z0-9'’&!,-]+)){0,8}\s+Overview)\b/g, "\n\n$1\n")
    .replace(/\b(Developer|More Games Like This|Similar Games|You May Also Like|Looking for More|What is More)\b/g, "\n\n$1\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isGuideHeading(line) {
  const text = line.trim().toLowerCase();
  return (
    text === "controls" ||
    text === "instructions" ||
    text === "table of contents" ||
    /^how\s+to\s+play\b/.test(text) ||
    /^tips?\b/.test(text) ||
    /^key\s+features\b/.test(text) ||
    /^developer\b/.test(text) ||
    /^more\s+games\s+like\s+this\b/.test(text) ||
    /^similar\s+games\b/.test(text) ||
    /^you\s+may\s+also\s+like\b/.test(text) ||
    /^looking\s+for\s+more\b/.test(text) ||
    /^what\s+is\s+more\b/.test(text) ||
    /^.+\s+overview$/.test(text)
  );
}

function splitMeaningfulParagraphs(text) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((paragraph) => !isGuideHeading(paragraph))
    .filter((paragraph) => !/^(?:wasd|arrow|mouse|space|spacebar|shift|ctrl|tab|enter|esc|left|right|up|down|lmb|rmb):\s+/i.test(paragraph));
}

function overviewParagraphs(description, title) {
  const sourceText = cleanSourceText(description);
  if (sourceText.toLowerCase().startsWith("table of contents") && title) {
    const marker = `what is ${String(title).toLowerCase()}?`;
    const first = sourceText.toLowerCase().indexOf(marker);
    const second = first === -1 ? -1 : sourceText.toLowerCase().indexOf(marker, first + marker.length);

    if (second !== -1) {
      const body = sectionizeSourceText(sourceText.slice(second + marker.length));
      const bodyLines = body.split("\n");
      const end = bodyLines.findIndex((line) => isGuideHeading(line));
      const paragraphs = splitMeaningfulParagraphs(bodyLines.slice(0, end === -1 ? undefined : end).join("\n"));
      if (paragraphs.length > 0) return paragraphs.slice(0, 2);
    }
  }

  const text = sectionizeSourceText(description);
  const lines = text.split("\n");
  let firstGuideLine = lines.findIndex((line) => isGuideHeading(line));
  let introStart = 0;
  let introEnd = firstGuideLine > 0 ? firstGuideLine : lines.length;

  if (firstGuideLine === 0 && lines[0].trim().toLowerCase() === "table of contents") {
    const firstContentLine = lines.findIndex((line, index) => index > 0 && line.trim().length > 80 && /[.!?]/.test(line));
    if (firstContentLine !== -1) {
      introStart = firstContentLine;
      introEnd = lines.length;
    }
  }

  const intro = lines.slice(introStart, introEnd).join("\n");
  let paragraphs = splitMeaningfulParagraphs(intro);

  if (paragraphs.length === 0) {
    paragraphs = splitMeaningfulParagraphs(text).filter((paragraph) => paragraph.length > 40);
  }

  return paragraphs.slice(0, 2);
}

function controlSection(description) {
  const text = sectionizeSourceText(description);
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line.trim().toLowerCase() === "controls");
  if (start === -1) return "";

  const end = lines.findIndex((line, index) => index > start && isGuideHeading(line) && line.trim().toLowerCase() !== "controls");
  return lines.slice(start + 1, end === -1 ? undefined : end).join("\n").trim();
}

function normalizeControlLabel(value) {
  return value
    .replace(/\bKey$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeControlAction(value) {
  return value
    .replace(/\bCarnera\b/gi, "Camera")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.$/, "");
}

function controlEntriesFromLine(line) {
  const inputPattern = [
    "WASD(?:\\s+or\\s+(?:the\\s+)?(?:Arrows?|arrow\\s+keys|Arrow\\s+keys))?",
    "(?:Arrow|arrow)\\s+keys?",
    "Arrows?",
    "Mouse(?:\\s+Wheel)?",
    "LMB\\s+or\\s+Spacebar",
    "Left[-\\s]?Mouse(?:\\s+Button)?",
    "Right[-\\s]?Mouse(?:\\s+Button)?",
    "LMB",
    "RMB",
    "Space(?:bar)?",
    "On\\s+Mobile\\s+Devices",
    "Touch\\s+controls",
    "(?:Left|Right|Up|Down)(?:\\s+Arrow)?",
    "Shift",
    "Ctrl",
    "Tab",
    "Esc",
    "Enter",
    "[A-Z0-9](?:\\s*/\\s*[A-Z0-9])?"
  ].join("|");
  const markers = [...line.matchAll(new RegExp(`(?:^|\\s)(${inputPattern}):\\s*`, "g"))];
  if (markers.length === 0) return [];

  return markers.map((marker, index) => {
    const input = marker[1];
    const actionStart = marker.index + marker[0].length;
    const actionEnd = index + 1 < markers.length ? markers[index + 1].index : line.length;
    return {
      input,
      action: line.slice(actionStart, actionEnd)
    };
  });
}

function parseControls(description) {
  const section = controlSection(description);
  if (!section) return [];

  const controls = [];
  for (const line of section.split("\n")) {
    const text = line.trim();
    if (!text || !text.includes(":") || /^player\s*\d*/i.test(text) || /^single player/i.test(text)) continue;

    for (const entry of controlEntriesFromLine(text)) {
      const cleanInput = normalizeControlLabel(entry.input);
      const cleanAction = normalizeControlAction(entry.action);

      if ((cleanInput.length < 2 && !/^[A-Z0-9]$/.test(cleanInput)) || cleanInput.length > 64 || cleanAction.length < 2) continue;
      controls.push({ input: cleanInput, action: cleanAction });
    }
  }

  return controls.slice(0, 8);
}

function fallbackControls(tags) {
  const tagSet = new Set(tags);
  const controls = [];

  if (tagSet.has("mouse") || tagSet.has("sports") || tagSet.has("puzzle") || tagSet.has("clicker")) {
    controls.push({ input: "Mouse", action: "Aim, select, or interact with the game" });
  }

  if (tagSet.has("mobile")) {
    controls.push({ input: "Touch controls", action: "Tap, drag, or swipe on mobile screens" });
  }

  if (tagSet.has("car") || tagSet.has("driving") || tagSet.has("racing") || tagSet.has("drift")) {
    controls.push({ input: "WASD or arrow keys", action: "Steer and control movement" });
    controls.push({ input: "Spacebar", action: "Brake, drift, or activate the main vehicle action" });
    controls.push({ input: "R", action: "Reset when the game supports it" });
  } else if (tagSet.has("shooting") || tagSet.has("sniper") || tagSet.has("action")) {
    controls.push({ input: "WASD or arrow keys", action: "Move your character" });
    controls.push({ input: "Mouse", action: "Aim or look around" });
    controls.push({ input: "Left mouse button", action: "Attack, shoot, or interact" });
  } else if (controls.length === 0) {
    controls.push({ input: "Mouse or keyboard", action: "Use the on-screen controls shown by the game" });
    controls.push({ input: "Touch controls", action: "Play with taps and swipes on mobile when supported" });
  }

  const seen = new Set();
  return controls.filter((control) => {
    const key = control.input.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 6);
}

function objectiveFor(tags, primaryTag) {
  const tagSet = new Set(tags);
  if (tagSet.has("drift")) return "hold clean slides, keep speed through corners, and recover before the car spins out";
  if (tagSet.has("racing") || tagSet.has("driving") || tagSet.has("car")) return "drive cleanly, avoid costly crashes, and reach each goal with control";
  if (tagSet.has("shooting") || tagSet.has("sniper")) return "line up targets, manage movement, and stay aware of threats";
  if (tagSet.has("sports")) return "time each shot carefully and adjust your aim before committing";
  if (tagSet.has("puzzle")) return "read the board, plan the next move, and avoid rushed decisions";
  if (tagSet.has("clicker")) return "keep earning currency, buy upgrades, and build momentum over time";
  if (tagSet.has("survival")) return "stay alive as pressure rises and use every safe opening to improve your run";
  return `focus on the main ${labelForTag(primaryTag).toLowerCase()} challenge and improve one run at a time`;
}

function actionVerbFor(tags, primaryTag) {
  const tagSet = new Set(tags);
  if (tagSet.has("drift")) return "master clean drifts";
  if (tagSet.has("racing") || tagSet.has("driving") || tagSet.has("car")) return "take control fast";
  if (tagSet.has("shooting") || tagSet.has("sniper")) return "lock onto the action";
  if (tagSet.has("sports")) return "time the winning shot";
  if (tagSet.has("puzzle")) return "solve the next move";
  if (tagSet.has("clicker")) return "build momentum";
  if (tagSet.has("survival")) return "stay alive under pressure";
  return `jump into a ${labelForTag(primaryTag).toLowerCase()} challenge`;
}

function buildHowToPlay(title, tags, primaryTag) {
  return [
    {
      title: "Launch and look around",
      text: `Press play, let ${title} load, and take a few seconds to read the first prompt or menu.`
    },
    {
      title: "Know what you are here to do",
      text: `Your goal is to ${objectiveFor(tags, primaryTag)}.`
    },
    {
      title: "Get comfortable with the controls",
      text: "Use the control list here first, then follow any extra prompts shown inside the game frame."
    },
    {
      title: "Run it back smarter",
      text: "Replay short sessions, notice what cost you the run, and adjust your timing, route, or upgrade choices."
    }
  ];
}

function buildLongTailTerms(tags, primaryTag) {
  const tagSet = new Set(tags);
  const terms = [];

  if (tagSet.has("drift")) {
    terms.push("drift game online", "free drift games no download", "3D drift simulator", "browser drifting challenge");
  } else if (tagSet.has("simulator")) {
    if (tagSet.has("driving") || tagSet.has("car") || tagSet.has("racing")) {
      terms.push("3D driving simulator", "free simulator online", "no download simulator", "browser driving challenge");
    } else if (tagSet.has("flight") || tagSet.has("flying") || tagSet.has("airplane")) {
      terms.push("flight simulator online", "free simulator online", "no download simulator", "browser flying challenge");
    } else {
      terms.push("free simulator online", "no download simulator", "3D simulator online", "browser simulator challenge");
    }
  } else if (tagSet.has("racing") || tagSet.has("driving") || tagSet.has("car")) {
    terms.push("car game online", "free driving challenge", "no download racing", "browser racing game");
  } else if (tagSet.has("sports")) {
    terms.push("sports game online", "free sports challenge", "browser sports game", "no download sports game");
  } else if (tagSet.has("puzzle")) {
    terms.push("puzzle game online", "free puzzle challenge", "browser puzzle game", "no download puzzle game");
  } else if (tagSet.has("shooting") || tagSet.has("sniper")) {
    terms.push("shooting game online", "free browser shooter", "no download shooting game", "online aiming challenge");
  } else if (tagSet.has("clicker")) {
    terms.push("clicker game online", "free idle clicker", "browser clicker game", "no download clicker");
  } else if (tagSet.has("survival")) {
    terms.push("survival game online", "free survival challenge", "browser survival game", "no download survival game");
  }

  return [...new Set(terms)].slice(0, 5);
}

function buildTips(tags, primaryTag) {
  const tagSet = new Set(tags);
  const baseTips = [
    "Spend the first run learning how quickly the game reacts to your input.",
    "Make small corrections instead of holding a direction for too long.",
    "Watch the edges of the play area so obstacles and enemies do not surprise you.",
    "Use restarts as practice; fast retries are often the quickest way to improve."
  ];

  if (tagSet.has("drift")) {
    return [
      "Start each drift before the corner, not after the car is already wide.",
      "Feather the throttle to keep control while the rear of the car slides.",
      "Reset quickly after a crash so you do not waste practice time.",
      "Try one track until you know where the long corners and recovery zones are.",
      "Switch camera views only when you have a straight section ahead."
    ];
  }

  if (tagSet.has("racing") || tagSet.has("driving") || tagSet.has("car")) {
    return [
      "Brake before sharp turns so you can accelerate out cleanly.",
      "Avoid oversteering; smooth inputs usually beat dramatic corrections.",
      "Use resets when the vehicle is stuck or badly positioned.",
      "Look ahead on the road instead of reacting only to the nearest obstacle.",
      "Learn where coins, ramps, or shortcuts appear before chasing risky routes."
    ];
  }

  if (tagSet.has("sports")) {
    return [
      "Wait for the best timing window instead of taking the first possible shot.",
      "Aim with small movements so the final adjustment stays precise.",
      "Study how power changes distance before attempting harder targets.",
      "On mobile, drag deliberately and release only when the angle feels stable.",
      "Replay missed shots in your head and correct either power or direction first."
    ];
  }

  if (tagSet.has("shooting") || tagSet.has("sniper")) {
    return [
      "Keep moving between shots so enemies cannot trap you in one spot.",
      "Aim before exposing yourself to danger whenever the level allows it.",
      "Reload or recover during quiet moments instead of during direct pressure.",
      "Prioritize close threats before chasing distant targets.",
      "Use cover, corners, or distance to control how many enemies can reach you."
    ];
  }

  if (tagSet.has("puzzle")) {
    return [
      "Pause for a second before each move and look for chain reactions.",
      "Clear blocked spaces early so later moves have more options.",
      "Avoid using a strong move unless it creates a clear advantage.",
      "Track the next objective instead of only reacting to the current board.",
      "If stuck, restart with a different first move and compare the result."
    ];
  }

  return [
    ...baseTips,
    `Focus on the habits that matter most in ${labelForTag(primaryTag).toLowerCase()} games: timing, awareness, and clean inputs.`
  ];
}

function buildTagline(title, tags, primaryTag) {
  return `Play ${title} online for free - no download, no sign-up, straight to the ${labelForTag(primaryTag).toLowerCase()} action.`;
}

function buildQuickFacts(tags, primaryTag) {
  const tagSet = new Set(tags);
  const facts = [
    { label: "Free", value: "No cost to play" },
    { label: "Instant Play", value: "Runs in your browser" },
    { label: labelForTag(primaryTag), value: "Main category" }
  ];

  if (tagSet.has("multiplayer") || tagSet.has("2-player")) {
    facts.push({ label: "Multiplayer", value: "Play with others or share a keyboard" });
  } else if (tagSet.has("mobile")) {
    facts.push({ label: "Mobile Ready", value: "Touch controls supported" });
  } else {
    facts.push({ label: "No Install", value: "Open and start playing" });
  }

  return facts.slice(0, 4);
}

function buildPlatformBenefits(title, primaryTag) {
  return [
    {
      title: "Browser-based",
      text: `${title} runs directly on ArcadeNest, so you can open it on a modern browser without setup.`
    },
    {
      title: "Fast start",
      text: "Skip downloads and account creation; load the page, press play, and get into the session."
    },
    {
      title: "Free access",
      text: `Play a focused ${labelForTag(primaryTag).toLowerCase()} game with no hidden fee from ArcadeNest.`
    }
  ];
}

function buildFeatureDetails(primaryTag) {
  return [
    { title: "Instant browser play", text: "No download, launcher, or install step." },
    { title: "Free online gameplay", text: "Start playing without creating an account." },
    { title: `${labelForTag(primaryTag)} category`, text: "Easy to find again from the ArcadeNest catalog." },
    { title: "Modern browser support", text: "Built for quick sessions on current desktop and mobile browsers." }
  ];
}

function buildGuide({ title, description, tags, primaryTag }) {
  const controls = parseControls(description);
  const overview = overviewParagraphs(description, title);
  return {
    overview,
    platformBenefits: buildPlatformBenefits(title, primaryTag),
    controls: controls.length > 0 ? controls : fallbackControls(tags),
    howToPlay: buildHowToPlay(title, tags, primaryTag),
    tips: buildTips(tags, primaryTag),
    longTailTerms: buildLongTailTerms(tags, primaryTag)
  };
}

function buildFaq(title, tags, primaryTag) {
  const tagSet = new Set(tags);
  const faq = [
    {
      question: `Can I play ${title} for free?`,
      answer: `Yes. ${title} is available as a free browser title on ArcadeNest.`
    },
    {
      question: `Do I need to install ${title}?`,
      answer: "No installation is required. It runs inside the browser iframe."
    },
    {
      question: `Is ${title} the same game people search for online?`,
      answer: `This page launches the playable browser version of ${title}. The experience may include the menus, ads, or loading screens provided by the game publisher.`
    },
    {
      question: `Can I play ${title} with friends?`,
      answer: tagSet.has("multiplayer") || tagSet.has("2-player")
        ? "Yes. This game is tagged for multiplayer or two-player play, so check the in-game menu for the available mode."
        : "This game is primarily a solo browser game. For shared play, browse ArcadeNest multiplayer and two-player categories."
    },
    {
      question: `Does ${title} work on mobile?`,
      answer: tagSet.has("mobile")
        ? "Yes. It is tagged for mobile play, though some controls can still feel better on a larger screen."
        : "It may load on mobile browsers, but keyboard or mouse controls can make the experience better."
    },
    {
      question: `Why is there an ad before ${title}?`,
      answer: `Some free online ${labelForTag(primaryTag).toLowerCase()} games show a short sponsor or publisher ad before loading. That helps keep the game free to play.`
    }
  ];

  if (tagSet.has("drift")) {
    faq.push({
      question: `Can I play ${title} at school or work?`,
      answer: `Players searching for a 3D drift simulator unblocked experience can launch it in the browser, subject to their local network rules.`
    });
  }

  return faq;
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
  const slug = slugify(title);
  const guide = buildGuide({ title, description: record.description, tags, primaryTag });
  const cleanDescription = cleanDescriptionFromOverview(guide.overview, title, primaryTag);

  return {
    slug,
    title,
    category: primaryTag,
    primaryTag,
    tags,
    rawTags: tags,
    status: "live",
    publishedAt: dateForIndex(index),
    description: cleanDescription,
    heroDescription: sentenceSummary(cleanDescription, 2),
    tagline: buildTagline(title, tags, primaryTag),
    quickFacts: buildQuickFacts(tags, primaryTag),
    cleanDescription,
    shortDescription: shortDescription(cleanDescription),
    compactDescription: compactDescription(cleanDescription),
    guide,
    seo: {
      title: `${title} - Play Free Online`,
      description: shortDescription(cleanDescription)
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
    features: buildFeatureDetails(primaryTag),
    instructions: [
      `Press play to load ${title} in your browser.`,
      `Focus first on how to ${actionVerbFor(tags, primaryTag)}.`,
      "Use quick retries to learn the timing, controls, and safest route."
    ],
    faq: buildFaq(title, tags, primaryTag),
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
