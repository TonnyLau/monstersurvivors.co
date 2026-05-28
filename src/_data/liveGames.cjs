const catalog = require("./games.cjs");

module.exports = catalog.games.filter((game) => game.status === "live");
