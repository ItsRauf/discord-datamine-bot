const { writeFileSync } = require("fs");

/**
 * writeToDatamine
 *
 * @param {*} datamine
 * @returns Datamine
 */
module.exports = async (datamine) => {;
  writeFileSync("./src/datamine.json", JSON.stringify(datamine, null, 2));
  delete require.cache[require.resolve("../datamine.json")];
  datamine = require("../datamine.json");
  return datamine;
}