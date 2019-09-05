const axios = require("axios").default;
const findStoredCommit = require("./findStoredCommit")
const parseBuildNumber = require("./parseBuildNumber");
const writeToDatamine = require("./writeToDatamine");
const writeToStorage = require("./writeToStorage");

/**
 * getCommits
 *
 * @param {*} datamine
 * @param {Array} storage
 * @returns Latest Commit
 */
module.exports = async (storage, datamine) => {
  const RequestOptions = {
    auth: {
      username: process.env.USERNAME,
      password: process.env.PASSWORD
    }
  };
  const commits = await axios.get("https://api.github.com/repos/DJScias/Discord-Datamining/commits", RequestOptions);
  const commitsWithComments = commits.data.filter((commit) => commit.commit.comment_count >= 1);
  commitsWithComments.forEach(async (commit) => {
    const storable = {
      comment: {
        url: commit.comments_url
      },
      title: commit.commit.message
    };
    storable.buildNumber = await parseBuildNumber(storable.title);
    const commitFromStorage = await findStoredCommit(storage, storable.buildNumber);
    if (!commitFromStorage) {
      const comments = await axios.get(storable.comment.url, RequestOptions);
      const commentsByTiemen = comments.data.filter((comment) => comment.user.login === "ThaTiemsz");
      const comment = commentsByTiemen[0];
      if (comment) {
        storable.comment.body = comment.body;
        storable.comment.html_url = comment.html_url;
        const storedCommit = await writeToStorage(storage, storable);
        console.log(`Stored Commit for Build ${storedCommit.commit.buildNumber}`);
      }
    }
  });
  const title = commitsWithComments[0].commit.message;
  const buildNumber = await parseBuildNumber(title);
  const commitFromStorage = await findStoredCommit(storage, buildNumber);

  datamine.current = commitFromStorage;
  const newDatamine = await writeToDatamine(datamine);

  return { latestCommit: commitFromStorage, newDatamine };
}
