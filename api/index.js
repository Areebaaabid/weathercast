let app;
let dbReady = false;

module.exports = async (req, res) => {
  if (!app) {
    try {
      app = require("../server/server");
    } catch (err) {
      return res.status(500).json({ error: "Server unavailable" });
    }
  }

  if (!dbReady) {
    try {
      const { connectDB } = require("../server/config/db");
      await connectDB();
      dbReady = true;
    } catch (err) {
      console.error("DB unavailable:", err.message);
    }
  }

  app(req, res);
};