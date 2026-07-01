const { connectDB } = require("../server/config/db");
const app = require("../server/server");

let dbReady = false;
let lastDbAttempt = 0;
const DB_RETRY_MS = 30_000;

module.exports = async (req, res) => {
  if (!dbReady && Date.now() - lastDbAttempt > DB_RETRY_MS) {
    lastDbAttempt = Date.now();
    try {
      await connectDB();
      dbReady = true;
    } catch (err) {
      console.error("DB unavailable — serving without database:", err.message);
    }
  }
  app(req, res);
};
