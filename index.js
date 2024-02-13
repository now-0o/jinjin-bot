require("dotenv").config();
const axios = require("axios");
const {
  getRiotAccountInfo,
  getSummonerMatchId,
  getSummonerFinalMatchData,
} = require("./api/getSummonerData");
const {
  findGameMode,
  PlayerDataSetArry,
  findUserTeamData,
  checkSummonerName,
} = require("./commands/utils/relatedSummonerData");
const { searchRecord } = require("./commands/lol/record");
const { findCarrierInLastGame } = require("./commands/lol/findCarrier");
const { findTrolerInLastGame } = require("./commands/lol/findTroll");
const { cleanToNoRole } = require("./commands/utils/clean");
const { setCommand } = require("./commands/utils/commands");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once("ready", async () => {
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
      cleanToNoRole(channel); // channel을 전달
    }, midnight - now);
  }, 24 * 60 * 60 * 1000); // 24시간 주기로 실행
});

client.on("guildCreate", async (guild) => {
  const guildId = guild.id;
  checkCommands(guildId);
  const defaultChannelId = guild.channels.cache.find(
    (channel) => channel.type === 4
  ).guild.systemChannelId;

  const defaultChannel = client.channels.cache.get(defaultChannelId);
});

client.on("interactionCreate", async (interaction) => {
  const channel = client.channels.cache.get(interaction.channelId);

  const { commandName, options, guildId, channelId, member } = interaction;

  if (!interaction.isChatInputCommand()) return;

  if (commandName === "청소") {
    const isAdmin = member.permissions.has("ADMINISTRATOR");

    if (isAdmin) {
      const channel = client.channels.cache.get(channelId);
      const guild = client.guilds.cache.get(guildId);

      if (channel && guild) {
        await interaction.reply("청소 시작!");
        await cleanToNoRole(guild, channel);
      } else {
        await interaction.reply("서버 정보를 가져오는 중 오류가 발생했습니다.");
      }
    } else {
      await interaction.reply("권한이 없습니다.");
    }
  }

  if (interaction.commandName === "전적") {
    searchRecord(interaction, channel);
  }

  if (interaction.commandName === "전판캐리") {
    findCarrierInLastGame(interaction, channel);
  }

  if (interaction.commandName === "전판트롤") {
    findTrolerInLastGame(interaction, channel);
  }

  if (commandName === "레벨갱신") {
    const isAdmin = member.permissions.has("ADMINISTRATOR");

    if (isAdmin) {
      const channel = client.channels.cache.get(channelId);
      const guild = client.guilds.cache.get(guildId);

      await setNickNameLevels(guild);

      await interaction.reply("레벨갱신을 완료했습니다.");
    } else {
      await interaction.reply("권한이 없습니다.");
    }
  }

  if (commandName === "매칭기록") {
  }
});

function checkCommands(guildId) {
  const guild = client.guilds.cache.get(guildId);
  if (guild) {
    guild.commands
      .fetch()
      .then((commands) => {
        // /A 명령어가 등록되어 있지 않다면 setCommand 함수 실행
        if (!commands.some((command) => command.name === "전적")) {
          setCommand(guildId);
        }
      })
      .catch(console.error);
  }
}

async function setNickNameLevels(guild) {
  try {
    client.guilds.cache.forEach(async () => {
      const members = await guild.members.fetch();

      members.forEach(async (member) => {
        try {
          const joinDate = member.joinedAt; // 또는 user.createdAt

          const currentDate = new Date();

          const daysInServer = Math.floor(
            (currentDate - joinDate) / (1000 * 60 * 60 * 24)
          );
          if (
            member.user.id !== "1203595904716636210" &&
            member.user.id !== "345442010385088523" &&
            member.user.id !== "501053366521167872"
          ) {
            await member.setNickname(
              `${member.user.globalName} [${daysInServer}일]`
            );
          }
        } catch (error) {
          console.error("별명 변경 중 에러 발생:", error);
        }
      });
    });
  } catch (error) {
    console.error("서버 및 멤버 정보 불러오기 중 에러 발생:", error);
  }
}

client.login(process.env.TOKEN);
