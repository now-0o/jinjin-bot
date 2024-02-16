function setCarryTitle(calcScoreWithPlayerDataArry, carrierData) {
  const count = {
    kill: 0,
    death: 0,
    assist: 0,
    dealToChamp: 0,
    dealToBuild: 0,
    gold: 0,
    vision: 0,
    shield: 0,
    heal: 0,
  };
  for (let player of calcScoreWithPlayerDataArry) {
    if (carrierData.kills > player.kills) count.kill++;
    if (carrierData.death < player.death) count.death++;
    if (carrierData.assist > player.assist) count.assist++;
    if (carrierData.dealToChamp > player.dealToChamp) count.dealToChamp++;
    if (carrierData.dealToBuild > player.dealToBuild) count.dealToBuild++;
    if (carrierData.gold > player.gold) count.gold++;
    if (carrierData.visionScore > player.visionScore) count.vision++;
    if (carrierData.shield > player.shield) count.shield++;
    if (carrierData.heal > player.heal) count.heal++;
  }
  return checkCountForCarrierTItle(count);
}
function checkCountForCarrierTItle(count) {
  const titleObj = {};
  if (count.kill === 4) titleObj.학살자 = "가장 많은 적을 처치했습니다.";
  if (count.death === 4) titleObj.불사신 = "가장 적은 데스를 기록했습니다.";
  if (count.assist === 4) titleObj.진진 = "가장 많은 어시스트를 기록했습니다.";
  if (count.dealToChamp === 4)
    titleObj.꽉찬캐리 = "가장 많은 피해량을 기록했습니다.";
  if (count.dealToBuild === 4)
    titleObj.철거반 = "구조물에 가장 많은 피해를 입혔습니다.";
  if (count.vision === 4)
    titleObj.천리안 = "가장 많은 시야점수를 획득했습니다.";
  if (count.shield === 4) titleObj.보호자 = "가장 많은 보호막을 부여했습니다.";
  if (count.heal === 4) titleObj.주유소 = "가장 많은 회복량을 기록했습니다.";

  return titleObj;
}
function setTrolerTitle(calcScoreWithPlayerDataArry, trolerData) {
  const count = {
    kill: 0,
    death: 0,
    assist: 0,
    dealToChamp: 0,
    dealToBuild: 0,
    gold: 0,
    vision: 0,
    shield: 0,
    heal: 0,
  };
  for (let player of calcScoreWithPlayerDataArry) {
    if (trolerData.kills < player.kills) count.kill++;
    if (trolerData.death > player.death) count.death++;
    if (trolerData.assist < player.assist) count.assist++;
    if (trolerData.dealToChamp < player.dealToChamp) count.dealToChamp++;
    if (trolerData.dealToBuild < player.dealToBuild) count.dealToBuild++;
    if (trolerData.gold < player.gold) count.gold++;
    if (trolerData.visionScore < player.visionScore) count.vision++;
    if (trolerData.shield < player.shield) count.shield++;
    if (trolerData.heal < player.heal) count.heal++;
  }
  return checkCountForTrolerTItle(count);
}
function checkCountForTrolerTItle(count) {
  const titleObj = {};
  if (count.kill === 4) titleObj.하남자 = "가장 적은 적을 처치했습니다.";
  if (count.death === 4) titleObj.또죽네 = "가장 많은 데스를 기록했습니다.";
  if (count.assist === 4) titleObj.솔로 = "가장 적은 어시스트를 기록했습니다.";
  if (count.dealToChamp === 4)
    titleObj.텅빈버스 = "가장 적은 피해량을 기록했습니다.";
  if (count.dealToBuild === 4)
    titleObj.영향력제로 = "구조물에 가장 적은 피해를 입혔습니다.";
  if (count.vision === 4) titleObj.맹인 = "가장 적은 시야점수를 획득했습니다.";
  if (count.shield === 4) titleObj.노도움 = "가장 적은 보호막을 부여했습니다.";
  if (count.heal === 4)
    titleObj.상처투성이 = "가장 적은 회복량을 기록했습니다.";
  return titleObj;
}
function makeTitleString(titleObj) {
  let titleString = "";
  for (const title in titleObj) {
    titleString += `\`${title}\`: ${titleObj[title]}`;
    if (
      Object.keys(titleObj).indexOf(title) !==
      Object.keys(titleObj).length - 1
    ) {
      titleString += "\n";
    }
  }
  return titleString;
}
module.exports = {
  setCarryTitle,
  setTrolerTitle,
  makeTitleString,
};
