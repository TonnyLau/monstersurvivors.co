(function () {
  var sidebar = document.getElementById("game-sidebar");
  var sidebarToggle = document.querySelector("[data-sidebar-toggle]");
  var sidebarClose = document.querySelector("[data-sidebar-close]");
  var desktopSidebar = window.matchMedia("(min-width: 901px)");

  function setSidebar(open) {
    if (!sidebar || !sidebarToggle) return;
    sidebar.classList.toggle("sidebar-nav--open", open);
    document.body.classList.toggle("has-sidebar-open", open);
    sidebarToggle.setAttribute("aria-expanded", String(open));
    if (sidebarClose) {
      sidebarClose.hidden = !open;
    }
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      if (desktopSidebar.matches) {
        setSidebar(false);
        return;
      }
      setSidebar(!sidebar.classList.contains("sidebar-nav--open"));
    });
  }

  if (sidebarClose) {
    sidebarClose.addEventListener("click", function () {
      setSidebar(false);
    });
  }

  var fullscreenButtons = document.querySelectorAll("[data-fullscreen-button]");

  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function requestFullscreen(element) {
    if (element.requestFullscreen) {
      return element.requestFullscreen();
    }
    if (element.webkitRequestFullscreen) {
      return element.webkitRequestFullscreen();
    }
    return null;
  }

  function syncFullscreenButton(button) {
    var frame = button.closest(".game-frame");
    button.hidden = getFullscreenElement() === frame;
  }

  if (fullscreenButtons.length) {
    Array.prototype.forEach.call(fullscreenButtons, function (button) {
      var frame = button.closest(".game-frame");
      if (!frame || (!frame.requestFullscreen && !frame.webkitRequestFullscreen)) {
        button.hidden = true;
        return;
      }

      button.addEventListener("click", function () {
        button.hidden = true;
        requestFullscreen(frame);
      });
    });

    document.addEventListener("fullscreenchange", function () {
      Array.prototype.forEach.call(fullscreenButtons, function (button) {
        syncFullscreenButton(button);
      });
    });

    document.addEventListener("webkitfullscreenchange", function () {
      Array.prototype.forEach.call(fullscreenButtons, function (button) {
        syncFullscreenButton(button);
      });
    });
  }

  var root = document.querySelector("[data-search-root]");
  if (!root) return;

  var input = root.querySelector("[data-search-input]");
  var submit = root.querySelector("[data-search-submit]");
  var panel = root.querySelector("[data-search-panel]");
  var results = root.querySelector("[data-search-results]");
  var empty = root.querySelector("[data-search-empty]");
  var indexPromise;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function loadIndex() {
    if (!indexPromise) {
      indexPromise = fetch("/search-index.json")
        .then(function (response) {
          return response.ok ? response.json() : [];
        })
        .catch(function () {
          return [];
        });
    }
    return indexPromise;
  }

  function scoreGame(game, query) {
    var title = game.title.toLowerCase();
    var tags = game.tags.join(" ").toLowerCase();
    var description = game.shortDescription.toLowerCase();

    if (title === query) return 100;
    if (title.indexOf(query) === 0) return 80;
    if (title.indexOf(query) !== -1) return 60;
    if (tags.indexOf(query) !== -1) return 35;
    if (description.indexOf(query) !== -1) return 15;
    return 0;
  }

  function render(matches) {
    if (!panel || !results || !empty) return;
    panel.hidden = false;
    results.innerHTML = matches.map(function (game) {
      return [
        '<a class="search-result" href="' + escapeHtml(game.url) + '">',
        '<img src="' + escapeHtml(game.thumbnail) + '" alt="" loading="lazy">',
        '<span class="search-result__body">',
        '<strong>' + escapeHtml(game.title) + '</strong>',
        '<small>' + escapeHtml(game.primaryTag) + '</small>',
        '</span>',
        '</a>'
      ].join("");
    }).join("");
    empty.hidden = matches.length > 0;
  }

  function updateSearch() {
    var query = input.value.trim().toLowerCase();
    if (!query) {
      panel.hidden = true;
      results.innerHTML = "";
      empty.hidden = true;
      return;
    }

    loadIndex().then(function (games) {
      var matches = games
        .map(function (game) {
          return { game: game, score: scoreGame(game, query) };
        })
        .filter(function (item) {
          return item.score > 0;
        })
        .sort(function (a, b) {
          var aRank = typeof a.game.localeRank === "number" ? a.game.localeRank : 999999;
          var bRank = typeof b.game.localeRank === "number" ? b.game.localeRank : 999999;
          return b.score - a.score || aRank - bRank || a.game.title.localeCompare(b.game.title);
        })
        .slice(0, 8)
        .map(function (item) {
          return item.game;
        });
      render(matches);
    });
  }

  if (input) {
    input.addEventListener("focus", loadIndex);
    input.addEventListener("input", updateSearch);
    input.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        panel.hidden = true;
        input.blur();
      }
    });
  }

  if (submit) {
    submit.addEventListener("click", function () {
      input.focus();
      updateSearch();
    });
  }

  document.addEventListener("click", function (event) {
    if (panel && !root.contains(event.target)) {
      panel.hidden = true;
    }
  });
}());
