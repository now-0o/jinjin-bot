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
  const channel = client.channels.cache.get(process.env.CHANNEL_ID);

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
    const summonerData = await searchSummoner(summonerName);
    const summonerEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`소환사명: ${summonerName}`)
      .addFields({
        name: "소환사 레벨",
        value: `${summonerData.summonerLevel}`,
        inline: true,
      })
      .setTimestamp()
      .setFooter({
        text: "League of Leagend",
      });

    channel.send({ embeds: [summonerEmbed] });
  }
});

async function searchSummoner(summonerName) {
  try {
    const response = await axios.get(
      `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${process.env.API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error("API 요청 중 에러:", error);
  }
}

client.login(process.env.TOKEN);
