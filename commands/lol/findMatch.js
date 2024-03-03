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

  channel.send(await makeRepeat(summonerName, searchData));
}

async function findMatchThisSummoner(summonerName) {
  const gameData = await Player.findAll({
    where: { account: summonerName },
    include: Game,
  });

  return gameData;
}

async function makeRepeat(summonerName, searchData) {
  if (searchData.length === 0) {
    const summonerEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`**${summonerName}**와 매칭된 기록이 없습니다.`);
    return { embeds: [summonerEmbed] };
  }
  const summonerEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`**${summonerName}** 매칭 기록`);
  for (const [index, data] of searchData.entries()) {
    if (index < 5) {
      summonerEmbed.addFields({
        name: `**${moment(data.dataValues.game.dataValues.date).format(
          "YYYY-MM-DD HH:mm:ss"
        )}** ${data.dataValues.game.dataValues.type}`,
        value: `\`KDA\`: ${data.dataValues.kills}/${data.dataValues.deaths}/${data.dataValues.assists}\n\`CHAMP\`: ${data.dataValues.champion}`,
      });
    }
  }
  const button = await makeButton();
  if (searchData.length > 5) {
    return { embeds: [summonerEmbed], components: [button] };
  }
  return { embeds: [summonerEmbed] };
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
