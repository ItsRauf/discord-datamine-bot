/**
 * handleError
 *
 * @param {*} bot
 * @param {string} channel
 * @param {*} error
 */
module.exports = async (bot, channel, error) => {
  console.log(channel);
  bot.createMessage(channel, {
    embed: {
      description: "An error has occured in this channel! \n" + error,
      title: "Updoot | Error"
    }
  });
}