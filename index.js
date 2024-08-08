require("dotenv").config();
const axios = require("axios");
const Sequelize = require("sequelize");
const { searchRecord } = require("./commands/lol/record");
const { findCarrierInLastGame } = require("./commands/lol/findCarrier");
const { findTrolerInLastGame } = require("./commands/lol/findTroll");
const { insertJinjinGame } = require("./commands/lol/insertGame");
const { setNickNameWithLevel } = require("./commands/utils/setNickName");
const { cleanToNoRole } = require("./commands/utils/clean");
const { checkCommands } = require("./commands/utils/checkCommand");
const { findMatch } = require("./commands/lol/findMatch");
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");

const sequelize = require("./config/database");
require("./models");
sequelize.sync({
  alter: true,
});

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
});

client.on("guildCreate", async (guild) => {
  const guildId = guild.id;
  checkCommands(client, guildId);
});

client.on("interactionCreate", async (interaction) => {
  const channel = client.channels.cache.get(interaction.channelId);
  const { commandName, options, guildId, channelId, member } = interaction;
  const guild = client.guilds.cache.get(guildId);
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  if (
    commandName === "청소" &&
    (await checkAdminPermission(member, interaction))
  ) {
    const channel = client.channels.cache.get(channelId);
    await interaction.reply("청소 시작!");
    await cleanToNoRole(guild, channel);
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
  if (
    commandName === "레벨갱신" &&
    (await checkAdminPermission(member, interaction))
  ) {
    await setNickNameWithLevel(client, guild);

    await interaction.reply("레벨갱신을 완료했습니다.");
  }
  if (commandName === "매칭기록") {
    await findMatch(interaction, channel);
  }
  if (
    commandName === "매칭업데이트" &&
    (await checkAdminPermission(member, interaction))
  ) {
    await insertJinjinGame(interaction, channel);
  }
  if (interaction.customId === "confirm") {
    const clickedMessage = interaction.message;
    const newContent = "버튼을 클릭하여 수정된 내용입니다.";
    await clickedMessage.edit({ content: newContent });
  }
});

async function checkAdminPermission(member, interaction) {
  const isAdmin = member.permissions.has(
    PermissionsBitField.Flags.Administrator
  );

  if (!isAdmin) {
    await interaction.reply("권한이 없습니다.");
    return false;
  }

  return true;
}

client.login(process.env.TOKEN);
