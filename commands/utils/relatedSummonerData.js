function calcCarryScore(player) {
  return (
    player.kills * 3 +
    player.deaths * -3 +
    player.assists / 4 +
    player.totalDamageDealtToChampions / 2000 +
    player.goldEarned / 1000 +
    player.damageDealtToBuildings / 1000 +
    player.totalDamageShieldedOnTeammates / 1000 +
    player.visionScore / 5
  );
}

function findGameMode(queueId) {
  if (queueId === 400) {
    return "일반";
  }
  if (queueId === 420) {
    return "솔랭";
  }
  if (queueId === 430) {
    return "일반";
  }
  if (queueId === 440) {
    return "자랭";
  }
  if (queueId === 450) {
    return "칼바람";
  }
  if (queueId === 700) {
    return "격전";
  }
  return "번외";
}

function PlayerDataSetArry(searchedUserTeamPlayersData) {
  const playerDataArry = [];

  for (let player of searchedUserTeamPlayersData) {
    const calcScoreWithPlayerData = {};

    calcScoreWithPlayerData.championName = player.championName;
    calcScoreWithPlayerData.summonerName = player.riotIdGameName;
    calcScoreWithPlayerData.kda =
      player.kills + "/" + player.deaths + "/" + player.assists;
    calcScoreWithPlayerData.dealToChamp = player.totalDamageDealtToChampions;
    calcScoreWithPlayerData.dealToBuild = player.damageDealtToBuildings;
    calcScoreWithPlayerData.gold = player.goldEarned;
    calcScoreWithPlayerData.visionScore = player.visionScore;
    calcScoreWithPlayerData.shield = player.totalDamageShieldedOnTeammates;
    calcScoreWithPlayerData.head = player.totalHeal;
    calcScoreWithPlayerData.carryScore = calcCarryScore(player);
    playerDataArry.push(calcScoreWithPlayerData);
  }

  return playerDataArry;
}

function findUserTeamData(summonerName, finalMatchData) {
  const userTeamId = finalMatchData.data.info.participants.find(
    (player) =>
      player.riotIdGameName.split(" ").join("") ===
      summonerName.split("#")[0].split(" ").join("")
  ).teamId;

  return finalMatchData.data.info.participants.filter(
    (player) => player.teamId === userTeamId
  );
}

function checkSummonerName(summonerName) {
  if (/^.+#.+$/g.test(summonerName)) {
    return true;
  }
  if (!/^.+#.+$/g.test(summonerName)) {
    return false;
  }
}

function findCarrier(calcScoreWithPlayerDataArry) {
  if (calcScoreWithPlayerDataArry.length === 0) {
    return null;
  }

  calcScoreWithPlayerDataArry.sort((a, b) => b.carryScore - a.carryScore);

  const carrierData = calcScoreWithPlayerDataArry[0];

  return carrierData;
}

function findTroler(calcScoreWithPlayerDataArry) {
  if (calcScoreWithPlayerDataArry.length === 0) {
    return null;
  }

  calcScoreWithPlayerDataArry.sort((a, b) => b.carryScore - a.carryScore);

  const carrierData =
    calcScoreWithPlayerDataArry[calcScoreWithPlayerDataArry.length - 1];

  return carrierData;
}

module.exports = {
  findGameMode,
  PlayerDataSetArry,
  findUserTeamData,
  checkSummonerName,
  findCarrier,
  findTroler,
};
