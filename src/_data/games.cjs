const embed = require("./embed.json");
const { buildCatalog } = require("./catalog-utils.cjs");

module.exports = buildCatalog(embed);
