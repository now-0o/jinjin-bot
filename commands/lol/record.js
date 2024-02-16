const { checkSummonerName } = require("./relatedSummonerData");

const {
  getRiotAccountInfo,
  getSummonerProfileIconAndRank,
} = require("../../api/getSummonerData");

const { EmbedBuilder } = require("discord.js");

async function searchRecord(interaction, channel) {
  const summonerName = interaction.options.getString("소환사명");

  if (!checkSummonerName(summonerName)) {
    await interaction.reply({
      content: `"**${summonerName}**"는 올바르지 않은 소환사명#태그 형식입니다.`,
    });

    return;
  }

  await interaction.reply({
    content: `"**${summonerName}**"의 전적을 조회합니다.`,
  });

  channel.send({ embeds: [await makeRecordEmbed(summonerName)] });
}

async function makeRecordEmbed(summonerName) {
  try {
    const summonerData = await searchSummoner(summonerName);
    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`소환사명: ${summonerName}`)
      .setThumbnail(
        `https://ddragon.leagueoflegends.com/cdn/14.2.1/img/profileicon/${summonerData.profileIconId}.png?api_key=${process.env.API_KEY}`
      )
      .addFields({
        name: "소환사 정보",
        value: makeRankValue(summonerData),
        inline: true,
      })
      .setFooter({
        text: "Powered by JinJin",
      });
  } catch (error) {
    console.error("전적 조회 중 에러:", error);
    await interaction.followUp("전적 조회 중 에러가 발생했습니다.");
  }
}

async function searchSummoner(summonerName) {
  const accountInfo = await getRiotAccountInfo(summonerName);
  const summonerData = {};
  const profileAndRankData = await getSummonerProfileIconAndRank(
    accountInfo.puuid
  );
  summonerData.summonerLevel = profileAndRankData.summonerLevel;
  summonerData.profileIconId = profileAndRankData.profileIconId;
  summonerData.soloRank = profileAndRankData.soloRank;
  summonerData.soloWins = profileAndRankData.soloWins;
  summonerData.soloLoses = profileAndRankData.soloLoses;
  summonerData.soloRate = profileAndRankData.soloRate;
  summonerData.haveSoloRank = profileAndRankData.haveSoloRank;
  summonerData.flexRank = profileAndRankData.flexRank;
  summonerData.flexWins = profileAndRankData.flexWins;
  summonerData.flexLoses = profileAndRankData.flexLoses;
  summonerData.flexRate = profileAndRankData.flexRate;
  summonerData.haveFlexRank = profileAndRankData.haveFlexRank;

  return summonerData;
}

function makeRankValue(summonerData) {
  if (!summonerData.haveSoloRank && !summonerData.haveFlexRank) {
    return `\`소환사 레벨\`: ${summonerData.summonerLevel}\n\`솔로랭크\` : ${summonerData.soloRank} \n\`자유랭크\` : ${summonerData.flexRank}`;
  }
  if (!summonerData.haveSoloRank) {
    return `\`소환사 레벨\`: ${summonerData.summonerLevel}\n\`솔로랭크\` : ${summonerData.soloRank} \n\`자유랭크\` : ${summonerData.flexRank} [승: ${summonerData.flexWins}/패: ${summonerData.flexLoses}] ${summonerData.flexRate}`;
  }
  if (!summonerData.haveFlexRank) {
    return `\`소환사 레벨\`: ${summonerData.summonerLevel}\n\`솔로랭크\` : ${summonerData.soloRank} [승: ${summonerData.soloWins}/패: ${summonerData.soloLoses}] ${summonerData.soloRate} \n\`자유랭크\` : ${summonerData.flexRank}`;
  }

  return `\`소환사 레벨\`: ${summonerData.summonerLevel}\n\`솔로랭크\` : ${summonerData.soloRank} [승: ${summonerData.soloWins}/패: ${summonerData.soloLoses}] ${summonerData.soloRate} \n\`자유랭크\` : ${summonerData.flexRank} [승: ${summonerData.flexWins}/패: ${summonerData.flexLoses}] ${summonerData.flexRate}`;
}

module.exports = {
  searchRecord,
};
