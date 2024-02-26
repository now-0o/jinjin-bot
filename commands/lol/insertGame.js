const sequelize = require("../../config/database");
const { Game, Player } = require("../../models");
const {
  getRiotAccountInfo,
  getSummonerMatchId,
  getSummonerFinalMatchData,
} = require("../../api/getSummonerData");
const { sleep } = require("../utils/loading");
const { findGameMode, findUserTeamData } = require("./relatedSummonerData");

async function insertJinjinGame(interaction, channel) {
  const insertCount = interaction.options.getInteger("게임_수");
  if (insertCount > 80) {
    return await interaction.reply({
      content: `최대 **80**건까지만 등록이 가능합니다.`,
    });
  }
  await interaction.reply({
    content: `**${insertCount}**개의 게임정보 등록을 시작합니다.`,
  });

  const message = await channel.send(`총 ${insertCount}건의 요청 중 0건 완료!`);

  const accountInfo = await getRiotAccountInfo("어쩌라고사과해#KR1");
  const matchIds = await getSummonerMatchId(accountInfo.puuid, insertCount);
  const insertResult = await insertGameTable(matchIds, message, insertCount);
  channel.send(
    `등록이 완료되었습니다. - 등록건수 : ${insertResult.insert}, 기존 등록건수 : ${insertResult.skip}`
  );
}

async function insertGameTable(matchIds, message, insertCount) {
  const resultCount = { skip: 0, insert: 0 };
  for (const [index, matchId] of matchIds.entries()) {
    const gameData = await getSummonerFinalMatchData(matchId);
    const gameType = findGameMode(gameData.data.info.queueId);
    const jinjinTeamPlayers = findUserTeamData("어쩌라고사과해#KR1", gameData);
    const isWin = jinjinTeamPlayers[0].win;
    const gameDate = new Date(gameData.data.info.gameCreation);
    const dbGameData = await Game.findByPk(matchId);

    if (dbGameData) {
      resultCount.skip++;
      message.edit(
        `총 ${insertCount}건의 요청 중 ${
          resultCount.skip + resultCount.insert
        }건 완료!`
      );
      continue;
    }
    const result = await sequelize.transaction(async () => {
      const savedMatchId = await Game.create({
        id: matchId,
        type: gameType,
        isWin,
        date: gameDate,
      });
      for (const jinjinTeamPlayer of jinjinTeamPlayers) {
        const savedGameData = await Player.create({
          account: `${jinjinTeamPlayer.riotIdGameName}#${jinjinTeamPlayer.riotIdTagline}`,
          kills: jinjinTeamPlayer.kills,
          deaths: jinjinTeamPlayer.deaths,
          assists: jinjinTeamPlayer.assists,
          champion: jinjinTeamPlayer.championName,
          gameId: matchId,
        });
      }
      resultCount.insert++;
      return savedMatchId;
    });

    if (resultCount.insert % 10 === 0) {
      sleep(1000);
      await message.edit(
        `총 ${insertCount}건의 요청 중 ${
          resultCount.skip + resultCount.insert
        }건 완료!`
      );
    }
  }

  return resultCount;
}

module.exports = {
  insertJinjinGame,
};
