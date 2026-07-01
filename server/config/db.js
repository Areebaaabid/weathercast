const { Sequelize } = require("sequelize");

let sequelize;

const getSequelize = () => {
  if (!sequelize) {
    sequelize = new Sequelize(process.env.DATABASE_URL || "postgres://localhost:5432/weatherapp", {
      dialect: "postgres",
      logging: false,
      dialectOptions:
        process.env.NODE_ENV === "production"
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {},
    });
  }
  return sequelize;
};

const connectDB = async () => {
  try {
    await getSequelize().authenticate();
    console.log("PostgreSQL connected successfully.");
    await getSequelize().sync({ alter: true });
    console.log("Database tables synced.");
  } catch (err) {
    console.error("PostgreSQL connection error:", err.message);
    throw err;
  }
};

module.exports = { getSequelize, sequelize: null, connectDB };
