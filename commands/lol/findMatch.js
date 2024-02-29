const { Player, Game } = require("../../models");
const { checkSummonerName } = require("./relatedSummonerData");
const { EmbedBuilder } = require("discord.js");
const moment = require("moment");

async function findMatch(interaction, channel) {
  const summonerName = interaction.options.getString("소환사명");

  if (!checkSummonerName(summonerName)) {
    await interaction.reply({
      content: `"**${summonerName}**"는 올바르지 않은 소환사명#태그 형식입니다.`,
    });
    return;
  }

  await interaction.reply({
    content: `**${summonerName}**와 매칭기록이 있는지 조회합니다.`,
  });

  const searchData = await findMatchThisSummoner(summonerName);
  channel.send({ embeds: [await makeEmbed(summonerName, searchData)] });
}

async function findMatchThisSummoner(summonerName) {
  const gameData = await Player.findAll({
    where: { account: summonerName },
    include: Game,
  });

  return gameData;
}

async function makeEmbed(summonerName, searchData) {
  const summonerEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`**${summonerName}** 매칭 기록`);
  for (const [index, data] of searchData.entries()) {
    if (index < 6) {
      summonerEmbed.addFields({
        name: `**${moment(data.dataValues.game.dataValues.date).format(
          "YYYY-MM-DD HH:mm:ss"
        )}** ${data.dataValues.game.dataValues.type}`,
        value: `\`KDA\`: ${data.dataValues.kills}/${data.dataValues.deaths}/${data.dataValues.assists}\n\`CHAMP\`: ${data.dataValues.champion}`,
      });
    }
  }

  return summonerEmbed;
}

module.exports = {
  findMatch,
};
