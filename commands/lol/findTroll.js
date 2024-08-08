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
const { setTrolerTitle, makeTitleString } = require("./title");
const { EmbedBuilder } = require("discord.js");

async function findTrolerInLastGame(interaction, channel) {
  const summonerName = interaction.options.getString("소환사명");

  if (!checkSummonerName(summonerName)) {
    await interaction.reply({
      content: `"**${summonerName}**"는 올바르지 않은 소환사명#태그 형식입니다.`,
    });

    return;
  }

  await interaction.reply({
    content: `"**${summonerName}**"의 가장 최근 게임 트롤러를 찾습니다.`,
  });

  try {
    const trolerData = await searchTroler(summonerName);
    // 칭호 수정
    const titleString = makeTitleString(trolerData.title);

    const summonerEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`트롤러: ${trolerData.summonerName}`)
      .setThumbnail(
        `https://ddragon.leagueoflegends.com/cdn/14.14.1/img/champion/${trolerData.championName}.png?api_key=${process.env.API_KEY}`
      )
      .addFields({
        name: "플레이정보",
        value: `\`KDA\`: ${trolerData.kda}`,
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

async function searchTroler(summonerName) {
  try {
    const accountInfo = await getRiotAccountInfo(summonerName);
    const finalMatchId = await getSummonerMatchId(accountInfo.puuid, 1);
    const finalMatchData = await getSummonerFinalMatchData(finalMatchId[0]);
    const gameType = findGameMode(finalMatchData.data.info.queueId);

    const searchedUserTeamPlayersData = await findUserTeamData(
      summonerName,
      finalMatchData
    );

    const calcScoreWithPlayerDataArry = PlayerDataSetArry(
      searchedUserTeamPlayersData
    );
    const trolerData = await findTroler(calcScoreWithPlayerDataArry);
    trolerData.gameType = gameType;
    return trolerData;
  } catch (error) {
    console.error("API 요청 중 에러:", error);
    throw error;
  }
}

function findTroler(calcScoreWithPlayerDataArry) {
  if (calcScoreWithPlayerDataArry.length === 0) {
    return null;
  }
  calcScoreWithPlayerDataArry.sort((a, b) => b.carryScore - a.carryScore);
  const trolerData =
    calcScoreWithPlayerDataArry[calcScoreWithPlayerDataArry.length - 1];
  trolerData.title = setTrolerTitle(calcScoreWithPlayerDataArry, trolerData);

  return trolerData;
}

module.exports = {
  findTrolerInLastGame,
};
