const { writeFileSync } = require("fs");

/**
 * writeToStorage
 *
 * @param {*} commit
 * @param {Array} storage
 * @returns Storage Array and Commit
 */
module.exports = async (storage, commit) => {
  storage.push(commit);
  writeFileSync("./src/commits.json", JSON.stringify(storage, null, 2));
  delete require.cache[require.resolve("../commits.json")];
  storage = require("../commits.json");
  return { commit, storage };
}