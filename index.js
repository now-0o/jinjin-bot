require("dotenv").config();
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");

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

  // 원하는 채널 ID를 여기에 넣어주세요
  const channelId = "1197860083250507799";
  const channel = client.channels.cache.get(channelId);

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
    }, timeUntilMidnight);
  }, getTimeUntilMidnight()); // 24시간 주기로 실행
});

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // 다음날 00:00:00
  return midnight - now;
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getRolesForAllMembers(channel) {
  channel.send(`00시가 되어 불법체류자 청소기를 가동합니다....`);

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
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

client.login(process.env.TOKEN);
