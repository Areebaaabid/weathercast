const { DataTypes } = require("sequelize");
const { getSequelize } = require("../config/db");

const Search = getSequelize().define(
  "Search",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
    },
    latitude: {
      type: DataTypes.FLOAT,
    },
    longitude: {
      type: DataTypes.FLOAT,
    },
    temperature: {
      type: DataTypes.INTEGER,
    },
    weatherCode: {
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.STRING,
    },
    searchedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "searches",
    timestamps: true,
  }
);

module.exports = Search;
