const { Game, Player } = require("../../models");
const {
  getRiotAccountInfo,
  getSummonerMatchId,
  getSummonerFinalMatchData,
} = require("../../api/getSummonerData");

async function insertJinjinGame(interaction, channel) {
  const insertCount = interaction.options.getInteger("게임_수");

  await interaction.reply({
    content: `"**${insertCount}**"개의 게임정보 등록을 시작합니다.`,
  });

  const accountInfo = await getRiotAccountInfo("어쩌라고사과해#KR1");
  const matchIds = await getSummonerMatchId(accountInfo.puuid, insertCount);
  await insertGameTable(matchIds);
  channel.send("등록이 완료되었습니다.");
}

async function insertGameTable(matchIds) {
  for (const [index, matchId] of matchIds.entries()) {
    const gameData = await getSummonerFinalMatchData(matchId);
    console.log(gameData.data);
    // const savedMatchId = await Game.create({
    //   userId: userId,
    //   championId: championId,
    //   createdAt: savedDatetime,
    // });
  }
}

module.exports = {
  insertJinjinGame,
};
