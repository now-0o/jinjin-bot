require("dotenv").config();
const axios = require("axios");
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

  client.guilds.cache.forEach(async (guild) => {
    try {
      // 모든 멤버 정보를 불러오기
      const members = await guild.members.fetch();
      let kickMemberCount = 0;

      for (const member of members.values()) {
        const roles = Array.from(member.roles.cache.values());

        // @everyone 역할을 제외한 역할 목록
        const otherRoles = roles.filter((role) => role.name !== "@everyone");

        if (otherRoles.length === 0) {
          // 멤버가 @everyone 이외의 역할을 가지고 있지 않음
          console.log(
            `${member.user.tag} 멤버는 @everyone 이외의 역할을 가지고 있지 않습니다.`
          );

          try {
            // 멤버 추방
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
    await interaction.reply({
      content: `"**${summonerName}**"의 전적을 조회합니다.`,
    });

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
          `https://ddragon.leagueoflegends.com/cdn/10.11.1/img/profileicon/${summonerData.profileIconId}.png`
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
    await interaction.reply({
      content: `"**${summonerName}**"의 가장 최근 게임 캐리머신을 찾습니다.`,
    });

    try {
      const carrierData = await searchCarrier(summonerName);

      const summonerEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`캐리머신: ${summonerName}`)
        .setThumbnail(
          `https://ddragon.leagueoflegends.com/cdn/10.11.1/img/champion/${carrierData.championName}.png`
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
});

async function searchSummoner(summonerName) {
  try {
    const response = await axios.get(
      `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${process.env.API_KEY}`
    );

    if (response.status === 200) {
      const summonerData = {
        level: response.data.summonerLevel,
      };

      summonerData.profileIconId = response.data.profileIconId;
      const secondResponse = await axios.get(
        `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${response.data.id}?api_key=${process.env.API_KEY}`
      );

      if (secondResponse.status === 200) {
        const soloGameData = secondResponse.data.find(
          (secondData) => secondData.queueType === "RANKED_SOLO_5x5"
        );

        const flexGameData = secondResponse.data.find(
          (secondData) => secondData.queueType === "RANKED_FLEX_SR"
        );

        if (soloGameData) {
          summonerData.soloRank =
            soloGameData.tier.substring(0, 1) +
            " " +
            soloGameData.rank +
            " " +
            soloGameData.leaguePoints;
          summonerData.soloWins = soloGameData.wins;
          summonerData.soloLoses = soloGameData.losses;
          summonerData.soloRate =
            Math.round(
              (soloGameData.wins / (soloGameData.wins + soloGameData.losses)) *
                100
            ) + "%";
          summonerData.haveSoloRank = true;
        } else {
          summonerData.soloRank = "솔랭 전적이 없어요.";
          summonerData.haveSoloRank = false;
        }

        if (flexGameData) {
          summonerData.flexRank =
            flexGameData.tier.substring(0, 1) +
            " " +
            flexGameData.rank +
            " " +
            flexGameData.leaguePoints;
          summonerData.flexWins = flexGameData.wins;
          summonerData.flexLoses = flexGameData.losses;
          summonerData.flexRate =
            Math.round(
              (flexGameData.wins / (flexGameData.wins + flexGameData.losses)) *
                100
            ) + "%";
          summonerData.haveFlexRank = true;
        } else {
          summonerData.flexRank = "자랭 전적이 없어요.";
          summonerData.haveFlexRank = false;
        }
      } else {
        throw new Error(
          `Second request failed - Status code: ${secondResponse.status}`
        );
      }

      return summonerData;
    } else {
      throw new Error(`API 요청 실패 - 상태 코드: ${response.status}`);
    }
  } catch (error) {
    console.error("API 요청 중 에러:", error);
    throw error;
  }
}

async function searchCarrier(summonerName) {
  try {
    const response = await axios.get(
      `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${process.env.API_KEY}`
    );
    if (response.status === 200) {
      const matchIdResponse = await axios.get(
        `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${response.data.puuid}/ids?start=0&count=1&api_key=${process.env.API_KEY}`
      );

      if (matchIdResponse.status === 200) {
        const finalMatchId = matchIdResponse.data[0];

        const finalMatchData = await axios.get(
          `https://asia.api.riotgames.com/lol/match/v5/matches/${finalMatchId}?api_key=${process.env.API_KEY}`
        );

        const carrierData = {};
        if (finalMatchData.data.info.queueId === 400) {
          carrierData.gameType = "일반";
        } else if (finalMatchData.data.info.queueId === 420) {
          carrierData.gameType = "솔랭";
        } else if (finalMatchData.data.info.queueId === 430) {
          carrierData.gameType = "일반";
        } else if (finalMatchData.data.info.queueId === 440) {
          carrierData.gameType = "자랭";
        } else if (finalMatchData.data.info.queueId === 450) {
          carrierData.gameType = "칼바람";
        } else if (finalMatchData.data.info.queueId === 700) {
          carrierData.gameType = "격전";
        } else {
          carrierData.gameType = "번외";
        }

        const searchedUserData = finalMatchData.data.info.participants.find(
          (team) => team.riotIdGameName === summonerName
        );
        carrierData.championName = searchedUserData.championName;
        carrierData.kda =
          searchedUserData.kills +
          "/" +
          searchedUserData.deaths +
          "/" +
          searchedUserData.assists;

        return carrierData;
      }
    } else {
      throw new Error(`API 요청 실패 - 상태 코드: ${response.status}`);
    }
  } catch (error) {
    console.error("API 요청 중 에러:", error);
    throw error;
  }
}

client.login(process.env.TOKEN);
