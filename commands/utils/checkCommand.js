const { setCommand } = require("./commands");

function checkCommands(guildId) {
  const guild = client.guilds.cache.get(guildId);
  if (guild) {
    guild.commands
      .fetch()
      .then((commands) => {
        // /A 명령어가 등록되어 있지 않다면 setCommand 함수 실행
        if (!commands.some((command) => command.name === "전적")) {
          setCommand(guildId);
        }
      })
      .catch(console.error);
  }
}

module.exports = {
  checkCommands,
};
