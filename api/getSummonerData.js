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
    if (sub_response.status !== 200) {
      throw new Error(
        `Sub request failed - Status code: ${sub_response.status}`
      );
    }
    const summonerData = {
      profileIconId: sub_response.data.profileIconId,
      summonerLevel: sub_response.data.summonerLevel,
    };
    const secondResponse = await axios.get(
      `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${sub_response.data.id}?api_key=${process.env.API_KEY}`
    );
    if (secondResponse.status !== 200) {
      throw new Error(
        `Second request failed - Status code: ${secondResponse.status}`
      );
    }
    return makeSummonerData(summonerData, secondResponse);
  } catch (error) {
    console.error("API 요청 중 에러:", error);
    throw error;
  }
}

function setGameData(summonerData, gameData, gameType, gameName) {
  if (!gameData) {
    summonerData[gameType + "Rank"] = `${gameName} 전적이 없어요.`;
    summonerData[gameType + "Status"] = false;
    return summonerData;
  }
  summonerData[gameType + "Rank"] =
    gameData.tier.substring(0, 1) +
    " " +
    gameData.rank +
    " " +
    gameData.leaguePoints;
  summonerData[gameType + "Wins"] = gameData.wins;
  summonerData[gameType + "Loses"] = gameData.losses;
  summonerData[gameType + "Rate"] =
    Math.round((gameData.wins / (gameData.wins + gameData.losses)) * 100) + "%";
  summonerData[gameType + "Status"] = true;

  return summonerData;
}

function makeSummonerData(summonerData, secondResponse) {
  const soloGameData = secondResponse.data.find(
    (secondData) => secondData.queueType === "RANKED_SOLO_5x5"
  );
  setGameData(summonerData, soloGameData, "solo", "솔랭");

  const flexGameData = secondResponse.data.find(
    (secondData) => secondData.queueType === "RANKED_FLEX_SR"
  );
  setGameData(summonerData, flexGameData, "flex", "자랭");

  return summonerData;
}

async function getSummonerMatchId(puuid, count) {
  try {
    const response = await axios.get(
      `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}&api_key=${process.env.API_KEY}`
    );

    return response.data;
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
