const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions:
    process.env.NODE_ENV === "production"
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {},
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully.");
    // Auto-create tables if they don't exist
    await sequelize.sync({ alter: true });
    console.log("Database tables synced.");
  } catch (err) {
    console.error("PostgreSQL connection error:", err.message);
    throw err;
  }
};

module.exports = { sequelize, connectDB };
