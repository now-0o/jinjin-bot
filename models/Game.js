const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Game = sequelize.define("games", {
  id: {
    primaryKey: true,
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.STRING,
  },
  isWin: {
    type: DataTypes.BOOLEAN,
  },
});

module.exports = Game;
