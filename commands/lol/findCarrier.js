const {
  getRiotAccountInfo,
  getSummonerMatchId,
  getSummonerFinalMatchData,
} = require("../../api/getSummonerData");
const {
  checkSummonerName,
  findGameMode,
  findUserTeamData,
  PlayerDataSetArry,
} = require("./relatedSummonerData");
const { setCarryTitle, makeTitleString } = require("./title");
const { EmbedBuilder } = require("discord.js");

async function findCarrierInLastGame(interaction, channel) {
  const summonerName = interaction.options.getString("소환사명");

  if (!checkSummonerName(summonerName)) {
    await interaction.reply({
      content: `"**${summonerName}**"는 올바르지 않은 소환사명#태그 형식입니다.`,
    });
    return;
  }

  await interaction.reply({
    content: `"**${summonerName}**"의 가장 최근 게임 캐리머신을 찾습니다.`,
  });

  try {
    const carrierData = await searchCarrier(summonerName);
    const titleString = makeTitleString(carrierData.title);
    console.log(
      `https://ddragon.leagueoflegends.com/cdn/14.14.1/img/champion/${carrierData.championName}.png?api_key=${process.env.API_KEY}`
    );
    const summonerEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`캐리머신: ${carrierData.summonerName}`)
      .setThumbnail(
        `https://ddragon.leagueoflegends.com/cdn/14.14.1/img/champion/${carrierData.championName}.png?api_key=${process.env.API_KEY}`
      )
      .addFields({
        name: "플레이정보",
        value: `\`KDA\`: ${carrierData.kda}`,
        inline: true,
      })
      .addFields({
        name: "칭호",
        value: titleString,
        inline: true,
      })
      .setTimestamp()
      .setFooter({
        text: "Powered by JinJin",
      });

    channel.send({ embeds: [summonerEmbed] });
  } catch (error) {
    console.error("전적 조회 중 에러:", error);
    await interaction.followUp("전적 조회 중 에러가 발생했습니다.");
  }
}

async function searchCarrier(summonerName) {
  try {
    const accountInfo = await getRiotAccountInfo(summonerName);
    const finalMatchId = await getSummonerMatchId(accountInfo.puuid, 1);
    const finalMatchData = await getSummonerFinalMatchData(finalMatchId[0]);
    const gameType = findGameMode(finalMatchData.data.info.queueId);

    const searchedUserTeamPlayersData = findUserTeamData(
      summonerName,
      finalMatchData
    );
    const calcScoreWithPlayerDataArry = PlayerDataSetArry(
      searchedUserTeamPlayersData
    );
    const carrierData = findCarrier(calcScoreWithPlayerDataArry);
    carrierData.gameType = gameType;
    return carrierData;
  } catch (error) {
    console.error("API 요청 중 에러:", error);
    throw error;
  }
}

function findCarrier(calcScoreWithPlayerDataArry) {
  if (calcScoreWithPlayerDataArry.length === 0) {
    return null;
  }
  calcScoreWithPlayerDataArry.sort((a, b) => b.carryScore - a.carryScore);
  const carrierData = calcScoreWithPlayerDataArry[0];
  carrierData.title = setCarryTitle(calcScoreWithPlayerDataArry, carrierData);
  return carrierData;
}

module.exports = {
  findCarrierInLastGame,
};
