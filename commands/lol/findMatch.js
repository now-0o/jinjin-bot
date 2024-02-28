const { Player, Game } = require("../../models");
const { checkSummonerName } = require("./relatedSummonerData");

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
  channel.send(
    `등록이 완료되었습니다. - 등록건수 : ${insertResult.insert}, 기존 등록건수 : ${insertResult.skip}`
  );
}

async function findMatchThisSummoner(summonerName) {
  const gameData = await Player.findAll({
    where: { account: summonerName },
    include: Game,
  });
  console.log(gameData);
}

module.exports = {
  findMatch,
};
