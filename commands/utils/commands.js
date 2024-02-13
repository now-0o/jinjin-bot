require("dotenv").config();
const { REST, Routes } = require("discord.js");

async function setCommand(guildId) {
  const commands = [
    {
      name: "청소",
      description: "불법 체류자들을 추방합니다!",
    },
    {
      name: "전적",
      description: "해당 유저의 최근 전적을 조회합니다.",
      options: [
        {
          name: "소환사명",
          description: "전적 검색할 소환사명#태그를 입력하세요.",
          type: 3, // 3은 문자열 (String) 타입을 나타냅니다.
          required: true,
        },
      ],
    },
    {
      name: "전판캐리",
      description: "해당 유저의 가장 최근 게임을 누가 캐리했는지 계산합니다.",
      options: [
        {
          name: "소환사명",
          description: "최근 게임을 조회할 소환사명#태그를 입력하세요.",
          type: 3, // 3은 문자열 (String) 타입을 나타냅니다.
          required: true,
        },
      ],
    },
    {
      name: "전판트롤",
      description: "해당 유저의 가장 최근 게임을 누가 트롤했는지 계산합니다.",
      options: [
        {
          name: "소환사명",
          description: "최근 게임을 조회할 소환사명#태그를 입력하세요.",
          type: 3, // 3은 문자열 (String) 타입을 나타냅니다.
          required: true,
        },
      ],
    },
    {
      name: "레벨갱신",
      description: "유저 별명의 날짜 칭호를 갱신합니다.",
    },
    {
      name: "매칭기록",
      description: "두 소환사가 최근 20게임 내 매칭 기록이 있는지 조회합니다.",
      options: [
        {
          name: "기준_소환사명",
          description:
            "이 소환사의 최근 20게임 기준으로 매칭여부를 조회합니다.",
          type: 3,
          required: true,
        },
        {
          name: "대상_소환사명",
          description:
            "이 소환사가 기준 소환사와 매칭된 기록이 있는지 조회합니다.",
          type: 3,
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
        Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
        { body: commands }
      );

      console.log("명령어 등록이 완료되었습니다.");
    } catch (error) {
      console.error(error);
    }
  })();
}

module.exports = {
  setCommand,
};
