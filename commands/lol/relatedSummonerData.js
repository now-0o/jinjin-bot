function calcCarryScore(player) {
  return (
    player.kills * 3 +
    player.deaths * -4 +
    player.assists / 2 +
    player.totalDamageDealtToChampions / 2000 +
    player.goldEarned / 1000 +
    player.damageDealtToBuildings / 1000 +
    player.totalDamageShieldedOnTeammates / 1000 +
    player.visionScore / 2
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
  if (queueId === 490) {
    return "일반";
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
    calcScoreWithPlayerData.championName =
      player.championName.charAt(0).toUpperCase() +
      player.championName.slice(1).toLowerCase();
    calcScoreWithPlayerData.summonerName = player.riotIdGameName;
    calcScoreWithPlayerData.kda =
      player.kills + "/" + player.deaths + "/" + player.assists;
    calcScoreWithPlayerData.kills = player.kills;
    calcScoreWithPlayerData.deaths = player.deaths;
    calcScoreWithPlayerData.assists = player.assists;
    calcScoreWithPlayerData.dealToChamp = player.totalDamageDealtToChampions;
    calcScoreWithPlayerData.dealToBuild = player.damageDealtToBuildings;
    calcScoreWithPlayerData.gold = player.goldEarned;
    calcScoreWithPlayerData.visionScore = player.visionScore;
    calcScoreWithPlayerData.shield = player.totalDamageShieldedOnTeammates;
    calcScoreWithPlayerData.heal = player.totalHeal;
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

module.exports = {
  findGameMode,
  PlayerDataSetArry,
  findUserTeamData,
  checkSummonerName,
};
