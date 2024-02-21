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
      description:
        "진진의 게임 기록에서 대상 소환사와의 매칭 기록이 있는지 조회합니다.",
      options: [
        {
          name: "소환사명",
          description: "이 소환사가 진진과 매칭된 기록이 있는지 조회합니다.",
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: "매칭업데이트",
      description: "진진의 게임 매칭정보를 가져와 저장합니다.",
      options: [
        {
          name: "게임_수",
          description:
            "1회에 최대 80게임까지 가능하며 2분 간격으로 사용이 가능합니다.",
          type: 4,
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
