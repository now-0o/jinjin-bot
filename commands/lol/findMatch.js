const { Player, Game } = require("../../models");
const { checkSummonerName } = require("./relatedSummonerData");
const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
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

  await makeRepeat(channel, summonerName, searchData);
}

async function findMatchThisSummoner(summonerName) {
  const gameData = await Player.findAll({
    where: { account: summonerName },
    include: Game,
  });

  return gameData;
}

async function makeRepeat(channel, summonerName, searchData) {
  if (searchData.length === 0) {
    const summonerEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`**${summonerName}**와 매칭된 기록이 없습니다.`);
    return { embeds: [summonerEmbed] };
  }
  for (const [index, data] of searchData.entries()) {
    if (index < 5) {
      const summonerEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(
          `**${index + 1}. ${data.dataValues.game.isWin ? "승리" : "패배"}**`
        )
        .setThumbnail(
          `https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/${data.dataValues.champion}.png?api_key=${process.env.API_KEY}`
        )
        .addFields({
          name: "게임정보",
          value: `\`타입\` : ${
            data.dataValues.game.dataValues.type
          }\n\`KDA\` : ${data.dataValues.kills}/${data.dataValues.deaths}/${
            data.dataValues.assists
          }\n\`날짜\` : ${moment(data.dataValues.game.dataValues.date).format(
            "YYYY-MM-DD HH:mm:ss"
          )}`,
          inline: true,
        });
      channel.send({ embeds: [summonerEmbed] });
    }
  }
  const button = await makeButton();
  if (searchData.length > 5) {
    channel.send({ components: [button] });
  }
}

async function makeButton() {
  const more = new ButtonBuilder()
    .setCustomId("confirm")
    .setLabel("더보기")
    .setStyle(ButtonStyle.Primary);

  return new ActionRowBuilder().addComponents(more);
}

module.exports = {
  findMatch,
};
