const Sequelize = require("sequelize");
const cls = require("cls-hooked");
const namespace = cls.createNamespace("sequelize-namespace");
Sequelize.useCLS(namespace);

const sequelize = new Sequelize(
  "jinjinbot",
  "root",
  process.env.databasePassword,
  {
    host: "localhost",
    dialect: "mysql", // MySQL을 사용하는 경우 dialect를 'mysql'로 설정
    logging: false,
    // MySQL 설정
    port: 3306, // MySQL 포트 (기본값: 3306)
  }
);

const checkConnection = async () => {
  try {
    await sequelize.authenticate(); // 데이터베이스에 연결 시도
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

checkConnection();

module.exports = sequelize;
