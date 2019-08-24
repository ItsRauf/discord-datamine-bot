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
          const imageRegex = /!\[image]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/mg;
          const imageRegexTwo = /!\[image]*\]\((.*?)\s*("(?:.*[^"])")?\s*\)/m;
          if (msg.embeds.length <= 0) {
            let desc = latestCommit.comment.body;
              const images = desc.match(imageRegex);
              if (Array.isArray(images)) {
                const parsedImages = images.map((image) => {
                  return {
                    old: image,
                    new: imageRegexTwo.exec(image)[1]
                  }
                });
                parsedImages.map((imageObj) => {
                  desc = desc.replace(imageObj.old, "")
                });
              }
              msg.channel.createMessage({
                embed: {
                  description: (desc.length > 2000) ? desc.substr(0, 2000) + "..." : desc,
                  title: unsentCommit.title,
                  url: unsentCommit.comment.html_url
                }
              });
              msg.channel.createMessage(parsedImages.map((imageObj) => imageObj.new).join("\n"));
          } else if (msg.embeds[0].title !== latestCommit.title) {
            const buildNumber = await parseBuildNumber(msg.embeds[0].title);
            const unsent = filterAndSortUnsentCommits(storage, buildNumber);
            unsent.forEach((unsentCommit) => {
              let desc = latestCommit.comment.body;
              const images = desc.match(imageRegex);
              if (Array.isArray(images)) {
                const parsedImages = images.map((image) => {
                  return {
                    old: image,
                    new: imageRegexTwo.exec(image)[1]
                  }
                });
                parsedImages.map((imageObj) => {
                  desc = desc.replace(imageObj.old, "")
                });
              }
              msg.channel.createMessage({
                embed: {
                  description: (desc.length > 2000) ? desc.substr(0, 2000) + "..." : desc,
                  title: unsentCommit.title,
                  url: unsentCommit.comment.html_url
                }
              });
              msg.channel.createMessage(parsedImages.map((imageObj) => imageObj.new).join("\n"));
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
