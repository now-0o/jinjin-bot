const { sendLoading } = require("./loading");

async function cleanToNoRole(guild, channel) {
  const message = await channel.send("청소중.. -");
  await sendLoading(message, "청소중..");

  try {
    const members = await guild.members.fetch(); // 해당 서버의 모든 멤버 정보를 불러오기
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
}

module.exports = {
  cleanToNoRole,
};
