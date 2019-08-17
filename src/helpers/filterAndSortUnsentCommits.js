/**
 * filterAndSortUnsentCommits
 *
 * @param {Array} storage
 * @param {Number} buildNumber
 * @returns
 */
module.exports = (storage, buildNumber) => {
  const unsent = storage.filter(commit => commit.buildNumber > buildNumber);
  unsent.sort((a, b) => a.buildNumber - b.buildNumber);
  return unsent;
}