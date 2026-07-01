let dbReady = false;
let lastDbAttempt = 0;
const DB_RETRY_MS = 30_000;
let app;

module.exports = async (req, res) => {
  if (!app) {
    try {
      app = require("../server/server");
    } catch (err) {
      console.error("Server load error:", err.message);
      return res.status(500).json({ error: "Server unavailable" });
    }
  }

  if (!dbReady && Date.now() - lastDbAttempt > DB_RETRY_MS) {
    lastDbAttempt = Date.now();
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
