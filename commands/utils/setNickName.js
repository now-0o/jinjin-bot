async function setNickNameWithLevel(client, guild) {
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
          await setNickName(member, daysInServer);
        } catch (error) {
          console.error("별명 변경 중 에러 발생:", error);
        }
      });
    });
  } catch (error) {
    console.error("서버 및 멤버 정보 불러오기 중 에러 발생:", error);
  }
}

async function setNickName(member, daysInServer) {
  if (
    member.user.id !== "1203595904716636210" &&
    member.user.id !== "345442010385088523" &&
    member.user.id !== "501053366521167872"
  ) {
    await member.setNickname(`${member.user.globalName} [${daysInServer}일]`);
  }
}

module.exports = {
  setNickNameWithLevel,
};
