const { connectDB } = require("../server/config/db");
const app = require("../server/server");

let dbReady = false;

module.exports = async (req, res) => {
  if (!dbReady) {
    try {
      await connectDB();
      dbReady = true;
    } catch (err) {
      console.error("DB connection failed:", err);
      return res.status(500).json({ error: "Database connection failed" });
    }
  }
  app(req, res);
};
