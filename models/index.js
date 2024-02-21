const Player = require("./Player");
const Game = require("./Game");

Game.hasMany(Player);
Player.belongsTo(Game);

module.exports = {
  Game,
  Player,
};
