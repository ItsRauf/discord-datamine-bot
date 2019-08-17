/**
 * findStoredCommit
 *
 * @param {Array} storage
 * @param {Number} buildNumber
 * @returns Found Commit
 */
module.exports = async (storage, buildNumber) => {
  return storage.find(commit => commit.buildNumber === buildNumber);
}