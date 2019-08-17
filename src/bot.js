const Eris = require("eris");
let datamine = require("./datamine.json");
const writeToDatamine = require("./helpers/writeToDatamine");

const bot = new Eris.Client(process.env.TOKEN);

bot.on("messageCreate", async (msg) => {
  if (msg.content.startsWith("u.")) {
    const cmd = msg.content.split("u.")[1].split(" ")[0];

    switch (cmd) {
      case "subscribe":
        if (datamine.channels.indexOf(msg.channel.id) === -1) {
          datamine.channels.push(msg.channel.id);
          msg.channel.createMessage({
            embed: {
              description: "This channel has been setup to be notified of Datamine Updates. Unsubscribe by using `u.unsubscribe`",
              title: "Updoot | Channel Subscribed"
            }
          }).then(async (_) => {
            const newDatamine = await writeToDatamine(datamine);
            datamine = newDatamine
          }).then((_) => {
            msg.channel.createMessage({
              embed: {
                description: datamine.current.comment.body.substr(0, 2000) + "...",
                title: datamine.current.title,
                url: datamine.current.comment.html_url
              }
            });
          });
        } else {
          msg.channel.createMessage({
            embed: {
              description: "This channel is already setup to be notified of Datamine Updates. Unsubscribe by using `u.unsubscribe`",
              title: "Updoot | Channel Already Subcribed"
            }
          });
        }
        break;
      case "unsubscribe":
        if (datamine.channels.indexOf(msg.channel.id) === -1) {
          msg.channel.createMessage({
            embed: {
              description: "This channel has not been setup to be notified of Datamine Updates. Subscribe by using `u.subscribe`",
              title: "Updoot | Channel Not Subscribed"
            }
          });
        } else {
          const channel = datamine.channels.indexOf(msg.channel.id);
          datamine.channels.splice(channel, 1);
          const newDatamine = await writeToDatamine(datamine);
          datamine = newDatamine
          msg.channel.createMessage({
            embed: {
              description: "This channel is no longer being notified of Datamine Updates. Subscribe by using `u.subscribe`",
              title: "Updoot | Channel Unsubscribed"
            }
          });
        }
        break;
      default:
        break;
    }
  }
});

process.on("unhandledRejection", (err) => {
  console.log(err);
});

module.exports = { bot, datamine };