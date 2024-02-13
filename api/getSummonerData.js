require("dotenv").config();
const axios = require("axios");

// API 요청을 담당하는 함수들
async function getRiotAccountInfo(summonerName) {
  try {
    const response = await axios.get(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${
        summonerName.split("#")[0]
      }/${summonerName.split("#")[1]}?api_key=${process.env.API_KEY}`
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`API 요청 실패 - 상태 코드: ${response.status}`);
    }
  } catch (error) {
    console.error("API 요청 중 에러:", error);
    throw error;
  }
}

async function getSummonerProfileIconAndRank(puuid) {
  try {
    const sub_response = await axios.get(
      `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${process.env.API_KEY}`
    );

    if (sub_response.status === 200) {
      const summonerData = {
        profileIconId: sub_response.data.profileIconId,
        summonerLevel: sub_response.data.summonerLevel,
      };

      const secondResponse = await axios.get(
        `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${sub_response.data.id}?api_key=${process.env.API_KEY}`
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

        return summonerData;
      } else {
        throw new Error(
          `Second request failed - Status code: ${secondResponse.status}`
        );
      }
    } else {
      throw new Error(
        `Sub request failed - Status code: ${sub_response.status}`
      );
    }
  } catch (error) {
    console.error("API 요청 중 에러:", error);
    throw error;
  }
}

async function getSummonerMatchId(puuid) {
  try {
    const response = await axios.get(
      `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1&api_key=${process.env.API_KEY}`
    );

    return response.data[0];
  } catch (error) {
    console.error("API 요청 중 에러:", error);
    throw error;
  }
}

async function getSummonerFinalMatchData(finalMatchId) {
  try {
    const response = await axios.get(
      `https://asia.api.riotgames.com/lol/match/v5/matches/${finalMatchId}?api_key=${process.env.API_KEY}`
    );

    return response;
  } catch (error) {
    console.error("API 요청 중 에러:", error);
    throw error;
  }
}

module.exports = {
  getRiotAccountInfo,
  getSummonerProfileIconAndRank,
  getSummonerMatchId,
  getSummonerFinalMatchData,
};
