require("dotenv").config();
const { REST, Routes } = require("discord.js");

const commands = [
  {
    name: "ping",
    description: "Replies with Pong!",
  },
  {
    name: "청소",
    description: "불법 체류자들을 추방합니다!",
  },
  {
    name: "전적",
    description: "해당 유저의 최근 전적을 조회 합니다.",
    options: [
      {
        name: "소환사명",
        description: "전적 검색할 소환사명을 입력하세요.",
        type: 3, // 3은 문자열 (String) 타입을 나타냅니다.
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("명령어를 등록하고 있습니다.");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("명령어 등록이 완료되었습니다.");
  } catch (error) {
    console.error(error);
  }
})();
