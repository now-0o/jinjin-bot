const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Player = sequelize.define("players", {
  id: {
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER,
  },
  account: {
    type: DataTypes.STRING,
  },
  kills: {
    type: DataTypes.INTEGER,
  },
  deaths: {
    type: DataTypes.INTEGER,
  },
  assists: {
    type: DataTypes.INTEGER,
  },
  champion: {
    type: DataTypes.STRING,
  },
});

module.exports = Player;
