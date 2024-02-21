const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Player = sequelize.define("players", {
  id: {
    primaryKey: true,
    type: DataTypes.STRING,
  },
  account: {
    type: DataTypes.STRING,
  },
  kda: {
    type: DataTypes.STRING,
  },
});

module.exports = Player;
