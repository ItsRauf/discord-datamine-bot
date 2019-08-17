/**
 * parseBuildNumber
 *
 * @param {String} title
 * @returns Build Number
 */
module.exports = async (title) => {
  const regex = /(Canary\sbuild:\s([0-9]*))/;
  if (regex.test(title)) {
    return regex.exec(title)[2];
  }
}