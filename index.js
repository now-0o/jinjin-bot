require("dotenv").config();
const axios = require("axios");
const {
  getRiotAccountInfo,
  getSummonerProfileIconAndRank,
  getSummonerMatchId,
  getSummonerFinalMatchData,
} = require("./api/getSummonerData");
const {
  findGameMode,
  PlayerDataSetArry,
  findUserTeamData,
  checkSummonerName,
  findCarrier,
  findTroler,
} = require("./commands/utils/relatedSummonerData");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity("고구마 앞뒤 안가리고 먹는 중");

  const channel = client.channels.cache.get(process.env.CHANNEL_ID);

  if (channel) {
    channel.send("진진봇 가동. 준비완료.");
  } else {
    console.error("Channel not found. Please check the provided channel ID.");
  }

  setInterval(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // 다음날 00:00:00

    setTimeout(() => {
      getRolesForAllMembers(channel); // channel을 전달
    }, midnight - now);
  }, 24 * 60 * 60 * 1000); // 24시간 주기로 실행
});

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getRolesForAllMembers(channel) {
  const message = await channel.send("청소중.. -");
  await sendCleaning(message);
  client.guilds.cache.forEach(async (guild) => {
    try {
      const members = await guild.members.fetch(); // 모든 멤버 정보를 불러오기
      let kickMemberCount = 0;

      for (const member of members.values()) {
        const roles = Array.from(member.roles.cache.values());
        const otherRoles = roles.filter((role) => role.name !== "@everyone");
        if (otherRoles.length === 0) {
          console.log(
            `${member.user.tag} 멤버는 @everyone 이외의 역할을 가지고 있지 않습니다.`
          );

          try {
            await member.kick();
            kickMemberCount++;
          } catch (error) {
            console.error("추방 중 에러 발생:", error);
          }
        }
      }

      message.edit(`총 ${kickMemberCount}명의 불법체류자를 추방했습니다.`);
    } catch (error) {
      console.error("멤버 정보 불러오기 중 에러 발생:", error);
    }
  });
}

client.on("interactionCreate", async (interaction) => {
  const channel = client.channels.cache.get(interaction.channelId);

  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }

  if (interaction.commandName === "청소") {
    const member = interaction.member;
    const isAdmin = member.permissions.has("ADMINISTRATOR");

    if (isAdmin) {
      await interaction.reply("청소 시작!");
      await getRolesForAllMembers(channel);
    } else {
      await interaction.reply("권한이 없습니다.");
    }
  }

  if (interaction.commandName === "전적") {
    const summonerName = interaction.options.getString("소환사명");

    if (checkSummonerName(summonerName)) {
      await interaction.reply({
        content: `"**${summonerName}**"의 전적을 조회합니다.`,
      });
    }
    if (!checkSummonerName(summonerName)) {
      await interaction.reply({
        content: `"**${summonerName}**"는 올바르지 않은 소환사명#태그 형식입니다.`,
      });

      return;
    }

    try {
      const summonerData = await searchSummoner(summonerName);

      let rankValue = `\`소환사 레벨\`: ${summonerData.level}\n\`솔로랭크\` : ${summonerData.soloRank} [승: ${summonerData.soloWins}/패: ${summonerData.soloLoses}] ${summonerData.soloRate} \n\`자유랭크\` : ${summonerData.flexRank} [승: ${summonerData.flexWins}/패: ${summonerData.flexLoses}] ${summonerData.flexRate}`;
      if (!summonerData.haveSoloRank && !summonerData.haveFlexRank) {
        rankValue = `\`소환사 레벨\`: ${summonerData.level}\n\`솔로랭크\` : ${summonerData.soloRank} \n\`자유랭크\` : ${summonerData.flexRank}`;
      } else if (!summonerData.haveSoloRank) {
        rankValue = `\`소환사 레벨\`: ${summonerData.level}\n\`솔로랭크\` : ${summonerData.soloRank} \n\`자유랭크\` : ${summonerData.flexRank} [승: ${summonerData.flexWins}/패: ${summonerData.flexLoses}] ${summonerData.flexRate}`;
      } else if (!summonerData.haveFlexRank) {
        rankValue = `\`소환사 레벨\`: ${summonerData.level}\n\`솔로랭크\` : ${summonerData.soloRank} [승: ${summonerData.soloWins}/패: ${summonerData.soloLoses}] ${summonerData.soloRate} \n\`자유랭크\` : ${summonerData.flexRank}`;
      }

      const summonerEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`소환사명: ${summonerName}`)
        .setThumbnail(
          `https://ddragon.leagueoflegends.com/cdn/14.2.1/img/profileicon/${summonerData.profileIconId}.png?api_key=${process.env.API_KEY}`
        )
        .addFields({
          name: "소환사 정보",
          value: rankValue,
          inline: true,
        })
        .setTimestamp()
        .setFooter({
          text: "League of Legends",
        });

      channel.send({ embeds: [summonerEmbed] });
    } catch (error) {
      console.error("전적 조회 중 에러:", error);
      await interaction.followUp("전적 조회 중 에러가 발생했습니다.");
    }
  }

  if (interaction.commandName === "전판캐리") {
    const summonerName = interaction.options.getString("소환사명");
    if (checkSummonerName(summonerName)) {
      await interaction.reply({
        content: `"**${summonerName}**"의 가장 최근 게임 캐리머신을 찾습니다.`,
      });
    }
    if (!checkSummonerName(summonerName)) {
      await interaction.reply({
        content: `"**${summonerName}**"는 올바르지 않은 소환사명#태그 형식입니다.`,
      });

      return;
    }

    try {
      const carrierData = await searchCarrier(summonerName);

      const summonerEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`캐리머신: ${carrierData.summonerName}`)
        .setThumbnail(
          `https://ddragon.leagueoflegends.com/cdn/14.2.1/img/champion/${carrierData.championName}.png?api_key=${process.env.API_KEY}`
        )
        .addFields({
          name: "플레이정보",
          value: `\`KDA\`: ${carrierData.kda}`,
          inline: true,
        })
        .addFields({
          name: "칭호",
          value: "`불사신`: 가장 적은 데스를 기록했습니다.",
          inline: true,
        })
        .setTimestamp()
        .setFooter({
          text: "League of Legends",
        });

      channel.send({ embeds: [summonerEmbed] });
    } catch (error) {
      console.error("전적 조회 중 에러:", error);
      await interaction.followUp("전적 조회 중 에러가 발생했습니다.");
    }
  }

  if (interaction.commandName === "전판트롤") {
    const summonerName = interaction.options.getString("소환사명");
    if (checkSummonerName(summonerName)) {
      await interaction.reply({
        content: `"**${summonerName}**"의 가장 최근 게임 트롤러를 찾습니다.`,
      });
    }
    if (!checkSummonerName(summonerName)) {
      await interaction.reply({
        content: `"**${summonerName}**"는 올바르지 않은 소환사명#태그 형식입니다.`,
      });

      return;
    }

    try {
      const carrierData = await searchTroler(summonerName);

      const summonerEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`트롤러: ${carrierData.summonerName}`)
        .setThumbnail(
          `https://ddragon.leagueoflegends.com/cdn/14.2.1/img/champion/${carrierData.championName}.png?api_key=${process.env.API_KEY}`
        )
        .addFields({
          name: "플레이정보",
          value: `\`KDA\`: ${carrierData.kda}`,
          inline: true,
        })
        .addFields({
          name: "칭호",
          value: "`또죽어?`: 가장 많은 데스를 기록했습니다.",
          inline: true,
        })
        .setTimestamp()
        .setFooter({
          text: "League of Legends",
        });

      channel.send({ embeds: [summonerEmbed] });
    } catch (error) {
      console.error("전적 조회 중 에러:", error);
      await interaction.followUp("전적 조회 중 에러가 발생했습니다.");
    }
  }
});

async function searchSummoner(summonerName) {
  const accountInfo = await getRiotAccountInfo(summonerName);
  const summonerData = {
    level: accountInfo.summonerLevel,
  };
  const profileAndRankData = await getSummonerProfileIconAndRank(
    accountInfo.puuid
  );
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

async function searchCarrier(summonerName) {
  try {
    const accountInfo = await getRiotAccountInfo(summonerName);
    const finalMatchId = await getSummonerMatchId(accountInfo.puuid);
    const finalMatchData = await getSummonerFinalMatchData(finalMatchId);
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

async function searchTroler(summonerName) {
  try {
    const accountInfo = await getRiotAccountInfo(summonerName);
    const finalMatchId = await getSummonerMatchId(accountInfo.puuid);
    const finalMatchData = await getSummonerFinalMatchData(finalMatchId);
    const gameType = findGameMode(finalMatchData.data.info.queueId);

    const searchedUserTeamPlayersData = findUserTeamData(
      summonerName,
      finalMatchData
    );
    const calcScoreWithPlayerDataArry = PlayerDataSetArry(
      searchedUserTeamPlayersData
    );
    const trolerData = findTroler(calcScoreWithPlayerDataArry);
    trolerData.gameType = gameType;
    return trolerData;
  } catch (error) {
    console.error("API 요청 중 에러:", error);
    throw error;
  }
}

async function sendCleaning(message) {
  await sleep(100);
  await message.edit("청소중.. \\");

  await sleep(100);
  await message.edit("청소중.. |");

  await sleep(100);
  await message.edit("청소중.. /");

  await sleep(100);
  await message.edit("청소중.. -");

  await sleep(100);
  await message.edit("청소중.. \\");

  await sleep(100);
  await message.edit("청소중.. |");

  await sleep(100);
  await message.edit("청소중.. /");
}

client.login(process.env.TOKEN);
