require("dotenv").config()

let { bot, datamine } = require("./src/bot");
const ms = require("ms");
let storage = require("./src/commits.json");

const filterAndSortUnsentCommits = require("./src/helpers/filterAndSortUnsentCommits");
const getCommits = require("./src/helpers/getCommits");
const handleError = require("./src/helpers/handleError");
const parseBuildNumber = require("./src/helpers/parseBuildNumber");
const writeToDatamine = require("./src/helpers/writeToDatamine");

async function __init() {
  try {
    const { latestCommit, newDatamine } = await getCommits(storage, datamine);
    datamine = newDatamine;
    const channels = datamine.channels;
    channels.forEach(async (channel) => {
      try {
        const msgs = await bot.getMessages(channel, 100).catch((err) => handleError(bot, channel, err));
        if (Array.isArray(msgs)) {
          const msgsFromBot = msgs.filter((msg) => msg.author.id === bot.user.id);
          const msgsWithEmbed = msgsFromBot.filter((msg) => msg.embeds.length > 0);
          const regex = /(Canary\sbuild:\s([0-9]*))/;
          const msg = msgsWithEmbed.find((msg) => regex.test(msg.embeds[0].title));
          if (msg.embeds.length <= 0) {
	    const desc = (latestCommit.comment.body.length > 2000) ? latestCommit.comment.body.substr(0, 2000) + "..." : latestCommit.comment.body
            msg.channel.createMessage({
              embed: {
                description: desc,
                title: latestCommit.title,
                url: latestCommit.comment.html_url
              }
            });
          } else if (msg.embeds[0].title !== datamine.current.title || msg.embeds[0] !== latestCommit.title) {
            const buildNumber = await parseBuildNumber(msg.embeds[0].title);
            const unsent = filterAndSortUnsentCommits(storage, buildNumber);
            unsent.forEach((unsentCommit) => {
	      const desc = (unsentCommit.comment.body.length > 2000) ? unsentCommit.comment.body.substr(0, 2000) + "..." : unsentCommit.comment.body
              msg.channel.createMessage({
                embed: {
                  description: unsentCommit.comment.body.substr(0, 2000) + "...",
                  title: unsentCommit.title,
                  url: unsentCommit.comment.html_url
                }
              });
            });
          }
        }
      } catch (error) {
        console.error(error);
        handleError(bot, channel, error);
      }
    });
  } catch (error) {
    console.error(error);
  }
}

bot.once("ready", () => {
  console.log(bot.user.username + " is alive!");
  __init().catch((err) => console.error(err));
  setInterval(__init, ms("5m"));
});

bot.connect();
